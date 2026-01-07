import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function CategoriesView({ currentClass }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [useWeighting, setUseWeighting] = useState(currentClass?.use_category_weighting ?? true);
  
  const [formData, setFormData] = useState({
    name: "",
    weight: 0,
    drop_lowest: 0,
    color: "#6366f1",
    order: 0
  });

  useEffect(() => {
    loadCategories();
    setUseWeighting(currentClass?.use_category_weighting ?? true);
  }, [currentClass]);

  const loadCategories = async () => {
    try {
      const data = await base44.entities.GradebookCategory.filter({ 
        class_id: currentClass.id 
      });
      setCategories(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeighting = async (enabled) => {
    try {
      await base44.entities.Class.update(currentClass.id, {
        use_category_weighting: enabled
      });
      
      // If disabling weighting, set all categories to 100%
      if (!enabled) {
        for (const category of categories) {
          await base44.entities.GradebookCategory.update(category.id, {
            weight: 100
          });
        }
        await loadCategories();
      }
      
      setUseWeighting(enabled);
    } catch (error) {
      console.error("Error toggling weighting:", error);
      alert("Failed to update weighting setting.");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        weight: useWeighting ? formData.weight : 100, // Force 100 if weighting disabled
        class_id: currentClass.id
      };

      if (editingCategory) {
        await base44.entities.GradebookCategory.update(editingCategory.id, dataToSave);
      } else {
        await base44.entities.GradebookCategory.create(dataToSave);
      }

      setShowDialog(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        weight: 0,
        drop_lowest: 0,
        color: "#6366f1",
        order: 0
      });
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      weight: category.weight,
      drop_lowest: category.drop_lowest,
      color: category.color,
      order: category.order
    });
    setShowDialog(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category? Assignments in this category will become uncategorized.")) {
      return;
    }

    try {
      await base44.entities.GradebookCategory.delete(categoryId);
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Grade Categories</h2>
            <p className="text-sm text-slate-600 mt-1">
              {useWeighting 
                ? "Configure weighted categories for grade calculation" 
                : "All assignments worth equal points based on max points"}
            </p>
          </div>
          <Button onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: "",
              weight: 0,
              drop_lowest: 0,
              color: "#6366f1",
              order: categories.length
            });
            setShowDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Weighting Toggle */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">Use Category Weighting</h3>
              <p className="text-sm text-slate-600">
                {useWeighting 
                  ? "Categories have different weights in final grade calculation" 
                  : "All assignments worth the same, differentiated only by max points"}
              </p>
            </div>
            <Switch
              checked={useWeighting}
              onCheckedChange={handleToggleWeighting}
            />
          </div>
        </Card>

        {useWeighting && totalWeight !== 100 && categories.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Category weights currently total {totalWeight.toFixed(1)}%. 
              They should total 100% for accurate grade calculations.
            </p>
          </div>
        )}

        <div className="grid gap-4">
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        {useWeighting && (
                          <span>Weight: {category.weight}%</span>
                        )}
                        {category.drop_lowest > 0 && (
                          <span>Drop Lowest: {category.drop_lowest}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {categories.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No categories yet. Create your first category to organize assignments.</p>
          </Card>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Homework, Tests, Quizzes"
              />
            </div>

            {useWeighting && (
              <div className="space-y-2">
                <Label>Weight (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-slate-500">
                  Percentage of final grade this category represents
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Drop Lowest Scores</Label>
              <Input
                type="number"
                min="0"
                value={formData.drop_lowest}
                onChange={(e) => setFormData({ ...formData, drop_lowest: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-500">
                Number of lowest scores to drop in this category
              </p>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded border border-slate-300 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}