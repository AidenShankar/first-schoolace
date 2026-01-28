import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, CheckCircle, X, Plus, File, FileText, Image, BrainCircuit, Upload, GraduationCap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { InvokeLLM, UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import ReactMarkdown from 'react-markdown';
import { getTutorSystemPrompt } from './tutorSystemPrompt';
import { AssignmentComment } from '@/entities/AssignmentComment';
import { ClassEnrollment } from '@/entities/ClassEnrollment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { t } from '../i18n/translations';

// Fix AI outputs: wrap unwrapped LaTeX-like math in dollar signs for KaTeX/Markdown rendering
function autoWrapLatex(content) {
  // This regex catches things like ( \frac{...} ), [ \frac{...} ], and other LaTeX fragments not inside $
  // You can expand this regex as needed to catch more patterns (exponents, \sqrt{}, etc)
  return content.replace(/(?<!\$)([\(\[][ ]*\\[a-zA-Z]+{[^}]+}[^$\)\]\n]*)[\)\]](?!\$)/g, m => `$${m}$`);
}

// Component to render text with math
const MathText = ({ children, className = "" }) => {
    const mathRef = useRef(null);
    
    useEffect(() => {
        if (mathRef.current && window.renderMathInElement) {
            window.renderMathInElement(mathRef.current, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }, [children]);

    return <div ref={mathRef} className={className}>{children}</div>;
};

const InteractiveQuiz = ({ quiz, onQuizSubmit, onCancel, language = 'EN' }) => {
    const [answers, setAnswers] = useState({});
    const isSubmittable = Object.keys(answers).length === quiz.questions.length;

    const handleAnswer = (qIndex, option) => {
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="my-6 bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-xl"
        >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{quiz.title}</h3>
                <button 
                    className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200" 
                    onClick={onCancel}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-8">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                        <MathText className="text-lg font-medium text-slate-800 leading-relaxed">
                            {qIndex + 1}. {q.question}
                        </MathText>
                        <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, oIndex) => (
                                <button
                                    key={oIndex}
                                    className={`text-left p-4 rounded-2xl text-base font-medium transition-all duration-300 ease-out border-2 ${
                                        answers[qIndex] === opt 
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg transform scale-[1.02]' 
                                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                    }`}
                                    onClick={() => handleAnswer(qIndex, opt)}
                                >
                                    <MathText>{opt}</MathText>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className={`w-full mt-8 rounded-2xl h-14 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${!isSubmittable ? 'grayscale' : ''}`} 
                disabled={!isSubmittable} 
                onClick={() => onQuizSubmit(answers)}
            >
                <CheckCircle className="w-6 h-6 mr-3" />
                {t('personalizedLearning.submitQuiz', language)}
            </button>
        </motion.div>
    );
};

const FilePreview = ({ file, onRemove, isUploading, language = 'EN' }) => {
    const getFileIcon = (type) => {
        if (!type) return <File className="w-5 h-5 text-slate-400" />;
        if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
        if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
        return <File className="w-5 h-5 text-slate-400" />;
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0) return 'Uploaded';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4"
        >
            {isUploading || file?.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            ) : (
                getFileIcon(file?.type)
            )}
            <div className="flex-1">
                <p className="font-medium text-slate-800">
                    {isUploading || file?.isLoading ? t('personalizedLearning.processingFile', language) : file?.name}
                </p>
                <p className="text-sm text-slate-500">{formatFileSize(file?.size || 0)}</p>
            </div>
            {!isUploading && !file?.isLoading && (
                <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all duration-200" onClick={onRemove}>
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
};

// Component to render message with KaTeX support
const MessageContent = ({ content, isUser }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && window.renderMathInElement) {
            window.renderMathInElement(contentRef.current, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }, [content]);
    const safeContent = autoWrapLatex(content);

    return (
        <div ref={contentRef}>
            <ReactMarkdown className={`prose prose-sm max-w-none ${
                isUser 
                    ? 'prose-invert prose-p:my-2' 
                    : 'prose-p:my-2 prose-a:text-purple-600 prose-a:font-medium hover:prose-a:text-purple-800'
            }`}>
                {safeContent}
            </ReactMarkdown>
        </div>
    );
};

export default function ChatTutor({ user, learningData, language = 'EN', isPersonalizedMode, setIsPersonalizedMode }) {
    const [conversation, setConversation] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]); 
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isSavingMessage, setIsSavingMessage] = useState(false);
    const [learningMode, setLearningMode] = useState(true); // Default ON (step-by-step only)
    const [isDragOver, setIsDragOver] = useState(false);
    const conversationEndRef = useRef(null);
    const quizRef = useRef(null);
    const fileInputRef = useRef(null);
    const prevConversationLengthRef = useRef(0);

    // Load learning mode from localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem('acelearningMode');
        if (savedMode !== null) {
            setLearningMode(savedMode === 'true');
        }
    }, []);

    // Save learning mode to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('acelearningMode', String(learningMode));
    }, [learningMode]);

    // Load KaTeX from CDN
    useEffect(() => {
        // Only load if not already loaded (check for a specific KaTeX element or global function)
        if (document.getElementById('katex-css') || window.renderMathInElement) return;

        const katexCSS = document.createElement('link');
        katexCSS.id = 'katex-css';
        katexCSS.rel = 'stylesheet';
        katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        katexCSS.crossOrigin = 'anonymous';
        document.head.appendChild(katexCSS);

        const katexJS = document.createElement('script');
        katexJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        katexJS.crossOrigin = 'anonymous';
        katexJS.onload = () => {
            const autoRenderJS = document.createElement('script');
            autoRenderJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
            autoRenderJS.crossOrigin = 'anonymous';
            autoRenderJS.onload = () => {
                // Ensure auto-render.min.js has loaded and added renderMathInElement to window
                // You might want to add a more robust check if needed.
            };
            document.head.appendChild(autoRenderJS);
        };
        document.head.appendChild(katexJS);
    }, []);

    const getIntroMessage = useCallback(() => {
        const allItems = [
            ...(learningData?.assignments || []),
            ...(learningData?.quizzes || [])
        ];

        const focusItems = allItems
            .filter(item => item.percentage < 80)
            .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        const recentFocus = focusItems.slice(0, 3);

        let focusText = '';
        if (recentFocus.length > 0) {
            const concepts = recentFocus.map(item => `"${item.title}"`).join(', ');
            focusText = t('personalizedLearning.focusAreasIntro', language).replace('{concepts}', concepts);
        }

        return t('personalizedLearning.introMessage', language)
            .replace('{name}', user.full_name.split(' ')[0])
            .replace('{focusText}', focusText);
    }, [user, learningData, language]);

    useEffect(() => {
        if (learningData && user) {
            setConversation([{ role: 'assistant', content: getIntroMessage(), id: Date.now() }]);
            prevConversationLengthRef.current = 1;
        }
    }, [user, learningData, getIntroMessage]);

    useEffect(() => {
        // Only scroll if conversation length increased (new message added)
        if (conversation.length > prevConversationLengthRef.current && !activeQuiz) {
            setTimeout(() => {
                conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
        prevConversationLengthRef.current = conversation.length;
    }, [conversation.length, activeQuiz]);

    useEffect(() => {
        // When a quiz becomes active, scroll to it
        if (activeQuiz && quizRef.current) {
            quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeQuiz]);

    const handleFileUpload = async (input) => {
        const files = input.target ? Array.from(input.target.files) : Array.from(input);
        if (files.length === 0) return;

        // Add loading placeholders first
        const loadingFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            file_url: null,
            extractedContent: '',
            error: false,
            isLoading: true,
            uploadedAt: new Date().toISOString()
        }));

        setAttachedFiles(prev => [...prev, ...loadingFiles]);
        setIsUploadingFile(true);

        const processedFiles = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const loadingFileId = loadingFiles[i].id;
            
            try {
                const { file_url } = await UploadFile({ file });

                const extraction = await ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: {
                        type: 'object',
                        properties: {
                            content: { type: 'string' }
                        }
                    }
                });

                let extractedContent = '';
                let hasError = false;
                
                if (extraction.status === 'success' && extraction.output?.content) {
                    extractedContent = extraction.output.content;
                } else {
                    extractedContent = 'Content extraction failed for this file type.';
                    hasError = true;
                }

                const fileInfo = {
                    id: loadingFileId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    file_url,
                    extractedContent,
                    error: hasError,
                    isLoading: false,
                    uploadedAt: new Date().toISOString()
                };

                processedFiles.push(fileInfo);

                // Update the loading file with processed data
                setAttachedFiles(prev => prev.map(f => 
                    f.id === loadingFileId ? fileInfo : f
                ));

            } catch (error) {
                console.error('Error processing file:', error);
                const fileInfo = {
                    id: loadingFileId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    file_url: null,
                    extractedContent: 'Error: Could not process this file.',
                    error: true,
                    isLoading: false,
                    uploadedAt: new Date().toISOString()
                };
                
                processedFiles.push(fileInfo);

                // Update the loading file with error data
                setAttachedFiles(prev => prev.map(f => 
                    f.id === loadingFileId ? fileInfo : f
                ));
            }
        }

        setUploadedFiles(prev => [...prev, ...processedFiles]);
        setIsUploadingFile(false);
    };

    const removeAttachedFile = (fileId) => {
        setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const removeUploadedFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleQuizSubmit = async (answers) => {
        const questions = activeQuiz.quiz.questions;
        const results = questions.map((q, index) => ({
            question: q.question,
            correct_answer: q.correct_answer,
            student_answer: answers[index] || 'No answer',
            is_correct: answers[index] === q.correct_answer
        }));

        const score = results.filter(r => r.is_correct).length;
        const percentage = Math.round((score / questions.length) * 100);

        let feedback = t('personalizedLearning.quizComplete', language)
            .replace('{score}', score)
            .replace('{total}', questions.length)
            .replace('{percentage}', percentage) + '\n\n';
        const wrongAnswers = results.filter(r => !r.is_correct);

        if (wrongAnswers.length > 0) {
            feedback += `${t('personalizedLearning.questionsToWorkOn', language)}\n${wrongAnswers.map(r => `* ${r.question}`).join('\n')}\n\n`;
            feedback += t('personalizedLearning.whichToBreakDown', language);
        } else {
            feedback += t('personalizedLearning.perfectScore', language);
        }

        setConversation(prev => [...prev, { role: 'assistant', content: feedback, id: Date.now() }]);
        setActiveQuiz(null);
    };

    const formatConversationHistory = (messages) => {
        return messages
            .filter(msg => msg.role !== 'system')
            .map(msg => {
                const role = msg.role === 'assistant' ? 'Tutor' : 'Student';
                let content = msg.content;
                
                if (msg.fileInfos && msg.fileInfos.length > 0) {
                    content += `\n[Files attached: ${msg.fileInfos.map(f => `${f.name} (${f.type})`).join(', ')}]`;
                    msg.fileInfos.forEach(fileInfo => {
                        if (fileInfo.extractedContent && !fileInfo.error) {
                            const truncatedContent = fileInfo.extractedContent.length > 1500 
                                ? fileInfo.extractedContent.substring(0, 1500) + '...[truncated]'
                                : fileInfo.extractedContent;
                            content += `\nFile content from ${fileInfo.name}: ${truncatedContent}`;
                        }
                    });
                }
                
                return `${role}: ${content}`;
            })
            .join('\n\n');
    };

    const createUploadedFilesContext = () => {
        if (uploadedFiles.length === 0) return '';
        
        return uploadedFiles.map(file => {
            let fileContext = `- File: ${file.name} (${file.type || 'unknown type'})`;
            fileContext += `\n  Upload ID: ${file.id}`;
            fileContext += `\n  Uploaded: ${new Date(file.uploadedAt).toLocaleString()}`;
            
            if (file.error) {
                fileContext += `\n  Status: Content extraction failed`;
            } else if (file.extractedContent) {
                const contentPreview = file.extractedContent.length > 3000 
                    ? file.extractedContent.substring(0, 3000) + '...[truncated - full content available upon request]'
                    : file.extractedContent;
                fileContext += `\n  Content: ${contentPreview}`;
            }
            
            return fileContext;
        }).join('\n\n');
    };

    const moderateAndSaveStudentMessage = async (message) => {
        setIsSavingMessage(true);
        let isFlagged = false;
        let flagReason = "";

        try {
            const moderationPrompt = `
                Analyze the following student message for concerning content. Respond ONLY with a valid JSON object.
                The JSON object must have two keys: "is_flagged" (boolean) and "reason" (string).
                Flag the message if it contains any of the following:
                - Requests for direct answers or cheating.
                - Requests to generate full assignment submissions, like essays.
                - Self-harm or suicidal ideation.
                - Threats, violence, or bullying.
                - Hate speech or discriminatory language.
                - Profanity or sexually explicit content.
                If no issues are found, "is_flagged" must be false and "reason" should be an empty string.

                Student message: "${message}"
            `;
            
            const moderationResult = await InvokeLLM({
                prompt: moderationPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        is_flagged: { type: "boolean" },
                        reason: { type: "string" },
                    },
                    required: ["is_flagged", "reason"],
                }
            });

            if (moderationResult) {
                isFlagged = moderationResult.is_flagged || false;
                flagReason = moderationResult.reason || "";
            }

        } catch (error) {
            console.error('AI Moderation failed, saving message without flags:', error);
        }

        try {
            const enrollments = await ClassEnrollment.filter({ student_id: user.id });
            for (const enrollment of enrollments) {
                await AssignmentComment.create({
                    assignment_id: null, 
                    student_id: user.id,
                    user_id: user.id,
                    user_name: user.full_name,
                    user_role: user.app_role,
                    content: message,
                    is_ai_tutor_message: true,
                    class_id: enrollment.class_id,
                    student_email: user.email,
                    is_flagged: isFlagged,
                    flag_reason: flagReason,
                });
            }
        } catch (saveError) {
             console.error('Failed to save student message after moderation attempt:', saveError);
        } finally {
            setIsSavingMessage(false);
        }
    };
    
    const saveTutorResponse = async (message) => {
        try {
            const enrollments = await ClassEnrollment.filter({ student_id: user.id });
             for (const enrollment of enrollments) {
                await AssignmentComment.create({
                    assignment_id: null, 
                    student_id: user.id,
                    user_id: "ai_tutor", 
                    user_name: "AI Tutor",
                    user_role: "teacher", 
                    content: message,
                    is_ai_tutor_message: true,
                    class_id: enrollment.class_id,
                    student_email: user.email,
                    is_flagged: false, 
                    flag_reason: "",
                });
            }
        } catch (error) {
             console.error('Failed to save AI Tutor response for teacher view:', error);
        }
    };

    const handleSend = async (message) => {
        if (!message.trim() && attachedFiles.length === 0) return;

        let fileInfos = null;
        if (attachedFiles.length > 0) {
            fileInfos = attachedFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                file_url: file.file_url,
                extractedContent: file.extractedContent,
                error: file.error
            }));
        }

        const studentMessageContent = message || `[Files uploaded: ${attachedFiles.map(f => f.name).join(', ')}]`;
        moderateAndSaveStudentMessage(studentMessageContent);

        const userMessage = { 
            role: 'user', 
            content: studentMessageContent,
            fileInfos: fileInfos,
            id: Date.now()
        };
        
        setConversation(prev => [...prev, userMessage]);
        setInput('');
        setAttachedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsLoading(true);

        try {
            const formattedHistory = formatConversationHistory([...conversation, userMessage]); 
            
            let fullPrompt = "";

            const MATH_RULES = `
BEFORE YOU WRITE YOUR RESPONSE, CHECK EVERY SINGLE WORD FOR MATH CONTENT.

**GOLDEN RULE:** If it's a number, variable, equation, or contains ANY mathematical notation → WRAP IT IN DOLLAR SIGNS

**YOU MUST FORMAT:**
✓ Single variables: $x$, $y$, $a$, $n$
✓ Numbers in equations: $3$, $42$, $2x$
✓ Simple expressions: $x + 1$, $3a^2$
✓ Complex expressions: $3a^2 + 3x^2 + 6ax$
✓ Fractions with backslashes: $\\\\frac{3}{ax}$, $\\\\frac{3x}{a^2x}$
✓ Parenthetical expressions: $\\\\left( \\\\frac{3}{ax} + \\\\frac{3x}{a^2x} \\\\right)$
✓ Exponents: $x^2$, $a^{2x}$, $e^{2\\\\pi i}$
✓ EVERYTHING with LaTeX backslashes: They NEED dollar signs!

**WRONG vs CORRECT - STUDY THESE:**

wrong "the expression ( \\frac{3}{ax} + \\frac{3x}{a^2x} + \\frac{7x}{x+a} )"
correct "the expression $\\\\left( \\\\frac{3}{ax} + \\\\frac{3x}{a^2x} + \\\\frac{7x}{x+a} \\\\right)$"

wrong "you wrote ( \\frac{3a^2 + 3x^2 + 6ax + 7a^2x^2}{a^2x(x+a)} )"
correct "you wrote $\\\\left( \\\\frac{3a^2 + 3x^2 + 6ax + 7a^2x^2}{a^2x(x+a)} \\\\right)$"

wrong "The denominator is a^2x(x+a)"
correct "The denominator is $a^2x(x+a)$"

wrong "3a^2 + 3x^2"
correct "$3a^2 + 3x^2$"

wrong "In your final expression, you wrote ( \\frac{3a^2 + 3x^2}"
correct "In your final expression, you wrote $\\\\left( \\\\frac{3a^2 + 3x^2} \\\\right.$"

**SPECIAL ATTENTION FOR IMAGES:**
When analyzing uploaded images containing math:
- Extract the mathematical expressions you see
- IMMEDIATELY wrap them in dollar signs when referencing them
- Use proper LaTeX formatting with double backslashes
- Example: If image shows "x²+1", write it as "$x^2 + 1$" in your response

**LaTeX Commands (DOUBLE backslashes required):**
- $\\\\frac{num}{den}$ for fractions
- $\\\\left( ... \\\\right)$ for parentheses
- $\\\\sqrt{x}$ for square roots
- $x^{power}$ for exponents
- $x_{subscript}$ for subscripts

TRIPLE-CHECK YOUR RESPONSE: Before finalizing, scan for ANY mathematical notation and ensure it's wrapped in $ or $$.

Please respond to the student's latest message, maintaining full conversation context and file access.`;

            if (isPersonalizedMode) {
                const uploadedFilesContext = createUploadedFilesContext();
                const systemPrompt = getTutorSystemPrompt(user, learningData, learningMode);
                
                fullPrompt = `${systemPrompt}

UPLOADED FILES CONTEXT:
${uploadedFilesContext || 'No files have been uploaded yet.'}

CONVERSATION HISTORY:
${formattedHistory}

INSTRUCTIONS FOR FILE REFERENCES:
- You have access to all uploaded files throughout this entire conversation
- When a student references "the file I uploaded" or asks about file content, refer to the UPLOADED FILES CONTEXT above
- If multiple files are available and the reference is ambiguous, ask for clarification
- Always prioritize the most recently uploaded file when references are unclear
- You can analyze, summarize, or answer questions about any uploaded file content at any time

⚠️⚠️⚠️ CRITICAL MATH FORMATTING RULE - ABSOLUTELY MANDATORY ⚠️⚠️⚠️
${MATH_RULES}`;
            } else {
                const systemPrompt = "You are a helpful, friendly AI assistant. You can answer general questions, help with homework, and provide explanations. You DO NOT have access to the student's specific assignments, quizzes, or files. If the user asks about them, politely explain that you cannot access their personal data in this mode.";
                
                fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${formattedHistory}

⚠️⚠️⚠️ CRITICAL MATH FORMATTING RULE - ABSOLUTELY MANDATORY ⚠️⚠️⚠️
${MATH_RULES}`;
            }

            const allFileUrls = isPersonalizedMode ? uploadedFiles
                .filter(file => file.file_url && !file.error)
                .map(file => file.file_url) : [];

            const response = await InvokeLLM({
                prompt: fullPrompt,
                file_urls: allFileUrls.length > 0 ? allFileUrls : undefined,
                response_json_schema: {
                    type: "object",
                    properties: {
                        content: { type: "string" },
                        quiz: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                questions: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            question: { type: "string" },
                                            options: { type: "array", items: { type: "string" } },
                                            correct_answer: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ["content"]
                }
            });

            let finalContent = response.content;
            let finalQuiz = response.quiz;

            // Translate the response if the language is not English
            if (language !== 'EN') {
                const langNames = { ES: 'Spanish', ZH: 'Chinese', KO: 'Korean', FR: 'French' };
                const targetLang = langNames[language] || 'English';
                
                const translationPrompt = `Translate the following AI tutor response to ${targetLang}. Keep all mathematical expressions (anything in $ or $$ delimiters) EXACTLY as they are - do not translate or modify them. Only translate the natural language text around them.

Response to translate:
${response.content}`;

                const translatedResponse = await InvokeLLM({ prompt: translationPrompt });
                finalContent = translatedResponse;

                // Also translate quiz if present
                if (response.quiz && Array.isArray(response.quiz.questions) && response.quiz.questions.length > 0) {
                    const quizTranslationPrompt = `Translate the following quiz to ${targetLang}. Keep all mathematical expressions (anything in $ or $$ delimiters) EXACTLY as they are. Return the result as a valid JSON object with the same structure.

Quiz to translate:
${JSON.stringify(response.quiz)}`;

                    const translatedQuiz = await InvokeLLM({ 
                        prompt: quizTranslationPrompt,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                questions: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            question: { type: "string" },
                                            options: { type: "array", items: { type: "string" } },
                                            correct_answer: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    });
                    finalQuiz = translatedQuiz;
                }
            }

            const assistantMessage = { role: 'assistant', content: finalContent, id: Date.now() };
            setConversation(prev => [...prev, assistantMessage]);
            
            saveTutorResponse(finalContent);

            if (finalQuiz && Array.isArray(finalQuiz.questions) && finalQuiz.questions.length > 0) {
                setActiveQuiz({ quiz: finalQuiz });
            }

        } catch (error) {
            console.error("AI Tutor Error:", error);
            const errorMessage = { role: 'assistant', content: "I seem to be having some trouble. Please try again in a moment.", id: Date.now() };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    return (
        <div 
            className={`bg-white backdrop-blur-xl border rounded-3xl shadow-xl flex flex-col h-[80vh] hover:shadow-2xl transition-all duration-500 w-full ${isDragOver ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-slate-100'}`} 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragOver && (
                <div className="absolute inset-0 bg-purple-500/10 backdrop-blur-sm rounded-3xl z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                        <Upload className="w-12 h-12 text-purple-500 mb-2" />
                        <p className="text-lg font-bold text-purple-700">{t('personalizedLearning.dropFilesHere', language)}</p>
                    </div>
                </div>
            )}
            <div className="p-6 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                        <BrainCircuit size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                            {t('personalizedLearning.chatWithAce', language)}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{t('personalizedLearning.yourPersonalTutor', language)}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        {/* Learning Mode Indicator - Only show in Personalized Mode */}
                        {isPersonalizedMode && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                learningMode 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-blue-100 text-blue-700'
                            }`}>
                                <GraduationCap className="w-3.5 h-3.5" />
                                {learningMode ? t('personalizedLearning.learningMode', language) : t('personalizedLearning.solutionMode', language)}
                            </div>
                        )}
                        
                        {/* Data Access Toggle */}
                        <div className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border transition-all duration-300 ${
                            isPersonalizedMode 
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                : 'bg-slate-50 border-slate-200'
                        }`}>
                            <Label 
                                htmlFor="data-access-mode" 
                                className={`text-xs font-bold cursor-pointer select-none transition-colors ${isPersonalizedMode ? 'text-indigo-700' : 'text-slate-500'}`}
                            >
                                Personalized Access
                            </Label>
                            <Switch 
                                id="data-access-mode"
                                checked={isPersonalizedMode}
                                onCheckedChange={setIsPersonalizedMode}
                                className="scale-75 data-[state=checked]:bg-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-white">
                <AnimatePresence initial={false}>
                    {conversation.map((msg, index) => (
                        <motion.div 
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-6 py-4 rounded-3xl shadow-md ${
                                msg.role === 'user' 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-12' 
                                    : 'bg-white text-slate-800 border border-slate-100'
                            }`}>
                                <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                                {msg.fileInfos && msg.fileInfos.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {msg.fileInfos.map((fileInfo, idx) => (
                                            <div key={idx} className={`p-3 rounded-2xl flex items-center gap-3 ${
                                                msg.role === 'user' ? 'bg-black/20' : 'bg-slate-50'
                                            }`}>
                                                {fileInfo.type && fileInfo.type.startsWith('image/')
                                                    ? <Image className="w-4 h-4" />
                                                    : <File className="w-4 h-4" />}
                                                <span className="text-sm font-medium">{fileInfo.name}</span>
                                                {fileInfo.error && (
                                                    <span className="text-xs opacity-75">(Processing failed)</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activeQuiz && (
                    <div ref={quizRef}>
                        <InteractiveQuiz
                            quiz={activeQuiz.quiz}
                            onQuizSubmit={handleQuizSubmit}
                            onCancel={() => setActiveQuiz(null)}
                            language={language}
                        />
                    </div>
                )}

                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-start items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-md">
                            <Loader2 className="animate-spin w-5 h-5" />
                        </div>
                        <div className="px-6 py-4 rounded-3xl bg-white border border-slate-100 shadow-md">
                            <p className="text-slate-600 font-medium">{t('personalizedLearning.aceIsThinking', language)}</p>
                        </div>
                    </motion.div>
                )}
                <div ref={conversationEndRef} />
            </div>

            <div className="p-6 border-t border-slate-100 flex-shrink-0 space-y-4 bg-white/80 backdrop-blur-xl rounded-b-3xl">
            {attachedFiles.length > 0 && (
                <div className="space-y-2">
                    {attachedFiles.map((file) => (
                        <FilePreview 
                            key={file.id}
                            file={file} 
                            onRemove={() => removeAttachedFile(file.id)} 
                            isUploading={file.isLoading}
                            language={language}
                        />
                    ))}
                </div>
            )}
                
                <div className="relative flex items-end gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        multiple
                    />
                    
                    {/* Plus Button with Dropdown - Only visible in Personalized Mode */}
                    {isPersonalizedMode && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    disabled={isLoading || isUploadingFile || isSavingMessage}
                                    className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 shadow-lg text-white"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {t('personalizedLearning.uploadFile', language)}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-purple-600" />
                                            <Label htmlFor="learning-mode" className="text-sm font-medium cursor-pointer">
                                                {t('personalizedLearning.learningMode', language)}
                                            </Label>
                                        </div>
                                        <Switch 
                                            id="learning-mode"
                                            checked={learningMode}
                                            onCheckedChange={setLearningMode}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 ml-6">
                                        {learningMode 
                                            ? t('personalizedLearning.learningModeDesc', language)
                                            : t('personalizedLearning.solutionModeDesc', language)}
                                    </p>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <div className="flex-1 relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
                            placeholder={t('personalizedLearning.inputPlaceholder', language)}
                            className="bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 rounded-2xl px-6 py-4 resize-none text-base font-medium placeholder:text-slate-400 pr-16"
                            rows={1}
                            disabled={isLoading || isUploadingFile || isSavingMessage}
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={isLoading || isUploadingFile || isSavingMessage || (!input.trim() && attachedFiles.length === 0)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 shadow-lg"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-400 text-center font-medium pt-2">{t('personalizedLearning.aiDisclaimer', language)}</p>
            </div>
        </div>
    );
}