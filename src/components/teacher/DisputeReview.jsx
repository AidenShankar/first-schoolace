import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, Send, CheckCircle, Pencil } from "lucide-react";
import { Submission } from "@/entities/Submission";

export default function DisputeReview({ submission, assignment, onReleased }) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState("");
  const [editedGrade, setEditedGrade] = useState("");

  useEffect(() => {
    if (submission.dispute_ai_response) {
      setEditedResponse(submission.dispute_ai_response);
    }
    if (submission.dispute_ai_grade !== null && submission.dispute_ai_grade !== undefined) {
      setEditedGrade(String(submission.dispute_ai_grade));
    }
  }, [submission.dispute_ai_response, submission.dispute_ai_grade]);

  if (!submission.student_dispute) return null;

  const isPendingReview =
    submission.grading_status === "disputed" ||
    submission.grading_status === "dispute_reviewing";
  const hasAIResponse = !!submission.dispute_ai_response;
  const isReleased = submission.dispute_response_released;

  const handleRelease = async () => {
    setIsReleasing(true);
    try {
      const gradeNum = parseFloat(editedGrade);
      await Submission.update(submission.id, {
        dispute_response_released: true,
        dispute_response_released_at: new Date().toISOString(),
        grading_status: "released",
        dispute_ai_response: editedResponse,
        ...((!isNaN(gradeNum)) && { dispute_ai_grade: gradeNum }),
      });
      onReleased?.();
    } catch (e) {
      console.error("Error releasing dispute response:", e);
      alert("Failed to release response.");
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="mt-4 border-t border-amber-200 pt-4 space-y-3">
      {/* Student's dispute */}
      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Student's Counter-Argument
          </p>
          {isPendingReview && !hasAIResponse && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              <Clock className="w-2.5 h-2.5 mr-1" /> Processing...
            </Badge>
          )}
        </div>
        <p className="text-sm text-amber-900 whitespace-pre-wrap">{submission.student_dispute}</p>
      </div>

      {/* AI response */}
      {hasAIResponse && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              AI Dispute Response
            </p>
            <div className="flex items-center gap-2">
              {!isReleased && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-blue-600 hover:text-blue-800 h-6 px-2"
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  {isEditing ? "Cancel Edit" : "Edit"}
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-blue-700 mb-1 block">Response</Label>
                <Textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  className="text-sm min-h-[120px] bg-white border-blue-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-blue-700 whitespace-nowrap">Suggested Grade:</Label>
                <Input
                  type="number"
                  min={0}
                  max={assignment.max_points}
                  value={editedGrade}
                  onChange={(e) => setEditedGrade(e.target.value)}
                  className="w-24 text-sm h-8 bg-white border-blue-200"
                />
                <span className="text-xs text-blue-600">/ {assignment.max_points}</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-1">
                {editedGrade !== "" && (
                  <Badge className="bg-white text-blue-700 border-blue-300 text-xs font-bold">
                    Suggested: {editedGrade}/{assignment.max_points}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{editedResponse}</p>
            </div>
          )}

          {!isReleased && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded flex-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                Review and optionally edit before releasing to the student.
              </div>
              <Button
                size="sm"
                onClick={handleRelease}
                disabled={isReleasing}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0"
              >
                <Send className="w-3 h-3 mr-1" />
                {isReleasing ? "Releasing..." : "Release to Student"}
              </Button>
            </div>
          )}

          {isReleased && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded border border-green-200">
              <CheckCircle className="w-3 h-3" /> Response released to student.
            </div>
          )}
        </div>
      )}
    </div>
  );
}