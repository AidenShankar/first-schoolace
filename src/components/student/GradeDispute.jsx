import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { Submission } from "@/entities/Submission";

export default function GradeDispute({ submission, assignment, onDisputed }) {
  const [disputeText, setDisputeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const canDispute =
    submission.is_released &&
    !submission.student_dispute &&
    submission.grading_status === "released";

  const hasDispute = !!submission.student_dispute;
  const disputeReleased = submission.dispute_response_released;

  const handleSubmitDispute = async () => {
    if (!disputeText.trim()) return;
    setIsSubmitting(true);
    try {
      await Submission.update(submission.id, {
        student_dispute: disputeText.trim(),
        student_dispute_at: new Date().toISOString(),
        grading_status: "disputed",
      });
      setShowForm(false);
      setDisputeText("");
      onDisputed?.();
    } catch (e) {
      console.error("Error submitting dispute:", e);
      alert("Failed to submit dispute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canDispute && !hasDispute) return null;

  return (
    <div className="mt-4 border-t pt-4">
      {/* Student already disputed and response is released */}
      {hasDispute && disputeReleased && (
        <div className="space-y-3">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Your Counter-Argument
            </p>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{submission.student_dispute}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> AI Response to Your Dispute
              </p>
              {submission.dispute_ai_grade !== null && submission.dispute_ai_grade !== undefined && (
                <Badge className="bg-white text-blue-700 border-blue-300 text-xs font-bold">
                  Suggested: {submission.dispute_ai_grade}/{assignment.max_points}
                </Badge>
              )}
            </div>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{submission.dispute_ai_response}</p>
          </div>
        </div>
      )}

      {/* Student disputed but response not yet released */}
      {hasDispute && !disputeReleased && (
        <div className="space-y-2">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Your Counter-Argument (Submitted)
            </p>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{submission.student_dispute}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>Your dispute is under review by your teacher. Check back soon.</span>
          </div>
        </div>
      )}

      {/* Can dispute — show button or form */}
      {canDispute && !showForm && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Dispute Grade
        </Button>
      )}

      {canDispute && showForm && (
        <div className="space-y-3 bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Dispute Your Grade</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Explain why you believe the grade is incorrect. Provide specific evidence from your work.
                Your original submission and feedback will be reviewed by AI, and a teacher will release the response.
              </p>
            </div>
          </div>
          <Textarea
            value={disputeText}
            onChange={(e) => setDisputeText(e.target.value)}
            placeholder="Explain your counter-argument with specific evidence from your submission..."
            className="h-28 resize-none border-amber-300 focus:border-amber-500 bg-white"
            disabled={isSubmitting}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowForm(false); setDisputeText(""); }}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitDispute}
              disabled={isSubmitting || !disputeText.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
            >
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}