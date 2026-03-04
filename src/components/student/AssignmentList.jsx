import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Award, Upload, Paperclip, Trash2, MessageSquare, Eye } from "lucide-react";
import { format, subHours } from "date-fns";
import { motion } from "framer-motion";
import FilePreview from "../common/FilePreview";
import { AssignmentComment } from "@/entities/AssignmentComment";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const subjectColors = {
  math: "bg-blue-100 text-blue-800 border-blue-200",
  english: "bg-green-100 text-green-800 border-green-200",
  science: "bg-purple-100 text-purple-800 border-purple-200",
  history: "bg-amber-100 text-amber-800 border-amber-200",
  art: "bg-pink-100 text-pink-800 border-pink-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const CommentThread = ({ assignment, currentUser, onTextSubmission, isSubmitting, allowSubmissions }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!currentUser) return;
    const fetchedComments = await AssignmentComment.filter({
      assignment_id: assignment.id,
      student_id: currentUser.id
    }, '-created_date');
    setComments(fetchedComments.reverse());
  }, [assignment.id, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchComments();
    }
  }, [assignment, currentUser, fetchComments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsCommenting(true);
    try {
      await AssignmentComment.create({
        assignment_id: assignment.id,
        student_id: currentUser.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.app_role,
        content: newComment.trim()
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment.");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleTextSubmission = async () => {
    if (!newComment.trim()) return;
    try {
      await onTextSubmission(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Error submitting text:", error);
      alert("Failed to submit text.");
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold mb-2 flex items-center" style={{ color: `rgb(var(--color-text))` }}>
      <MessageSquare className="w-4 h-4 mr-2" /> Private Comments
      </h4>
      <div className="space-y-3 max-h-60 overflow-y-auto p-3 rounded-lg border" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
        {comments.map(comment => (
          <div key={comment.id} className={`flex items-start gap-2 ${comment.user_id === currentUser.id ? "flex-row-reverse" : ""}`}>
            <div className={`text-sm p-3 rounded-lg ${comment.user_id === currentUser.id ? "text-white" : "border"}`} style={{ backgroundColor: comment.user_id === currentUser.id ? `rgb(var(--color-primary))` : `rgb(var(--color-surface))`, borderColor: comment.user_id === currentUser.id ? 'transparent' : `rgb(var(--color-border))`, color: comment.user_id === currentUser.id ? 'white' : `rgb(var(--color-text))` }}>
              <p className="font-bold">{comment.user_name} <span className="opacity-70 font-normal">({comment.user_role})</span></p>
              <p className="whitespace-pre-wrap mt-1">{comment.content}</p>
              <p className="text-right text-xs opacity-70 mt-1">{format(subHours(new Date(comment.created_date), 8), 'MMM d, p')}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-center py-4" style={{ color: `rgb(var(--color-textSecondary))` }}>No comments yet. Ask your teacher a question!</p>}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={allowSubmissions !== false ? "Write a private comment or text submission..." : "Write a private comment..."}
          className="h-16 resize-none"
          disabled={isCommenting || (allowSubmissions !== false && isSubmitting)}
        />
        <div className="flex flex-col gap-1">
          <Button
            onClick={handlePostComment}
            disabled={isCommenting || (allowSubmissions !== false && isSubmitting) || !newComment.trim()}
            size="sm"
            variant="outline"
          >
            {isCommenting ? "..." : "Comment"}
          </Button>
          {allowSubmissions !== false && (
            <Button
              onClick={handleTextSubmission}
              disabled={isCommenting || isSubmitting || !newComment.trim()}
              size="sm"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AssignmentList({ assignments, onUpload, userSubmissions, onDeleteSubmission, currentUser, onTextSubmission, isSubmitting }) {

  const getSubmissionsForAssignment = (assignmentId) => {
    return userSubmissions.filter(sub => sub.assignment_id === assignmentId);
  };

  const getLatestSubmission = (assignmentId) => {
    const submissions = getSubmissionsForAssignment(assignmentId);
    if (submissions.length === 0) return null;
    return submissions.sort((a, b) => new Date(b.submitted_at || b.created_date) - new Date(a.submitted_at || a.created_date))[0];
  };

  const getGradeColor = (grade, maxPoints) => {
    if (grade === null || grade === undefined || !maxPoints) return "text-slate-600";
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold" style={{ color: `rgb(var(--color-text))` }}>Available Assignments</h3>
        <Badge variant="outline" style={{ backgroundColor: `rgb(var(--color-accentLight))` }}>
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {assignments.length === 0 ? (
        <Card className="themed-card backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 mb-4" style={{ color: `rgb(var(--color-border))` }} />
            <p className="font-medium text-lg" style={{ color: `rgb(var(--color-textSecondary))` }}>No assignments available</p>
            <p className="text-sm mt-2" style={{ color: `rgb(var(--color-textSecondary))` }}>Your teacher hasn't posted any assignments yet. If you are expecting an assignment, please close this tab and log back in.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment, index) => {
            const submissions = getSubmissionsForAssignment(assignment.id);
            const latestSubmission = getLatestSubmission(assignment.id);
            const subject = assignment.subject || 'other';
            const isValidDate = assignment.due_date && !isNaN(new Date(assignment.due_date).getTime());

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full themed-card" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold mb-2 line-clamp-2" style={{ color: `rgb(var(--color-text))` }}>
                          {assignment.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${subjectColors[subject] || subjectColors.other} text-xs px-2 py-1 rounded-full`}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                          </Badge>
                          {assignment.allow_submissions !== false && submissions.length > 0 && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 rounded-full">
                              ✓ Submitted
                            </Badge>
                          )}
                          {assignment.allow_submissions !== false && latestSubmission?.is_released && (
                            <Badge className={`border text-xs px-2 py-1 font-bold ${getGradeColor(latestSubmission.final_grade, assignment.max_points)}`} style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                              {latestSubmission.final_grade}/{assignment.max_points}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <FileText className="w-5 h-5 flex-shrink-0" style={{ color: `rgb(var(--color-textSecondary))` }} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center" style={{ color: `rgb(var(--color-textSecondary))` }}>
                        <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: `rgb(var(--color-text))` }}>Due Date</p>
                          <p className="text-xs truncate">
                            {isValidDate ? format(new Date(assignment.due_date), 'MMM d') : 'No due date'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center" style={{ color: `rgb(var(--color-textSecondary))` }}>
                        <Award className="w-4 h-4 mr-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: `rgb(var(--color-text))` }}>{assignment.allow_submissions !== false ? 'Points' : 'Info Only'}</p>
                          <p className="text-xs">{assignment.allow_submissions !== false ? `${assignment.max_points} pts` : 'No grading'}</p>
                        </div>
                      </div>
                    </div>

                    {assignment.allow_submissions !== false && latestSubmission && !latestSubmission.is_released && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="font-medium text-blue-800 text-sm">Under Review</p>
                        <p className="text-xs mt-1 text-blue-600">
                          Your teacher will release grades soon.
                        </p>
                      </div>
                    )}

                    <div className={`flex ${assignment.allow_submissions !== false ? 'justify-between' : 'justify-center'} gap-2 pt-2`}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs border"
                            style={{ 
                              backgroundColor: `rgb(var(--color-surface))`, 
                              borderColor: `rgb(var(--color-border))`, 
                              color: `rgb(var(--color-text))` 
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{assignment.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {assignment.description && (
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>Description</h4>
                                <div 
                                  className="prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
                                  dangerouslySetInnerHTML={{ __html: assignment.description }}
                                />
                              </div>
                            )}

                            {assignment.attachment_urls && assignment.attachment_urls.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>Assignment Files</h4>
                                <div className="space-y-3">
                                  {assignment.attachment_urls.map((url, index) => (
                                    <div key={index} className="rounded-lg p-4 border" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Paperclip className="w-5 h-5" style={{ color: `rgb(var(--color-textSecondary))` }} />
                                          <div>
                                            <p className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>
                                              {assignment.attachment_filenames && assignment.attachment_filenames[index]
                                                ? assignment.attachment_filenames[index]
                                                : `Assignment File ${index + 1}`}
                                            </p>
                                          </div>
                                        </div>
                                        <FilePreview
                                          fileUrl={url}
                                          fileName={assignment.attachment_filenames && assignment.attachment_filenames[index]
                                            ? assignment.attachment_filenames[index]
                                            : `Assignment File ${index + 1}`}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {assignment.allow_submissions !== false && latestSubmission && latestSubmission.is_released && (
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>Your Grade & Feedback</h4>
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold">Grade:</span>
                                    <Badge className={`bg-white ${getGradeColor(latestSubmission.final_grade, assignment.max_points)} border-slate-200 font-bold px-3 py-1`}>
                                      {latestSubmission.final_grade}/{assignment.max_points}
                                    </Badge>
                                  </div>
                                  {latestSubmission.final_feedback && (
                                    <div>
                                      <p className="font-medium mb-2" style={{ color: `rgb(var(--color-text))` }}>Feedback:</p>
                                      <p className="text-sm leading-relaxed" style={{ color: `rgb(var(--color-textSecondary))` }}>{latestSubmission.final_feedback}</p>
                                    </div>
                                  )}
                                  {latestSubmission.feedback_attachment_url && (
                                    <div className="mt-3 pt-3 border-t border-green-200/50">
                                      <p className="font-medium mb-2" style={{ color: `rgb(var(--color-text))` }}>Feedback Attachment:</p>
                                      <FilePreview 
                                        fileUrl={latestSubmission.feedback_attachment_url} 
                                        fileName={latestSubmission.feedback_attachment_filename || "Feedback Attachment"} 
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {assignment.allow_submissions !== false && submissions.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>Your Submissions</h4>
                                <div className="space-y-2">
                                  {submissions.map(sub => (
                                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                                      <FilePreview fileUrl={sub.file_url} fileName={sub.file_name} />
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                          {format(new Date(sub.submitted_at || sub.created_date), 'MMM d, p')}
                                        </span>
                                        {!sub.is_released && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
                                            onClick={() => onDeleteSubmission(sub.id)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {currentUser && <CommentThread
                              assignment={assignment}
                              currentUser={currentUser}
                              onTextSubmission={(textContent) => onTextSubmission(assignment, textContent)}
                              isSubmitting={isSubmitting}
                              allowSubmissions={assignment.allow_submissions}
                            />}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {assignment.allow_submissions !== false && (
                        <Button
                          onClick={() => onUpload(assignment)}
                          size="sm"
                          className="flex-1 text-xs transition-colors"
                          style={{ backgroundColor: `rgb(var(--color-primary))`, color: 'white' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `rgb(var(--color-primaryHover))`}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          {submissions.length > 0 ? "Submit More" : "Submit"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}