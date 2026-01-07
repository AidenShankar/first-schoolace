import React, { useState, useEffect, useCallback } from "react";
import { User } from '@/entities/User';
import { Class } from '@/entities/Class';
import { ClassEnrollment } from '@/entities/ClassEnrollment';
import { LessonPlan } from '@/entities/LessonPlan';
import { InvokeLLM } from '@/integrations/Core';
import { Button } from "@/components/ui/button";
import { Plus, Calendar, BookOpen, Search, ChevronDown, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from '../components/i18n/useTranslation';

import LessonPlanEditor from "../components/lesson_plans/LessonPlanEditor";
import LessonPlanViewer from "../components/lesson_plans/LessonPlanViewer";
import LessonPlanCalendar from "../components/lesson_plans/LessonPlanCalendar";
import AssignmentRecommendationModal from "../components/lesson_plans/AssignmentRecommendationModal";

export default function LessonPlansPage() {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentClass, setCurrentClass] = useState(null);
    const [allClasses, setAllClasses] = useState([]);
    const [lessonPlans, setLessonPlans] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [viewMode, setViewMode] = useState('calendar');
    const [showEditor, setShowEditor] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [showRecommendationModal, setShowRecommendationModal] = useState(false);
    const [savedLessonForRecommendation, setSavedLessonForRecommendation] = useState(null);

    // Effect for the initial 2-second loading screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Add retry logic for rate-limited requests
    const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
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
    };

    const initializeUser = useCallback(async () => {
        try {
            const userData = await retryWithBackoff(() => User.me());
            setUser(userData);
            
            if (userData.app_role === 'teacher') {
                const classes = await retryWithBackoff(() => 
                    Class.filter({ teacher_id: userData.id })
                );
                setAllClasses(classes);
                if (classes.length > 0) {
                    // Get class from URL or use first class
                    const urlParams = new URLSearchParams(window.location.search);
                    const classIdFromUrl = urlParams.get('classId');
                    const targetClass = classIdFromUrl 
                        ? classes.find(c => c.id === classIdFromUrl) || classes[0]
                        : classes[0];
                    setCurrentClass(targetClass);
                }
            } else {
                // Student logic - force calendar view and only show released lessons
                setViewMode('calendar');
                const enrollments = await retryWithBackoff(() => 
                    ClassEnrollment.filter({ student_id: userData.id })
                );
                if (enrollments.length > 0) {
                    const classes = await retryWithBackoff(() => 
                        Class.filter({ 
                            id: { $in: enrollments.map(e => e.class_id) }
                        })
                    );
                    setAllClasses(classes);
                    if (classes.length > 0) {
                        const urlParams = new URLSearchParams(window.location.search);
                        const classIdFromUrl = urlParams.get('classId');
                        const targetClass = classIdFromUrl 
                            ? classes.find(c => c.id === classIdFromUrl) || classes[0]
                            : classes[0];
                        setCurrentClass(targetClass);
                    }
                }
            }
        } catch (error) {
            console.error("Error initializing user:", error);
            if (error.response?.status === 429) {
                alert("Too many requests. Please wait a moment and refresh the page.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        initializeUser();
    }, [initializeUser]); // Now initializeUser is a stable dependency due to useCallback

    const handleClassSwitch = (selectedClass) => {
        setCurrentClass(selectedClass);
        const newUrl = `${window.location.pathname}?classId=${selectedClass.id}`;
        window.history.pushState({}, '', newUrl);
    };

    const loadLessonPlans = useCallback(async () => {
        if (!currentClass || !user) {
            // This check is crucial for `useCallback` and `useEffect` dependencies.
            // If `currentClass` or `user` are not yet set, we cannot load.
            // The `useEffect` below will ensure this function is called only when needed.
            return;
        }
        
        try {
            let plans;
            if (user.app_role === 'teacher') {
                // Teachers see all lessons
                plans = await retryWithBackoff(() => 
                    LessonPlan.filter({ class_id: currentClass.id }, "-lesson_date", 100)
                );
            } else {
                // Students only see released lessons
                plans = await retryWithBackoff(() => 
                    LessonPlan.filter({ 
                        class_id: currentClass.id, 
                        is_released: true 
                    }, "-lesson_date", 100)
                );
            }
            setLessonPlans(plans);
        } catch (error) {
            console.error("Error loading lesson plans:", error);
            if (error.response?.status === 429) {
                alert("Too many requests. Please wait a moment and try again.");
            }
        }
    }, [currentClass, user]); // Dependencies for useCallback

    useEffect(() => {
        if (currentClass) { // Only run if currentClass is defined
            loadLessonPlans();
        }
    }, [currentClass, loadLessonPlans]); // Re-run when currentClass or the memoized loadLessonPlans function changes

    const handleToggleRelease = async (lessonId, currentReleaseStatus) => {
        try {
            const newReleaseStatus = !currentReleaseStatus;
            await LessonPlan.update(lessonId, { is_released: newReleaseStatus });
            
            // Update the lesson in our state
            setLessonPlans(prev => prev.map(lesson => 
                lesson.id === lessonId 
                    ? { ...lesson, is_released: newReleaseStatus }
                    : lesson
            ));
            
            // If viewing the lesson, update the selected lesson
            if (selectedLesson && selectedLesson.id === lessonId) {
                setSelectedLesson(prev => ({ ...prev, is_released: newReleaseStatus }));
            }
            
        } catch (error) {
            console.error("Error toggling lesson release status:", error);
            alert("Failed to update lesson release status. Please try again.");
        }
    };

    const handleCreateLesson = () => {
        setEditingLesson(null);
        setShowEditor(true);
    };

    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setShowEditor(true);
    };

    const handleSaveLesson = async (lessonData) => {
        try {
            let savedLesson;
            if (editingLesson) {
                savedLesson = await LessonPlan.update(editingLesson.id, lessonData);
                // If update returns null or undefined (depends on SDK), we might need to refetch or use lessonData merged with ID
                if (!savedLesson) savedLesson = { ...lessonData, id: editingLesson.id };
            } else {
                savedLesson = await LessonPlan.create({
                    ...lessonData,
                    class_id: currentClass.id,
                    teacher_id: user.id,
                    is_released: lessonData.is_released ?? false
                });
            }
            
            setShowEditor(false);
            setEditingLesson(null);
            setSelectedLesson(null);
            setViewMode('calendar');
            loadLessonPlans();

            // Trigger recommendation modal
            if (savedLesson) {
                setSavedLessonForRecommendation(savedLesson);
                setShowRecommendationModal(true);
            }
        } catch (error) {
            console.error("Error saving lesson:", error);
            alert("Failed to save lesson plan. Please try again.");
        }
    };

    const handleCancelEdit = () => {
        setShowEditor(false);
        setEditingLesson(null);
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm(t('common.delete') + "?")) {
            return;
        }
        try {
            await LessonPlan.delete(lessonId);
            loadLessonPlans();
            setSelectedLesson(null); // Close viewer if the deleted lesson was open
        } catch (error) {
            console.error("Error deleting lesson plan:", error);
            alert("Failed to delete the lesson plan.");
        }
    };

    const handleDuplicateLesson = async (lesson, destinationClassId) => {
        try {
            const duplicatedData = { ...lesson };
            // Remove original ID and update class/teacher info
            delete duplicatedData.id;
            delete duplicatedData.created_date;
            delete duplicatedData.updated_date;
            
            const newLesson = {
                ...duplicatedData,
                class_id: destinationClassId,
                teacher_id: user.id,
                is_released: false // Duplicated lessons default to unreleased
            };

            await LessonPlan.create(newLesson);
            
            const destinationClass = allClasses.find(c => c.id === destinationClassId);
            alert(`Lesson "${lesson.title}" successfully duplicated to ${destinationClass?.name || 'the destination class'}!`);
            loadLessonPlans(); // Reload to show the new lesson if duplicated to current class

        } catch (error) {
            console.error("Error duplicating lesson:", error);
            alert("Failed to duplicate lesson plan. Please try again.");
        }
    };

    const generateAILesson = async (prompt, isTextImport = false) => {
        try {
            let finalPrompt;
            if (isTextImport) {
                finalPrompt = `A teacher has pasted the following lesson plan text. Please parse it and extract the key information into the provided JSON schema. Identify the title, objectives, activities, homework, and other relevant sections from the text. 

For the additional_information field, look for and extract any teacher-specific information that would be helpful for students or parents, such as:
- Office hours (e.g., "Office hours: Monday-Friday 3:00-4:00 PM", "Available for help after school")
- Contact information (e.g., "Email: teacher@school.edu", "Please email with questions")
- Special instructions or policies (e.g., "Late work policy", "Bring calculators", "Field trip permission slips due")
- Parent communication notes (e.g., "Parent conference requests", "Progress reports available")
- Additional resources or support information
- Classroom expectations or reminders
- Biblical Integration Goals
If there are Unit Learning Outcomes or Unit Standards, put them into the learning objectives, or anything else that looks like it is a goal.

If some sections are missing, leave them as empty strings or arrays. Here is the text: 

---${prompt}---`;
            } else {
                finalPrompt = `Create a comprehensive lesson plan based on this request: "${prompt}". 
                
                Please generate a lesson plan that includes:
                1. A clear, engaging title
                2. 3-5 specific learning objectives
                3. An engaging hook/warm-up activity
                4. 2-4 main classroom activities with time estimates
                5. Homework assignments
                6. Educational resources with ACCURATE and WORKING URLs to real educational content
                7. Assessment strategies
                8. Differentiation suggestions for different learning needs
                9. Additional information section with relevant teacher contact/policy info
                
                For the additional_information field, include helpful information such as:
                - Generic office hours (e.g., "Office hours available by appointment")
                - Contact guidance (e.g., "For questions, please email during school hours")
                - General classroom policies relevant to the lesson
                - Any special instructions for students or parents related to this topic
                
                For resources, provide real, working educational links from reputable sources like:
                - Khan Academy (actual lesson URLs)
                - National Geographic Education
                - NASA Education
                - Library of Congress Teaching Resources
                - Educational YouTube channels
                - University educational websites
                - Government educational portals
                
                Ensure ALL URLs are accurate and functional. Only provide URLs that you are confident exist and work.
                
                Format the response as a structured lesson plan suitable for a ${currentClass?.name || 'classroom'} setting.`;
            }
            
            const response = await InvokeLLM({
                prompt: finalPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        objectives: { 
                            type: "array", 
                            items: { type: "string" } 
                        },
                        hook: { type: "string" },
                        activities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    duration: { type: "number" },
                                    materials: { 
                                        type: "array", 
                                        items: { type: "string" } 
                                    }
                                }
                            }
                        },
                        homework: { 
                            type: "array", 
                            items: { type: "string" } 
                        },
                        resources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    url: { type: "string" },
                                    type: { type: "string" }
                                }
                            }
                        },
                        assessment: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                description: { type: "string" }
                            }
                        },
                        differentiation: { 
                            type: "array", 
                            items: { type: "string" } 
                        },
                        additional_information: { type: "string" }
                    }
                }
            });
            
            return response;
        } catch (error) {
            console.error("Error generating AI lesson:", error);
            throw error;
        }
    };

    const filteredLessons = lessonPlans.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const weekStart = startOfWeek(selectedWeek);
    const weekEnd = endOfWeek(selectedWeek);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const lessonsForWeek = filteredLessons.filter(lesson => {
        const lessonDate = parseISO(lesson.lesson_date);
        return lessonDate >= weekStart && lessonDate <= weekEnd;
    });

    const isTeacher = user?.app_role === 'teacher';

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
                            {t('lessonPlans.title')}
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
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">{t('lessonPlans.pleaseLogin')}</p>
                </div>
            </div>
        );
    }

    if (!currentClass) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">{t('lessonPlans.noClassesFound')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                             <div className="flex-shrink-0">
                                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <BookOpen className="w-8 h-8 text-indigo-600" />
                                    {t('lessonPlans.title')}
                                </h1>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="min-w-[200px] justify-between">
                                        <span>{currentClass.name}</span>
                                        <ChevronDown className="w-4 h-4" />
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
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder={t('lessonPlans.searchLessons')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            
                            {/* Only show view mode toggle for teachers */}
                            {isTeacher && (
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('calendar')}
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Only show create button for teachers */}
                            {isTeacher && (
                                <Button
                                    onClick={handleCreateLesson}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('lessonPlans.createLesson')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {showEditor ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <LessonPlanEditor
                                lesson={editingLesson}
                                onSave={handleSaveLesson}
                                onCancel={handleCancelEdit}
                                onGenerateAI={generateAILesson}
                                currentClass={currentClass}
                            />
                        </motion.div>
                    ) : selectedLesson ? (
                        <motion.div
                            key="viewer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <LessonPlanViewer
                                lesson={selectedLesson}
                                onEdit={isTeacher ? handleEditLesson : null}
                                onBack={() => setSelectedLesson(null)}
                                currentUser={user}
                                onUpdate={loadLessonPlans}
                                onDelete={handleDeleteLesson}
                                onDuplicate={handleDuplicateLesson}
                                onToggleRelease={handleToggleRelease}
                                allClasses={allClasses}
                            />
                        </motion.div>
                    ) : viewMode === 'calendar' || !isTeacher ? ( // Students always get calendar view
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <LessonPlanCalendar
                                lessons={filteredLessons}
                                selectedWeek={selectedWeek}
                                onWeekChange={setSelectedWeek}
                                onLessonClick={setSelectedLesson}
                                onEditLesson={null}
                                onToggleRelease={handleToggleRelease}
                                currentUser={user}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {filteredLessons.length === 0 ? (
                                <div className="text-center py-16">
                                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('lessonPlans.noLessons')}</h3>
                                    <p className="text-slate-500 mb-4">
                                        {isTeacher 
                                            ? t('lessonPlans.createFirst')
                                            : t('lessonPlans.noLessons')}
                                    </p>
                                    {isTeacher && (
                                        <Button onClick={handleCreateLesson}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('lessonPlans.createFirstLesson')}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {filteredLessons.map((lesson, index) => (
                                        <motion.div
                                            key={lesson.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                                                isTeacher
                                                    ? lesson.is_released
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'
                                                    : 'bg-white border-slate-200'
                                            }`}
                                            onClick={() => setSelectedLesson(lesson)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-semibold text-slate-900">
                                                            {lesson.title}
                                                        </h3>
                                                        {isTeacher && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleRelease(lesson.id, lesson.is_released);
                                                                }}
                                                                className={`${
                                                                    lesson.is_released
                                                                        ? 'text-green-700 bg-green-100 hover:bg-green-200 border-green-300'
                                                                        : 'text-red-700 bg-red-100 hover:bg-red-200 border-red-300'
                                                                }`}
                                                            >
                                                                {lesson.is_released ? (
                                                                <>
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                {t('lessonPlans.released')}
                                                                </>
                                                                ) : (
                                                                <>
                                                                <EyeOff className="w-3 h-3 mr-1" />
                                                                {t('lessonPlans.unreleased')}
                                                                </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 mb-4">
                                                        {format(parseISO(lesson.lesson_date), 'EEEE, MMMM d, yyyy')}
                                                    </p>
                                                    {lesson.objectives && lesson.objectives.length > 0 && (
                                                        <div className="mb-3">
                                                            <h4 className="text-sm font-medium text-slate-700 mb-1">{t('lessonPlans.objectives')}:</h4>
                                                            <ul className="text-sm text-slate-600 list-disc list-inside">
                                                                {lesson.objectives.slice(0, 2).map((objective, idx) => (
                                                                    <li key={idx}>{objective}</li>
                                                                ))}
                                                                {lesson.objectives.length > 2 && (
                                                                    <li className="text-slate-400">
                                                                        +{lesson.objectives.length - 2} more...
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AssignmentRecommendationModal 
                isOpen={showRecommendationModal}
                onClose={() => setShowRecommendationModal(false)}
                lessonPlan={savedLessonForRecommendation}
                classId={currentClass?.id}
                teacherId={user?.id}
            />
        </div>
    );
}