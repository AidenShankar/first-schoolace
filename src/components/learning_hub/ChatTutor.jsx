import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, CheckCircle, X, Plus, File, FileText, Image, BrainCircuit, Upload, GraduationCap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import ReactMarkdown from 'react-markdown';
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
import { base44 } from '@/api/base44Client';

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
            className="my-6 backdrop-blur-xl p-8 rounded-3xl border shadow-xl themed-card" style={{ borderColor: `rgb(var(--color-border))` }}
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
                            {q.type === 'free-response' ? (
                                <Textarea
                                    value={answers[qIndex] || ''}
                                    onChange={(e) => handleAnswer(qIndex, e.target.value)}
                                    placeholder={t('personalizedLearning.typeAnswerHere', language) || "Type your answer here..."}
                                    className="min-h-[120px] text-base p-4 rounded-2xl border-2 resize-y"
                                    style={{ 
                                        backgroundColor: `rgb(var(--color-surface))`, 
                                        borderColor: `rgb(var(--color-border))`,
                                        color: `rgb(var(--color-text))`
                                    }}
                                />
                            ) : (
                                q.options.map((opt, oIndex) => (
                                    <button
                                        key={oIndex}
                                        className={`text-left p-4 rounded-2xl text-base font-medium transition-all duration-300 ease-out border-2 ${
                                            answers[qIndex] === opt 
                                                ? 'text-white shadow-lg transform scale-[1.02]' 
                                                : 'hover:shadow-md'
                                        }`}
                                        style={
                                            answers[qIndex] === opt
                                                ? { background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))`, borderColor: `rgb(var(--color-primary))` }
                                                : { backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }
                                        }
                                        onMouseEnter={(e) => {
                                            if (answers[qIndex] !== opt) {
                                                e.currentTarget.style.backgroundColor = `rgba(var(--color-border), 0.5)`;
                                                e.currentTarget.style.borderColor = `rgb(var(--color-textSecondary))`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (answers[qIndex] !== opt) {
                                                e.currentTarget.style.backgroundColor = `rgb(var(--color-surface))`;
                                                e.currentTarget.style.borderColor = `rgb(var(--color-border))`;
                                            }
                                        }}
                                        onClick={() => handleAnswer(qIndex, opt)}
                                    >
                                        <MathText>{opt}</MathText>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className={`w-full mt-8 rounded-2xl h-14 text-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${!isSubmittable ? 'grayscale' : ''}`}
                style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.opacity = '1')} 
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
    const [learningMode, setLearningMode] = useState(false); // Default OFF (Solution Mode)
    const [isDragOver, setIsDragOver] = useState(false);
    const [showUploadNotice, setShowUploadNotice] = useState(false);
    const conversationEndRef = useRef(null);
    const quizRef = useRef(null);
    const fileInputRef = useRef(null);
    const prevConversationLengthRef = useRef(0);

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
            const titles = recentFocus.map(item => `"${item.title.trim()}"`);
            const listFormatter = new Intl.ListFormat(language.toLowerCase(), { style: 'long', type: 'conjunction' });
            const concepts = listFormatter.format(titles);
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

    useEffect(() => {
        if (uploadedFiles.length > 0) setShowUploadNotice(true);
    }, [uploadedFiles.length]);

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
            const { data, error } = await base44.functions.invoke('chatWithAce', {
                message: studentMessageContent,
                learningData,
                uploadedFiles, // Pass context of all uploaded files in session
                conversationHistory: [...conversation, userMessage],
                isPersonalizedMode,
                learningMode,
                language
            });

            if (error) throw new Error(error.response?.data?.error || "Unknown error");

            const { content: finalContent, quiz: finalQuiz } = data;

            const assistantMessage = { role: 'assistant', content: finalContent, id: Date.now() };
            setConversation(prev => [...prev, assistantMessage]);
            
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
            className={`backdrop-blur-xl border rounded-3xl shadow-xl flex flex-col h-[80vh] hover:shadow-2xl transition-all duration-500 w-full themed-card ${isDragOver ? 'ring-4 ring-purple-500/20' : ''}`}
            style={{ borderColor: isDragOver ? `rgb(var(--color-primary))` : `rgb(var(--color-border))` }} 
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

            {showUploadNotice && (
                <div className="mx-6 mt-4 mb-2 flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-4 py-2 text-xs sm:text-sm z-10">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4" />
                        <span>Heads up: file uploads can slow down replies. Refresh the page when you're done to speed things back up.</span>
                    </div>
                    <div className="flex items-center gap-2 pl-3">
                        <button onClick={() => window.location.reload()} className="px-2 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold">Reload</button>
                        <button onClick={() => setShowUploadNotice(false)} className="text-amber-500 hover:text-amber-700"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
            <div className="p-6 border-b flex-shrink-0" style={{ borderColor: `rgb(var(--color-border))` }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg" style={{ background: `linear-gradient(to bottom right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}>
                        <BrainCircuit size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold tracking-tight" style={{ color: `rgb(var(--color-text))` }}>
                            {t('personalizedLearning.chatWithAce', language)}
                        </h3>
                        <p className="text-sm font-medium" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('personalizedLearning.yourPersonalTutor', language)}</p>
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

            <div className="flex-grow p-6 overflow-y-auto space-y-4" style={{ backgroundColor: `rgb(var(--color-surface))` }}>
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
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-md" style={{ background: `linear-gradient(to bottom right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-6 py-4 rounded-3xl shadow-md ${
                                msg.role === 'user' 
                                    ? 'text-white ml-12' 
                                    : 'border'
                            }`} style={
                                msg.role === 'user' 
                                    ? { background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }
                                    : { backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))`, color: `rgb(var(--color-text))` }
                            }>
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
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ background: `linear-gradient(to bottom right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}>
                            <Loader2 className="animate-spin w-5 h-5" />
                        </div>
                        <div className="px-6 py-4 rounded-3xl border shadow-md" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                            <p className="text-slate-600 font-medium">{t('personalizedLearning.aceIsThinking', language)}</p>
                        </div>
                    </motion.div>
                )}
                <div ref={conversationEndRef} />
            </div>

            <div className="p-6 border-t flex-shrink-0 space-y-4 backdrop-blur-xl rounded-b-3xl" style={{ borderColor: `rgb(var(--color-border))`, backgroundColor: `rgba(var(--color-surface), 0.8)` }}>
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
                                    disabled={isLoading || isUploadingFile}
                                    className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 shadow-lg text-white"
                                    style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}
                                    onMouseEnter={(e) => !isLoading && !isUploadingFile && (e.currentTarget.style.opacity = '0.9')}
                                    onMouseLeave={(e) => !isLoading && !isUploadingFile && (e.currentTarget.style.opacity = '1')}
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
                            className="rounded-2xl px-6 py-4 resize-none text-base font-medium pr-16"
                            style={{ 
                                backgroundColor: `rgb(var(--color-surface))`, 
                                borderColor: `rgb(var(--color-border))`, 
                                color: `rgb(var(--color-text))` 
                            }}
                            rows={1}
                            disabled={isLoading || isUploadingFile}
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={isLoading || isUploadingFile || (!input.trim() && attachedFiles.length === 0)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 shadow-lg"
                            style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}
                            onMouseEnter={(e) => !isLoading && !isUploadingFile && (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={(e) => !isLoading && !isUploadingFile && (e.currentTarget.style.opacity = '1')}
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