import React, { useState, useEffect, useCallback } from "react";
import { Assignment } from "@/entities/Assignment";
import { Submission } from "@/entities/Submission";
import { Class } from "@/entities/Class";
import { ClassEnrollment } from "@/entities/ClassEnrollment";
import { User } from "@/entities/User";
import { ScheduleEvent } from "@/entities/ScheduleEvent";
import { Message } from "@/entities/Message";
import { Quiz } from "@/entities/Quiz";
import { Poll } from "@/entities/Poll";
import { UploadFile, InvokeLLM, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { useTranslation } from "../components/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, GraduationCap, LogOut, Trash2, ChevronDown, RefreshCw, MessageCircle, EyeOff, Eye, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from '@/utils';
import { createCheckoutSession } from "@/functions/createCheckoutSession";
import { syncSubscriptionStatus } from "@/functions/syncSubscriptionStatus";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

import AuthModal from "../components/auth/AuthModal";
import ClassSetup from "../components/teacher/ClassSetup";
import ClassJoin from "../components/student/ClassJoin";
import AssignmentForm from "../components/teacher/AssignmentForm";
import AssignmentCard from "../components/teacher/AssignmentCard";
import SubmissionsList from "../components/teacher/SubmissionsList";
import AssignmentList from "../components/student/AssignmentList";
import SubmissionUpload from "../components/student/SubmissionUpload";
// New import
import ProcessingModal from "../components/common/ProcessingModal"; // New import
import ReactQuill from "react-quill"; // New import
import LanguageSelector from "../components/i18n/LanguageSelector";
import ThemeSelector from "../components/theme/ThemeSelector";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getStandardDescription } from "../components/teacher/StandardsData";

