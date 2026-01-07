
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, User } from "lucide-react"; // Added User icon
import { motion } from "framer-motion";

export default function ScoreInspector({ cell, onClose, onSave }) {
  const { assignment, student, score } = cell;
  
  const [formData, setFormData] = useState({
    points_earned: score?.points_earned ?? null,
    special_code: score?.special_code || "",
    is_late: score?.is_late || false,
    is_missing: score?.is_missing || false,
    is_unreleased: score?.is_unreleased || false,
    comment: score?.comment || "",
    is_overridden: score?.is_overridden || false,
    original_score: score?.original_score ?? null
  });

  useEffect(() => {
    if (score) {
      setFormData({
        points_earned: score.points_earned ?? null,
        special_code: score.special_code || "",
        is_late: score.is_late || false,
        is_missing: score.is_missing || false,
        is_unreleased: score.is_unreleased || false,
        comment: score.comment || "",
        is_overridden: score.is_overridden || false,
        original_score: score.original_score ?? null
      });
    }
  }, [score]);

  const handleSave = () => {
    // Check if assignment has no category and trying to save with unreleased = false
    if (!assignment.category_id && !formData.is_unreleased) {
      alert("⚠️ To release this grade, please edit the assignment and assign a category first. This ensures accurate grade calculations.");
      return;
    }

    onSave(formData);
  };

  // Safety check for required data
  if (!assignment || !student) {
    return null;
  }

  // Show unreleased checkbox if:
  // 1. Assignment has no category, OR
  // 2. Score is currently marked as unreleased (so teacher can uncheck it after assigning category)
  const showUnreleasedFlag = !assignment.category_id || formData.is_unreleased;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 border-b border-white/20 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Grade Entry</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Student Info */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{student.student_name}</div>
            <div className="text-sm text-slate-600">{student.student_email}</div>
          </div>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="text-sm text-slate-600 mb-1">Assignment</div>
        <div className="font-semibold text-slate-900">{assignment.name}</div>
        <div className="text-sm text-slate-600 mt-2">
          Maximum Points: <span className="font-medium text-slate-900">{assignment.max_points}</span>
        </div>
      </div>

      {/* Score Entry Form */}
      <div className="px-6 py-6 space-y-6">
        {/* Special Code */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Special Code</Label>
          <Select
            value={formData.special_code}
            onValueChange={(value) => {
              setFormData({ 
                ...formData, 
                special_code: value,
                points_earned: value ? null : formData.points_earned,
                is_missing: value === "MIS"
              });
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="None (Enter Score)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              <SelectItem value="MIS">🔴 Missing (MIS)</SelectItem>
              <SelectItem value="ABS">⚪ Absent (ABS)</SelectItem>
              <SelectItem value="INC">🟡 Incomplete (INC)</SelectItem>
              <SelectItem value="EXC">🔵 Excused (EXC)</SelectItem>
              <SelectItem value="EXE">🔵 Exempt (EXE)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Special codes override numeric scores
          </p>
        </div>

        {/* Score Entry */}
        {!formData.special_code && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Points Earned
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max={assignment.max_points}
                step="0.5"
                value={formData.points_earned ?? ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? null : parseFloat(e.target.value);
                  setFormData({ ...formData, points_earned: value });
                }}
                placeholder="Enter score"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                / {assignment.max_points}
              </span>
            </div>
            {formData.points_earned !== null && formData.points_earned !== undefined && (
              <p className="text-xs text-slate-600">
                Percentage: {((formData.points_earned / assignment.max_points) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        )}

        {/* Flags Section */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <Label className="text-sm font-semibold text-slate-700">Flags</Label>
          
          {/* Unreleased Flag - Show if no category OR if currently unreleased */}
          {showUnreleasedFlag && (
            <div className={`${!assignment.category_id ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="is_unreleased"
                  checked={formData.is_unreleased}
                  onChange={(e) => setFormData({ ...formData, is_unreleased: e.target.checked })}
                  disabled={!assignment.category_id}
                  className={`mt-0.5 h-4 w-4 rounded ${!assignment.category_id ? 'border-amber-300 text-amber-600 focus:ring-amber-500' : 'border-blue-300 text-blue-600 focus:ring-blue-500'}`}
                />
                <div className="flex-1">
                  <label htmlFor="is_unreleased" className={`text-sm font-medium ${!assignment.category_id ? 'text-amber-900' : 'text-blue-900'} cursor-pointer`}>
                    Unreleased
                  </label>
                  <p className={`text-xs mt-1 ${!assignment.category_id ? 'text-amber-700' : 'text-blue-700'}`}>
                    {!assignment.category_id 
                      ? "This grade cannot be released until a category is assigned to the assignment"
                      : "Uncheck to release this grade to the student"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_late"
              checked={formData.is_late}
              onChange={(e) => setFormData({ ...formData, is_late: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_late" className="text-sm text-slate-700 cursor-pointer">
              Late Submission
            </label>
          </div>
        </div>

        {/* Comment Section */}
        <div className="space-y-2">
          <Label htmlFor="comment" className="text-sm font-semibold text-slate-700">
            Comment (Optional)
          </Label>
          <Textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Add a note about this score..."
            className="h-24 resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            Save Score
          </Button>
        </div>

        {/* Warning if no category */}
        {!assignment.category_id && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700">
              ⚠️ This assignment has no category assigned. Please edit the assignment and assign a category for accurate grade calculations.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
