import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Upload, Eye, Zap, FileText, Brain, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { User } from '@/entities/User';
import { Class } from '@/entities/Class';
import { Assignment } from '@/entities/Assignment';
import { Submission } from '@/entities/Submission';
import { ClassEnrollment } from '@/entities/ClassEnrollment';
import { Quiz } from '@/entities/Quiz';
import { QuizQuestion } from '@/entities/QuizQuestion';
import { Poll } from '@/entities/Poll';
import { Message } from '@/entities/Message';
import { ScheduleEvent } from '@/entities/ScheduleEvent';
import { AssignmentComment } from '@/entities/AssignmentComment';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../components/i18n/useTranslation';
import { useLanguage } from '../components/i18n/LanguageContext';

const FuturisticButton = ({ action, onExecute, autoExecute = false }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (autoExecute && buttonRef.current) {
            // Auto-click the button after a short delay for visual feedback
            setTimeout(() => {
                buttonRef.current?.click();
            }, 2000);
        }
    }, [autoExecute]);

    const getIcon = () => {
        switch (action.type) {
            case 'navigate': return <Eye className="w-4 h-4" />;
            case 'create': return <Sparkles className="w-4 h-4" />;
            case 'upload': return <Upload className="w-4 h-4" />;
            case 'view': return <FileText className="w-4 h-4" />;
            case 'message': return <MessageSquare className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    return (
        <motion.button
            ref={buttonRef}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExecute(action)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold transition-all duration-200 shadow-lg border border-purple-400/30"
        >
            {getIcon()}
            {action.label}
        </motion.button>
    );
};

const FileUploadButton = ({ onFileUpload, label = "Upload File" }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { file_url } = await UploadFile({ file });
                onFileUpload({ file, file_url, file_name: file.name });
            } catch (error) {
                console.error('File upload failed:', error);
            }
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.mp4,.mp3"
            />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold transition-all duration-200 shadow-lg border border-green-400/30"
            >
                <Upload className="w-4 h-4" />
                {label}
            </motion.button>
        </>
    );
};

