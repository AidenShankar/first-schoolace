import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { GraduationCap, MessageSquare, BookOpen, Sparkles, SlidersHorizontal, Bot, Share2, Calendar, BrainCircuit, CalendarClock, LineChart } from "lucide-react";
import { LanguageProvider, useLanguage } from "./components/i18n/LanguageContext";
import { t } from "./components/i18n/translations";
import { User } from '@/entities/User';
import { Class } from '@/entities/Class';
import { ClassEnrollment } from '@/entities/ClassEnrollment';
import { QuizSubmission } from '@/entities/QuizSubmission';
import { Assignment } from '@/entities/Assignment';
import { Submission } from '@/entities/Submission';
import { Message } from '@/entities/Message';
import { Quiz } from '@/entities/Quiz';
import { QuizQuestion } from '@/entities/QuizQuestion';
import { Poll } from '@/entities/Poll';
import { ScheduleEvent } from '@/entities/ScheduleEvent';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { getAgentSystemPrompt } from './components/agent/systemPrompt';
import { syncSubscriptionStatus } from "@/functions/syncSubscriptionStatus";


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);
  
  // --- AI AGENT STATE ---
  const [isAgentMinimized, setAgentMinimized] = useState(true);
  const [agentConversation, setAgentConversation] = useState([]);
  const [isAgentLoading, setAgentLoading] = useState(false);
  const [isAgentThinking, setAgentThinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Add retry logic for rate-limited requests
  const retryWithBackoff = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
          try {
              return await fn();
          } catch (error) {
              lastError = error;
              if (error.response?.status === 429 && i < maxRetries - 1) {
                  console.log(`Rate limit hit, retrying in ${delay}ms...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  delay *= 2; // Exponential backoff
              } else {
                  throw error;
              }
          }
      }
      throw lastError; // Re-throw the last error if all retries fail
  }, []); // No external dependencies, so empty array is correct

  // --- Agent Persistence & Initialization ---
  useEffect(() => {
    const savedConversation = localStorage.getItem('agentConversation');
    if (savedConversation) {
      let isCorrupt = false;
      let parsed;
      try {
        parsed = JSON.parse(savedConversation);
        if (!Array.isArray(parsed)) {
            isCorrupt = true;
        } else {
            for (const msg of parsed) {
                if (msg.actions && Array.isArray(msg.actions)) {
                    if (msg.actions.some(action => action.target === 'ai-detector')) {
                        isCorrupt = true;
                        break;
                    }
                }
            }
        }
      } catch (e) {
        isCorrupt = true;
      }
      
      if (isCorrupt) {
        localStorage.removeItem('agentConversation');
        setAgentConversation([{ role: 'assistant', content: "Hello! Your previous chat history was cleared due to an error. How can I assist you today?" }]);
      } else {
        setAgentConversation(parsed);
      }
    } else {
      setAgentConversation([{ role: 'assistant', content: "Hello! I'm your AI Personal Agent. How can I assist you today?" }]);
    }
  }, []);

  useEffect(() => {
    if (agentConversation.length > 0) {
      localStorage.setItem('agentConversation', JSON.stringify(agentConversation));
    }
  }, [agentConversation]);

  // --- End AI Agent State ---

  const checkQuizStatus = useCallback(async (studentId) => {
    try {
      const activeSubmissions = await retryWithBackoff(() => QuizSubmission.filter({ 
          student_id: studentId, 
          status: 'in-progress' 
      }));
      setQuizInProgress(activeSubmissions.length > 0);
    } catch (e) {
      console.error("Error checking quiz status:", e);
      setQuizInProgress(false);
    }
  }, [retryWithBackoff]); // useCallback for memoization

  const fetchUserAndClasses = useCallback(async () => { // Make it a useCallback
      setIsLayoutLoading(true);
      try {
        const userData = await retryWithBackoff(() => User.me());

        // FIX: If user is logged in but hasn't completed setup, redirect them.
        // BUT: Don't redirect if we're already on the Setup page to avoid infinite loop
        if (userData && !userData.setup_complete && currentPageName !== 'Setup') {
            window.location.href = createPageUrl('Setup');
            return; // Stop further execution to allow redirect to happen
        }

        setUser(userData);
        if (userData?.app_role === 'student') {
          checkQuizStatus(userData.id);
        }
        
        // Load all user's classes
        if (userData?.app_role === 'teacher') {
          const classes = await retryWithBackoff(() => Class.filter({ teacher_id: userData.id }, "-created_date", 50));
          setAllClasses(classes);
        } else if (userData?.app_role === 'student') {
          const enrollments = await retryWithBackoff(() => ClassEnrollment.filter({ student_id: userData.id }, "-created_date", 50));
          if (enrollments.length > 0) {
            const fetchedClasses = await retryWithBackoff(() => Class.list("-created_date", 100));
            const enrolledClasses = fetchedClasses.filter(cls => 
              enrollments.some(e => e.class_id === cls.id)
            );
            setAllClasses(enrolledClasses);
          }
        }

      } catch (e) {
        setUser(null);
        setQuizInProgress(false);
        console.error("Failed to fetch user:", e);
      } finally {
        setIsLayoutLoading(false);
      }
    }, [checkQuizStatus, retryWithBackoff, currentPageName]); // Added currentPageName to dependencies


  useEffect(() => {
    fetchUserAndClasses();
    
    // Refresh user data when page becomes visible (catches webhook updates)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserAndClasses();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleQuizStateChange = (event) => {
        setQuizInProgress(event.detail.quizInProgress);
    };

    window.addEventListener('quiz-state-change', handleQuizStateChange);
    return () => {
      window.removeEventListener('quiz-state-change', handleQuizStateChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange); // Cleanup visibilitychange listener
    };
  }, [fetchUserAndClasses]); // Use fetchUserAndClasses here

  useEffect(() => {
    const fetchClassInfo = async () => {
      // No need to run if user or the list of all classes isn't loaded yet.
      if (!user) return; 

      const urlParams = new URLSearchParams(window.location.search);
      let classIdFromUrl = urlParams.get('classId');
      let resolvedClassId = classIdFromUrl;

      // OPTIMIZATION: If no classId is in the URL, and we have classes loaded,
      // use the first one from the existing list instead of making a new API call.
      if (!resolvedClassId && allClasses.length > 0) {
          resolvedClassId = allClasses[0].id;
      }
      
      if (resolvedClassId && resolvedClassId !== currentClassId) { // Only update if different
          setCurrentClassId(resolvedClassId);
          try {
              // OPTIMIZATION: First, try to find the class from the already-loaded `allClasses` state.
              const classFromState = allClasses.find(c => c.id === resolvedClassId);
              if (classFromState) {
                  setCurrentClass(classFromState);
              } else {
                  // Fallback API call only if the class isn't in our state (e.g., stale URL).
                  const cls = await retryWithBackoff(() => Class.filter({ id: resolvedClassId }));
                  if (cls.length > 0) setCurrentClass(cls[0]);
                  else setCurrentClass(null);
              }
          } catch (e) {
              console.error("Error fetching class:", e);
              setCurrentClass(null);
          }
      } else if (!resolvedClassId && currentClassId) { // If no resolved classId, but one was previously set
          setCurrentClassId(null);
          setCurrentClass(null);
      }
    };
    fetchClassInfo();
  }, [location.search, user, currentClassId, allClasses, retryWithBackoff]); // Dependency on allClasses is key here

  // Redirect to quiz if one is in progress and user tries to navigate away
  useEffect(() => {
    if (user?.app_role === 'student' && quizInProgress && currentPageName !== 'ClassTools' && currentClassId) {
        // Using window.location.href to force a full navigation/reload which helps
        // ensure the "locked down" state is fully applied and prevents back-button
        // navigation around the lockdown.
        window.location.href = createPageUrl(`ClassTools?classId=${currentClassId}`);
    }
  }, [user, quizInProgress, currentPageName, currentClassId, location.pathname]);


  const isQuizModeActive = user?.app_role === 'student' && quizInProgress;
  const isLandingPage = currentPageName === 'Landing';
  const isCompliancePage = currentPageName === 'Compliance'; // Add this line
  const isDemoPage = currentPageName === 'Demo';
  const isExampleLearningTrackerPage = currentPageName === 'examplelearningtracker';

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await syncSubscriptionStatus();
      if (error) {
        throw new Error(error.response?.data?.error || error.message);
      }
      alert(data.message || "Sync successful!");
      // After a successful sync, refresh the user data to update the UI
      await fetchUserAndClasses(); 
    } catch (error) {
      console.error("Error syncing subscription:", error);
      alert(`Sync Failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };


  // --- AGENT LOGIC ---
  const findClassByName = (name) => {
      if (!name) return currentClass; // If no name given, assume current class if available
      const normalizedName = name.toLowerCase();
      // Try to find exact match first, then partial
      return allClasses.find(c => c.name.toLowerCase() === normalizedName) ||
             allClasses.find(c => c.name.toLowerCase().includes(normalizedName));
  };
  
  const updateAgentContext = useCallback(async () => {
    if (!user) return {};
    
    // Determine the relevant class ID for context fetching
    const relevantClassId = currentClass?.id || (allClasses.length > 0 ? allClasses[0].id : null);
    
    // If no relevant class and not a teacher trying to see all classes, return limited context
    if (!relevantClassId && user.app_role !== 'teacher') {
      return { allClasses: allClasses.map(c => ({id: c.id, name: c.name})) };
    }

    try {
        let assignments = [];
        let submissions = [];
        let quizzes = [];
        let polls = [];
        let scheduleEvents = [];
        let enrollments = [];

        if (relevantClassId) {
            [assignments, quizzes, polls, scheduleEvents] = await Promise.all([
                retryWithBackoff(() => Assignment.filter({ class_id: relevantClassId })),
                retryWithBackoff(() => Quiz.filter({ class_id: relevantClassId })),
                retryWithBackoff(() => Poll.filter({ class_id: relevantClassId })),
                retryWithBackoff(() => ScheduleEvent.filter({ class_id: relevantClassId })),
            ]);

            if (user.app_role === 'teacher') {
                const assignmentIds = assignments.map(a => a.id);
                if (assignmentIds.length > 0) {
                    submissions = await retryWithBackoff(() => Submission.filter({ assignment_id: { $in: assignmentIds }}));
                }
                enrollments = await retryWithBackoff(() => ClassEnrollment.filter({ class_id: relevantClassId }));
            } else { // Student
                submissions = await retryWithBackoff(() => Submission.filter({ student_id: user.id }));
            }
        }

        return {
            assignments: assignments.map(a => ({ id: a.id, title: a.title, due_date: a.due_date, max_points: a.max_points })),
            submissions: submissions.map(s => ({ id: s.id, assignment_id: s.assignment_id, student_id: s.student_id, student_name: s.student_name, grade: s.final_grade, feedback: s.final_feedback, grading_status: s.grading_status })),
            quizzes: quizzes.map(q => ({ id: q.id, title: q.title, status: q.status, time_limit_minutes: q.time_limit_minutes })),
            polls: polls.map(p => ({ id: p.id, question: p.question, status: p.status, options: p.options })),
            scheduleEvents: scheduleEvents.map(e => ({ id: e.id, title: e.title, event_date: e.event_date, event_type: e.event_type })),
            students: enrollments.map(e => ({ id: e.student_id, name: e.student_name })), // Only for teachers
            currentClassInfo: currentClass ? { id: currentClass.id, name: currentClass.name } : null,
            allClasses: allClasses.map(c => ({ id: c.id, name: c.name }))
        };
    } catch (error) {
        console.error("Error updating agent context:", error);
        return {};
    }
  }, [user, currentClass, allClasses, retryWithBackoff]);

  const handleAgentSendMessage = async (userInput, file = null) => {
    const newUserMessage = { role: 'user', content: userInput };
    setAgentConversation(prev => [...prev, newUserMessage]);
    setAgentLoading(true);

    let currentTaskContext = { userInput, currentPageName };
    if (file) {
        try {
            setAgentThinking(true);
            const { file_url } = await retryWithBackoff(() => UploadFile({ file }));
            currentTaskContext.file_url = file_url;
            currentTaskContext.file_name = file.name;
            setAgentConversation(prev => [...prev, { role: 'assistant', content: `File "${file.name}" uploaded successfully. Analyzing...` }]);
        } catch (e) {
            console.error("File upload error:", e);
            setAgentConversation(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't upload that file." }]);
            setAgentLoading(false);
            setAgentThinking(false);
            return;
        } finally {
            setAgentThinking(false);
        }
    }

    try {
        const freshContext = await updateAgentContext();
        const systemPrompt = getAgentSystemPrompt(user, currentClass, freshContext, currentTaskContext);
        
        // Take last 8 messages (4 user, 4 assistant) plus new user message
        const conversationHistoryForLLM = agentConversation.slice(-8).map(msg => ({ role: msg.role, content: msg.content }));
        
        let messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistoryForLLM,
            newUserMessage // Ensure the latest user message is always included
        ];

        const responseSchema = {
            type: "object",
            properties: {
                content: { type: "string", description: "The agent's response message to the user." },
                actions: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string", description: "The action type (e.g., navigate, create_quiz)." },
                            label: { type: "string", description: "Button text to display for the action." },
                            target: { type: "string", description: "The internal function name to call for this action (e.g., CREATE_QUIZ, SEND_CLASS_CHAT)." },
                            params: { type: "object", description: "Parameters for the target function." }
                        },
                        required: ["type", "label", "target", "params"]
                    }
                },
                data_needed: { type: "boolean", description: "Set to true if more data is needed before providing a final answer or taking action." }
            },
            required: ["content"] // Actions and data_needed are optional properties
        };

        let response = await retryWithBackoff(() => InvokeLLM({
            prompt: JSON.stringify(messages),
            response_json_schema: responseSchema
        }));
        
        // Handle data query loop
        if (response.data_needed) {
            setAgentThinking(true);
            // Refresh context and potentially refine the prompt for the second LLM call
            const updatedContext = await updateAgentContext(); // Fetch the latest data
            
            // Add the assistant's request for data (if any was provided in initial response)
            if (response.content) {
                messages.push({ role: 'assistant', content: response.content });
            }
            
            const dataQueryMessage = { role: 'user', content: `I have the latest system context: ${JSON.stringify(updatedContext)}. Continue with the original request: "${userInput}".` };
            messages.push(dataQueryMessage);
            
            response = await retryWithBackoff(() => InvokeLLM({ 
                prompt: JSON.stringify(messages), 
                response_json_schema: responseSchema // Use the same schema
            }));
            setAgentThinking(false);
        }

        // Ensure response is an object with 'content' and 'role' properties for display
        const finalAgentResponse = typeof response === 'object' && response !== null 
            ? response 
            : { content: String(response), actions: [], data_needed: false }; // Default actions and data_needed if not present
        setAgentConversation(prev => [...prev, { role: 'assistant', ...finalAgentResponse }]);
    } catch (error) {
        console.error("Agent Error:", error);
        setAgentConversation(prev => [...prev, { role: 'assistant', content: `I encountered an error. Please try again. (Details: ${error.message || error})` }]);
    } finally {
        setAgentLoading(false);
    }
  };

  const handleAgentAction = async (action) => {
      setAgentConversation(prev => [...prev, { role: 'assistant', content: `Executing: **${action.label || action.target.replace(/_/g, ' ')}**...` }]);
      try {
          // Resolve targetClassId based on action params or current context
          let targetClass = null;
          if (action.params && action.params.class_name) {
            targetClass = findClassByName(action.params.class_name);
          } else {
            targetClass = currentClass; // Default to current class if no class_name specified
          }
          const targetClassId = targetClass?.id;
          
          if (action.target.startsWith('CREATE') && user?.app_role !== 'teacher') {
            throw new Error("You must be a teacher to perform creation actions.");
          }

          switch (action.target) {
              case 'NAVIGATE_TO_AI_TOOL':
                  window.location.href = createPageUrl(`AITools?tool=${action.params.tool_id}`);
                  break;
                  
              case 'SEND_CLASS_CHAT':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  await retryWithBackoff(() => Message.create({ class_id: targetClassId, content: action.params.content, user_id: user.id, user_name: user.full_name, user_role: user.app_role }));
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Message sent to ${targetClass.name} chat!` }]);
                  break;

              case 'SEND_CHAT_TO_ALL_CLASSES':
                  if (user?.app_role !== 'teacher') {
                      throw new Error("Only teachers can send messages to all classes.");
                  }
                  if (!allClasses || allClasses.length === 0) {
                      throw new Error("You do not have any classes to send a message to.");
                  }
                  
                  const messageContent = action.params.content;
                  if (!messageContent) throw new Error("Message content is required.");

                  for (const cls of allClasses) {
                      await retryWithBackoff(() => Message.create({
                          class_id: cls.id,
                          content: messageContent,
                          user_id: user.id,
                          user_name: user.full_name,
                          user_role: user.app_role
                      }));
                  }
                  
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Message sent to all ${allClasses.length} classes!` }]);
                  break;
                  
              case 'CREATE_QUIZ':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  const newQuiz = await retryWithBackoff(() => Quiz.create({
                      class_id: targetClassId,
                      teacher_id: user.id,
                      title: action.params.title,
                      time_limit_minutes: action.params.time_limit_minutes || 60, // Default to 60 mins if not provided
                      show_results: action.params.show_results || false, // Default to false
                      status: 'active'
                  }));
                  if (action.params.questions && Array.isArray(action.params.questions) && action.params.questions.length > 0) {
                      const questionsToCreate = action.params.questions.map(q => ({ ...q, quiz_id: newQuiz.id }));
                      await retryWithBackoff(() => QuizQuestion.bulkCreate(questionsToCreate));
                  }
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Quiz "${action.params.title}" created in ${targetClass.name}!`, actions: [{ type:'navigate', label: 'View Quiz', target: 'VIEW_QUIZ_DETAILS', params: { class_id: targetClassId, quiz_id: newQuiz.id } }] }]);
                  break;
                  
              case 'VIEW_QUIZ_DETAILS':
                  if (!action.params.class_id || !action.params.quiz_id) throw new Error("Missing class_id or quiz_id for viewing quiz.");
                  window.location.href = createPageUrl(`ClassTools?classId=${action.params.class_id}&tool=quizzes&quizId=${action.params.quiz_id}`);
                  break;

              case 'CREATE_ASSIGNMENT':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  await retryWithBackoff(() => Assignment.create({ ...action.params, class_id: targetClassId, teacher_id: user.id }));
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Assignment "${action.params.title}" created in ${targetClass.name}!` }]);
                  break;

              case 'DELETE_ASSIGNMENT':
                  await retryWithBackoff(() => Assignment.delete(action.params.assignment_id));
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Assignment deleted!` }]);
                  break;

              case 'DELETE_ALL_ASSIGNMENTS':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  const classAssignments = await retryWithBackoff(() => Assignment.filter({ class_id: targetClassId }));
                  let deletedCount = 0;
                  for (const assignment of classAssignments) {
                      await retryWithBackoff(() => Assignment.delete(assignment.id));
                      deletedCount++;
                  }
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Deleted ${deletedCount} assignments from ${targetClass.name}!` }]);
                  break;

              case 'RELEASE_GRADES':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  const assignmentToGrade = (await retryWithBackoff(() => Assignment.filter({ title: action.params.assignment_title, class_id: targetClassId })))[0];
                  if (!assignmentToGrade) throw new Error(`Assignment "${action.params.assignment_title}" not found in ${targetClass.name}.`);
                  const submissionsToRelease = await retryWithBackoff(() => Submission.filter({ assignment_id: assignmentToGrade.id, grading_status: 'ai_graded' }));
                  if (submissionsToRelease.length === 0) {
                      throw new Error("No AI-graded submissions found to release for this assignment.");
                  }
                  for (const sub of submissionsToRelease) {
                      await retryWithBackoff(() => Submission.update(sub.id, { is_released: true, released_at: new Date().toISOString(), grading_status: 'released', final_grade: sub.ai_grade, final_feedback: sub.ai_feedback }));
                  }
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Released ${submissionsToRelease.length} AI-generated grades for "${assignmentToGrade.title}"!` }]);
                  break;

              case 'CREATE_POLL':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  await retryWithBackoff(() => Poll.create({ class_id: targetClassId, teacher_id: user.id, question: action.params.question, options: action.params.options, status: 'active' }));
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Poll created in ${targetClass.name}!` }]);
                  break;

              case 'REOPEN_POLL':
                  if (!action.params.poll_id) throw new Error("Missing poll_id for reopening poll.");
                  await retryWithBackoff(() => Poll.update(action.params.poll_id, { status: 'active' }));
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: '✅ Poll reopened!' }]);
                  break;
                  
              case 'CLOSE_POLL':
                  if (!action.params.poll_id) throw new Error("Missing poll_id for closing poll.");
                  await retryWithBackoff(() => Poll.update(action.params.poll_id, { status: 'closed' }));
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: '✅ Poll closed!' }]);
                  break;

              case 'CLOSE_ALL_POLLS':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  const activePolls = await retryWithBackoff(() => Poll.filter({ class_id: targetClassId, status: 'active' }));
                  for (const poll of activePolls) {
                      await retryWithBackoff(() => Poll.update(poll.id, { status: 'closed' }));
                  }
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Closed ${activePolls.length} polls in ${targetClass.name}!` }]);
                  break;
                  
              case 'SEND_AI_TOOL_MESSAGE':
                  // Navigate to tool and then send message
                  const toolUrl = createPageUrl(`AITools?tool=${action.params.tool_id}&message=${encodeURIComponent(action.params.content)}`);
                  window.location.href = toolUrl;
                  break;
                  
              case 'PIN_AI_TOOL':
                  if (!action.params.tool_id) throw Error("Missing tool_id for pinning.");
                  const currentPinnedTools = user.pinned_ai_tools || [];
                  if (!currentPinnedTools.includes(action.params.tool_id)) {
                      const updatedPinnedTools = [...currentPinnedTools, action.params.tool_id];
                      await retryWithBackoff(() => User.updateMyUserData({ pinned_ai_tools: updatedPinnedTools }));
                      // Update local user state to reflect change immediately
                      setUser(prevUser => ({ ...prevUser, pinned_ai_tools: updatedPinnedTools }));
                  }
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: '✅ Tool pinned!' }]);
                  break;
                  
              case 'CREATE_SCHEDULE_EVENT':
                  if (action.params.class_ids && action.params.class_ids.length > 0) {
                      // Handle multiple classes
                      let createdCount = 0;
                      for (const classId of action.params.class_ids) {
                          await retryWithBackoff(() => ScheduleEvent.create({
                              class_id: classId,
                              title: action.params.title,
                              description: action.params.description || '',
                              event_date: action.params.event_date,
                              event_type: action.params.event_type || 'Event'
                          }));
                          createdCount++;
                      }
                      setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Event "${action.params.title}" added to ${createdCount} class schedules!` }]);
                  } else {
                      // Single class
                      if (!targetClassId) throw new Error("Class not found or not specified.");
                      await retryWithBackoff(() => ScheduleEvent.create({
                          class_id: targetClassId,
                          title: action.params.title,
                          description: action.params.description || '',
                          event_date: action.params.event_date,
                          event_type: action.params.event_type || 'Event'
                      }));
                      setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Event "${action.params.title}" added to ${targetClass.name} schedule!` }]);
                  }
                  break;

              case 'VIEW_SCHEDULE':
                  if (!targetClassId) throw new Error("Class not found or not specified.");
                  window.location.href = createPageUrl(`ClassTools?classId=${targetClassId}&tool=schedule`);
                  break;

              case 'SWITCH_CLASS':
                  if (!targetClass) throw new Error("Class not found or not specified.");
                  if (targetClass.id === currentClassId) {
                      setAgentConversation(prev => [...prev, { role: 'assistant', content: `You are already viewing ${targetClass.name}.` }]);
                      return;
                  }
                  setCurrentClass(targetClass);
                  setCurrentClassId(targetClass.id);
                  const newUrl = new URL(window.location);
                  newUrl.searchParams.set('classId', targetClass.id);
                  // Use pushState to change URL without full reload, then let useEffect handle class update
                  window.history.pushState({}, '', newUrl.toString()); 
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `✅ Switched to ${targetClass.name}!` }]);
                  break;

              default:
                  console.error(`Unknown action target: ${action.target}`);
                  setAgentConversation(prev => [...prev, { role: 'assistant', content: `I'm sorry, I cannot perform the action "${action.label || action.target}". This may be an old command. Please try asking in a different way.` }]);
                  break;
          }
      } catch (e) {
          console.error("Agent action failed:", e);
          setAgentConversation(prev => [...prev, { role: 'assistant', content: `❌ Action failed: ${e.message}` }]);
      }
  };
  // --- End AGENT LOGIC ---

  const getNavLinks = (language) => [
    { 
      name: t('nav.dashboard', language), 
      href: createPageUrl("Dashboard"), 
      icon: BookOpen, 
      blocked: isQuizModeActive, 
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['teacher', 'student', 'admin']
    },
    { 
      name: "Learner Dashboard", 
      href: createPageUrl("LearnerDashboard"), 
      icon: LineChart, 
      blocked: isQuizModeActive, 
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['teacher', 'student', 'admin']
    },
    { 
      name: t('nav.scheduler', language), 
      href: createPageUrl("Scheduler"), 
      icon: CalendarClock, 
      blocked: false,
      blockedReason: "",
      roles: ['admin']
    },
    { 
      name: t('nav.aiAgent', language), 
      href: createPageUrl("AIPersonalAgent"), 
      icon: Bot, 
      blocked: isQuizModeActive, 
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['teacher'],
      requiresSupercharged: true,
      tag: "Beta" 
    },
    { 
      name: t('nav.chat', language), 
      href: createPageUrl(`Chat?classId=${currentClassId}`), 
      icon: MessageSquare, 
      requiresClass: true, 
      blocked: isQuizModeActive,
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['teacher', 'student']
    },
    { 
      name: t('nav.classTools', language), 
      href: createPageUrl(`ClassTools?classId=${currentClassId}`), 
      icon: SlidersHorizontal, 
      requiresClass: true, 
      blocked: false,
      blockedReason: "",
      roles: ['teacher', 'student']
    },
    {
      name: t('nav.lessonPlans', language),
      href: createPageUrl(`LessonPlans?classId=${currentClassId}`),
      icon: Calendar,
      requiresClass: true,
      blocked: isQuizModeActive,
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['teacher', 'student']
    },
    { 
      name: t('nav.aiTools', language), 
      href: createPageUrl("AITools"), 
      icon: Sparkles, 
      blocked: isQuizModeActive, 
      blockedReason: "Complete your quiz to access other pages.",
      requiresSupercharged: true,
      roles: ['teacher', 'student']
    },
    { 
      name: t('nav.powerSchool', language),
      href: createPageUrl("PowerSchool"),
      icon: Share2,
      blocked: isQuizModeActive,
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['teacher', 'student']
    },
    { 
      name: t('nav.aceAI', language),
      href: createPageUrl("PersonalizedLearning"),
      icon: BrainCircuit,
      requiresClass: false,
      blocked: isQuizModeActive,
      blockedReason: "Complete your quiz to access other pages.",
      roles: ['student']
    },
  ];
  
  // Filter links based on user role and subscription status
  const filterNavLinks = (navLinks) => navLinks.filter(link => {
    // 1. Handle role-based visibility first
    if (link.roles && (!user || !link.roles.includes(user.app_role))) {
      return false; // Hide if user role doesn't match
    }

    // 2. Handle subscription-based visibility
    if (link.requiresSupercharged) {
      // Special case: students always see AI Tools
      if (link.name === "AI Tools" && user?.app_role === 'student') {
        return true; 
      }
      
      // For all other cases (teachers, other supercharged links)
      if (!user || user.subscription_status !== 'active' || user.subscription_tier !== 'supercharged') {
        return false; // Hide if not supercharged
      }
    }

    // 3. If it passed all checks, show it.
    return true;
  });

  // Inner component that uses language context
  const NavigationContent = () => {
    const { language } = useLanguage();
    const navLinks = getNavLinks(language);
    const filteredNavLinks = filterNavLinks(navLinks);
    
    return (
      <>
        {quizInProgress && user?.app_role === 'student' && currentPageName !== 'ClassTools' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center font-medium z-50">
            ⏰ You have an active quiz in progress. Some features are locked until you complete it.
            <Link to={createPageUrl(`ClassTools?classId=${currentClassId}`)} className="ml-2 underline font-bold">
              Return to Quiz →
            </Link>
          </div>
        )}

        {/* Header - Conditionally render based on page */}
        {!isLandingPage && !isCompliancePage && !isDemoPage && (
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to={createPageUrl("Dashboard")} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Schoolace</h1>
                  </div>
                </Link>
                
                <div className="flex items-center gap-2">
                    <nav className="hidden md:flex items-center space-x-1">
                    {filteredNavLinks.map((link) => {
                      if (link.requiresClass && !currentClassId) return null;
                      
                      return (
                        <div key={link.name} className="relative">
                          <Link
                            to={link.blocked ? '#' : link.href}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                              link.blocked 
                                ? "text-slate-400 cursor-not-allowed"
                                : location.pathname === new URL(link.href, window.location.origin).pathname && !link.action
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                            onClick={(e) => handleNavClick(e, link)}
                            title={link.blocked ? link.blockedReason : undefined}
                          >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                            {link.tag && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                                {link.tag}
                              </span>
                            )}
                            {link.blocked && <span className="text-xs">🔒</span>}
                          </Link>
                        </div>
                      );
                    })}
                  </nav>
                </div>

              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="relative flex-grow">
          {React.cloneElement(children, { user, allClasses, currentClass, fetchUserAndClasses, isLayoutLoading })}
        </main>

        {/* Mobile Navigation - Conditionally render based on page */}
        {!isLandingPage && !isCompliancePage && !isDemoPage && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 py-2 flex justify-around z-40">
            {filteredNavLinks.map((link) => {
              if (link.requiresClass && !currentClassId) return null;
              return (
                <Link
                  key={link.name}
                  to={link.blocked ? '#' : link.href}
                  className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 w-full ${
                    link.blocked 
                      ? "text-slate-400 cursor-not-allowed"
                      : location.pathname === new URL(link.href, window.location.origin).pathname && !link.action
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-600"
                  }`}
                  onClick={(e) => handleNavClick(e, link)}
                  title={link.blocked ? link.blockedReason : undefined}
                >
                  <link.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs flex items-center">
                    {link.name}
                    {link.tag && (
                      <span className="ml-1 px-1 py-0.5 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                        {link.tag}
                      </span>
                    )}
                  </span>
                  {link.blocked && <span className="text-xs">🔒</span>}
                </Link>
              )
            })}
          </div>
        )}
      </>
    );
  };

  const handleNavClick = (e, link) => {
      if (link.blocked) {
          e.preventDefault();
      } else if (link.action) {
          e.preventDefault();
          link.action();
      }
  };
  
  return (
    <LanguageProvider>
      <LayoutContent 
        user={user}
        allClasses={allClasses}
        currentClass={currentClass}
        currentClassId={currentClassId}
        quizInProgress={quizInProgress}
        currentPageName={currentPageName}
        isQuizModeActive={isQuizModeActive}
        isLandingPage={isLandingPage}
        isCompliancePage={isCompliancePage}
        isDemoPage={isDemoPage}
        isExampleLearningTrackerPage={isExampleLearningTrackerPage}
        location={location}
        handleNavClick={handleNavClick}
        fetchUserAndClasses={fetchUserAndClasses}
        isLayoutLoading={isLayoutLoading}
        getNavLinks={getNavLinks}
        filterNavLinks={filterNavLinks}
      >
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}

function LayoutContent({ 
  user, allClasses, currentClass, currentClassId, quizInProgress, currentPageName,
  isQuizModeActive, isLandingPage, isCompliancePage, isDemoPage, isExampleLearningTrackerPage,
  location, handleNavClick, fetchUserAndClasses, isLayoutLoading, getNavLinks, filterNavLinks, children 
}) {
  const { language } = useLanguage();
  const navLinks = getNavLinks(language);
  const filteredNavLinks = filterNavLinks(navLinks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {quizInProgress && user?.app_role === 'student' && currentPageName !== 'ClassTools' && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center font-medium z-50">
          ⏰ You have an active quiz in progress. Some features are locked until you complete it.
          <Link to={createPageUrl(`ClassTools?classId=${currentClassId}`)} className="ml-2 underline font-bold">
            Return to Quiz →
          </Link>
        </div>
      )}

      {/* Header - Conditionally render based on page */}
      {!isLandingPage && !isCompliancePage && !isDemoPage && (
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to={createPageUrl("Dashboard")} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Schoolace</h1>
                </div>
              </Link>
              
              <div className="flex items-center gap-2">
                  <nav className="hidden md:flex items-center space-x-1">
                  {filteredNavLinks.map((link) => {
                    if (link.requiresClass && !currentClassId) return null;
                    
                    return (
                      <div key={link.name} className="relative">
                        <Link
                          to={link.blocked ? '#' : link.href}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                            link.blocked 
                              ? "text-slate-400 cursor-not-allowed"
                              : location.pathname === new URL(link.href, window.location.origin).pathname && !link.action
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                          onClick={(e) => handleNavClick(e, link)}
                          title={link.blocked ? link.blockedReason : undefined}
                        >
                          <link.icon className="w-4 h-4" />
                          {link.name}
                          {link.tag && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                              {link.tag}
                            </span>
                          )}
                          {link.blocked && <span className="text-xs">🔒</span>}
                        </Link>
                      </div>
                    );
                  })}
                </nav>
              </div>

            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="relative flex-grow">
        {React.cloneElement(children, { user, allClasses, currentClass, fetchUserAndClasses, isLayoutLoading })}
      </main>

      {/* Mobile Navigation - Conditionally render based on page */}
      {!isLandingPage && !isCompliancePage && !isDemoPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 py-2 flex justify-around z-40">
          {filteredNavLinks.map((link) => {
            if (link.requiresClass && !currentClassId) return null;
            return (
              <Link
                key={link.name}
                to={link.blocked ? '#' : link.href}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 w-full ${
                  link.blocked 
                    ? "text-slate-400 cursor-not-allowed"
                    : location.pathname === new URL(link.href, window.location.origin).pathname && !link.action
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-slate-600"
                }`}
                onClick={(e) => handleNavClick(e, link)}
                title={link.blocked ? link.blockedReason : undefined}
              >
                <link.icon className="w-5 h-5 mb-1" />
                <span className="text-xs flex items-center">
                  {link.name}
                  {link.tag && (
                    <span className="ml-1 px-1 py-0.5 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                      {link.tag}
                    </span>
                  )}
                </span>
                {link.blocked && <span className="text-xs">🔒</span>}
              </Link>
            )
          })}
        </div>
      )}

    </div>
  );
}