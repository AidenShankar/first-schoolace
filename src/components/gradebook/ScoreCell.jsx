import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, AlertTriangle } from "lucide-react";

export default function ScoreCell({ assignment, student, score, onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    points_earned: score?.points_earned ?? null,
    special_code: score?.special_code || "",
    is_late: score?.is_late || false,
    is_missing: score?.is_missing || false,
    comment: score?.comment || "",
    is_overridden: score?.is_overridden || false,
    original_score: score?.original_score ?? null
  });

  const handleSave = () => {
    onUpdate(formData);
    setShowDialog(false);
  };

  const getDisplayValue = () => {
    if (score?.special_code) {
      return score.special_code;
    }
    if (score?.points_earned !== null && score?.points_earned !== undefined) {
      return score.points_earned;
    }
    return "-";
  };

  const getCellColor = () => {
    if (score?.special_code === "MIS" || score?.is_missing) return "bg-red-50 text-red-700";
    if (score?.special_code === "ABS") return "bg-slate-100 text-slate-600";
    if (score?.special_code === "INC") return "bg-amber-50 text-amber-700";
    if (score?.special_code === "EXC" || score?.special_code === "EXE") return "bg-blue-50 text-blue-700";
    if (score?.is_late) return "bg-yellow-50 text-yellow-700";
    
    if (score?.points_earned !== null && score?.points_earned !== undefined) {
      const percentage = (score.points_earned / assignment.max_points) * 100;
      if (percentage >= 90) return "bg-green-50 text-green-700";
      if (percentage >= 80) return "bg-blue-50 text-blue-700";
      if (percentage >= 70) return "bg-yellow-50 text-yellow-700";
      return "bg-red-50 text-red-700";
    }
    
    return "bg-white text-slate-400";
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className={`w-full h-full min-h-[60px] px-2 py-3 text-center font-semibold hover:ring-2 hover:ring-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${getCellColor()}`}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-lg">{getDisplayValue()}</span>
          {score?.is_late && <Clock className="w-3 h-3" />}
          {score?.is_missing && <AlertTriangle className="w-3 h-3" />}
          {score?.is_overridden && <span className="text-xs">▲</span>}
        </div>
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Score: {student.student_name}
            </DialogTitle>
            <p className="text-sm text-slate-600">
              {assignment.name} ({assignment.max_points} pts)
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Special Code</Label>
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
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  <SelectItem value="MIS">Missing (MIS)</SelectItem>
                  <SelectItem value="ABS">Absent (ABS)</SelectItem>
                  <SelectItem value="INC">Incomplete (INC)</SelectItem>
                  <SelectItem value="EXC">Excused (EXC)</SelectItem>
                  <SelectItem value="EXE">Exempt (EXE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!formData.special_code && (
              <div className="space-y-2">
                <Label>Points Earned</Label>
                <Input
                  type="number"
                  min="0"
                  max={assignment.max_points}
                  step="0.5"
                  value={formData.points_earned ?? ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    points_earned: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  placeholder={`Out of ${assignment.max_points}`}
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_late}
                  onChange={(e) => setFormData({ ...formData, is_late: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Mark as Late</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_missing}
                  onChange={(e) => setFormData({ ...formData, is_missing: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Mark as Missing</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Add a comment for this score..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Save Score
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}