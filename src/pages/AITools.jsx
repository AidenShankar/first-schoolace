import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Sparkles, BookOpen, ClipboardCheck, ListChecks, FileSignature, Wand2, FileText, Lightbulb, Mail, HeartHandshake, Wind, Shield } from 'lucide-react';
import ToolCard from '../components/ai_tools/ToolCard';
import ToolRunner from '../components/ai_tools/ToolRunner';
import MarkdownOutput from '../components/ai_tools/outputs/MarkdownOutput';
import WorksheetOutput from '../components/ai_tools/outputs/WorksheetOutput';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import FileUpload from '../components/ai_tools/inputs/FileUpload';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";
import { useTranslation } from '../components/i18n/useTranslation';

// --- Tool Definitions ---

const getTeacherTools = (t) => [
   {
    id: 'teacher-email-generator',
    name: t('aiTools.emailGenerator'),
    description: t('aiTools.emailGeneratorDesc'),
    icon: Mail,
    getInputSchema: (t) => [
        { id: 'recipient', label: t('aiTools.emailTo'), component: Select, props: { items: [t('aiTools.aParentGuardian'), t('aiTools.aStudent')] }, required: true},
        { id: 'student_name', label: t('aiTools.studentName'), component: Input, props: { placeholder: 'e.g., Jane Doe' }, required: true },
        { id: 'topic', label: t('aiTools.emailSubject'), component: Input, props: { placeholder: 'e.g., Upcoming Test, Behavior Update' }, required: true },
        { id: 'key_points', label: t('aiTools.keyPointsToInclude'), component: Textarea, props: { placeholder: 'e.g., Test is on Friday. It will cover chapters 4-6. Jane has been doing well in class.' }, required: true },
        { id: 'tone', label: t('aiTools.tone'), component: Select, props: { items: [t('aiTools.formalEncouraging'), t('aiTools.positiveCasual'), t('aiTools.directInformative')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'iep-accommodations',
    name: t('aiTools.iepAccommodations'),
    description: t('aiTools.iepAccommodationsDesc'),
    icon: FileSignature,
    getInputSchema: (t) => [
      { id: 'student_name', label: t('aiTools.studentName'), component: Input, props: { placeholder: 'e.g., Jane Doe' }, required: true },
      { id: 'grade_level', label: t('aiTools.gradeLevel'), component: Select, props: { 
          items: [t('aiTools.kindergarten'), t('aiTools.grade1'), t('aiTools.grade2'), t('aiTools.grade3'), t('aiTools.grade4'), t('aiTools.grade5'), t('aiTools.grade6'), t('aiTools.grade7'), t('aiTools.grade8'), t('aiTools.grade9'), t('aiTools.grade10'), t('aiTools.grade11'), t('aiTools.grade12')] 
      }, required: true },
      { id: 'area_of_need', label: t('aiTools.areaOfNeed'), component: Input, props: { placeholder: 'e.g., ADHD, Dyslexia, Autism, Anxiety' }, required: true },
      { id: 'challenges', label: t('aiTools.describeStudentChallenges'), component: Textarea, props: { placeholder: 'e.g., "Student struggles to stay on task for more than 5 minutes," or "Has difficulty decoding multi-syllable words."' }, required: true },
      { id: 'output_type', label: t('aiTools.whatToGenerate'), component: Select, props: { items: [t('aiTools.fullReport'), t('aiTools.listOfAccommodations'), t('aiTools.smartGoal'), t('aiTools.emailToParent')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'rubric-generator',
    name: t('aiTools.rubricGenerator'),
    description: t('aiTools.rubricGeneratorDesc'),
    icon: ClipboardCheck,
    getInputSchema: (t) => [
      { id: 'assignment_title', label: t('aiTools.assignmentTitle'), component: Input, props: { placeholder: 'e.g., History of Rome Essay' }, required: true },
      { id: 'criteria', label: t('aiTools.gradingCriteria'), component: Textarea, props: { placeholder: 'e.g., Thesis Statement\nEvidence and Analysis\nClarity and Organization\nGrammar and Mechanics' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'teacher-question-generator',
    name: t('aiTools.questionGenerator'),
    description: t('aiTools.questionGeneratorDesc'),
    icon: ListChecks,
    getInputSchema: (t) => [
      { id: 'topic', label: t('aiTools.topicIfNoContent'), component: Input, props: { placeholder: 'e.g., The American Revolution' }, required: false },
      { id: 'context_url', label: t('aiTools.websiteUrlOptional'), component: Input, props: { placeholder: 'e.g., https://www.history.com/topics/american-revolution' }, required: false },
      { id: 'youtube_transcript', label: t('aiTools.youtubeTranscript'), component: Textarea, props: { placeholder: 'Paste the full transcript from a YouTube video here...', className: "h-32" }, required: false },
      { id: 'file_upload', label: t('aiTools.uploadDocumentOptional'), component: FileUpload, required: false },
      { id: 'question_type', label: t('aiTools.questionType'), component: Select, props: { items: [t('aiTools.multipleChoice'), t('aiTools.trueFalse'), t('aiTools.shortAnswer')] }, required: true },
      { id: 'num_questions', label: t('aiTools.numberOfQuestions'), component: Input, props: { type: 'number', placeholder: 'e.g., 5' }, required: true },
      { id: 'difficulty', label: t('aiTools.difficulty'), component: Select, props: { items: [t('aiTools.easy'), t('aiTools.medium'), t('aiTools.hard')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'worksheet-generator',
    name: t('aiTools.worksheetGenerator'),
    description: t('aiTools.worksheetGeneratorDesc'),
    icon: FileText,
    hasBetaTag: true,
    getInputSchema: (t) => [
      { id: 'topic', label: t('aiTools.topicIfNoContent'), component: Input, props: { placeholder: 'e.g., The Water Cycle' }, required: false },
      { id: 'context_url', label: t('aiTools.websiteUrlOptional'), component: Input, props: { placeholder: 'e.g., https://www.nationalgeographic.org/encyclopedia/water-cycle/' }, required: false },
      { id: 'youtube_transcript', label: t('aiTools.youtubeTranscript'), component: Textarea, props: { placeholder: 'Paste the full transcript from a YouTube video here...', className: "h-32" }, required: false },
      { id: 'file_upload', label: t('aiTools.uploadDocumentOptional'), component: FileUpload, required: false },
      { id: 'worksheet_instructions', label: t('aiTools.worksheetInstructions'), component: Textarea, props: { placeholder: 'e.g., Create a worksheet with 5 multiple choice questions, 3 true/false questions, and 2 short answer questions about the water cycle. Include a diagram for students to label. Make it colorful and engaging for 4th graders.', className: "h-32" }, required: true },
    ],
    outputComponent: WorksheetOutput
  },
  {
    id: 'report-card-comments',
    name: t('aiTools.reportCardComments'),
    description: t('aiTools.reportCardCommentsDesc'),
    icon: FileSignature,
    getInputSchema: (t) => [
      { id: 'student_name', label: t('aiTools.studentName'), component: Input, props: { placeholder: 'e.g., Jane Doe' }, required: true },
      { id: 'strengths', label: t('aiTools.studentStrengths'), component: Textarea, props: { placeholder: 'e.g., Excellent participation, creative problem-solver, helps peers' }, required: true },
      { id: 'areas_for_improvement', label: t('aiTools.areasForImprovement'), component: Textarea, props: { placeholder: 'e.g., Double-checking work for careless errors, speaking up in group discussions' }, required: true },
      { id: 'tone', component: Select, props: { items: [t('aiTools.encouraging'), t('aiTools.formal'), t('aiTools.direct')] }, required: true, label: t('aiTools.tone') },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'assignment-scaffolder',
    name: t('aiTools.assignmentScaffolder'),
    description: t('aiTools.assignmentScaffolderDesc'),
    icon: BookOpen,
    getInputSchema: (t) => [
      { id: 'original_assignment', label: t('aiTools.originalAssignment'), component: Textarea, props: { placeholder: 'e.g., Write a 5-paragraph essay on how climate change affects different parts of the world.' }, required: true },
      { id: 'grade_level', component: Select, props: { 
          items: [t('aiTools.kindergarten'), t('aiTools.grade1'), t('aiTools.grade2'), t('aiTools.grade3'), t('aiTools.grade4'), t('aiTools.grade5'), t('aiTools.grade6'), t('aiTools.grade7'), t('aiTools.grade8'), t('aiTools.grade9'), t('aiTools.grade10'), t('aiTools.grade11'), t('aiTools.grade12')] 
      }, required: true, label: t('aiTools.gradeLevel') },
      { id: 'subject', label: t('aiTools.subject'), component: Input, props: { placeholder: 'e.g., English, Science, Social Studies' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
 
  {
    id: 'teacher-wellness-support',
    name: t('aiTools.teacherWellness'),
    description: t('aiTools.teacherWellnessDesc'),
    icon: Wind,
    getInputSchema: (t) => [
      { id: 'user_input', label: t('aiTools.howAreYouFeelingTeacher') + ' 📚 😅 😐 😫 😍', component: Textarea, props: { placeholder: 'You can use emojis or describe it in words...' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'ai-detector',
    name: t('aiTools.aiDetector'),
    description: t('aiTools.aiDetectorDesc'),
    icon: Shield,
    hasBetaTag: true,
    getInputSchema: (t) => [
      { id: 'text_content', label: t('aiTools.textToAnalyze'), component: Textarea, props: { placeholder: 'Paste the text you want to analyze for AI detection...', className: "h-48" }, required: false },
      { id: 'file_upload', label: t('aiTools.orUploadDocument'), component: FileUpload, required: false },
    ],
    outputComponent: MarkdownOutput
  }
];

const getStudentTools = (t) => [
  {
    id: 'writing-feedback',
    name: t('aiTools.writingFeedback'),
    description: t('aiTools.writingFeedbackDesc'),
    icon: Wand2,
    getInputSchema: (t) => [
      { id: 'student_text', label: t('aiTools.pasteTextHere'), component: Textarea, props: { placeholder: 'Enter the writing you want feedback on...', className: "h-48" }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'text-summarizer',
    name: t('aiTools.textSummarizer'),
    description: t('aiTools.textSummarizerDesc'),
    icon: FileText,
    getInputSchema: (t) => [
      { id: 'text_to_summarize', label: t('aiTools.textToSummarize'), component: Textarea, props: { placeholder: 'Enter the article or text...', className: "h-48" }, required: true },
      { id: 'length', label: t('aiTools.summaryLength'), component: Select, props: { items: [t('aiTools.shortSentences'), t('aiTools.mediumParagraph'), t('aiTools.detailedBullets')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'student-question-generator',
    name: t('aiTools.checkUnderstanding'),
    description: t('aiTools.checkUnderstandingDesc'),
    icon: ListChecks,
    getInputSchema: (t) => [
      { id: 'topic', label: t('aiTools.topicIfNoContent'), component: Input, props: { placeholder: 'e.g., The Water Cycle' }, required: false },
      { id: 'context_url', label: t('aiTools.websiteUrlOptional'), component: Input, props: { placeholder: 'e.g., https://www.nationalgeographic.org/encyclopedia/water-cycle/' }, required: false },
      { id: 'youtube_transcript', label: t('aiTools.youtubeTranscript'), component: Textarea, props: { placeholder: 'Paste the full transcript from a YouTube video here...', className: "h-32" }, required: false },
      { id: 'file_upload', label: t('aiTools.uploadDocumentOptional'), component: FileUpload, required: false },
      { id: 'question_type', label: t('aiTools.questionType'), component: Select, props: { items: [t('aiTools.multipleChoice'), t('aiTools.trueFalse'), t('aiTools.shortAnswer')] }, required: true },
      { id: 'num_questions', label: t('aiTools.numberOfQuestions'), component: Input, props: { type: 'number', placeholder: 'e.g., 5' }, required: true },
      { id: 'difficulty', component: Select, props: { items: [t('aiTools.easy'), t('aiTools.medium'), t('aiTools.hard')] }, required: true, label: t('aiTools.difficulty') },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'concept-explainer',
    name: t('aiTools.conceptExplainer'),
    description: t('aiTools.conceptExplainerDesc'),
    icon: Lightbulb,
    getInputSchema: (t) => [
      { id: 'concept', label: t('aiTools.conceptToExplain'), component: Input, props: { placeholder: 'e.g., Photosynthesis, The Pythagorean Theorem, Blockchain' }, required: true },
      { id: 'explain_like_im', label: t('aiTools.explainLikeIm'), component: Select, props: { items: [t('aiTools.a5thGrader'), t('aiTools.aHighSchoolStudent'), t('aiTools.aCompleteBeginber')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'student-email-generator',
    name: t('aiTools.studentEmailGenerator'),
    description: t('aiTools.studentEmailGeneratorDesc'),
    icon: Mail,
    getInputSchema: (t) => [
        { id: 'teacher_name', label: t('aiTools.teacherLastName'), component: Input, props: { placeholder: 'e.g., Smith' }, required: true },
        { id: 'topic', label: t('aiTools.emailSubject'), component: Input, props: { placeholder: 'e.g., Question about homework, Request for extension' }, required: true },
        { id: 'key_points', label: t('aiTools.whatYouNeedToSay'), component: Textarea, props: { placeholder: 'e.g., I was absent on Monday and need the makeup work. I am struggling with question 5 on the worksheet.' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'student-wellness-support',
    name: t('aiTools.studentWellness'),
    description: t('aiTools.studentWellnessDesc'),
    icon: HeartHandshake,
    getInputSchema: (t) => [
      { id: 'user_input', label: t('aiTools.howAreYouFeelingStudent') + ' 😊 😐 😢 😡 😰 😴', component: Textarea, props: { placeholder: 'You can describe it in words or emojis if you want...' }, required: true },
    ],
    outputComponent: MarkdownOutput
  }
];

export default function AITools() {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [tools, setTools] = useState([]);
    const [selectedTool, setSelectedTool] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pinnedTools, setPinnedTools] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchUserAndTools = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const userPinnedTools = userData.pinned_ai_tools || [];
                setPinnedTools(userPinnedTools);
                
                const userTools = userData.app_role === 'teacher' ? getTeacherTools(t) : getStudentTools(t);
                
                const sortedTools = [
                    ...userTools.filter(tool => userPinnedTools.includes(tool.id)),
                    ...userTools.filter(tool => !userPinnedTools.includes(tool.id))
                ];
                setTools(sortedTools);
                
                // Check for URL param to select a tool
                const urlParams = new URLSearchParams(window.location.search);
                const toolIdFromUrl = urlParams.get('tool');
                const messageFromUrl = urlParams.get('message');
                
                if (toolIdFromUrl) {
                    const toolToSelect = sortedTools.find(tool => tool.id === toolIdFromUrl);
                    if (toolToSelect) {
                        if (messageFromUrl) {
                            const toolWithInitialMessage = { ...toolToSelect, initialMessage: messageFromUrl };
                            setSelectedTool(toolWithInitialMessage);
                        } else {
                            setSelectedTool(toolToSelect);
                        }
                    } else if (sortedTools.length > 0) {
                        setSelectedTool(sortedTools[0]);
                    }
                } else if (sortedTools.length > 0 && !selectedTool) {
                    setSelectedTool(sortedTools[0]);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAndTools();
    }, [t]);

    const handlePinToggle = async (toolId) => {
        try {
            const newPinnedTools = pinnedTools.includes(toolId)
                ? pinnedTools.filter(id => id !== toolId)
                : [...pinnedTools, toolId];
            
            await User.updateMyUserData({ pinned_ai_tools: newPinnedTools });
            setPinnedTools(newPinnedTools);
            
            // Re-sort tools
            const currentUserTools = user.app_role === 'teacher' ? getTeacherTools(t) : getStudentTools(t);
            const sortedTools = [
                ...currentUserTools.filter(tool => newPinnedTools.includes(tool.id)),
                ...currentUserTools.filter(tool => !newPinnedTools.includes(tool.id))
            ];
            setTools(sortedTools);
        } catch (error) {
            console.error("Failed to update pinned tools:", error);
        }
    };

    if (pageLoading) {
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
                            {t('aiTools.title')}
                        </h1>
                        <p className="text-lg text-slate-500 mt-4 font-medium tracking-wide">
                            {t('common.poweredByACE')}
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">{t('aiTools.loadingAITools')}</div>;
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{t('aiTools.locked')}</h2>
                <p className="text-slate-600 max-w-sm">
                    {t('aiTools.lockedDescription')}
                </p>
                <Button 
                    onClick={async () => {
                        const redirectUrl = window.location.origin + createPageUrl('Dashboard');
                        await User.loginWithRedirect(redirectUrl);
                    }} 
                    className="mt-4 px-6 py-3"
                >
                    {t('aiTools.signInToContinue')}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ backgroundColor: `rgb(var(--color-background))`, minHeight: '100vh' }}>
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('aiTools.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('aiTools.subtitle')}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/3 lg:w-1/4 space-y-3">
                    <h2 className="text-lg font-semibold text-slate-800 px-2">
                      {user.app_role === 'teacher' ? t('aiTools.teacherTools') : t('aiTools.studentTools')}
                    </h2>
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ToolCard 
                                icon={tool.icon}
                                title={tool.name}
                                description={tool.description}
                                isSelected={selectedTool?.id === tool.id}
                                isPinned={pinnedTools.includes(tool.id)}
                                hasBetaTag={tool.hasBetaTag} 
                                onSelect={() => {
                                // Find the original tool object from the current 'tools' state.
                                // This ensures we're working with the most up-to-date version of the tool.
                                const toolToSelect = tools.find(t => t.id === tool.id);
                                if (toolToSelect) {
                                    // Create a new object without the 'initialMessage' property
                                    // if it exists, ensuring subsequent selections don't retain old URL messages.
                                    const cleanedTool = { ...toolToSelect };
                                    if (cleanedTool.initialMessage !== undefined) {
                                        delete cleanedTool.initialMessage;
                                    }
                                    setSelectedTool(cleanedTool);
                                }
                            }}
                            onPinToggle={() => handlePinToggle(tool.id)}
                        />
                        </motion.div>
                    ))}
                </aside>
                <main className="flex-1">
                    {selectedTool && (
                        <ToolRunner key={selectedTool.id} tool={selectedTool} />
                    )}
                </main>
            </div>
        </div>
    );
}