export default function Dashboard({ user: layoutUser, allClasses: layoutAllClasses, isLayoutLoading }) {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState(layoutUser);
    const [currentClass, setCurrentClass] = useState(null);
    const [allClasses, setAllClasses] = useState(layoutAllClasses || []);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [editingAssignment, setEditingAssignment] = useState(null); // New state for editing
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingAssignment, setUploadingAssignment] = useState(null);
    const [showJoinClass, setShowJoinClass] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false); // For teacher to create new class
    const [isRedirecting, setIsRedirecting] = useState(false); // New state for safe redirects
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [textSubmissionState, setTextSubmissionState] = useState({ show: false, status: 'processing', message: '' });

    // Add retry logic for rate-limited requests
    const retryWithBackoff = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (error.response?.status === 429 && i < maxRetries - 1) {
                    console.log(`Rate limit hit, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw error;
                }
            }
        }
    }, []);

    useEffect(() => {
        setUser(layoutUser);
    }, [layoutUser]);

    useEffect(() => {
        setAllClasses(layoutAllClasses || []); // Always sync allClasses state with prop

        if (!layoutAllClasses || layoutAllClasses.length === 0) {
            // If no classes are provided by layout, ensure currentClass is null
            if (currentClass !== null) {
                setCurrentClass(null);
            }
            return;
        }

        // Try to get classId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const classIdFromUrl = urlParams.get('classId');

        let targetClass = null;
        if (classIdFromUrl) {
            targetClass = layoutAllClasses.find(cls => cls.id === classIdFromUrl);
        }

        // Fallback to the first class if URL classId is not found or not provided
        if (!targetClass) {
            targetClass = layoutAllClasses[0];
        }

        // Only update currentClass if it's different from the current state
        if (targetClass && targetClass.id !== currentClass?.id) {
            setCurrentClass(targetClass);
            // Update URL to reflect the chosen class, even if it was the default first one
            const newUrl = `${window.location.pathname}?classId=${targetClass.id}`;
            window.history.replaceState({}, '', newUrl);
        }
        // If targetClass is null (no classes at all) and currentClass is not null, set currentClass to null
        else if (!targetClass && currentClass !== null) {
            setCurrentClass(null);
        }
        // If currentClass is already the targetClass, do nothing.
    }, [layoutAllClasses, currentClass]);

    const loadAssignments = useCallback(async () => {
        if (!currentClass) return;
        
        try {
            // Add a small delay before loading assignments
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const data = await retryWithBackoff(() => 
                Assignment.filter({ class_id: currentClass.id }, "-created_date", 100)
            );
            if (user.app_role === "teacher") {
                setAssignments(data); // Teachers see all assignments regardless of schedule
            } else {
                // Filter assignments for students based on visibility and dates
                const now = new Date();
                const visibleAssignments = data.filter(a => {
                    // Manually hidden by teacher OR not yet active
                    if (!a.is_visible || a.status !== "active") return false;
                    
                    // Check open date
                    if (a.open_date && new Date(a.open_date) > now) return false;
                    
                    // Check close date
                    if (a.close_date && new Date(a.close_date) < now) return false;
                    
                    return true;
                });
                setAssignments(visibleAssignments);
            }
        } catch (error) {
            console.error("Error loading assignments:", error);
            if (error.response?.status === 429) {
                alert("Too many requests. Please wait a moment and refresh the page.");
            }
            setAssignments([]);
        }
    }, [currentClass, user, retryWithBackoff]);

    const loadSubmissions = useCallback(async () => {
        if (!currentClass || !user) return;

        try {
            // Add a small delay before loading submissions
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Fetch assignments for the current class to scope the submission query
            const classAssignments = await retryWithBackoff(() => 
                Assignment.filter({ class_id: currentClass.id }, "-created_date", 100)
            );
            const assignmentIds = classAssignments.map(a => a.id);

            if (assignmentIds.length === 0) {
                setSubmissions([]);
                return;
            }

            if (user.app_role === "teacher") {
                // Load submissions specifically for these assignments with a higher limit
                const classSubmissions = await retryWithBackoff(() => 
                    Submission.filter({ assignment_id: { $in: assignmentIds } }, "-created_date", 2000)
                );
                setSubmissions(classSubmissions);
            } else {
                // Load submissions for this student within these assignments
                const userClassSubmissions = await retryWithBackoff(() => 
                    Submission.filter({ 
                        student_id: user.id, 
                        assignment_id: { $in: assignmentIds } 
                    }, "-created_date", 500)
                );
                setSubmissions(userClassSubmissions);
            }
        } catch (error) {
            console.error("Error loading submissions:", error);
            if (error.response?.status === 429) {
                alert("Too many requests. Please wait a moment and refresh the page.");
            }
            setSubmissions([]);
        }
    }, [currentClass, user, retryWithBackoff]);

    useEffect(() => {
        if (currentClass) {
            loadAssignments();
            loadSubmissions();
        }
    }, [currentClass, loadAssignments, loadSubmissions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleClassSwitch = (selectedClass) => {
        setCurrentClass(selectedClass);
        setAssignments([]);
        setSubmissions([]);
        setSelectedAssignment(null);
        setShowAssignmentForm(false);
        setEditingAssignment(null); // Clear editing state on class switch
        setShowCreateForm(false);

        // Update URL to include class ID for chat navigation
        const newUrl = `${window.location.pathname}?classId=${selectedClass.id}`;
        window.history.replaceState({}, '', newUrl);
    };

    const handleJoinNewClass = async () => {
        // For students to join another class
        const classCode = prompt("Enter the new class code:");
        if (!classCode) return;
        
        try {
            const classes = await retryWithBackoff(() => Class.filter({ class_code: classCode.trim().toUpperCase() }));
            if (classes.length === 0) {
                alert("Class not found.");
                return;
            }
            const targetClass = classes[0];

            const existingEnrollment = await retryWithBackoff(() => ClassEnrollment.filter({ class_id: targetClass.id, student_id: user.id }));
            if (existingEnrollment.length > 0) {
                alert("You are already in this class.");
                // Ensure the URL reflects the class they are already in
                handleClassSwitch(targetClass);
                return;
            }

            await retryWithBackoff(() => ClassEnrollment.create({
                class_id: targetClass.id,
                student_id: user.id,
                student_name: user.full_name,
                student_email: user.email,
                enrolled_at: new Date().toISOString()
            }));

            alert(`Successfully joined ${targetClass.name}!`);
            // This needs a way to tell the Layout to refetch classes.
            // For now, a page reload is the simplest way.
            window.location.reload();
        } catch (error) {
            console.error("Error joining new class:", error);
            alert("Failed to join the class. Please try again.");
        }
    };

    const handleClassJoined = async (newClass) => {
        setShowJoinClass(false);
        // Reload the page to have the Layout refetch all data
        window.location.reload();
    };

    const handleLogin = async () => {
        // A full reload will trigger the Layout's auth check.
        window.location.reload();
    };

    const handleLogout = async () => {
        await User.logout();
        window.location.href = createPageUrl('Landing');
    };

    const handleFeedbackClick = () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSfOJj9XWNP4MXmV__Y_TVLrS2EtRteei5rGa-9uQONch-DvmQ/viewform?usp=dialog', '_blank');
    };

    const handleSyncClick = async () => {
        setIsSyncing(true);
        try {
          const { data, error } = await syncSubscriptionStatus();
          if (error) {
            throw new Error(error.response?.data?.error || error.message);
          }
          alert(data.message || "Sync successful!");
          // After a successful sync, refresh the user data by reloading
          window.location.reload();
        } catch (error) {
          console.error("Error syncing subscription:", error);
          alert(`Sync Failed: ${error.message}`);
        } finally {
          setIsSyncing(false);
        }
    };

    const handleUpgradeClick = async () => {
        // Only allow teachers to upgrade
        if (!user || user.app_role !== 'teacher') {
          alert('Only teachers can upgrade to Schoolace Supercharged.');
          return;
        }
    
        // If already subscribed, go directly to customer portal
        if (user.subscription_status === 'active' && user.subscription_tier === 'supercharged') {
          window.location.href = 'https://billing.stripe.com/p/login/9B6bIUeste2sdGNfJG3Nm00';
          return;
        }
    
        // Start upgrade process
        setIsUpgrading(true);
        try {
            const { data, error: apiError } = await createCheckoutSession();
    
            if (apiError) {
                const errorMessage = apiError.response?.data?.error || apiError.message || "An unknown error occurred during checkout.";
                throw new Error(errorMessage);
            }
            
            if (data && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                 throw new Error("Checkout URL was not received from the server.");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert(error.message);
            setIsUpgrading(false);
        }
      };

    const gradeSubmission = async (submission, assignment) => {
        try {
            await retryWithBackoff(() => Submission.update(submission.id, { grading_status: "ai_grading" }));
            loadSubmissions(); // Refresh UI to show "ai_grading" status

            const gradingPromise = (async () => {
                let fileContent = 'File content could not be extracted.';
                
                // Handle text submissions differently
                if (submission.submission_type === "text" && submission.text_content) {
                    fileContent = submission.text_content;
                } else {
                    // Handle non-gradable file types
                    const fileName = submission.file_name.toLowerCase();
                    if (fileName.endsWith('.mp3') || fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.m4a')) {
                        return retryWithBackoff(() => Submission.update(submission.id, {
                            grading_status: "manual_review",
                            ai_feedback: "This is a video/audio file that requires manual review by your teacher."
                        }));
                    }

                    if (!submission.file_url || submission.file_url.startsWith('blob:')) {
                        return retryWithBackoff(() => Submission.update(submission.id, {
                            grading_status: "manual_review",
                            ai_feedback: "File processing error. This submission requires manual review by your teacher."
                        }));
                    }

                    try {
                        const extraction = await ExtractDataFromUploadedFile({ 
                            file_url: submission.file_url, 
                            json_schema: { type: 'object', properties: { content: { type: 'string' } } } 
                        });
                        if (extraction.status === 'success' && extraction.output?.content) {
                            fileContent = extraction.output.content;
                        }
                    } catch (e) { 
                        console.error("File extraction failed:", e);
                        return retryWithBackoff(() => Submission.update(submission.id, {
                            grading_status: "manual_review",
                            ai_feedback: "This file format requires manual review by your teacher."
                        }));
                    }
                }

                let answerKeyContent = 'No answer key provided.';
                if (assignment.answer_key_url && !assignment.answer_key_url.startsWith('blob:')) {
                    try {
                        const keyExtraction = await ExtractDataFromUploadedFile({ 
                            file_url: assignment.answer_key_url, 
                            json_schema: { type: 'object', properties: { content: { type: 'string' } } } 
                        } );
                        if (keyExtraction.status === 'success' && keyExtraction.output?.content) {
                            answerKeyContent = keyExtraction.output.content;
                        }
                    } catch (e) { 
                        console.error("Answer key extraction failed:", e);
                    }
                }

                const prompt = `
You are an expert academic grader. Your task is to grade a student's work with absolute precision and accuracy based on a specific leniency level.

**GRADING TASK CONTEXT:**
- **Student's Name:** ${submission.student_name}
- **Assignment Title:** ${assignment.title}
- **Teacher's Instructions:** ${assignment.instructions}
- **Maximum Points:** ${assignment.max_points}
- **Grading Leniency:** ${assignment.leniency || 'Neutral'}. Interpret this as follows:
    - **Strict:** Be exacting. No partial credit unless explicitly stated in instructions. Minor errors are penalized. The final grade must precisely reflect the number of correct answers.
    - **Neutral:** Grade fairly based on the instructions. Award partial credit where it makes sense. The final grade should be a balanced reflection of the student's work.
    - **Lenient:** Focus on understanding and effort. Be generous with partial credit. Minor errors should not significantly impact the grade.

${assignment.grading_standards?.selected_codes?.length > 0 ? `
**GRADING STANDARDS (NGSS):**
The teacher has selected specific standards to grade against. You have access to the full description of these standards below. You must evaluate the student's mastery of EACH of these specific standards:
${assignment.grading_standards.selected_codes.map(code => {
    const desc = getStandardDescription(assignment.grading_standards.standard_set, code) || "";
    return `- ${code} (${desc})`;
}).join('\n')}

**MANDATORY FEEDBACK REQUIREMENT:**
In your feedback response, you MUST explicitly address each selected standard individually.
For every standard listed above, type the standard code and specific feedback on how the student met or did not meet that specific standard.

Example format:
"Regarding [Standard Code]: You successfully demonstrated..."
"Regarding [Standard Code]: You missed the key concept of..."
` : ''}

- **Answer Key:** ${answerKeyContent}
- **Student Submission:** ${fileContent}

**CRITICAL RULES:**
- **Address the student directly by their name, ${submission.student_name}, in your feedback.**
- If a student's answer matches the correct answer, it is CORRECT. Never say an answer is wrong when it matches the correct answer.
- Be precise in your calculations.
- If you cannot clearly read the submission, state that clearly in your feedback.
- Provide constructive feedback that helps the student learn.
- **If the grade is lower than the maximum points (${assignment.max_points}) or less than 100%, you MUST explicitly state what was missing or incorrect to achieve full marks. Structure the feedback as "Good Feedback" (what they did well) followed by "Gap Feedback" (what was missing/wrong) to help them close the gap.**

Output your response as JSON with:
- grade: numerical score (0 to ${assignment.max_points})
- feedback: detailed explanation of what was correct/incorrect, starting with the student's name (e.g., "${submission.student_name}, you did a great job on...").
`;

                const result = await InvokeLLM({
                    prompt: prompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            grade: { type: "number" },
                            feedback: { type: "string" }
                        },
                        required: ["grade", "feedback"]
                    }
                });

                return retryWithBackoff(() => Submission.update(submission.id, {
                    ai_grade: result.grade,
                    ai_feedback: result.feedback,
                    grading_status: "ai_graded"
                }));
            })();
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Grading timed out after 3 minutes.')), 180000)
            );

            await Promise.race([gradingPromise, timeoutPromise]);

        } catch (error) {
            console.error("Error grading submission:", error);
            await retryWithBackoff(() => Submission.update(submission.id, { 
                grading_status: "manual_review", 
                ai_feedback: `AI grading failed or timed out and requires manual review. Error: ${error.message}`
            }));
        } finally {
            loadSubmissions();
        }
    };

    const handleTextSubmission = async (assignment, textContent) => {
        setTextSubmissionState({ show: true, status: 'processing', message: 'Submitting your text...' });
        try {
            // Validate assignment is still open before submitting
            const currentAssignment = await retryWithBackoff(() => Assignment.get(assignment.id));
            const now = new Date();
            
            // Check if assignment is hidden or inactive
            if (!currentAssignment.is_visible || currentAssignment.status !== "active") {
                throw new Error("This assignment is no longer accepting submissions.");
            }
            
            // Check if assignment is outside open/close dates
            if (currentAssignment.open_date && new Date(currentAssignment.open_date) > now) {
                throw new Error("This assignment is not yet open for submissions.");
            }
            
            if (currentAssignment.close_date && new Date(currentAssignment.close_date) < now) {
                throw new Error("This assignment is closed and no longer accepting submissions.");
            }

            // Check for previously released submissions for this assignment and student
            const existingSubmissions = submissions.filter(s =>
                s.assignment_id === assignment.id && s.student_id === user.id
            );
            const hasReleasedSubmission = existingSubmissions.some(s => s.is_released);

            // Create the new text submission
            const submission = await retryWithBackoff(() => Submission.create({
                assignment_id: assignment.id,
                student_id: user.id,
                student_name: user.full_name,
                student_email: user.email,
                text_content: textContent,
                submission_type: "text",
                file_name: "Text Submission",
                submitted_at: new Date().toISOString(),
                grading_status: assignment.use_ai_grading ? "pending" : "manual_review"
            }));

            // If there was a previously released submission, "unrelease" all of them
            if (hasReleasedSubmission) {
                const updatePromises = existingSubmissions.map(s => {
                    let newStatus = "pending";
                    if (s.grading_status === 'released') {
                        if (s.teacher_grade !== null && s.teacher_grade !== undefined) {
                            newStatus = "graded";
                        } else if (s.ai_grade !== null && s.ai_grade !== undefined) {
                            newStatus = "ai_graded";
                        }
                    } else {
                        newStatus = s.grading_status;
                    }
                    return retryWithBackoff(() => Submission.update(s.id, {
                        is_released: false,
                        released_at: null,
                        grading_status: newStatus,
                        final_grade: null,
                        final_feedback: null,
                    }));
                });
                await Promise.all(updatePromises);
            }

            if (assignment.use_ai_grading) {
                setTextSubmissionState({ show: true, status: 'processing', message: 'Processing...' });
                await gradeSubmission(submission, assignment);
            }
            
            setTextSubmissionState({ show: true, status: 'success', message: 'Text submission submitted!' });

            setTimeout(() => {
                setTextSubmissionState({ show: false, status: 'processing', message: '' });
                loadSubmissions();
            }, 2000);

        } catch (error) {
            console.error("Error submitting text:", error);
            const errorMessage = error.message || 'Failed to submit text. Please try again.';
            setTextSubmissionState({ show: true, status: 'error', message: errorMessage });
            setTimeout(() => {
                setTextSubmissionState({ show: false, status: 'processing', message: '' });
                loadAssignments(); // Refresh assignments in case one was closed
                loadSubmissions();
            }, 3000);
        }
    };

    const handleAgentAction = async (actionName, params) => {
        switch(actionName) {
            case 'create_assignment':
                // The agent has collected all info, now create it
                const assignmentData = {
                    ...params,
                    class_id: currentClass.id,
                    teacher_id: user.id
                };
                // Show a loading indicator on the dashboard if possible
                await handleCreateAssignment(assignmentData, true); // Pass a flag to indicate it's from agent
                break;
            case 'create_quiz':
                // Navigate to the quiz builder with pre-filled info
                const quizParams = new URLSearchParams({
                    tool: 'quizzes',
                    action: 'create',
                    ...params
                });
                window.location.href = createPageUrl(`ClassTools?classId=${currentClass.id}&${quizParams.toString()}`);
                break;
            case 'send_chat_message':
                // This would require more complex state management, for now we can guide the user
                // Or if we had a global send message function, we could call it.
                // For now, let's assume it's handled conversationally.
                break;
            default:
                console.warn("Unknown agent action:", actionName);
        }
    };

    // New central function for both creating and updating assignments from the form
    const handleAssignmentSubmit = async (formData) => {
        setIsCreating(true);
        try {
            // This is now the single source of truth for file handling.
            
            // 1. Handle Answer Key Upload
            let answerKeyUrl = editingAssignment?.answer_key_url || null;
            let answerKeyFilename = editingAssignment?.answer_key_filename || null;
            if (formData.use_ai_grading && formData.answer_key_file) {
                const uploadedKey = await UploadFile({ file: formData.answer_key_file });
                answerKeyUrl = uploadedKey.file_url;
                answerKeyFilename = formData.answer_key_file.name;
            } else if (!formData.use_ai_grading) {
                // Clear key if AI grading is disabled
                answerKeyUrl = null;
                answerKeyFilename = null;
            }

            // 2. Handle Attachment Uploads
            const newFilesToUpload = formData.attachment_file || [];
            let newlyUploadedFiles = [];
            if (newFilesToUpload.length > 0) {
                const uploadPromises = newFilesToUpload.map(file => UploadFile({ file }));
                const uploadedResults = await Promise.all(uploadPromises);
                newlyUploadedFiles = newFilesToUpload.map((file, index) => ({
                    url: uploadedResults[index].file_url,
                    name: file.name
                }));
            }

            // 3. Combine existing files (that weren't removed) with newly uploaded ones
            const existingAttachments = formData.existing_attachments || [];
            const finalAttachments = {
                attachment_urls: [
                    ...existingAttachments.map(f => f.url),
                    ...newlyUploadedFiles.map(f => f.url)
                ],
                attachment_filenames: [
                    ...existingAttachments.map(f => f.name),
                    ...newlyUploadedFiles.map(f => f.name)
                ]
            };

            // 4. Prepare the final data object for submission
            const finalData = { 
                ...formData, 
                ...finalAttachments,
                answer_key_url: answerKeyUrl,
                answer_key_filename: answerKeyFilename
            };
            
            // Clean up temporary properties before submitting to the database
            delete finalData.attachment_file;
            delete finalData.existing_attachments;
            delete finalData.answer_key_file;

            // Ensure class_id and teacher_id are set
            if (!finalData.class_id && currentClass) {
                finalData.class_id = currentClass.id;
            }
            if (!finalData.teacher_id && user) {
                finalData.teacher_id = user.id;
            }

            // 5. Update or Create
            if (editingAssignment) {
                await retryWithBackoff(() => Assignment.update(editingAssignment.id, finalData));
            } else {
                const newAssignment = await retryWithBackoff(() => Assignment.create(finalData));
                
                // Auto-add to schedule if due date exists (only for new assignments)
                if (finalData.due_date) {
                    try {
                      let scheduleEventDate;
                      const dueDate = new Date(finalData.due_date);
                      
                      if (!isNaN(dueDate.getTime())) {
                        scheduleEventDate = dueDate.toISOString().split('T')[0];
                        
                        await retryWithBackoff(() => ScheduleEvent.create({
                          class_id: finalData.class_id,
                          title: finalData.title,
                          description: `Assignment Due: ${finalData.title}`,
                          event_date: scheduleEventDate,
                          event_type: 'Homework Due'
                        }));
                      }
                    } catch (scheduleError) {
                      console.warn("Failed to add assignment to schedule:", scheduleError);
                    }
                }
            }

            handleCancelForm();
            loadAssignments();

        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("Failed to save assignment. Please check your connection and try again.");
        } finally {
            setIsCreating(false);
        }
    };

    // Existing handleCreateAssignment, now adapted to use handleAssignmentSubmit
    const handleCreateAssignment = async (formData, fromAgent = false) => {
        // This function now primarily passes data to the robust handleAssignmentSubmit handler.
        // It wraps the form data in the expected structure.
        const dataToSubmit = {
            ...formData,
            attachment_file: formData.attachment_file ? [formData.attachment_file] : [],
            existing_attachments: [],
            answer_key_file: formData.answer_key_file || null,
        };
        await handleAssignmentSubmit(dataToSubmit);
    };
    
    const handleUploadSubmission = async (submissionData) => {
        setIsSubmitting(true);
        try {
            // Validate assignment is still open before submitting
            const currentAssignment = await retryWithBackoff(() => Assignment.get(uploadingAssignment.id));
            const now = new Date();
            
            // Check if assignment is hidden or inactive
            if (!currentAssignment.is_visible || currentAssignment.status !== "active") {
                alert("This assignment is no longer accepting submissions.");
                setShowUploadModal(false);
                setUploadingAssignment(null);
                setIsSubmitting(false);
                loadAssignments(); // Refresh to show current state
                return;
            }
            
            // Check if assignment is outside open/close dates
            if (currentAssignment.open_date && new Date(currentAssignment.open_date) > now) {
                alert("This assignment is not yet open for submissions.");
                setShowUploadModal(false);
                setUploadingAssignment(null);
                setIsSubmitting(false);
                loadAssignments(); // Refresh to show current state
                return;
            }
            
            if (currentAssignment.close_date && new Date(currentAssignment.close_date) < now) {
                alert("This assignment is closed and no longer accepting submissions.");
                setShowUploadModal(false);
                setUploadingAssignment(null);
                setIsSubmitting(false);
                loadAssignments(); // Refresh to show current state
                return;
            }

            const { file_url } = await UploadFile({ file: submissionData.file });

            // Check for previously released submissions for this assignment and student
            const existingSubmissions = submissions.filter(s =>
                s.assignment_id === uploadingAssignment.id && s.student_id === user.id
            );
            const hasReleasedSubmission = existingSubmissions.some(s => s.is_released);

            // Create the new submission
            const submission = await retryWithBackoff(() => Submission.create({
                assignment_id: uploadingAssignment.id,
                student_id: user.id,
                student_name: user.full_name,
                student_email: user.email,
                file_url: file_url,
                file_name: submissionData.file.name,
                submitted_at: new Date().toISOString(),
                grading_status: uploadingAssignment.use_ai_grading ? "pending" : "manual_review"
            }));

            // If there was a previously released submission, "unreleased" all of them
            if (hasReleasedSubmission) {
                const updatePromises = existingSubmissions.map(s => {
                    let newStatus = "pending";
                    if (s.grading_status === 'released') {
                        if (s.teacher_grade !== null && s.teacher_grade !== undefined) {
                            newStatus = "graded";
                        } else if (s.ai_grade !== null && s.ai_grade !== undefined) {
                            newStatus = "ai_graded";
                        }
                    } else {
                        newStatus = s.grading_status;
                    }
                    return retryWithBackoff(() => Submission.update(s.id, {
                        is_released: false,
                        released_at: null,
                        grading_status: newStatus,
                        final_grade: null,
                        final_feedback: null,
                    }));
                });
                await Promise.all(updatePromises);
            }

            // The important part: only close modal after AI grading is done
            if (uploadingAssignment.use_ai_grading) {
                await gradeSubmission(submission, uploadingAssignment); // Wait for it to finish
            }
            // Now close modal and reset UI
            setShowUploadModal(false);
            setUploadingAssignment(null);
            setIsSubmitting(false);
            loadSubmissions();
        } catch (error) {
            console.error("Error submitting assignment:", error);
            setIsSubmitting(false);
            setShowUploadModal(false);
            setUploadingAssignment(null);
            loadSubmissions();
            alert("Failed to submit assignment. Please try again.");
        }
    };
    

    const handleReleaseGrade = async (submissionId, gradeType) => {
        try {
            const primarySubmission = submissions.find(s => s.id === submissionId);
            if (!primarySubmission) return;

            // Data that will be synced across ALL submissions for this student/assignment
            const sharedUpdateData = {
                grading_status: "released",
                final_grade: gradeType === 'ai' ? primarySubmission.ai_grade : primarySubmission.teacher_grade,
                final_feedback: gradeType === 'ai' ? primarySubmission.ai_feedback : primarySubmission.teacher_feedback,
            };

            // Add feedback attachment URL to all if it exists
            if (gradeType !== 'ai' && primarySubmission.feedback_attachment_url) {
                sharedUpdateData.feedback_attachment_url = primarySubmission.feedback_attachment_url;
                sharedUpdateData.feedback_attachment_filename = primarySubmission.feedback_attachment_filename;
            }

            // Specific data ONLY for the submission being released
            const primaryUpdateData = {
                ...sharedUpdateData,
                is_released: true,
                released_at: new Date().toISOString(),
            };

            // Find all related submissions
            const allSubmissionsForAssignment = submissions.filter(
                s => s.student_id === primarySubmission.student_id && s.assignment_id === primarySubmission.assignment_id
            );

            // Create a list of promises to update each submission accordingly
            const updatePromises = allSubmissionsForAssignment.map(sub => {
                if (sub.id === submissionId) {
                    // This is the one we clicked, give it the full "released" status
                    return retryWithBackoff(() => Submission.update(sub.id, primaryUpdateData));
                } else {
                    // These are the others, just sync the grade and lock them
                    return retryWithBackoff(() => Submission.update(sub.id, sharedUpdateData));
                }
            });

            // Execute all updates
            await Promise.all(updatePromises);

            // Refresh the data from the server
            loadSubmissions();

        } catch (error) {
            console.error("Error releasing grade:", error);
            alert("Failed to release grade. Please try again.");
        }
    };

    const handleManualGrade = async (submissionId, gradeData) => {
        try {
            const updateData = {
                teacher_grade: gradeData.grade,
                teacher_feedback: gradeData.feedback,
                grading_status: "graded"
            };
            if (gradeData.feedback_attachment) {
                const { file_url } = await UploadFile({ file: gradeData.feedback_attachment });
                updateData.feedback_attachment_url = file_url;
                updateData.feedback_attachment_filename = gradeData.feedback_attachment.name;
            }

            await retryWithBackoff(() => Submission.update(submissionId, updateData));
            loadSubmissions();
        } catch (error) {
            console.error("Error saving manual grade:", error);
        }
    };
    
    const handleToggleAceAi = async (checked) => {
        if (!currentClass) return;
        try {
            await retryWithBackoff(() => Class.update(currentClass.id, { hide_ace_ai: checked }));
            // Update local state immediately for responsiveness
            setCurrentClass(prev => ({ ...prev, hide_ace_ai: checked }));
            // Also update in allClasses list to persist across class switches
            setAllClasses(prev => prev.map(c => c.id === currentClass.id ? { ...c, hide_ace_ai: checked } : c));
            // Force a layout refresh to update navigation visibility
            window.location.reload();
        } catch (error) {
            console.error("Error updating class settings:", error);
            alert("Failed to update settings. Please try again.");
        }
    };

    const handleToggleAiTools = async (checked) => {
        if (!currentClass) return;
        try {
            await retryWithBackoff(() => Class.update(currentClass.id, { hide_ai_tools: checked }));
            // Update local state immediately for responsiveness
            setCurrentClass(prev => ({ ...prev, hide_ai_tools: checked }));
            // Also update in allClasses list to persist across class switches
            setAllClasses(prev => prev.map(c => c.id === currentClass.id ? { ...c, hide_ai_tools: checked } : c));
            // Force a layout refresh to update navigation visibility
            window.location.reload();
        } catch (error) {
            console.error("Error updating class settings:", error);
            alert("Failed to update settings. Please try again.");
        }
    };

    const handleDeleteClass = async () => {
        if (!currentClass) return;

        const confirmMessage = `Are you sure you want to delete "${currentClass.name}"? This will delete all assignments, submissions, quizzes, polls, and messages associated with this class. This action cannot be undone.`;
        if (!window.confirm(confirmMessage)) return;

        const confirmCode = prompt(`To confirm deletion, please type the class code: "${currentClass.class_code}"`);
        if (confirmCode !== currentClass.class_code) {
            alert("Incorrect class code. Deletion cancelled.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Delete Enrollments
            const enrollments = await retryWithBackoff(() => ClassEnrollment.filter({ class_id: currentClass.id }));
            await Promise.all(enrollments.map(e => retryWithBackoff(() => ClassEnrollment.delete(e.id))));

            // 2. Delete Assignments & Submissions
            const classAssignments = await retryWithBackoff(() => Assignment.filter({ class_id: currentClass.id }));
            for (const assignment of classAssignments) {
                 const assignmentSubmissions = await retryWithBackoff(() => Submission.filter({ assignment_id: assignment.id }));
                 await Promise.all(assignmentSubmissions.map(s => retryWithBackoff(() => Submission.delete(s.id))));
                 await retryWithBackoff(() => Assignment.delete(assignment.id));
            }
            
            // 3. Delete Schedule Events
            const events = await retryWithBackoff(() => ScheduleEvent.filter({ class_id: currentClass.id }));
            await Promise.all(events.map(e => retryWithBackoff(() => ScheduleEvent.delete(e.id))));

            // 4. Delete Messages
            const messages = await retryWithBackoff(() => Message.filter({ class_id: currentClass.id }));
            await Promise.all(messages.map(m => retryWithBackoff(() => Message.delete(m.id))));

            // 5. Delete Quizzes
            const quizzes = await retryWithBackoff(() => Quiz.filter({ class_id: currentClass.id }));
            await Promise.all(quizzes.map(q => retryWithBackoff(() => Quiz.delete(q.id))));

            // 6. Delete Polls
            const polls = await retryWithBackoff(() => Poll.filter({ class_id: currentClass.id }));
            await Promise.all(polls.map(p => retryWithBackoff(() => Poll.delete(p.id))));

            // 7. Delete Class
            await retryWithBackoff(() => Class.delete(currentClass.id));

            alert(`Class "${currentClass.name}" has been deleted.`);
            window.location.reload(); 

        } catch (error) {
            console.error("Error deleting class:", error);
            alert("Failed to delete class. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to delete this assignment? This will delete all student submissions and cannot be undone.")) {
            return;
        }
        try {
            // Find assignment details *before* deleting it
            const assignmentToDelete = assignments.find(a => a.id === assignmentId);

            // Delete all submissions for this assignment first
            const submissionsToDelete = await retryWithBackoff(() => Submission.filter({ assignment_id: assignmentId }));
            for (const submission of submissionsToDelete) {
                await retryWithBackoff(() => Submission.delete(submission.id));
            }

            // Delete the assignment
            await retryWithBackoff(() => Assignment.delete(assignmentId));

            // If the assignment existed and had a due date, delete its schedule event
            if (assignmentToDelete && assignmentToDelete.due_date) {
                try {
                    const scheduleEventsToDelete = await retryWithBackoff(() => ScheduleEvent.filter({
                        class_id: assignmentToDelete.class_id,
                        event_type: 'Homework Due',
                        title: assignmentToDelete.title,
                        description: `Assignment Due: ${assignmentToDelete.title}`
                    }));
                    
                    for (const event of scheduleEventsToDelete) {
                        await retryWithBackoff(() => ScheduleEvent.delete(event.id));
                    }
                } catch(scheduleError) {
                    console.warn("Could not delete corresponding schedule event. It may need to be removed manually.", scheduleError);
                }
            }
            
            // Refresh state
            loadAssignments();
            loadSubmissions();
            setSelectedAssignment(null); // Deselect if it was selected
        } catch (error) {
            console.error("Error deleting assignment:", error);
            alert("Failed to delete the assignment. Please try again.");
        }
    };

    const handleDuplicateAssignment = async (assignment, destinationClassId) => {
        try {
            const duplicatedAssignment = {
                title: assignment.title,
                description: assignment.description,
                instructions: assignment.instructions,
                max_points: assignment.max_points,
                due_date: assignment.due_date,
                subject: assignment.subject,
                use_ai_grading: assignment.use_ai_grading,
                leniency: assignment.leniency,
                answer_key_url: assignment.answer_key_url,
                answer_key_filename: assignment.answer_key_filename,
                attachment_urls: assignment.attachment_urls, 
                attachment_filenames: assignment.attachment_filenames,
                class_id: destinationClassId,
                teacher_id: user.id,
                status: 'active',
                is_visible: assignment.is_visible, // Retain visibility
                open_date: assignment.open_date, // Retain open date
                close_date: assignment.close_date // Retain close date
            };

            const newAssignment = await retryWithBackoff(() => Assignment.create(duplicatedAssignment));

            // Auto-add to schedule if due date exists
            if (assignment.due_date) {
                try {
                    let scheduleEventDate;
                    const dueDate = new Date(assignment.due_date);
                    
                    if (!isNaN(dueDate.getTime())) {
                        scheduleEventDate = dueDate.toISOString().split('T')[0];
                        
                        await retryWithBackoff(() => ScheduleEvent.create({
                            class_id: destinationClassId,
                            title: assignment.title,
                            description: `Assignment Due: ${assignment.title}`,
                            event_date: scheduleEventDate,
                            event_type: 'Homework Due'
                        }));
                    }
                } catch (scheduleError) {
                    console.warn("Failed to add duplicated assignment to schedule:", scheduleError);
                }
            }

            const destinationClass = allClasses.find(c => c.id === destinationClassId);
            alert(`Assignment "${assignment.title}" successfully duplicated to ${destinationClass?.name || 'the destination class'}!`);
        } catch (error) {
            console.error("Error duplicating assignment:", error);
            alert("Failed to duplicate assignment. Please try again.");
        }
    };
    
    const handleDeleteSubmission = async (submissionId) => {
         if (!window.confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
            return;
        }
        try {
            await retryWithBackoff(() => Submission.delete(submissionId));
            loadSubmissions(); // Refresh the submissions list for both student and teacher
        } catch (error) {
            console.error("Error deleting submission:", error);
            alert("Failed to delete the submission. Please try again.");
        }
    };

    const handleToggleVisibility = async (assignmentId, isVisible, shouldReopen = false) => {
        try {
            const updateData = { is_visible: isVisible };
            // If re-opening, clear the close date to make it active again
            if (shouldReopen) {
                updateData.close_date = null;
            }
            await retryWithBackoff(() => Assignment.update(assignmentId, updateData));
            loadAssignments();
        } catch (error) {
            console.error("Error toggling assignment visibility:", error);
            alert("Failed to update assignment visibility. Please try again.");
        }
    };

    const handleEditAssignment = (assignment) => {
        setSelectedAssignment(null); // Ensure submissions list is not showing
        setEditingAssignment(assignment);
        setShowAssignmentForm(true);
    };

    const handleCreateNewAssignment = () => {
        setSelectedAssignment(null); // Ensure submissions list is not showing
        setEditingAssignment(null); // Clear any editing state
        setShowAssignmentForm(true);
    };

    const handleCancelForm = () => {
        setShowAssignmentForm(false);
        setEditingAssignment(null); // Clear editing state
    };

    const getSubmissionCount = (assignmentId) => submissions.filter(s => s.assignment_id === assignmentId).length;
    const getUserSubmissions = () => submissions.filter(s => s.student_id === user?.id);
    const handleAssignmentClick = (assignment) => { if (user.app_role === "teacher") setSelectedAssignment(assignment) };
    const handleUploadClick = (assignment) => { setUploadingAssignment(assignment); setShowUploadModal(true); };

    if (pageLoading || (isLayoutLoading && !user)) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: `rgb(var(--color-background))` }}>
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center"
                    >
                        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                            {t('dashboard.teachingHub')}
                        </h1>
                        <p className="text-lg text-slate-500 mt-4 font-medium tracking-wide">
                            {t('common.poweredByACE')}
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isRedirecting) {
        return <div className="flex items-center justify-center h-screen bg-slate-50">Loading...</div>;
    }

    if (!user) {
        return <AuthModal onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen pb-20 md:pb-8 relative" style={{ backgroundColor: `rgb(var(--color-background))` }}>
            <div className="text-white relative overflow-hidden" style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)), rgb(var(--color-accent)))` }}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-2 text-white">
                                {t('dashboard.welcome')}, {user.full_name || user.email}!
                            </motion.h1>
                            <div className="flex items-center gap-4">
                                {currentClass ? (
                                    <div className="flex items-center gap-3">
                                        <p className="text-blue-100 font-medium">
                                            {currentClass.name} {user.app_role === 'teacher' ? `- Class Code: ${currentClass.class_code}`: ''}
                                        </p>
                                        {allClasses.length > 1 && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-indigo-600 border-white/20 hover:bg-white/10 hover:text-white rounded-xl">
                                                        {t('dashboard.switchClass')} <ChevronDown className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {allClasses.map((cls) => (
                                                        <DropdownMenuItem 
                                                            key={cls.id} 
                                                            onClick={() => handleClassSwitch(cls)}
                                                            className={currentClass.id === cls.id ? "bg-indigo-50" : ""}
                                                        >
                                                            {cls.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                        {user.app_role === 'student' && (
                                            <Button variant="outline" size="sm" onClick={handleJoinNewClass} className="text-indigo-600 border-white/20 hover:bg-white/10 hover:text-white rounded-xl">
                                                <Plus className="w-4 h-4 mr-1" />
                                                {t('dashboard.joinAnotherClass')}
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-blue-100 font-medium">{t('dashboard.loadingClassroom')}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleFeedbackClick} 
                                    className="bg-white rounded-xl transition-colors"
                                    style={{ color: `rgb(var(--color-primary))` }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`;
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.color = `rgb(var(--color-primary))`;
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {t('dashboard.feedback')}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleLogout} 
                                    className="bg-white rounded-xl transition-colors"
                                    style={{ color: `rgb(var(--color-primary))` }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`;
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.color = `rgb(var(--color-primary))`;
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t('dashboard.logout')}
                                </Button>
                            {/* Show supercharged badge for students (non-interactive) */}
                            {user.app_role === 'student' && (
                                <>
                                    <Button 
                                        onClick={() => {}} 
                                        className="text-white text-xs px-3 py-3 rounded-full shadow-lg font-bold tracking-wider cursor-default h-10"
                                        size="sm"
                                        style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}
                                    >
                                        SUPERCHARGED
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button 
                                                variant="ghost"
                                                size="icon"
                                                title="Settings"
                                                className="bg-white rounded-xl h-9 w-9 transition-colors"
                                                style={{ color: `rgb(var(--color-primary))` }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`;
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'white';
                                                    e.currentTarget.style.color = `rgb(var(--color-primary))`;
                                                }}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Settings</DialogTitle>
                                                <DialogDescription>
                                                    Manage your application settings
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-6 space-y-6">
                                                <div className="flex items-center justify-between space-x-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <Label className="text-base font-medium">Language</Label>
                                                        <span className="text-sm text-slate-500">
                                                            Change application language
                                                        </span>
                                                    </div>
                                                    <LanguageSelector />
                                                </div>
                                                <div className="pt-6 border-t flex items-center justify-between space-x-4">
                                                    <div className="flex flex-col space-y-1">
                                                        <Label className="text-base font-medium">Theme</Label>
                                                        <span className="text-sm text-slate-500">
                                                            Choose your preferred color scheme
                                                        </span>
                                                    </div>
                                                    <ThemeSelector />
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button 
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setIsSyncing(true);
                                            setTimeout(() => window.location.reload(), 1000);
                                        }}
                                        disabled={isSyncing}
                                        title="Refresh Page"
                                        className="bg-white rounded-xl h-9 w-9 transition-colors"
                                        style={{ color: `rgb(var(--color-primary))` }}
                                        onMouseEnter={(e) => {
                                            if (!isSyncing) {
                                                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`;
                                                e.currentTarget.style.color = 'white';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSyncing) {
                                                e.currentTarget.style.backgroundColor = 'white';
                                                e.currentTarget.style.color = `rgb(var(--color-primary))`;
                                            }
                                        }}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                    </Button>
                                </>
                                )}
                            {user.app_role === 'teacher' && (
                                <Button 
                                    onClick={() => {}} 
                                    className="text-white text-xs px-3 py-3 rounded-full shadow-lg font-bold tracking-wider cursor-default h-10"
                                    size="sm"
                                    style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}
                                >
                                    SUPERCHARGED
                                </Button>
                            )}
                            {user.app_role === 'teacher' && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="ghost"
                                            size="icon"
                                            title="Class Settings"
                                            className="bg-white rounded-xl h-9 w-9 transition-colors"
                                            style={{ color: `rgb(var(--color-primary))` }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`;
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                                e.currentTarget.style.color = `rgb(var(--color-primary))`;
                                            }}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Class Settings</DialogTitle>
                                            <DialogDescription>
                                                Manage settings for {currentClass?.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-6 space-y-6">
                                        <div className="flex items-center justify-between space-x-4">
                                            <div className="flex flex-col space-y-1">
                                                <Label className="text-base font-medium">Language</Label>
                                                <span className="text-sm text-slate-500">
                                                    Change application language
                                                </span>
                                            </div>
                                            <LanguageSelector />
                                        </div>
                                        <div className="pt-6 border-t flex items-center justify-between space-x-4">
                                            <div className="flex flex-col space-y-1">
                                                <Label className="text-base font-medium">Theme</Label>
                                                <span className="text-sm text-slate-500">
                                                    Choose your preferred color scheme
                                                </span>
                                            </div>
                                            <ThemeSelector />
                                        </div>
                                        <div className="pt-6 border-t flex items-center justify-between space-x-4">
                                            <div className="flex flex-col space-y-1">
                                                <Label htmlFor="ace-ai-toggle" className="text-base font-medium">Hide ACE AI Chat from students</Label>
                                                <span className="text-sm text-slate-500">
                                                    Prevent students in this class from having conversations with ACE
                                                </span>
                                            </div>
                                            <Switch 
                                                id="ace-ai-toggle" 
                                                checked={currentClass?.hide_ace_ai || false}
                                                onCheckedChange={handleToggleAceAi}
                                            />
                                            </div>
                                            <div className="flex items-center justify-between space-x-4">
                                            <div className="flex flex-col space-y-1">
                                                <Label htmlFor="ai-tools-toggle" className="text-base font-medium">Hide AI Tools from students</Label>
                                                <span className="text-sm text-slate-500">
                                                    Prevent students in this class from accessing the AI Tools tab
                                                </span>
                                            </div>
                                            <Switch 
                                                id="ai-tools-toggle" 
                                                checked={currentClass?.hide_ai_tools || false}
                                                onCheckedChange={handleToggleAiTools}
                                            />
                                            </div>
                                            </div>
                                                </DialogContent>
                                </Dialog>
                            )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AnimatePresence mode="wait">
                    {user.app_role === "teacher" ? (
                        <motion.div 
                            key="teacher" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            {!currentClass && allClasses.length === 0 ? (
                                <ClassSetup onClassReady={handleClassJoined} isFirstClass={true} />
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `rgba(var(--color-primary), 0.1)` }}>
                                                <Users className="w-6 h-6" style={{ color: `rgb(var(--color-primary))` }} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{t('dashboard.teacherDashboard')}</h2>
                                                <p className="mt-1" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('dashboard.teacherDescription')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!showAssignmentForm && !selectedAssignment && !showCreateForm && (
                                                <Button 
                                                    onClick={handleCreateNewAssignment} 
                                                    className="text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                                    style={{ backgroundColor: `rgb(var(--color-primary))` }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `rgb(var(--color-primaryHover))`}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`}
                                                >
                                                    <Plus className="w-5 h-5 mr-2" /> {t('dashboard.createAssignment')}
                                                </Button>
                                            )}
                                            {!showAssignmentForm && !selectedAssignment && !showCreateForm && (
                                                <Button onClick={() => setShowCreateForm(true)} variant="outline" className="px-6 py-3 rounded-xl">
                                                    <Plus className="w-5 h-5 mr-2" /> {t('dashboard.createNewClass')}
                                                </Button>
                                            )}
                                            {!showAssignmentForm && !selectedAssignment && !showCreateForm && currentClass && (
                                                <Button onClick={handleDeleteClass} variant="destructive" className="px-6 py-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 border border-red-200">
                                                    <Trash2 className="w-5 h-5 mr-2" /> {t('classSetup.deleteClass') || "Delete Class"}
                                                </Button>
                                            )}
                                            {(showAssignmentForm || selectedAssignment || showCreateForm) && (
                                                <Button variant="outline" onClick={() => { setShowAssignmentForm(false); setSelectedAssignment(null); setShowCreateForm(false); setEditingAssignment(null); }} className="rounded-xl border-slate-300 hover:bg-slate-50">
                                                    ← {t('dashboard.backToDashboard')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {showCreateForm && <ClassSetup onClassReady={() => { setShowCreateForm(false); handleClassJoined(); }} isFirstClass={false} />}

                                    {showAssignmentForm && ( <AssignmentForm onSubmit={handleAssignmentSubmit} onCancel={handleCancelForm} isSubmitting={isCreating} assignmentToEdit={editingAssignment} /> )}
                                    {selectedAssignment && (
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <Button variant="outline" onClick={() => setSelectedAssignment(null)} className="rounded-xl border-slate-300 hover:bg-slate-50">
                                                        ← {t('dashboard.backToAssignments')}
                                                    </Button>
                                                    <div>
                                                        <h3 className="text-2xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{selectedAssignment.title}</h3>
                                                        <ReactQuill
                                                          value={selectedAssignment.description}
                                                          readOnly={true}
                                                          theme="bubble"
                                                          className="text-slate-600 [&_.ql-editor]:p-0 [&_.ql-container]:border-none"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                                                    className="rounded-xl"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            <SubmissionsList submissions={submissions.filter(s => s.assignment_id === selectedAssignment.id)} assignment={selectedAssignment} onReleaseGrade={handleReleaseGrade} onManualGrade={handleManualGrade} currentUser={user} />
                                        </div>
                                    )}
                                    {!showAssignmentForm && !selectedAssignment && !showCreateForm && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className="space-y-6"
                                        >
                                            <h3 className="text-2xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{t('dashboard.yourAssignments')}</h3>
                                            {assignments.length === 0 ? (
                                                <div className="text-center py-16">
                                                    <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: `rgb(var(--color-border))` }} />
                                                    <p className="font-medium text-lg" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('dashboard.noAssignmentsYet')}</p>
                                                    <p className="text-sm mt-2" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('dashboard.createFirstAssignment')}</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <AnimatePresence>
                                                        {assignments.map((assignment, index) => {
                                                            const submissionCount = getSubmissionCount(assignment.id);
                                                            return (
                                                                <motion.div
                                                                    key={assignment.id}
                                                                    layout
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -20 }}
                                                                    transition={{ 
                                                                        delay: index * 0.1,
                                                                        duration: 0.5,
                                                                        ease: "easeOut"
                                                                    }}
                                                                >
                                                                    <AssignmentCard
                                                                        assignment={assignment}
                                                                        submissionCount={submissionCount}
                                                                        onClick={() => setSelectedAssignment(assignment)}
                                                                        onDelete={handleDeleteAssignment}
                                                                        onDuplicate={handleDuplicateAssignment}
                                                                        onToggleVisibility={handleToggleVisibility}
                                                                        onEdit={handleEditAssignment} // New prop
                                                                        allClasses={allClasses}
                                                                        currentClass={currentClass}
                                                                    />
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="student" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            transition={{ duration: 0.5 }}
                        >
                            {!currentClass ? (
                                <ClassJoin onClassJoined={handleClassJoined} />
                            ) : (
                                <>
                                    <div className="flex items-center space-x-4 mb-8">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `rgba(var(--color-secondary), 0.2)` }}>
                                            <GraduationCap className="w-6 h-6" style={{ color: `rgb(var(--color-secondary))` }} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{t('dashboard.studentPortal')}</h2>
                                            <p className="mt-1" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('dashboard.studentDescription')}</p>
                                        </div>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <AssignmentList 
                                            assignments={assignments} 
                                            onUpload={handleUploadClick} 
                                            userSubmissions={getUserSubmissions()} 
                                            onDeleteSubmission={handleDeleteSubmission} 
                                            currentUser={user} 
                                            onTextSubmission={handleTextSubmission} 
                                            isSubmitting={isSubmitting || textSubmissionState.show} 
                                        />
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {textSubmissionState.show && (
                    <ProcessingModal 
                        isVisible={textSubmissionState.show} 
                        status={textSubmissionState.status} 
                        message={textSubmissionState.message} 
                    />
                )}
                {showUploadModal && uploadingAssignment && (
                    <SubmissionUpload assignment={uploadingAssignment} onSubmit={handleUploadSubmission} onCancel={() => { setShowUploadModal(false); setUploadingAssignment(null); }} isSubmitting={isSubmitting} />
                )}
                {showJoinClass && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full">
                            <ClassJoin 
                                onClassJoined={handleClassJoined} 
                                onCancel={() => setShowJoinClass(false)}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}