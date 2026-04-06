import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import { User, FileText, Star, Send, Edit, CheckCircle, Paperclip, AlertTriangle, MessageSquare, Users, Inbox, LayoutGrid, List, Eye } from "lucide-react";
import { format, subHours } from "date-fns";
import { motion } from "framer-motion";
import FilePreview from "../common/FilePreview";
import { AssignmentComment } from "@/entities/AssignmentComment";
import { ClassEnrollment } from "@/entities/ClassEnrollment";
import { Submission } from "@/entities/Submission";
import DisputeReview from "./DisputeReview";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ai_grading: "bg-blue-100 text-blue-800 border-blue-200",
  ai_graded: "bg-green-100 text-green-800 border-green-200",
  manual_review: "bg-purple-100 text-purple-800 border-purple-200",
  graded: "bg-green-100 text-green-200 border-green-200",
  released: "bg-gray-100 text-gray-800 border-gray-200",
  error: "bg-red-100 text-red-800 border-red-200"
};

const CommentThread = ({ assignment, currentUser, allClassStudents }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [studentsWithComments, setStudentsWithComments] = useState([]);

    const fetchStudentsWithComments = useCallback(async () => {
        try {
            const allComments = await AssignmentComment.filter({ assignment_id: assignment.id });
            const uniqueStudentIds = [...new Set(allComments.map(c => c.student_id))];
            const studentsWhoCommented = allClassStudents.filter(s => uniqueStudentIds.includes(s.student_id));
            setStudentsWithComments(studentsWhoCommented);
        } catch (error) {
            console.error("Error fetching students with comments:", error);
        }
    }, [assignment.id, allClassStudents]);

    useEffect(() => {
        if (assignment.id && allClassStudents.length > 0) {
            fetchStudentsWithComments();
        }
    }, [assignment.id, allClassStudents, fetchStudentsWithComments]);

    const fetchComments = useCallback(async () => {
        if (!selectedStudentId || !assignment) return;
        const fetchedComments = await AssignmentComment.filter({ 
            assignment_id: assignment.id, 
            student_id: selectedStudentId 
        }, '-created_date');
        setComments(fetchedComments.reverse());
    }, [selectedStudentId, assignment.id]);

    useEffect(() => {
        if (selectedStudentId) {
            fetchComments();
        } else {
            setComments([]);
        }
    }, [selectedStudentId, fetchComments]);

    const handlePostComment = async () => {
        if (!newComment.trim() || !selectedStudentId) return;
        setIsPosting(true);
        try {
            await AssignmentComment.create({
                assignment_id: assignment.id,
                student_id: selectedStudentId,
                user_id: currentUser.id,
                user_name: currentUser.full_name,
                user_role: currentUser.app_role,
                content: newComment.trim()
            });
            setNewComment("");
            fetchComments();
            fetchStudentsWithComments();
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const selectedStudent = allClassStudents.find(s => s.student_id === selectedStudentId);
    
    return (
        <Card className="mt-8 bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3 text-indigo-600" />
                    Private Comments
                </CardTitle>
            </CardHeader>
            <CardContent>
                {studentsWithComments.length > 0 ? (
                    <>
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Students with active conversations:</h4>
                            <div className="flex flex-wrap gap-2">
                                {studentsWithComments.map(student => (
                                    <Button
                                        key={student.student_id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedStudentId(student.student_id)}
                                        className={`text-xs ${selectedStudentId === student.student_id ? 'bg-blue-100 border-blue-400 font-bold' : 'bg-white'}`}
                                    >
                                        {student.student_name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {selectedStudentId ? (
                             <>
                                <div className="space-y-3 max-h-72 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    {comments.length > 0 ? comments.map(comment => (
                                        <div key={comment.id} className={`flex ${comment.user_id === currentUser.id ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex flex-col ${comment.user_id === currentUser.id ? "items-end" : "items-start"} max-w-[80%]`}>
                                                <div className={`text-sm p-3 rounded-lg shadow-sm ${comment.user_id === currentUser.id ? "bg-indigo-600 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                                                    <p className="font-bold mb-1">
                                                        {comment.user_name}
                                                        <span className={`font-normal ml-1 ${comment.user_id === currentUser.id ? "text-indigo-200" : "text-slate-500"}`}>
                                                            ({comment.user_role})
                                                        </span>
                                                    </p>
                                                    <p className="whitespace-pre-wrap leading-snug">{comment.content}</p>
                                                </div>
                                                <p className={`text-xs mt-1 ${comment.user_id === currentUser.id ? "text-indigo-400" : "text-slate-500"}`}>
                                                    {format(subHours(new Date(comment.created_date), 8), 'MMM d, p')}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            No comments with {selectedStudent?.student_name} yet for this assignment.
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Textarea 
                                        value={newComment} 
                                        onChange={e => setNewComment(e.target.value)} 
                                        placeholder={`Write a private comment to ${selectedStudent?.student_name}...`} 
                                        className="h-20 resize-none" 
                                    />
                                    <Button onClick={handlePostComment} disabled={isPosting || !newComment.trim()} className="shrink-0 self-end">
                                        {isPosting ? <span className="animate-pulse">...</span> : <Send className="w-4 h-4" />}
                                        <span className="sr-only">Send Comment</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>Click on a student's name above to view their comments.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-4" />
                        <p className="font-medium">No Private Comments Yet</p>
                        <p className="text-sm">When a student starts a conversation on this assignment, it will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function SubmissionsList({ submissions, assignment, onReleaseGrade, onManualGrade, currentUser, onDisputeReleased }) {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [manualGrade, setManualGrade] = useState("");
  const [manualFeedback, setManualFeedback] = useState("");
  const [feedbackAttachment, setFeedbackAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allClassStudents, setAllClassStudents] = useState([]);
  
  // Bulk Release State
  const [showBulkReleaseModal, setShowBulkReleaseModal] = useState(false);
  const [bulkGradeValue, setBulkGradeValue] = useState("");
  const [isBulkReleasing, setIsBulkReleasing] = useState(false);


  const getGradeColor = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return "text-slate-600";
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStudentGrade = (student) => {
    const sub = student.submissions[0];
    if (!sub) return null;
    if (sub.is_released && sub.final_grade !== null && sub.final_grade !== undefined) return sub.final_grade;
    if (sub.teacher_grade !== null && sub.teacher_grade !== undefined) return sub.teacher_grade;
    if (sub.ai_grade !== null && sub.ai_grade !== undefined) return sub.ai_grade;
    return null;
  };

  const loadClassStudents = useCallback(async () => {
    try {
      const enrollments = await ClassEnrollment.filter({ class_id: assignment.class_id });
      setAllClassStudents(enrollments);
    } catch (error) {
      console.error("Error loading class students:", error);
    }
  }, [assignment.class_id]);

  useEffect(() => {
    if (assignment && assignment.class_id) {
      loadClassStudents();
    }
  }, [assignment, loadClassStudents]);

  const handleManualGrade = async () => {
    if (!selectedSubmission || !manualGrade.trim() || !manualFeedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onManualGrade(selectedSubmission.id, {
        grade: parseFloat(manualGrade),
        feedback: manualFeedback.trim(),
        feedback_attachment: feedbackAttachment
      });
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setManualGrade("");
      setManualFeedback("");
      setFeedbackAttachment(null);
    } catch (error) {
      console.error("Error submitting manual grade:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    const currentGrade = submission.teacher_grade;
    setManualGrade(currentGrade !== null && currentGrade !== undefined ? String(currentGrade) : "");
    setManualFeedback(submission.teacher_feedback || "");
    setFeedbackAttachment(null);
    setShowGradeModal(true);
  };

  const openEditAiGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setManualGrade(submission.ai_grade !== null && submission.ai_grade !== undefined ? String(submission.ai_grade) : "");
    setManualFeedback(submission.ai_feedback || "");
    setFeedbackAttachment(null);
    setShowGradeModal(true);
  };
  
  const studentsWithSubmissions = Object.values(submissions.reduce((acc, sub) => {
      if (!acc[sub.student_id]) {
          acc[sub.student_id] = {
              student_id: sub.student_id,
              student_name: sub.student_name,
              submissions: [],
          };
      }
      acc[sub.student_id].submissions.push(sub);
      return acc;
  }, {})).map(student => ({
      ...student,
      submissions: student.submissions.sort((a, b) => new Date(b.submitted_at || b.created_date) - new Date(a.submitted_at || a.created_date)),
      is_released: student.submissions.some(s => s.is_released),
  })).sort((a, b) => {
      const getGrade = (student) => {
          const latest = student.submissions[0];
          if (!latest) return -1;
          // Prioritize released grades, then draft teacher grades, then draft AI grades
          // This ensures that even unreleased AI grades are used for sorting
          if (latest.final_grade !== null && latest.final_grade !== undefined) return Number(latest.final_grade);
          if (latest.teacher_grade !== null && latest.teacher_grade !== undefined) return Number(latest.teacher_grade);
          if (latest.ai_grade !== null && latest.ai_grade !== undefined) return Number(latest.ai_grade);
          return -1;
      };
      
      const gradeA = getGrade(a);
      const gradeB = getGrade(b);
      
      // If one has a grade and the other doesn't, graded comes first
      if (gradeA !== -1 && gradeB === -1) return -1;
      if (gradeA === -1 && gradeB !== -1) return 1;
      
      // If both have grades, sort descending (highest score first)
      if (gradeA !== gradeB) return gradeB - gradeA;
      
      // If both ungraded or same grade, sort by name
      return a.student_name.localeCompare(b.student_name);
  });

  useEffect(() => {
    if (!selectedStudentId && studentsWithSubmissions.length > 0) {
      setSelectedStudentId(studentsWithSubmissions[0].student_id);
    }
    if (selectedStudentId && !studentsWithSubmissions.some(s => s.student_id === selectedStudentId)) {
        setSelectedStudentId(studentsWithSubmissions.length > 0 ? studentsWithSubmissions[0].student_id : null);
    }
  }, [submissions, studentsWithSubmissions, selectedStudentId]);

  const selectedStudentData = studentsWithSubmissions.find(s => s.student_id === selectedStudentId);

  const handleBulkReleaseCurrent = async () => {
    if (!confirm("Are you sure you want to release all current grades? This will make grades visible to all students who have a grade assigned.")) return;
    
    setIsBulkReleasing(true);
    let releasedCount = 0;
    let skippedCount = 0;
    
    try {
        for (const student of studentsWithSubmissions) {
            const sub = student.submissions[0];
            if (!sub || !sub.id) { skippedCount++; continue; }
            if (sub.is_released) { skippedCount++; continue; }
            
            // Determine grade to release: Teacher grade takes precedence over AI grade
            let gradeToRelease = null;
            let feedbackToRelease = "";
            
            if (sub.teacher_grade !== null && sub.teacher_grade !== undefined) {
                gradeToRelease = sub.teacher_grade;
                feedbackToRelease = sub.teacher_feedback || "";
            } else if (sub.ai_grade !== null && sub.ai_grade !== undefined) {
                gradeToRelease = sub.ai_grade;
                feedbackToRelease = sub.ai_feedback || "";
            } else {
                skippedCount++;
                continue; // No grade to release
            }
            
            await Submission.update(sub.id, {
                is_released: true,
                released_at: new Date().toISOString(),
                grading_status: 'released',
                final_grade: gradeToRelease,
                final_feedback: feedbackToRelease
            });
            releasedCount++;
        }
        
        setShowBulkReleaseModal(false);
        window.location.reload();
    } catch (e) {
        console.error("Error bulk releasing grades:", e);
    } finally {
        setIsBulkReleasing(false);
    }
  };

  const handleBulkReleaseFixed = async () => {
    if (!bulkGradeValue || isNaN(bulkGradeValue)) {
        alert("Please enter a valid numeric grade.");
        return;
    }
    


    setIsBulkReleasing(true);
    try {
        const gradeNum = parseFloat(bulkGradeValue);
        const promises = studentsWithSubmissions.map(student => {
            const sub = student.submissions[0];
            return Submission.update(sub.id, {
                is_released: true,
                released_at: new Date().toISOString(),
                grading_status: 'released',
                final_grade: gradeNum,
                teacher_grade: gradeNum, // Also update teacher grade to match
                // Preserve existing feedback if any, or set default
                final_feedback: sub.teacher_feedback || sub.ai_feedback || "Graded via bulk release."
            });
        });
        
        await Promise.all(promises);
        setShowBulkReleaseModal(false);
        setBulkGradeValue("");
        window.location.reload(); // Refresh to show changes
    } catch (e) {
        console.error("Error bulk releasing fixed grades:", e);
    } finally {
        setIsBulkReleasing(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900">Submissions</h3>

          </div>
          <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowBulkReleaseModal(true)}
                className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              >
                <Send className="w-4 h-4 mr-2" />
                Release All
              </Button>
              <Badge variant="outline" className="bg-slate-50">
                {studentsWithSubmissions.length} student{studentsWithSubmissions.length !== 1 ? 's' : ''} submitted
              </Badge>
          </div>
        </div>

        {submissions.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No submissions yet</p>
              <p className="text-sm text-slate-400 mt-1">Students will see this assignment and can submit their work.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-3 space-y-2 h-fit">
              <h4 className="font-semibold text-slate-800 px-2 flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-slate-500" /> Students
              </h4>
              {studentsWithSubmissions.map(student => {
                const grade = getStudentGrade(student);
                return (
                <button
                  key={student.student_id}
                  onClick={() => setSelectedStudentId(student.student_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${
                    selectedStudentId === student.student_id ? 'bg-indigo-100 text-indigo-900 shadow-sm' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium">{student.student_name}</span>
                    <span className="text-xs text-slate-500 truncate max-w-full">{student.submissions[0]?.student_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {grade !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${student.is_released ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {grade}/{assignment.max_points}
                      </span>
                    )}
                    {student.is_released && <CheckCircle className="w-4 h-4 text-green-500" title="Grade Released" />}
                    <span className={`text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center ${
                        selectedStudentId === student.student_id ? 'bg-indigo-200' : 'bg-slate-200'
                    }`}>
                        {student.submissions.length}
                    </span>
                  </div>
                </button>
              )})}
            </div>

            <div className="md:col-span-2 space-y-4">
              {selectedStudentData ? (
                selectedStudentData.submissions.map((submission, index) => {
                  const mostRecentSubmission = selectedStudentData.submissions[0];
                  const isNewestSubmission = submission.id === mostRecentSubmission.id;
                  
                  return (
                  <motion.div
                    key={submission.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-4">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Submission {selectedStudentData.submissions.length - index}
                                <span className="text-sm text-slate-500 font-normal ml-2">({format(new Date(submission.submitted_at || submission.created_date), 'MMM d, p')})</span>
                            </CardTitle>
                            <Badge className={`${statusColors[submission.grading_status]} text-xs px-2 py-1 rounded-full`}>
                                {submission.grading_status.replace(/_/g, ' ')}
                            </Badge>
                         </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FilePreview 
                          fileUrl={submission.file_url} 
                          fileName={submission.file_name} 
                        />
                        
                        {submission.submission_type === "text" && submission.text_content && (
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-4">
                            <h4 className="font-semibold text-slate-800 mb-2">Text Submission:</h4>
                            <p className="text-slate-700 whitespace-pre-wrap">{submission.text_content}</p>
                          </div>
                        )}

                        {submission.ai_grade !== null && submission.ai_grade !== undefined && submission.ai_feedback && (isNewestSubmission || submission.is_released) && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-blue-500 mr-2" />
                                <span className="font-semibold text-slate-700">AI Grade</span>
                              </div>
                              <Badge className={`bg-white ${getGradeColor(submission.ai_grade, assignment.max_points)} border-slate-200 text-sm px-2 py-1 rounded-full font-bold`}>
                                {submission.ai_grade}/{assignment.max_points}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.ai_feedback}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-blue-700/80 p-2 bg-blue-100/70 rounded-lg">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                              <span>Please review the AI's grade and the student's work for accuracy before releasing the grade.</span>
                            </div>
                          </div>
                        )}

                        {submission.teacher_grade !== null && submission.teacher_grade !== undefined && submission.teacher_feedback && (isNewestSubmission || submission.is_released) && (
                          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-green-500 mr-2" />
                                <span className="font-semibold text-slate-700">Your Grade</span>
                              </div>
                              <Badge className={`bg-white ${getGradeColor(submission.teacher_grade, assignment.max_points)} border-slate-200 text-sm px-2 py-1 rounded-full font-bold`}>
                                {submission.teacher_grade}/{assignment.max_points}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.teacher_feedback}</p>
                            {submission.feedback_attachment_url && (
                                <div className="mt-3">
                                    <FilePreview fileUrl={submission.feedback_attachment_url} fileName={submission.feedback_attachment_filename} />
                                </div>
                            )}
                          </div>
                        )}
                        

                        {isNewestSubmission && submission.student_dispute && (
                          <DisputeReview
                            submission={submission}
                            assignment={assignment}
                            onReleased={onDisputeReleased}
                          />
                        )}

                        {isNewestSubmission && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            {(submission.grading_status === "ai_graded" || submission.grading_status === "ai_grading") && !submission.is_released && (
                            <>
                                {submission.grading_status === "ai_graded" && (
                                  <>
                                    <Button size="sm" onClick={() => onReleaseGrade(submission.id, "ai")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-xs">
                                        <Send className="w-3 h-3 mr-1.5" /> Release AI Grade
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => openEditAiGradeModal(submission)} className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1 text-xs">
                                        <Edit className="w-3 h-3 mr-1.5" /> Edit AI Grade
                                    </Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline" onClick={() => openGradeModal(submission)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-1 text-xs">
                                <Edit className="w-3 h-3 mr-1.5" /> Grade Manually
                                </Button>
                            </>
                            )}
                            
                            {submission.grading_status === "graded" && !submission.is_released && (
                            <Button size="sm" onClick={() => onReleaseGrade(submission.id, "teacher")} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1 text-xs">
                                <Send className="w-3 h-3 mr-1.5" /> Release Grade
                            </Button>
                            )}
                            
                            {submission.is_released && (
                            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <CheckCircle className="w-3 h-3" /> Released: <span className="font-bold">{submission.final_grade}/{assignment.max_points}</span>
                            </Badge>
                            )}
                            
                            {(submission.grading_status === "pending" || submission.grading_status === "manual_review") && (
                            <Button size="sm" variant="outline" onClick={() => openGradeModal(submission)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg px-3 py-1 text-xs">
                                <Edit className="w-3 h-3 mr-1.5" /> Grade Now
                            </Button>
                            )}
                        </div>
                        )}

                        {!isNewestSubmission && submission.is_released && (
                          <div className="pt-2 border-t border-slate-100">
                            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3" /> Released: <span className="font-bold">{submission.final_grade}/{assignment.max_points}</span> on {format(new Date(submission.released_at), 'MMM d')}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
                })
              ) : (
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 md:col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <Inbox className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Select a student</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">Choose a student from the list on the left to view their submitted work.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <CommentThread 
        assignment={assignment} 
        currentUser={currentUser}
        allClassStudents={allClassStudents}
      />

      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Grade Submission - {selectedSubmission?.student_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-semibold text-slate-700">
                  Grade (out of {assignment.max_points})
                </Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max={assignment.max_points}
                  value={manualGrade}
                  onChange={(e) => setManualGrade(e.target.value)}
                  placeholder={`Enter grade (0-${assignment.max_points})`}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm font-semibold text-slate-700">
                Feedback
              </Label>
              <Textarea
                id="feedback"
                value={manualFeedback}
                onChange={(e) => setManualFeedback(e.target.value)}
                placeholder="Provide detailed feedback for the student..."
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-32"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Attach Graded Work (Optional)</Label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl">
                <Paperclip className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 font-medium">
                    {feedbackAttachment ? feedbackAttachment.name : "Attach annotated student work."}
                  </p>
                </div>
                <input
                  type="file"
                  id="feedback-attachment"
                  className="hidden"
                  onChange={(e) => setFeedbackAttachment(e.target.files[0])}
                />
                <Button asChild variant="outline">
                  <label htmlFor="feedback-attachment" className="cursor-pointer">
                    {feedbackAttachment ? "Change File" : "Choose File"}
                  </label>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowGradeModal(false)}
                className="px-6 py-2 rounded-xl border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualGrade}
                disabled={isSubmitting || !manualGrade.trim() || !manualFeedback.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {isSubmitting ? "Saving..." : "Save Grade"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Release Modal */}
      <Dialog open={showBulkReleaseModal} onOpenChange={setShowBulkReleaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Release Grades</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Option 1: Release Current Grades</h4>
                <p className="text-xs text-slate-500">Releases the current Teacher Grade (if set) or AI Grade for all submissions that haven't been released yet.</p>
                <Button 
                    onClick={handleBulkReleaseCurrent} 
                    disabled={isBulkReleasing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                    {isBulkReleasing ? "Processing..." : "Release Current Grades"}
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or</span>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Option 2: Set Same Grade for All</h4>
                <p className="text-xs text-slate-500">Apply the same grade to every submission and release it immediately.</p>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        placeholder={`Grade (Max ${assignment.max_points})`}
                        value={bulkGradeValue}
                        onChange={(e) => setBulkGradeValue(e.target.value)}
                        className="flex-1"
                    />
                    <Button 
                        onClick={handleBulkReleaseFixed}
                        disabled={isBulkReleasing || !bulkGradeValue}
                        variant="secondary"
                    >
                        Apply & Release
                    </Button>
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}