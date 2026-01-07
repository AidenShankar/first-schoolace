import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function AssignmentDialog({ open, onClose, onSave, assignment, categories }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_points: 100,
    weight: 1,
    due_date: null,
    category_id: "",
    is_extra_credit: false,
    exclude_from_final: false,
    publish_scores: false,
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        name: assignment.name || "",
        description: assignment.description || "",
        max_points: assignment.max_points || 100,
        weight: assignment.weight || 1,
        due_date: assignment.due_date ? new Date(assignment.due_date) : null,
        category_id: assignment.category_id || "",
        is_extra_credit: assignment.is_extra_credit || false,
        exclude_from_final: assignment.exclude_from_final || false,
        publish_scores: assignment.publish_scores || false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        max_points: 100,
        weight: 1,
        due_date: null,
        category_id: "",
        is_extra_credit: false,
        exclude_from_final: false,
        publish_scores: false,
      });
    }
  }, [assignment, open]);

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Please enter an assignment name");
      return;
    }
    
    if (!formData.category_id) {
      alert("Please select a category for this assignment");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edit Assignment" : "New Assignment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assignment Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Assignment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chapter 5 Quiz"
            />
          </div>

          {/* Category - NOW REQUIRED */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.weight}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-red-600">
                Please create at least one category in the Categories tab first
              </p>
            )}
          </div>

          {/* Max Points */}
          <div className="space-y-2">
            <Label htmlFor="max_points" className="text-sm font-semibold">
              Max Points
            </Label>
            <Input
              id="max_points"
              type="number"
              min="0"
              step="0.5"
              value={formData.max_points}
              onChange={(e) => setFormData({ ...formData, max_points: parseFloat(e.target.value) })}
            />
          </div>

          {/* Weight Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-semibold">
              Weight Multiplier
            </Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
            />
            <p className="text-xs text-slate-500">
              1.0 = normal weight, 2.0 = double weight
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData({ ...formData, due_date: date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes about this assignment"
              className="h-20"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_extra_credit}
                onChange={(e) => setFormData({ ...formData, is_extra_credit: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Extra Credit</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.exclude_from_final}
                onChange={(e) => setFormData({ ...formData, exclude_from_final: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Exclude from Final Grade</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.publish_scores}
                onChange={(e) => setFormData({ ...formData, publish_scores: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Publish Scores to Students</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={categories.length === 0}>
            {assignment ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}