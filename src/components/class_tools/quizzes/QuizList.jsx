import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quiz } from '@/entities/Quiz';
import { QuizQuestion } from '@/entities/QuizQuestion';
import { Edit, Play, BarChart, Lock, Unlock, Eye, EyeOff, Copy, Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from '../../i18n/useTranslation';


export default function QuizList({ user, quizzes, submissions, onTakeQuiz, onViewResults, onEditQuiz, onUpdate, allClasses, retryWithBackoff }) {
    const { t } = useTranslation();
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [duplicatingQuiz, setDuplicatingQuiz] = useState(null);
    const [destinationClassId, setDestinationClassId] = useState('');
    const [isSubmittingDuplicate, setIsSubmittingDuplicate] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fallback retry function if not provided prop (e.g. from older parent versions)
    const safeRetry = retryWithBackoff || (async (fn) => await fn());

    const statusConfig = {
        draft: { color: "bg-yellow-100 text-yellow-800", icon: <Lock className="w-3 h-3" />, text: t('classTools.draft') },
        active: { color: "bg-green-100 text-green-800", icon: <Unlock className="w-3 h-3" />, text: t('classTools.active') },
        closed: { color: "bg-red-100 text-red-800", icon: <BarChart className="w-3 h-3" />, text: t('classTools.closed') },
    };

    const toggleStatus = async (quiz) => {
        try {
            setIsProcessing(true);
            let newStatus;
            if (quiz.status === 'draft') newStatus = 'active';
            else if (quiz.status === 'active') newStatus = 'closed';
            else newStatus = 'draft';
            await safeRetry(() => Quiz.update(quiz.id, { status: newStatus }));
            onUpdate();
        } catch (e) {
            console.error("Error updating status:", e);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleShowResults = async (quiz) => {
        try {
            setIsProcessing(true);
            await safeRetry(() => Quiz.update(quiz.id, { show_results: !quiz.show_results }));
            onUpdate();
        } catch (e) {
            console.error("Error updating settings:", e);
            alert("Failed to update settings. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenDuplicateDialog = (quiz) => {
        setDuplicatingQuiz(quiz);
        setIsDuplicating(true);
    };

    const handleCloseDuplicateDialog = () => {
        if (isSubmittingDuplicate) return;
        setIsDuplicating(false);
        setDuplicatingQuiz(null);
        setDestinationClassId('');
    };

    const handleDuplicateQuiz = async () => {
        if (!duplicatingQuiz || !destinationClassId) return;

        setIsSubmittingDuplicate(true);
        try {
            // 1. Create a copy of the quiz in the new class
            const newQuiz = await safeRetry(() => Quiz.create({
                class_id: destinationClassId,
                teacher_id: duplicatingQuiz.teacher_id,
                title: duplicatingQuiz.title,
                description: duplicatingQuiz.description,
                status: 'draft', // Duplicated quizzes always start as drafts
                time_limit_minutes: duplicatingQuiz.time_limit_minutes,
                show_results: duplicatingQuiz.show_results,
            }));

            // 2. Get all questions from the original quiz
            const originalQuestions = await safeRetry(() => QuizQuestion.filter({ quiz_id: duplicatingQuiz.id }));

            // 3. Create copies of the questions for the new quiz
            if (originalQuestions.length > 0) {
                const newQuestions = originalQuestions.map(q => ({
                    quiz_id: newQuiz.id,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.options,
                    correct_answer: q.correct_answer,
                }));
                // Bulk create is usually efficient, but wrap in retry just in case
                await safeRetry(() => QuizQuestion.bulkCreate(newQuestions));
            }

            alert(t('classTools.quizCopied').replace('{title}', duplicatingQuiz.title));
            handleCloseDuplicateDialog();

        } catch (error) {
            console.error("Failed to duplicate quiz:", error);
            alert("An error occurred while duplicating the quiz. Please try again.");
        } finally {
            setIsSubmittingDuplicate(false);
        }
    };

    const handleDeleteQuiz = async (quiz) => {
        if (!window.confirm(t('classTools.deleteQuizConfirm').replace('{title}', quiz.title))) {
            return;
        }

        try {
            setIsProcessing(true);
            // Get all questions first
            const questions = await safeRetry(() => QuizQuestion.filter({ quiz_id: quiz.id }));

            // Delete all questions in PARALLEL instead of sequential loop for speed
            // Using chunks of 10 to avoid hitting aggressive rate limits if there are many questions
            const chunkSize = 10;
            for (let i = 0; i < questions.length; i += chunkSize) {
                const chunk = questions.slice(i, i + chunkSize);
                await Promise.all(chunk.map(q => safeRetry(() => QuizQuestion.delete(q.id))));
            }

            // Delete the quiz
            await safeRetry(() => Quiz.delete(quiz.id));

            alert(t('classTools.quizDeleted').replace('{title}', quiz.title));
            onUpdate();
        } catch (error) {
            console.error("Failed to delete quiz:", error);
            alert("An error occurred while deleting the quiz. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const studentQuizzes = user.app_role === 'student' 
        ? quizzes.filter(q => q.status === 'active' || (q.status === 'closed' && submissions.some(s => s.quiz_id === q.id && s.status === 'completed')))
        : quizzes;

    const destinationClasses = allClasses?.filter(c => c.id !== duplicatingQuiz?.class_id) || [];

    return (
        <div className="space-y-3">
            {studentQuizzes.length === 0 && <p className="text-center py-8" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('classTools.noQuizzesAvailable')}</p>}
            {studentQuizzes.map(quiz => {
                const submission = submissions.find(s => s.quiz_id === quiz.id);
                const isCompleted = submission?.status === 'completed';

                return (
                    <div key={quiz.id} className="p-4 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <div className="flex-grow">
                            <h4 className="font-semibold" style={{ color: `rgb(var(--color-text))` }}>{quiz.title}</h4>
                            <p className="text-sm" style={{ color: `rgb(var(--color-textSecondary))` }}>{quiz.description}</p>
                            <Badge className={`${statusConfig[quiz.status]?.color || ''} mt-2 gap-1`}>
                                {statusConfig[quiz.status]?.icon} {statusConfig[quiz.status]?.text}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                            {user.app_role === 'teacher' && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => toggleShowResults(quiz)}>
                                        {quiz.show_results ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                                        {quiz.show_results ? t('classTools.hideResults') : t('classTools.showResults')}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => toggleStatus(quiz)}>
                                        {quiz.status === 'draft' ? <Unlock className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
                                        {quiz.status === 'draft' ? t('classTools.activate') : quiz.status === 'active' ? t('classTools.lock') : t('classTools.reDraft')}
                                    </Button>
                                    {allClasses && allClasses.length > 1 && (
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDuplicateDialog(quiz)}>
                                            <Copy className="w-4 h-4 mr-1" /> {t('classTools.duplicate')}
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => onEditQuiz(quiz)}><Edit className="w-4 h-4 mr-1" /> {t('classTools.edit')}</Button>
                                    <Button 
                                        size="sm" 
                                        onClick={() => onViewResults(quiz)}
                                        style={{ backgroundColor: `rgb(var(--color-surface))`, color: `rgb(var(--color-text))`, borderColor: `rgb(var(--color-border))` }}
                                        className="border"
                                    >
                                        <BarChart className="w-4 h-4 mr-1" /> {t('classTools.results')}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteQuiz(quiz)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4 mr-1" /> {t('classTools.delete')}
                                    </Button>
                                </>
                            )}
                            {user.app_role === 'student' && !isCompleted && quiz.status === 'active' && (
                                <Button onClick={() => onTakeQuiz(quiz)}><Play className="w-4 h-4 mr-1" /> {t('classTools.takeQuiz')}</Button>
                            )}
                            {user.app_role === 'student' && isCompleted && (
                                quiz.show_results ? (
                                    <Button 
                                        onClick={() => onViewResults(quiz)}
                                        style={{ backgroundColor: `rgb(var(--color-surface))`, color: `rgb(var(--color-text))`, borderColor: `rgb(var(--color-border))` }}
                                        className="border"
                                    >
                                        <BarChart className="w-4 h-4 mr-1" /> {t('classTools.viewResults')}
                                    </Button>
                                ) : (
                                    <Badge className="bg-gray-100 text-gray-800" style={{ backgroundColor: `rgb(var(--color-accentLight))`, color: `rgb(var(--color-text))` }}>{t('classTools.completed')}</Badge>
                                )
                            )}
                        </div>
                    </div>
                );
            })}

            {/* DUPLICATION DIALOG */}
            <Dialog open={isDuplicating} onOpenChange={(open) => !open && handleCloseDuplicateDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('classTools.duplicateQuiz')}</DialogTitle>
                        <DialogDescription>
                            {t('classTools.duplicateQuizDesc').replace('{title}', duplicatingQuiz?.title || '')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <label className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>{t('classTools.destinationClass')}</label>
                        <Select value={destinationClassId} onValueChange={setDestinationClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('classTools.selectClassToCopy')} />
                            </SelectTrigger>
                            <SelectContent>
                                {destinationClasses.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDuplicateDialog} disabled={isSubmittingDuplicate}>{t('classTools.cancel')}</Button>
                        <Button onClick={handleDuplicateQuiz} disabled={!destinationClassId || isSubmittingDuplicate}>
                            {isSubmittingDuplicate ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {isSubmittingDuplicate ? t('classTools.duplicating') : t('classTools.confirmAndCopy')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}