export default function AIPersonalAgentPage() { // Renamed from AIPersonalAgent
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [context, setContext] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const conversationEndRef = useRef(null);

  // Loading screen timer (same as other tabs)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Translation helper for AI responses
  const translateMessage = useCallback(async (text) => {
    if (language === 'EN' || !text) return text;
    
    const languageNames = {
      ES: 'Spanish',
      ZH: 'Chinese',
      KO: 'Korean',
      FR: 'French'
    };
    
    try {
      const response = await InvokeLLM({
        prompt: `Translate the following text to ${languageNames[language]}. Keep any markdown formatting. Only return the translated text, nothing else:\n\n${text}`,
      });
      return response || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [language]);

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
  }, []); // useCallback dependency array

  const loadUserClasses = useCallback(async (currentUser) => {
    try {
      if (currentUser.app_role === 'teacher') {
        const classes = await retryWithBackoff(() => Class.filter({ teacher_id: currentUser.id }, "-created_date", 50));
        setAllClasses(classes);
      } else {
        const enrollments = await retryWithBackoff(() => ClassEnrollment.filter({ student_id: currentUser.id }, "-created_date", 50));
        if (enrollments.length > 0) {
          const fetchedClasses = await retryWithBackoff(() => Class.list("-created_date", 100));
          const enrolledClasses = fetchedClasses.filter(cls =>
            enrollments.some(e => e.class_id === cls.id)
          );
          setAllClasses(enrolledClasses);
        }
      }

      // Start with a fresh conversation every time. Do not load from localStorage.
      // Note: greeting translation will be applied in the component render
      setConversation([{
        role: 'assistant',
        content: `__GREETING__${currentUser.full_name || 'there'}`,
        actions: []
      }]);

    } catch (error) {
        console.error('Error loading classes:', error);
        if (error.response?.status === 429) {
            alert("Too many requests. Please wait a moment and refresh the page.");
        }
    }
  }, [retryWithBackoff]); // useCallback dependency array

  useEffect(() => {
    const fetchUserAndClasses = async () => {
        try {
            const userData = await retryWithBackoff(() => User.me());
            // REDIRECT if user is a student
            if (userData && userData.app_role === 'student') {
              window.location.href = createPageUrl('Dashboard');
              return;
            }
            setUser(userData);
            if (userData) {
              await loadUserClasses(userData);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            if (error.response?.status === 429) {
                alert("Too many requests. Please wait a moment and refresh the page.");
            }
            setUser(null);
            setAllClasses([]);
            // Not logged in, redirect to dashboard which will handle auth
            window.location.href = createPageUrl('Dashboard');
        } finally {
            // Data loaded - pageLoading timer handles the loading screen
        }
    };

    fetchUserAndClasses();
  }, [retryWithBackoff, loadUserClasses]); // Added loadUserClasses to dependencies

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const findClassByName = (name) => {
    if (!name || !allClasses || allClasses.length === 0) return null;

    // Clean the input name - remove "class" suffix and normalize
    const cleanName = name.toLowerCase()
      .replace(/\s+class$/, '') // Remove " class" at the end
      .replace(/\s+/g, ' ')     // Normalize spaces
      .trim();

    console.log('Looking for class:', cleanName, 'in classes:', allClasses.map(c => c.name));

    // Try exact match first
    let found = allClasses.find(c => c.name.toLowerCase().trim() === cleanName);
    if (found) return found;

    // Try partial match - check if class name contains the search term
    found = allClasses.find(c => c.name.toLowerCase().includes(cleanName));
    if (found) return found;

    // Try reverse - check if search term contains class name
    found = allClasses.find(c => cleanName.includes(c.name.toLowerCase()));
    if (found) return found;

    // If still no match, try matching individual words
    const searchWords = cleanName.split(' ');
    found = allClasses.find(c => {
      const classWords = c.name.toLowerCase().split(' ');
      return searchWords.every(searchWord =>
        classWords.some(classWord =>
          classWord.includes(searchWord) || searchWord.includes(classWord)
        )
      );
    });

    return found || null;
  };

  const updateContext = async () => {
    if (!user || allClasses.length === 0) return {};

    try {
      // Get data for ALL classes the user has access to
      const allAssignments = [];
      const allSubmissions = [];
      const allQuizzes = [];
      const allPolls = [];
      const allScheduleEvents = [];

      for (const cls of allClasses) {
        const [assignments, quizzes, polls, scheduleEvents] = await Promise.all([
          retryWithBackoff(() => Assignment.filter({ class_id: cls.id })),
          retryWithBackoff(() => Quiz.filter({ class_id: cls.id })),
          retryWithBackoff(() => Poll.filter({ class_id: cls.id })),
          retryWithBackoff(() => ScheduleEvent.filter({ class_id: cls.id }))
        ]);

        assignments.forEach(a => allAssignments.push({ ...a, class_name: cls.name }));
        quizzes.forEach(q => allQuizzes.push({ ...q, class_name: cls.name }));
        polls.forEach(p => allPolls.push({ ...p, class_name: cls.name }));
        scheduleEvents.forEach(e => allScheduleEvents.push({ ...e, class_name: cls.name }));
      }

      if (user.app_role === 'teacher') {
        const assignmentIds = allAssignments.map(a => a.id);
        if (assignmentIds.length > 0) {
          const submissions = await retryWithBackoff(() => Submission.filter({ assignment_id: { $in: assignmentIds }}));
          submissions.forEach(s => {
            const assignment = allAssignments.find(a => a.id === s.assignment_id);
            allSubmissions.push({ ...s, class_name: assignment?.class_name });
          });
        }
      } else {
        const submissions = await retryWithBackoff(() => Submission.filter({ student_id: user.id }));
        submissions.forEach(s => {
          const assignment = allAssignments.find(a => a.id === s.assignment_id);
          allSubmissions.push({ ...s, class_name: assignment?.class_name });
        });
      }

      return {
        assignments: allAssignments.map(a => ({ id: a.id, title: a.title, class_name: a.class_name, max_points: a.max_points })),
        submissions: allSubmissions.map(s => ({ id: s.id, assignment_id: s.assignment_id, student_name: s.student_name, class_name: s.class_name, grading_status: s.grading_status, is_released: s.is_released, ai_feedback: s.ai_feedback, final_feedback: s.final_feedback })),
        quizzes: allQuizzes.map(q => ({ id: q.id, title: q.title, status: q.status, class_name: q.class_name })),
        polls: allPolls.map(p => ({ id: p.id, question: p.question, status: p.status, class_name: p.class_name })),
        scheduleEvents: allScheduleEvents.map(e => ({ id: e.id, title: e.title, event_date: e.event_date, class_name: e.class_name })),
        allClasses: allClasses.map(c => ({ id: c.id, name: c.name }))
      };
    } catch (error) {
      console.error("Error updating context:", error);
      return {};
    }
  };

  const getSystemPrompt = (context) => {
    const role = user?.app_role || 'user';
    const userName = user?.full_name || 'the user';

    const teacherToolMap = `
- **NAVIGATE_TO_AI_TOOL**: Use this to go to an AI tool page. Requires one parameter: \`tool_id\`.
  **AI TOOL MAPPING (Use these exact IDs):**
  - "Lesson Plan Generator" -> \`lesson-plan\`
  - "Worksheet Generator" -> \`worksheet-generator\`
  - "Rubric Generator" -> \`rubric-generator\`
  - "Assessment Question Generator", "Question Generator" -> \`question-generator\`
  - "Report Card Comments" -> \`report-card-comments\`
  - "IEP & Accommodation Generator", "IEP Generator" -> \`iep-accommodations\`
  - "Assignment Scaffolder" -> \`assignment-scaffolder\`
  - "Email Generator" -> \`email-generator\`
  - "Teacher Wellness Support" -> \`teacher-wellness-support\`
  - "AI Content Detector", "AI Detector" -> \`ai-detector\`
  - "PowerSchool" -> \`powerschool\`
`;
    const studentToolMap = `
- **NAVIGATE_TO_AI_TOOL**: Use this to go to an AI tool page. Requires one parameter: \`tool_id\`.
  **AI TOOL MAPPING (Use these exact IDs):**
  - "Student Wellness Support" -> \`student-wellness-support\`
  - "Writing Feedback Assistant" -> \`writing-feedback\`
  - "Text Summarizer" -> \`text-summarizer\`
  - "Concept Explainer" -> \`concept-explainer\`
  - "Email Generator" -> \`email-generator\`
  - "Question Generator" -> \`question-generator\`
`;

    let prompt = `You are GradeAI's Personal Agent, an action-oriented AI assistant. Your primary goal is to **EXECUTE** actions for the user, not just have a conversation.

**Core Directive:** If a user's request maps to an available action, you **MUST** generate that action in your response. Avoid purely conversational replies if an action can be taken.

**Current User Context:**
- User Name: ${userName}
- User Role: ${role}
- All Classes: ${JSON.stringify(allClasses.map(c => ({ id: c.id, name: c.name })))}
${uploadedFile ? `- Uploaded File: ${uploadedFile.file_name} (${uploadedFile.file_url}) is available.` : ''}

**CRITICAL TASK-HANDLING RULES:**

1.  **QUIZ CREATION:**
    When a user asks to create a quiz, DO NOT create an action. Instead, respond with TEXT ONLY, asking for the details. You will act immediately upon receiving the details.

2.  **ASSIGNMENT CREATION:**
    When a user asks to create an assignment, DO NOT create an action. Instead, respond with TEXT ONLY, asking for the details.

3.  **SCHEDULE EVENT CREATION:**
    If the user asks to create a schedule event but does not provide a complete date with a year (e.g., "July 30, 2025"), DO NOT create an action. Instead, respond with TEXT ONLY and ask for the full date in the correct format.

**AVAILABLE ACTIONS for OTHER requests:**

${role === 'teacher' ? teacherToolMap : studentToolMap}
- NAVIGATE_TO_DASHBOARD: No params
- NAVIGATE_TO_CHAT: class_name (opens the chat page for the specified class)
- NAVIGATE_TO_CLASS_TOOLS: class_name
- SEND_CLASS_CHAT: content, class_name
- CREATE_ASSIGNMENT: title, description, instructions, max_points, due_date, class_name
- CREATE_POLL: question, options (array), class_name
- NAVIGATE_TO_POLLS: class_name
- NAVIGATE_TO_QUIZZES: class_name
- CREATE_SCHEDULE_EVENT: title, event_date, class_name
- **CHECK_ASSIGNMENT_COMMENTS**: To check comments, you MUST use this target. It requires two parameters: \`class_name\` and \`assignment_title\`. To check comments for ALL assignments in a class, you MUST set the \`assignment_title\` parameter to the literal string "all". **DO NOT** use "all" as the action target itself.
- VIEW_STUDENT_COMMENTS: assignment_title, class_name, student_name
- POST_COMMENT: assignment_title, class_name, student_name, comment_content
- RELEASE_GRADES: assignment_title, class_name
- DELETE_ASSIGNMENT: assignment_id OR assignment_title and class_name
- LOCK_QUIZ: quiz_id
- CLOSE_POLL: poll_id
- REOPEN_POLL: poll_id
- VIEW_SCHEDULE: class_name
- VIEW_QUIZ_DETAILS: quiz_id, class_name
- VIEW_QUIZ_RESULTS: quiz_title, class_name
- SUBMIT_ASSIGNMENT: assignment_id (requires prior file upload)

**Response Format:**
{
  "content": "Your response text.",
  "actions": [
    {
      "type": "navigate",
      "label": "Button Text",
      "target": "ACTION_NAME",
      "params": {"key": "value"},
      "auto_execute": true
    }
  ]
}

**CRITICAL: The \`target\` value in your action MUST be one of the exact strings from the 'AVAILABLE ACTIONS' list. DO NOT invent new targets or combine user input (like class names) into the target name. For example, a request for an "english quiz" must NOT result in a target named "english_quiz". Instead, you must follow the specific rules for quiz creation by asking for details first.**

**Final Instruction:** For any request that is **NOT** related to creating a quiz or an assignment from scratch, you **MUST** generate an action if one is applicable. For quiz/assignment creation, follow the specific rules above by asking for details first.`;

    return prompt;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return; // Changed isLoading to isSending

    const userMessage = { role: 'user', content: input };
    setConversation(prev => [...prev, userMessage]);
    const originalInput = input;
    setInput('');
    setIsSending(true); // Changed setIsLoading to setIsSending

    try {
      // Check if we're waiting for a comment to post
      if (context.pendingComment) {
        const { assignment_title, class_name, student_name, student_id } = context.pendingComment;
        
        // Find the assignment and post the comment
        const targetClass = findClassByName(class_name);
        if (!targetClass) throw new Error("Class not found");
        
        const assignments = await retryWithBackoff(() => Assignment.filter({ class_id: targetClass.id }));
        const foundAssignment = assignments.find(a => a.title.toLowerCase().includes(assignment_title.toLowerCase()));
        
        if (!foundAssignment) throw new Error("Assignment not found");
        
        await retryWithBackoff(() => AssignmentComment.create({
          assignment_id: foundAssignment.id,
          student_id: student_id,
          user_id: user.id,
          user_name: user.full_name,
          user_role: user.app_role,
          content: originalInput
        }));
        
        const commentPostedMsg = await translateMessage(`✅ Your comment has been posted to ${student_name} for "${assignment_title}".`);
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: commentPostedMsg
        }]);
        
        // Clear the pending comment
        setContext(prevContext => {
          const { pendingComment, ...rest } = prevContext;
          return rest;
        });
        
        setIsSending(false); // Changed setIsLoading to setIsSending
        return;
      }
      
      // Check if the PREVIOUS message was a request for quiz details
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage.content.toLowerCase().includes('details for the quiz')) {
        await handleDirectQuizCreation(originalInput);
        setIsSending(false); // Changed setIsLoading to setIsSending
        return;
      }

      // DIRECT QUIZ CREATION DETECTION
      const inputLower = originalInput.toLowerCase();
      if (inputLower.includes('quiz') && inputLower.includes('class') && !inputLower.includes('details') && !inputLower.includes('results')) {
        // Extract class name
        let detectedClass = null;
        for (const cls of allClasses) {
          if (inputLower.includes(cls.name.toLowerCase())) {
            detectedClass = cls;
            break;
          }
        }

        if (detectedClass || allClasses.length === 1) {
          const quizPromptMsg = await translateMessage(`I'll help you create a quiz for ${detectedClass?.name || allClasses[0].name}. Please provide these details:

**Quiz Title:**
**Time Limit:** (in minutes)
**Show Results to Students:** (yes/no)
**Questions:** Tell me the number and type (e.g., "10 multiple choice questions" or "5 MC and 3 TF")
**Topic:** What subject should the questions cover?

Example: "Title: Math Test, Time: 15 minutes, Show results: yes, 5 multiple choice and 3 true/false questions about fractions"

⚠️ **Important:** Make sure to review the quiz before assigning it to students, because there could be mistakes in it, as it's AI-generated.`);
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: quizPromptMsg,
            actions: []
          }]);
          setIsSending(false); // Changed setIsLoading to setIsSending
          return;
        }
      }

      // CHECK FOR QUIZ CREATION WITH DETAILS
      if (inputLower.includes('title:') && (inputLower.includes('time') || inputLower.includes('minutes')) && inputLower.includes('questions')) {
        await handleDirectQuizCreation(originalInput);
        setIsSending(false); // Changed setIsLoading to setIsSending
        return;
      }

      // Regular AI processing for non-quiz requests
      const freshContext = await updateContext();
      setContext(freshContext);
      const systemPrompt = getSystemPrompt(freshContext);

      const conversationHistory = conversation.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        userMessage
      ];

      const responseSchema = {
        type: "object",
        properties: {
          content: { type: "string" },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                label: { type: "string" },
                target: { type: "string", "minLength": 1 },
                params: { "type": "object" },
                auto_execute: { type: "boolean" }
              },
              required: ["type", "label", "target"]
            }
          }
        },
        required: ["content"]
      };

      const agentResponse = await retryWithBackoff(() => InvokeLLM({
        prompt: JSON.stringify(messages),
        response_json_schema: responseSchema
      }));

      const finalAgentResponse = typeof agentResponse === 'object' && agentResponse !== null
        ? agentResponse
        : { content: String(agentResponse), actions: [] };

      // Translate response if not English
      if (language !== 'EN' && finalAgentResponse.content) {
        finalAgentResponse.content = await translateMessage(finalAgentResponse.content);
      }

      setConversation(prev => [...prev, { role: 'assistant', ...finalAgentResponse }]);

    } catch (error) {
      console.error("Agent Error:", error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: `I encountered an error: ${error.message}. Please try again.`
      }]);
    } finally {
      setIsSending(false); // Changed setIsLoading to setIsSending
      setIsThinking(false);
    }
  };

  // NEW DIRECT QUIZ CREATION FUNCTION
  const handleDirectQuizCreation = async (userInput) => {
    try {
      setIsThinking(true);

      // Parse quiz details from user input
      const inputLower = userInput.toLowerCase();

      // Extract title
      let title = 'New Quiz';
      const titleMatch = userInput.match(/title:\s*([^,.\n]+)/i);
      if (titleMatch && titleMatch[1].trim() !== '') {
        title = titleMatch[1].trim();
      }

      // Extract time limit
      let timeLimit = 0;
      const timeMatch = userInput.match(/(\d+)\s*(?:min|minutes)/i);
      if (timeMatch) {
        timeLimit = parseInt(timeMatch[1]);
      }

      // Extract show results
      let showResults = inputLower.includes('show results: yes') || inputLower.includes('yes show results');

      // Extract question counts
      let numMC = 0;
      let numTF = 0;

      const mcMatch = userInput.match(/(\d+)\s*(?:multiple\s*choice|mc)/i);
      const tfMatch = userInput.match(/(\d+)\s*(?:true\s*false|tf)/i);

      if (mcMatch) numMC = parseInt(mcMatch[1]);
      if (tfMatch) numTF = parseInt(tfMatch[1]);

      // Default to 5 MC if no questions specified
      if (numMC === 0 && numTF === 0) {
        numMC = 5;
      }

      // Extract topic - NEW ROBUST LOGIC
      let topic = 'general knowledge';
      let topicFound = false;

      // 1. Prioritize explicit "topic:" keyword
      const explicitTopicMatch = userInput.match(/topic:\s*([^,.\n]+)/i);
      if (explicitTopicMatch && explicitTopicMatch[1].trim()) {
        topic = explicitTopicMatch[1].trim();
        topicFound = true;
      }

      // 2. If not found, look for keywords like "on" or "about"
      if (!topicFound) {
        const prepositionTopicMatch = userInput.match(/(?:questions on|questions about|quiz on|quiz about)\s+([^,.\n]+)/i);
        if (prepositionTopicMatch && prepositionTopicMatch[1].trim()) {
          topic = prepositionTopicMatch[1].trim();
          topicFound = true;
        }
      }

      // 3. Fallback to the title as a last resort, cleaning it up
      if (!topicFound && title) {
          const cleanTitle = title.toLowerCase()
              .replace(/quiz/g, '')
              .replace(/test/g, '')
              .replace(/exam/g, '')
              .trim();
          if (cleanTitle && cleanTitle !== "new") {
              topic = cleanTitle;
          }
      }


      // Find target class
      let targetClass = null;
      for (const cls of allClasses) {
        if (inputLower.includes(cls.name.toLowerCase())) {
          targetClass = cls;
          break;
        }
      }

      // If no class found in current input, check previous messages
      if (!targetClass) {
        for (let i = conversation.length - 1; i >= 0; i--) {
            const msgContent = conversation[i].content.toLowerCase();
            for (const cls of allClasses) {
                if (msgContent.includes(cls.name.toLowerCase())) {
                    targetClass = cls;
                    break;
                }
            }
            if (targetClass) break;
        }
      }

      // Default to first class if none specified
      if (!targetClass && allClasses.length > 0) {
        targetClass = allClasses[0];
      }

      if (!targetClass) {
        throw new Error("I couldn't determine which class to create the quiz in. Please specify the class name.");
      }

      const creatingQuizMsg = await translateMessage(`Creating quiz "${title}" in ${targetClass.name}...`);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: creatingQuizMsg
      }]);

      // Create quiz object in the database
      const quiz = await retryWithBackoff(() => Quiz.create({
        class_id: targetClass.id,
        teacher_id: user.id,
        title: title,
        time_limit_minutes: timeLimit,
        show_results: showResults,
        status: 'active'
      }));

      // --- DYNAMIC QUESTION GENERATION ---
      setIsThinking(true);
      const generatingQuestionsMsg = await translateMessage(`Now generating ${numMC} multiple-choice and ${numTF} true/false questions about "${topic}"...`);
      setConversation(prev => [...prev, { role: 'assistant', content: generatingQuestionsMsg }]);

      const questionGenerationPrompt = `
You are an expert quiz question writer. Your task is to generate a set of quiz questions based on the provided topic and, if available, the content of the attached file.

**Topic:** ${topic}
**Number of Multiple-Choice Questions:** ${numMC}
**Number of True/False Questions:** ${numTF}

**Instructions:**
- Generate exactly the number of questions requested for each type.
- If a file is provided, all questions **MUST** be based on the content of that file.
- For multiple-choice questions, provide 4 plausible options (A, B, C, D).
- Ensure the questions are clear, concise, and appropriate for a quiz.
- The final output **MUST** be a valid JSON object matching the provided schema.
      `;

      const questionSchema = {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question_text: { type: "string" },
                question_type: { "type": "string", "enum": ["multiple-choice", "true-false"] },
                options: { 
                  type: "object", 
                  description: "For MC, an object like {'A': 'text', 'B': 'text'}. For TF, can be an empty object.",
                  additionalProperties: { "type": "string" }
                },
                correct_answer: { type: "string", "description": "The key of the correct option for MC (e.g., 'A') or 'True'/'False' for TF." }
              },
              required: ["question_text", "question_type", "correct_answer"]
            }
          }
        },
        required: ["questions"]
      };

      const llmResponse = await retryWithBackoff(() => InvokeLLM({
        prompt: questionGenerationPrompt,
        response_json_schema: questionSchema,
        file_urls: uploadedFile ? [uploadedFile.file_url] : []
      }));

      const generatedQuestions = llmResponse.questions || [];

      // Add the quiz_id to each generated question
      const questionsToCreate = generatedQuestions.map(q => ({
        ...q,
        quiz_id: quiz.id,
      }));

      // Add questions to the quiz in the database
      if (questionsToCreate.length > 0) {
        await retryWithBackoff(() => QuizQuestion.bulkCreate(questionsToCreate));
      }
      setIsThinking(false);

      const quizSuccessMsg = await translateMessage(`✅ Successfully created quiz "${title}" in ${targetClass.name} with ${questionsToCreate.length} questions!`);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: quizSuccessMsg,
        actions: [{
          type: "navigate",
          label: "View Quiz",
          target: "VIEW_QUIZ_DETAILS",
          params: { quiz_id: quiz.id, class_name: targetClass.name }
        }]
      }]);

    } catch (error) {
      console.error("Direct quiz creation failed:", error);
      const errorMsg = await translateMessage(`❌ Failed to create quiz: ${error.message}`);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: errorMsg
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteAction = async (action) => {
    // Add a guard clause to prevent crashes from invalid actions in history
    if (!action || !action.target) {
        console.error("An invalid action was passed to handleExecuteAction. The action object was missing a 'target'. Full action object:", JSON.stringify(action, null, 2));
        setConversation(prev => [...prev, { role: 'assistant', content: "I encountered an invalid action. Please try your request again." }]);
        return;
    }

    // FIX: Add a guardrail for when the AI hallucinates 'all' as an action target for comments.
    if (action.target?.toLowerCase() === 'all' && action.label?.toLowerCase().includes('comment')) {
      console.warn("AI hallucinated 'all' as a target. Correcting to CHECK_ASSIGNMENT_COMMENTS.");
      action.target = 'CHECK_ASSIGNMENT_COMMENTS';
      if (!action.params) {
        action.params = {};
      }
      action.params.assignment_title = 'all';
    }
    
    const upperCaseTarget = action.target?.toUpperCase().replace(/-/g, '_');

    const executingMsg = await translateMessage(`Executing: **${action.label}**...`);
    setConversation(prev => [...prev, {
      role: 'assistant',
      content: executingMsg
    }]);

    try {
      // COMPLETELY NEW CLASS DETECTION SYSTEM
      let targetClass = null;
      let targetClassId = null;

      // Method 1: Direct class_name in params
      if (action.params?.class_name) {
        targetClass = findClassByName(action.params.class_name);
        if (targetClass) {
          targetClassId = targetClass.id;
        }
      }

      // Method 2: Extract from action label if not found
      if (!targetClass && action.label) {
        const labelLower = action.label.toLowerCase();
        for (const cls of allClasses) {
          if (labelLower.includes(cls.name.toLowerCase())) {
            targetClass = cls;
            targetClassId = cls.id;
            break;
          }
        }
      }

      // Method 3: If only one class exists, use it as a default for non-all-class actions
      if (!targetClass && allClasses.length === 1 && !action.params?.class_name?.toLowerCase().includes("all")) {
        targetClass = allClasses[0];
        targetClassId = allClasses[0].id; // Ensure targetClassId is set
      }

      // Method 4: If it's an "all classes" request explicitly for multi-class actions
      const isAllClasses = (action.params?.class_name && action.params.class_name.toLowerCase().includes("all")) ||
                           (action.label && action.label.toLowerCase().includes("all")) ||
                           (action.params?.class_ids && action.params.class_ids.length > 0 && allClasses.length > 1); // If class_ids are provided and it's for multiple classes

      // Handle multi-class actions
      if (isAllClasses && ['CREATE_ASSIGNMENT', 'CREATE_QUIZ', 'CREATE_POLL', 'CREATE_SCHEDULE_EVENT', 'SEND_CLASS_CHAT'].includes(upperCaseTarget)) {
        let successCount = 0;

        for (const cls of allClasses) {
          try {
            if (upperCaseTarget === 'CREATE_ASSIGNMENT') {
              if (!action.params.title) {
                throw new Error("Assignment title is missing");
              }

              const assignmentData = {
                class_id: cls.id,
                teacher_id: user.id,
                title: action.params.title,
                description: action.params.description || '',
                instructions: action.params.instructions || '',
                max_points: action.params.max_points || 100,
                subject: action.params.subject || 'other',
                use_ai_grading: action.params.use_ai_grading !== undefined ? action.params.use_ai_grading : true,
                leniency: action.params.leniency || 'Neutral'
              };

              // FIX: Convert human-friendly dates like "Tomorrow" into a valid date format.
              if (action.params.due_date) {
                let dueDate = new Date();
                const dateStr = String(action.params.due_date).toLowerCase();

                if (dateStr.includes('tomorrow')) {
                    dueDate.setDate(dueDate.getDate() + 1);
                } else if (dateStr.includes('in 2 days') || dateStr.includes('two days')) {
                    dueDate.setDate(dueDate.getDate() + 2);
                } else if (dateStr.includes('in 3 days') || dateStr.includes('three days')) {
                    dueDate.setDate(dueDate.getDate() + 3);
                } else {
                    const parsedDate = new Date(action.params.due_date);
                    if (!isNaN(parsedDate.getTime())) {
                        dueDate = parsedDate;
                    }
                }
                assignmentData.due_date = dueDate.toISOString();
              }

              if (uploadedFile?.file_url) {
                assignmentData.attachment_url = uploadedFile.file_url;
                assignmentData.attachment_filename = uploadedFile.file_name;
              }

              await retryWithBackoff(() => Assignment.create(assignmentData));

              // Auto-add to schedule if due date exists
              if (assignmentData.due_date) { // Check assignmentData.due_date after parsing
                try {
                  const scheduleEventDate = new Date(assignmentData.due_date).toISOString().split('T')[0];
                  await retryWithBackoff(() => ScheduleEvent.create({
                    class_id: cls.id,
                    title: action.params.title,
                    description: `Assignment Due: ${action.params.title}`,
                    event_date: scheduleEventDate,
                    event_type: 'Homework Due'
                  }));
                } catch (scheduleError) {
                  console.warn("Failed to add assignment to schedule for class:", cls.name, scheduleError);
                }
              }
              successCount++;
            } else if (upperCaseTarget === 'CREATE_POLL') {
                await retryWithBackoff(() => Poll.create({
                    class_id: cls.id,
                    teacher_id: user.id,
                    question: action.params.question,
                    options: action.params.options,
                    status: 'active'
                }));
                successCount++;
            } else if (upperCaseTarget === 'CREATE_SCHEDULE_EVENT') {
                let eventDate = new Date();
                let providedDateStr = action.params.event_date || '';
                let parsedDate = new Date(providedDateStr);

                // Check if date is valid or a keyword
                if (isNaN(parsedDate.getTime()) || providedDateStr.toLowerCase().includes('tomorrow') || providedDateStr.split(' ').length < 2) {
                    setConversation(prev => [...prev, {
                        role: 'assistant',
                        content: 'To create an event, I need a specific date. Please provide the date in the format "Month Day, Year" (e.g., "July 30, 2025").'
                    }]);
                    return; // Stop execution
                }
                eventDate = parsedDate;

                const formattedDate = eventDate.toISOString().split('T')[0];

                await retryWithBackoff(() => ScheduleEvent.create({
                    class_id: cls.id,
                    title: action.params.title,
                    description: action.params.description || '',
                    event_date: formattedDate,
                    event_type: action.params.event_type || 'Event'
                }));
                successCount++;
            } else if (upperCaseTarget === 'SEND_CLASS_CHAT') {
                await retryWithBackoff(() => Message.create({
                    class_id: cls.id,
                    content: action.params.content,
                    user_id: user.id,
                    user_name: user.full_name || user.email,
                    user_role: user.app_role || 'student'
                }));
                successCount++;
            }
          } catch (error) {
            console.error(`Failed to execute ${action.target} in ${cls.name}:`, error);
          }
        }

        const multiClassSuccessMsg = await translateMessage(`✅ Successfully executed action for ${successCount} out of ${allClasses.length} classes!`);
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: multiClassSuccessMsg
        }]);
        return;
      }

      // Single class actions
      const actionsRequiringClass = [
        'CREATE_ASSIGNMENT', 'DELETE_ASSIGNMENT', 'LOCK_QUIZ', 'VIEW_QUIZ_DETAILS',
        'VIEW_QUIZ_RESULTS', 'CREATE_POLL', 'RELEASE_GRADES',
        'CREATE_SCHEDULE_EVENT', 'VIEW_SCHEDULE', 'CHECK_ASSIGNMENT_COMMENTS', 'VIEW_STUDENT_COMMENTS', 'POST_COMMENT', 'NAVIGATE_TO_CLASS_TOOLS',
        'NAVIGATE_TO_POLLS', 'NAVIGATE_TO_QUIZZES', 'NAVIGATE_TO_CHAT'
      ];

      if (actionsRequiringClass.includes(upperCaseTarget) && !targetClassId && allClasses.length > 0 && !action.params?.class_name) {
        // If an action requires a class, but none was explicitly found, and we have multiple classes,
        // prompt the user to specify unless it's a 'NAVIGATE_TO_CHAT' action which has its own specificity logic below.
        if (upperCaseTarget !== 'NAVIGATE_TO_CHAT') {
            setConversation(prev => [...prev, {
                role: 'assistant',
                content: `I couldn't determine which class to use. Available classes: ${allClasses.map(c => c.name).join(', ')}. Please specify the class name clearly.`
            }]);
            return;
        }
      } else if (actionsRequiringClass.includes(upperCaseTarget) && !targetClassId && allClasses.length === 0) {
          // If no classes exist at all
          setConversation(prev => [...prev, {
              role: 'assistant',
              content: "You don't have any classes. Please create a class first."
          }]);
          return;
      }


      switch (upperCaseTarget) {
        case 'CREATE_ASSIGNMENT':
          if (!targetClassId) throw new Error("Class not found");

          const assignmentData = {
            class_id: targetClassId,
            teacher_id: user.id,
            title: action.params.title,
            description: action.params.description || '',
            instructions: action.params.instructions || '',
            max_points: action.params.max_points || 100,
            subject: action.params.subject || 'other',
            use_ai_grading: action.params.use_ai_grading !== undefined ? action.params.use_ai_grading : true,
            leniency: action.params.leniency || 'Neutral'
          };

          // Convert human-friendly dates like "Tomorrow" into a valid date format.
          if (action.params.due_date) {
            let dueDate = new Date();
            const dateStr = String(action.params.due_date).toLowerCase();

            if (dateStr.includes('tomorrow')) {
                dueDate.setDate(dueDate.getDate() + 1);
            } else if (dateStr.includes('in 2 days') || dateStr.includes('two days')) {
                dueDate.setDate(dueDate.getDate() + 2);
            } else if (dateStr.includes('in 3 days') || dateStr.includes('three days')) {
                dueDate.setDate(dueDate.getDate() + 3);
            } else {
                const parsedDate = new Date(action.params.due_date);
                if (!isNaN(parsedDate.getTime())) {
                    dueDate = parsedDate;
                    if (parsedDate.getHours() === 0 && parsedDate.getMinutes() === 0) { // If time not specified, default to end of day
                        dueDate.setHours(23, 59, 59, 999);
                    }
                }
            }
            assignmentData.due_date = dueDate.toISOString();
          }

          if (uploadedFile?.file_url) {
            assignmentData.attachment_url = uploadedFile.file_url;
            assignmentData.attachment_filename = uploadedFile.file_name;
          }

          await retryWithBackoff(() => Assignment.create(assignmentData));

          // Auto-add to schedule if due date exists
          if (assignmentData.due_date) { // Check assignmentData.due_date after parsing
            try {
              const scheduleEventDate = new Date(assignmentData.due_date).toISOString().split('T')[0];
              await retryWithBackoff(() => ScheduleEvent.create({
                class_id: targetClassId,
                title: action.params.title,
                description: `Assignment Due: ${action.params.title}`,
                event_date: scheduleEventDate,
                event_type: 'Homework Due'
              }));
            } catch (scheduleError) {
              console.warn("Failed to add assignment to schedule:", scheduleError);
            }
          }

          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Assignment "${action.params.title}" created in ${targetClass?.name || 'class'}!${action.params.due_date ? ' Also added to class schedule.' : ''}`
          }]);
          break;

        case 'DELETE_ASSIGNMENT':
          let assignmentIdToDelete = action.params.assignment_id;

          if (!assignmentIdToDelete && action.params.assignment_title && targetClass) {
              const classAssignments = await retryWithBackoff(() => Assignment.filter({ class_id: targetClass.id }));
              const assignmentTitle = action.params.assignment_title.toLowerCase();
              const foundAssignment = classAssignments.find(a => a.title.toLowerCase().includes(assignmentTitle));

              if (foundAssignment) {
                  assignmentIdToDelete = foundAssignment.id;
              } else {
                  throw new Error(`Assignment "${action.params.assignment_title}" not found in ${targetClass.name}.`);
              }
          }

          if (!assignmentIdToDelete) {
              throw new Error("Could not determine which assignment to delete. Please specify by ID or provide a more precise title and class.");
          }

          await retryWithBackoff(() => Assignment.delete(assignmentIdToDelete));
          setConversation(prev => [...prev, { role: 'assistant', content: `✅ Assignment deleted!` }]);
          break;

        case 'LOCK_QUIZ':
          await retryWithBackoff(() => Quiz.update(action.params.quiz_id, { status: 'closed' }));
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Quiz locked!`
          }]);
          break;

        case 'VIEW_QUIZ_DETAILS':
          if (!action.params.class_name || !action.params.quiz_id) throw new Error("Missing class or quiz ID");
          // targetClass already determined by new logic
          window.location.href = createPageUrl(`ClassTools?classId=${targetClass.id}&tool=quizzes&quizId=${action.params.quiz_id}`);
          break;

        case 'VIEW_QUIZ_RESULTS':
          const quizForResults = context.quizzes?.find(q =>
            q.title.toLowerCase().includes(action.params.quiz_title.toLowerCase()) &&
            (!action.params.class_name || q.class_name.toLowerCase().includes(action.params.class_name.toLowerCase()))
          );
          if (!quizForResults) throw new Error(`Quiz "${action.params.quiz_title}" not found`);
          window.location.href = createPageUrl(`ClassTools?classId=${quizForResults.class_id || targetClassId}&tool=quizzes&quizId=${quizForResults.id}&view=results`);
          break;

        case 'CREATE_POLL':
          // targetClassId already determined by new logic
          if (!targetClassId) throw new Error("No classes found");

          await retryWithBackoff(() => Poll.create({
            class_id: targetClassId,
            teacher_id: user.id,
            question: action.params.question,
            options: action.params.options,
            status: 'active'
          }));
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Poll created in ${targetClass?.name || 'class'}!`
          }]);
          break;

        case 'CLOSE_POLL':
          await retryWithBackoff(() => Poll.update(action.params.poll_id, { status: 'closed' }));
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Poll closed!`
          }]);
          break;

        case 'REOPEN_POLL':
          await retryWithBackoff(() => Poll.update(action.params.poll_id, { status: 'active' }));
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Poll reopened!`
          }]);
          break;

        case 'SEND_CLASS_CHAT':
          if (targetClassId) {
            // Send to specific class
            await retryWithBackoff(() => Message.create({
              class_id: targetClassId,
              content: action.params.content,
              user_id: user.id,
              user_name: user.full_name || user.email,
              user_role: user.app_role || 'student'
            }));
            setConversation(prev => [...prev, {
              role: 'assistant',
              content: `✅ Message sent to ${targetClass.name} chat!`
            }]);
          } else {
            // This 'else' block for "all classes" should ideally be handled by the 'isAllClasses' block at the top.
            // If control reaches here for a multi-class request, it implies the earlier check failed,
            // or it's a fallback. For now, following the outline exactly.
            let sentCount = 0;
            for (const cls of allClasses) {
              await retryWithBackoff(() => Message.create({
                class_id: cls.id,
                content: action.params.content,
                user_id: user.id,
                user_name: user.full_name || user.email,
                user_role: user.app_role || 'student'
              }));
              sentCount++;
            }
            setConversation(prev => [...prev, {
              role: 'assistant',
              content: `✅ Message sent to ${sentCount} classes!`
            }]);
          }
          break;

        case 'RELEASE_GRADES':
          const assignmentToGrade = context.assignments?.find(a =>
            a.title.toLowerCase().includes(action.params.assignment_title.toLowerCase()) &&
            (!action.params.class_name || a.class_name.toLowerCase().includes(action.params.class_name.toLowerCase()))
          );
          if (!assignmentToGrade) throw new Error(`Assignment "${action.params.assignment_title}" not found`);

          const submissionsToRelease = await retryWithBackoff(() => Submission.filter({
            assignment_id: assignmentToGrade.id,
            grading_status: 'ai_graded'
          }));

          for (const sub of submissionsToRelease) {
            await retryWithBackoff(() => Submission.update(sub.id, {
              is_released: true,
              released_at: new Date().toISOString(),
              grading_status: 'released',
              final_grade: sub.ai_grade,
              final_feedback: sub.ai_feedback
            }));
          }
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Released 3 grades for "${assignmentToGrade.title}"!`
          }]);
          break;

        case 'create-schedule-event': // FALLBACK for AI-hallucinated action name
        case 'create_schedule_event': // FALLBACK for AI-hallucinated action name
        case 'CREATE_SCHEDULE_EVENT':
          // Parse date from action params
          let eventDate = new Date();
          let providedDateStr = action.params.event_date || '';
          let parsedDate = new Date(providedDateStr);

          // Check if date is valid or a keyword
          if (isNaN(parsedDate.getTime()) || providedDateStr.toLowerCase().includes('tomorrow') || providedDateStr.split(' ').length < 2) {
              setConversation(prev => [...prev, {
                  role: 'assistant',
                  content: 'To create an event, I need a specific date. Please provide the date in the format "Month Day, Year" (e.g., "July 30, 2025").'
              }]);
              return; // Stop execution
          }

          eventDate = parsedDate;

          const formattedDate = eventDate.toISOString().split('T')[0];

          if (action.params.class_ids && action.params.class_ids.length > 0) {
            // Multiple classes
            let createdCount = 0;
            for (const classId of action.params.class_ids) {
              await retryWithBackoff(() => ScheduleEvent.create({
                class_id: classId,
                title: action.params.title,
                description: action.params.description || '',
                event_date: formattedDate,
                event_type: action.params.event_type || 'Event'
              }));
              createdCount++;
            }
            setConversation(prev => [...prev, {
              role: 'assistant',
              content: `✅ Event "${action.params.title}" added to ${createdCount} class schedules!`
            }]);
          }
          else {
            // Single class, targetClassId already determined by new logic
            if (!targetClassId) throw new Error("No classes found to create event in.");

            await retryWithBackoff(() => ScheduleEvent.create({
              class_id: targetClassId,
              title: action.params.title,
              description: action.params.description || '',
              event_date: formattedDate,
              event_type: action.params.event_type || 'Event'
            }));
            setConversation(prev => [...prev, {
              role: 'assistant',
              content: `✅ Event "${action.params.title}" added to ${targetClass?.name || 'class'} schedule!`
            }]);
          }
          break;

        case 'VIEW_SCHEDULE':
          // targetClassId already determined by new logic
          if (!targetClassId) throw new Error("No classes found to view schedule for.");
          window.location.href = createPageUrl(`ClassTools?classId=${targetClassId}&tool=schedule`);
          break;

        case 'LIST_ASSIGNMENT_COMMENTS': // FALLBACK
        case 'CHECK_COMMENTS': // FALLBACK
        case 'GET_COMMENTS': // FALLBACK
        case 'CHECK_ALL_ASSIGNMENT_COMMENTS': // FALLBACK
        case 'CHECK_ASSIGNMENT_COMMENTS':
          // Check if it's for all assignments or a specific one
          if (action.params.assignment_title?.toLowerCase() === "all") {
            // Check all assignments for comments
            if (!targetClass) throw new Error("Class not found");

            const assignments = await retryWithBackoff(() => Assignment.filter({ class_id: targetClass.id }));
            const assignmentsWithComments = [];

            for (const assignment of assignments) {
              const comments = await retryWithBackoff(() => AssignmentComment.filter({ assignment_id: assignment.id }));
              if (comments.length > 0) {
                const uniqueStudents = [...new Set(comments.map(c => c.student_id))];
                assignmentsWithComments.push({
                  title: assignment.title,
                  id: assignment.id,
                  commentCount: comments.length,
                  studentCount: uniqueStudents.length
                });
              }
            }

            if (assignmentsWithComments.length === 0) {
              setConversation(prev => [...prev, {
                role: 'assistant',
                content: `No private comments found in any assignments for ${targetClass.name}.`
              }]);
            } else {
              let response = `**Private Comments Summary for ${targetClass.name}:**\n\n`;
              assignmentsWithComments.forEach(assignment => {
                response += `• **${assignment.title}**: ${assignment.commentCount} comment${assignment.commentCount !== 1 ? 's' : ''} from ${assignment.studentCount} student${assignment.studentCount !== 1 ? 's' : ''}\n`;
              });

              const actions = assignmentsWithComments.map(assignment => ({
                type: "view",
                label: `View ${assignment.title} Comments`,
                target: "CHECK_ASSIGNMENT_COMMENTS",
                params: { assignment_title: assignment.title, class_name: targetClass.name }
              }));

              setConversation(prev => [...prev, {
                role: 'assistant',
                content: response,
                actions: actions
              }]);
            }
          } else {
            // Check specific assignment
            if (!targetClass) throw new Error("Class not found");

            const assignments = await retryWithBackoff(() => Assignment.filter({ class_id: targetClass.id }));
            const assignmentTitle = action.params.assignment_title.toLowerCase();
            const foundAssignment = assignments.find(a => a.title.toLowerCase().includes(assignmentTitle));

            if (!foundAssignment) {
              throw new Error(`Assignment "${action.params.assignment_title}" not found in ${targetClass.name}.`);
            }

            const comments = await retryWithBackoff(() => AssignmentComment.filter({ assignment_id: foundAssignment.id }));

            if (comments.length === 0) {
              setConversation(prev => [...prev, {
                role: 'assistant',
                content: `No private comments found for "${foundAssignment.title}" in ${targetClass.name}.`
              }]);
            } else {
              const studentsWithComments = [...new Set(comments.map(c => c.student_id))];
              const studentNames = comments.reduce((acc, comment) => {
                if (!acc[comment.student_id]) {
                  acc[comment.student_id] = comment.user_name;
                }
                return acc;
              }, {});

              let commentSummary = `**Private Comments for "${foundAssignment.title}" in ${targetClass.name}:**\n\n`;

              const actions = studentsWithComments.map(studentId => {
                const studentComments = comments.filter(c => c.student_id === studentId);
                commentSummary += `• **${studentNames[studentId]}**: ${studentComments.length} comment${studentComments.length !== 1 ? 's' : ''}\n`;

                return {
                  type: "view",
                  label: `View ${studentNames[studentId]}'s Comments`,
                  target: "VIEW_STUDENT_COMMENTS",
                  params: {
                    assignment_title: foundAssignment.title,
                    class_name: targetClass.name,
                    student_name: studentNames[studentId],
                    student_id: studentId
                  }
                };
              });

              setConversation(prev => [...prev, {
                role: 'assistant',
                content: commentSummary,
                actions: actions
              }]);
            }
          }
          break;

        case 'VIEW_STUDENT_COMMENTS':
          if (!targetClass) throw new Error("Class not found");

          const assignments = await retryWithBackoff(() => Assignment.filter({ class_id: targetClass.id }));
          const assignmentTitle = action.params.assignment_title.toLowerCase();
          const foundAssignment = assignments.find(a => a.title.toLowerCase().includes(assignmentTitle));

          if (!foundAssignment) {
            throw new Error(`Assignment "${action.params.assignment_title}" not found.`);
          }

          const studentComments = await retryWithBackoff(() => AssignmentComment.filter({
            assignment_id: foundAssignment.id,
            student_id: action.params.student_id
          }, '-created_date'));

          if (studentComments.length === 0) {
            setConversation(prev => [...prev, {
              role: 'assistant',
              content: `No comments found between you and ${action.params.student_name} for "${foundAssignment.title}".`
            }]);
          } else {
            let conversationDisplay = `**Conversation with ${action.params.student_name} - "${foundAssignment.title}":**\n\n`;

            studentComments.reverse().forEach(comment => {
              const timestamp = format(new Date(comment.created_date), 'MMM d, yyyy h:mm a');
              conversationDisplay += `**${comment.user_name}** (${comment.user_role}) - ${timestamp}:\n${comment.content}\n\n`;
            });

            const replyAction = {
              type: "send_message",
              label: "Reply to Student",
              target: "POST_COMMENT",
              params: {
                assignment_title: foundAssignment.title,
                class_name: targetClass.name,
                student_name: action.params.student_name,
                student_id: action.params.student_id
              }
            };

            setConversation(prev => [...prev, {
              role: 'assistant',
              content: conversationDisplay + "Would you like to reply to this student?",
              actions: [replyAction]
            }]);
          }
          break;

        case 'POST_COMMENT':
          // This will be triggered when user wants to post a comment
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `What would you like to say to ${action.params.student_name} about "${action.params.assignment_title}"? Please type your message and I'll post it as a private comment.`
          }]);

          // Store the context for the next message
          setContext(prevContext => ({
            ...prevContext,
            pendingComment: {
              assignment_title: action.params.assignment_title,
              class_name: action.params.class_name,
              student_name: action.params.student_name,
              student_id: action.params.student_id
            }
          }));
          break;

        case 'NAVIGATE_TO_CHAT':
          // Find the target class
          if (!action.params?.class_name) {
            if (allClasses.length === 1) {
              // If only one class, navigate to it
              window.location.href = createPageUrl(`Chat?classId=${allClasses[0].id}`);
            } else if (allClasses.length > 1) {
              // Multiple classes - ask user to specify
              setConversation(prev => [...prev, {
                role: 'assistant',
                content: `Please specify which class you would like to open the chat for: ${allClasses.map(c => c.name).join(', ')}.`,
                actions: allClasses.map(cls => ({
                  type: "navigate",
                  label: `Open Chat for ${cls.name}`,
                  target: "NAVIGATE_TO_CHAT",
                  params: { class_name: cls.name }
                }))
              }]);
            } else {
              // No classes available
              throw new Error("You don't have any classes to chat in.");
            }
          } else {
            const targetClass = findClassByName(action.params.class_name);
            if (!targetClass) throw new Error("Class not found");
            window.location.href = createPageUrl(`Chat?classId=${targetClass.id}`);
          }
          break;

        case 'NAVIGATE_TO_AI_TOOL':
          window.location.href = createPageUrl(`AITools?tool=${action.params.tool_id}`);
          break;

        case 'OPEN_CLASS_TOOLS': // FALLBACK for AI-hallucinated action name
        case 'NAVIGATE_TO_CLASS_TOOLS':
          // targetClassId already determined by new logic
          if (!targetClassId && allClasses.length > 0) {
              // If no specific class is mentioned, but classes exist, navigate to the first one by default.
              window.location.href = createPageUrl(`ClassTools?classId=${allClasses[0].id}`);
          } else if (targetClassId) {
              window.location.href = createPageUrl(`ClassTools?classId=${targetClassId}`);
          } else {
              throw new Error("You don't have any classes. Please create a class first.");
          }
          break;

        case 'NAVIGATE_TO_POLLS':
          // targetClassId already determined by new logic
          if (!targetClassId) throw new Error("No classes found");
          window.location.href = createPageUrl(`ClassTools?classId=${targetClassId}&tool=polls`);
          break;

        case 'NAVIGATE_TO_QUIZZES':
          // targetClassId already determined by new logic
          if (!targetClassId) throw new Error("No classes found");
          window.location.href = createPageUrl(`ClassTools?classId=${targetClassId}&tool=quizzes`);
          break;

        case 'NAVIGATE_TO_DASHBOARD':
          window.location.href = createPageUrl('Dashboard');
          break;

        case 'SUBMIT_ASSIGNMENT':
          if (!uploadedFile) throw new Error("No file uploaded");
          await retryWithBackoff(() => Submission.create({
            assignment_id: action.params.assignment_id,
            student_id: user.id,
            student_name: user.full_name,
            student_email: user.email,
            file_url: uploadedFile.file_url,
            file_name: uploadedFile.file_name
          }));
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `✅ Assignment submitted successfully!`
          }]);
          setUploadedFile(null);
          break;

        case 'VIEW_QUIZ':
            window.location.href = createPageUrl(`ClassTools?classId=${action.params.classId}&tool=quizzes&quizId=${action.params.quizId}`);
            break;

        // --- START FIX for AI hallucinating tool_ids as targets ---
        case 'AI_DETECTOR':
        case 'RUBRIC_GENERATOR':
        case 'LESSON_PLAN':
        case 'QUESTION_GENERATOR':
        case 'EMAIL_GENERATOR':
        case 'TEACHER_WELLNESS_SUPPORT':
        case 'STUDENT_WELLNESS_SUPPORT':
        case 'WORKSHEET_GENERATOR':
        case 'REPORT_CARD_COMMENTS':
        case 'IEP_ACCOMMODATIONS':
        case 'ASSIGNMENT_SCAFFOLDER':
        case 'WRITING_FEEDBACK':
        case 'TEXT_SUMMARIZER':
        case 'CONCEPT_EXPLAINER':
        case 'POWERSCHOOL': // Added this case for PowerSchool
          window.location.href = createPageUrl(`AITools?tool=${action.target}`);
          break;
        // --- END FIX ---

        default:
          // Gracefully handle unknown actions instead of crashing
          console.error(`Unknown action target: ${action.target}`);
          setConversation(prev => [...prev, { role: 'assistant', content: `I'm sorry, I cannot perform the action "${action.label}". This may be an old command. Please try asking in a different way.` }]);
          break;
      }

    } catch (error) {
      console.error("Action execution failed:", error);
      const actionErrorMsg = await translateMessage(`❌ Action failed: ${error.message}`);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: actionErrorMsg
      }]);
    }
  };

  const handleFileUpload = async (fileData) => {
    setUploadedFile(fileData);
    const fileUploadMsg = await translateMessage(`✅ File "${fileData.file_name}" uploaded successfully! You can now use it for assignments or other tasks.`);
    setConversation(prev => [...prev, {
      role: 'assistant',
      content: fileUploadMsg
    }]);
  };

  const placeholderText = user?.app_role === 'teacher'
    ? t('aiAgent.teacherPlaceholder')
    : t('aiAgent.studentPlaceholder');

  if (pageLoading) {
    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center"
                >
                    <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                        {t('aiAgent.title')}
                    </h1>
                    <p className="text-lg text-slate-500 mt-4 font-medium tracking-wide">
                        {t('common.poweredByACE')}
                    </p>
                </motion.div>
            </div>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  // Helper to render greeting with translation
  const renderMessageContent = (content) => {
    if (content.startsWith('__GREETING__')) {
      const name = content.replace('__GREETING__', '');
      return t('aiAgent.greeting').replace('{name}', name);
    }
    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="border-b border-white/20 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {t('aiAgent.title')}
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">Beta</Badge>
                </h1>
                <p className="text-white/70">{t('aiAgent.subtitle')}</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5 mr-2" />
              {t('aiAgent.closeAgent')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col max-w-6xl mx-auto w-full p-6 overflow-hidden">
        {/* Conversation */}
        <div className="flex-grow overflow-y-auto space-y-6 mb-6">
          <AnimatePresence>
            {conversation.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-4xl p-6 rounded-2xl backdrop-blur-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/80 text-white rounded-br-none'
                    : 'bg-black/40 text-white rounded-bl-none border border-white/20'
                }`}>
                  <ReactMarkdown className="prose prose-invert max-w-none">
                    {renderMessageContent(msg.content)}
                  </ReactMarkdown>

                  {msg.actions?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      {msg.actions.map((action, idx) => (
                        <FuturisticButton
                          key={idx}
                          action={action}
                          onExecute={handleExecuteAction}
                          autoExecute={action.auto_execute}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(isSending || isThinking) && ( // Changed isLoading to isSending
            <div className="flex justify-start">
              <div className="p-6 bg-black/40 rounded-2xl rounded-bl-none border border-white/20">
                <motion.div className="flex items-center gap-3 text-white/70">
                  <span className="text-sm font-mono">
                    {isThinking ? t('aiAgent.accessingData') : t('aiAgent.processing')}
                  </span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
          <div ref={conversationEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          {uploadedFile && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-500/50 rounded-lg">
              <p className="text-green-300 text-sm">
                <FileText className="w-4 h-4 inline mr-2" />
                {t('aiAgent.fileReady')} {uploadedFile.file_name}
              </p>
            </div>
          )}

          <Card className="bg-black/40 border-white/20 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={placeholderText}
                  className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl resize-none"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <FileUploadButton
                    onFileUpload={handleFileUpload}
                    label="📎"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending} // Changed isLoading to isSending
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}