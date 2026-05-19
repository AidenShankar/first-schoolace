import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
// DATA LOADING IMPORTS PRESERVED FOR FUTURE USE — DO NOT DELETE
// import { Assignment } from '@/entities/Assignment';
// import { Submission } from '@/entities/Submission';
// import { Quiz } from '@/entities/Quiz';
// import { QuizSubmission } from '@/entities/QuizSubmission';
// import { QuizQuestion } from '@/entities/QuizQuestion';
// import { QuizAnswer } from '@/entities/QuizAnswer';
// import { ExtractDataFromUploadedFile } from "@/integrations/Core";
import { motion } from 'framer-motion';
import { BrainCircuit, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ChatTutor from '../components/learning_hub/ChatTutor';
// import GradedWorkList from '../components/learning_hub/GradedWorkList';
import { Button } from "@/components/ui/button";
import { useTranslation } from '../components/i18n/useTranslation';

export default function PersonalizedLearning() {
    const { t, language } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Intro screen timer
    useEffect(() => {
        const timer = setTimeout(() => setPageLoading(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    // Fetch user only (no learning data)
    useEffect(() => {
        if (!pageLoading) {
            User.me().then(setUser).catch(console.error);
        }
    }, [pageLoading]);

    // ===========================================================================
    // PERSONALIZED DATA LOADING — PRESERVED FOR FUTURE RESTORATION
    // To re-enable: uncomment imports above, restore loadData function below,
    // restore performanceData state, restore sidebar + toggle in ChatTutor props,
    // and restore the grid layout with GradedWorkList.
    //
    // const loadData = async (currentUser) => {
    //     try {
    //         const allSubmissions = await Submission.filter({ student_id: currentUser.id });
    //         const releasedSubmissions = allSubmissions.filter(s =>
    //             s.is_released === true && s.final_grade !== null && s.final_grade !== undefined
    //         );
    //         const assignmentIds = [...new Set(releasedSubmissions.map(s => s.assignment_id))];
    //         const assignments = await Promise.all(
    //             assignmentIds.map(async (id) => {
    //                 try { return await Assignment.get(id); }
    //                 catch (error) { console.warn(`Assignment ${id} not found`); return null; }
    //             })
    //         );
    //         const validAssignments = assignments.filter(Boolean);
    //         const expandedSubmissions = await Promise.all(
    //             releasedSubmissions.map(async (sub) => {
    //                 const assignment = validAssignments.find(a => a.id === sub.assignment_id);
    //                 let extractedFileContent = null;
    //                 if (sub.submission_type === "text" && sub.text_content) {
    //                     extractedFileContent = sub.text_content;
    //                 } else if (sub.file_url && sub.file_name) {
    //                     const fileName = sub.file_name.toLowerCase();
    //                     if (!fileName.endsWith('.mp3') && !fileName.endsWith('.mp4') && !fileName.endsWith('.mov') && !fileName.endsWith('.m4a')) {
    //                         try {
    //                             const extraction = await ExtractDataFromUploadedFile({
    //                                 file_url: sub.file_url,
    //                                 json_schema: { type: 'object', properties: { content: { type: 'string' } } }
    //                             });
    //                             if (extraction.status === 'success' && extraction.output?.content) {
    //                                 extractedFileContent = extraction.output.content;
    //                             }
    //                         } catch (e) { console.warn("File extraction failed:", sub.file_name, e); }
    //                     }
    //                 }
    //                 let extractedAnswerKeyContent = null;
    //                 if (assignment && assignment.answer_key_url && !assignment.answer_key_url.startsWith('blob:')) {
    //                     try {
    //                         const keyExtraction = await ExtractDataFromUploadedFile({
    //                             file_url: assignment.answer_key_url,
    //                             json_schema: { type: 'object', properties: { content: { type: 'string' } } }
    //                         });
    //                         if (keyExtraction.status === 'success' && keyExtraction.output?.content) {
    //                             extractedAnswerKeyContent = keyExtraction.output.content;
    //                         }
    //                     } catch (e) { console.warn("Answer key extraction failed:", assignment.answer_key_filename, e); }
    //                 }
    //                 return {
    //                     ...sub,
    //                     assignment_title: assignment ? assignment.title : '',
    //                     assignment_subject: assignment ? assignment.subject : '',
    //                     assignment_instructions: assignment ? assignment.instructions : '',
    //                     extracted_answer_key_content: extractedAnswerKeyContent,
    //                     extracted_file_content: extractedFileContent,
    //                     released_feedback: sub.final_feedback,
    //                 };
    //             })
    //         );
    //         const assignmentPerformance = expandedSubmissions.map(sub => {
    //             const assignment = validAssignments.find(a => a.id === sub.assignment_id);
    //             if (!assignment) return null;
    //             const percentage = assignment.max_points > 0 ? Math.round((sub.final_grade / assignment.max_points) * 100) : 0;
    //             return {
    //                 title: assignment.title, subject: assignment.subject || 'Assignment',
    //                 score: sub.final_grade, max_points: assignment.max_points,
    //                 percentage, score_display: `${sub.final_grade}/${assignment.max_points}`,
    //                 feedback: sub.released_feedback || 'No feedback provided',
    //                 submitted_at: sub.released_at || sub.submitted_at,
    //                 extracted_answer_key_content: sub.extracted_answer_key_content,
    //                 extracted_file_content: sub.extracted_file_content,
    //             };
    //         }).filter(Boolean);
    //         const allQuizSubmissions = await QuizSubmission.filter({ student_id: currentUser.id });
    //         const completedQuizSubmissions = allQuizSubmissions.filter(qs => qs.status === 'completed' && qs.score !== null && qs.score !== undefined);
    //         const quizIds = [...new Set(completedQuizSubmissions.map(qs => qs.quiz_id))];
    //         const quizzes = await Promise.all(quizIds.map(async (id) => { try { return await Quiz.get(id); } catch { return null; } }));
    //         const validQuizzes = quizzes.filter(Boolean);
    //         const quizPerformance = await Promise.all(completedQuizSubmissions.map(async (qs) => {
    //             const quiz = validQuizzes.find(q => q.id === qs.quiz_id);
    //             if (!quiz) return null;
    //             try {
    //                 const questions = await QuizQuestion.filter({ quiz_id: quiz.id });
    //                 if (questions.length === 0) return null;
    //                 const answers = await QuizAnswer.filter({ quiz_submission_id: qs.id });
    //                 const questionsAndAnswers = questions.map(q => {
    //                     const studentAnswer = answers.find(a => a.quiz_question_id === q.id);
    //                     const options = (typeof q.options === 'object' && q.options !== null) ? q.options : {};
    //                     const studentAnswerText = studentAnswer?.student_answer ? (options[studentAnswer.student_answer] || `Selected '${studentAnswer.student_answer}'`) : 'No answer';
    //                     const correctAnswerText = q.correct_answer ? (options[q.correct_answer] || `Correct '${q.correct_answer}'`) : 'Not defined';
    //                     return { question: q.question_text, student_answer: studentAnswerText, correct_answer: correctAnswerText, is_correct: studentAnswer?.student_answer === q.correct_answer };
    //                 });
    //                 const correctAnswersCount = questionsAndAnswers.filter(qa => qa.is_correct).length;
    //                 const totalQuestions = questions.length;
    //                 return { title: quiz.title, subject: 'Quiz', score: correctAnswersCount, max_points: totalQuestions, percentage: Math.round((correctAnswersCount / totalQuestions) * 100), score_display: `${correctAnswersCount}/${totalQuestions}`, feedback: `Scored ${correctAnswersCount}/${totalQuestions}`, submitted_at: qs.completed_at, questions_and_answers: questionsAndAnswers };
    //             } catch (error) { console.warn(`Error processing quiz ${quiz.id}:`, error); return null; }
    //         }));
    //         setPerformanceData({ assignments: assignmentPerformance.filter(Boolean), quizzes: quizPerformance.filter(Boolean), all_assignment_details: validAssignments, all_submission_details: expandedSubmissions, all_quiz_details: validQuizzes, all_quiz_submission_details: completedQuizSubmissions });
    //     } catch (e) { console.error("Error loading learning hub data:", e); }
    // };
    // ===========================================================================

    if (pageLoading) {
        return (
            <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 z-[9999]">
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 30%, #1e1b4b 0%, #581c87 25%, #7e22ce 50%, #1e1b4b 100%)',
                            'radial-gradient(circle at 80% 70%, #312e81 0%, #6b21a8 25%, #9333ea 50%, #312e81 100%)',
                            'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #7e22ce 25%, #a855f7 50%, #1e1b4b 100%)',
                            'radial-gradient(circle at 30% 80%, #312e81 0%, #581c87 25%, #7e22ce 50%, #312e81 100%)',
                            'radial-gradient(circle at 20% 30%, #1e1b4b 0%, #581c87 25%, #7e22ce 50%, #1e1b4b 100%)',
                        ]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)', filter: 'blur(90px)' }} animate={{ x: [0, 150, -100, 50, 0], y: [0, -120, 80, -60, 0], scale: [1, 1.4, 0.8, 1.2, 1], opacity: [0.2, 0.5, 0.3, 0.6, 0.2] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)', filter: 'blur(100px)' }} animate={{ x: [0, -180, 120, -80, 0], y: [0, 140, -90, 70, 0], scale: [1, 0.7, 1.3, 0.9, 1], opacity: [0.3, 0.7, 0.4, 0.8, 0.3] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
                {[...Array(40)].map((_, i) => (
                    <motion.div key={i} className="absolute rounded-full bg-purple-300" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${Math.random() * 4 + 1}px`, height: `${Math.random() * 4 + 1}px`, opacity: Math.random() * 0.4 + 0.1 }} animate={{ y: [0, -150, 80, -100, 0], x: [0, Math.random() * 80 - 40, Math.random() * 60 - 30, Math.random() * 40 - 20, 0], opacity: [0.1, 0.6, 0.3, 0.8, 0.1], scale: [1, 2.5, 1.5, 3, 1] }} transition={{ duration: 12 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }} />
                ))}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                    <motion.div initial={{ opacity: 0, scale: 0.6, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} className="text-center relative z-20">
                        <motion.h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tight" animate={{ textShadow: ['0 0 40px rgba(139, 92, 246, 1), 0 0 80px rgba(124, 58, 237, 0.8)', '0 0 50px rgba(168, 85, 247, 1), 0 0 100px rgba(147, 51, 234, 0.8)', '0 0 40px rgba(139, 92, 246, 1), 0 0 80px rgba(124, 58, 237, 0.8)'] }} transition={{ duration: 5, repeat: Infinity }}>
                            {t('personalizedLearning.title')}
                        </motion.h1>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8 }}>
                            <div className="inline-block px-12 py-6 rounded-3xl bg-white/5 backdrop-blur-3xl border border-purple-300/20 shadow-[0_0_40px_rgba(139,92,246,0.6),0_0_80px_rgba(124,58,237,0.4)]">
                                <div className="flex items-center gap-5">
                                    <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 1.5, ease: "easeInOut" }}>
                                        <BrainCircuit className="w-10 h-10 text-purple-200" />
                                    </motion.div>
                                    <span className="text-4xl font-bold text-white tracking-wide">{t('personalizedLearning.poweredByACEAI')}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-24 relative">
                        <div className="relative w-32 h-32">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <motion.div key={i} className="absolute w-5 h-5 rounded-full" style={{ left: '50%', top: '50%', marginLeft: '-10px', marginTop: '-10px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(139, 92, 246, 1))', boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }} animate={{ x: [0, Math.cos((i * 60 * Math.PI) / 180) * 50, Math.cos(((i * 60 + 60) * Math.PI) / 180) * 50, 0], y: [0, Math.sin((i * 60 * Math.PI) / 180) * 50, Math.sin(((i * 60 + 60) * Math.PI) / 180) * 50, 0], scale: [1, 1.8, 1.2, 1], opacity: [0.3, 1, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
                            ))}
                        </div>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="text-purple-200 text-lg mt-16 font-medium tracking-wider">
                        {t('personalizedLearning.preparingExperience')}
                    </motion.p>
                </div>
                <motion.div className="absolute top-0 left-0 w-full h-1" animate={{ background: ['linear-gradient(90deg, transparent, rgba(139, 92, 246, 1), transparent)', 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 1), transparent)', 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 1), transparent)'] }} transition={{ duration: 4, repeat: Infinity }} />
                <motion.div className="absolute bottom-0 left-0 w-full h-1" animate={{ background: ['linear-gradient(90deg, transparent, rgba(168, 85, 247, 1), transparent)', 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 1), transparent)', 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 1), transparent)'] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: `rgb(var(--color-background))` }}>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
                <div className="absolute top-8 right-8 z-50 flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 backdrop-blur-sm transition-colors"
                        style={{ backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-primary))' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `rgba(var(--color-primary), 0.1)`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--color-surface))'; }}
                        onClick={() => window.location.href = createPageUrl('AceSpaces')}
                    >
                        <Users className="w-4 h-4" />
                        Ace Spaces
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2 backdrop-blur-sm transition-colors"
                        style={{ backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-primary))' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `rgba(var(--color-primary), 0.1)`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--color-surface))'; }}
                        onClick={() => window.location.href = createPageUrl('Learn')}
                    >
                        <BrainCircuit className="w-4 h-4" />
                        {t('personalizedLearning.aiStudyTools')}
                    </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center mb-16">
                    <h1 className="text-5xl font-bold tracking-tight" style={{ color: `rgb(var(--color-text))` }}>{t('personalizedLearning.title')}</h1>
                    <p className="text-xl mt-3 max-w-2xl mx-auto" style={{ color: `rgb(var(--color-textSecondary))` }}>
                        {t('personalizedLearning.subtitle')}
                    </p>
                </motion.div>

                {/* Full-screen chat — no personalized data, no sidebar, no toggle */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    >
                        <ChatTutor
                            user={user}
                            learningData={null}
                            language={language}
                            isPersonalizedMode={false}
                            setIsPersonalizedMode={() => {}}
                        />
                    </motion.div>
                )}

                {/* SIDEBAR + PERSONALIZED LAYOUT — PRESERVED FOR FUTURE RESTORATION
                {user && performanceData && (
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                        <motion.div
                            className={isPersonalizedMode ? "lg:col-span-7" : "lg:col-span-10"}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease:"easeOut", delay: 0.2 }}
                        >
                            <ChatTutor
                                user={user}
                                learningData={performanceData}
                                language={language}
                                isPersonalizedMode={isPersonalizedMode}
                                setIsPersonalizedMode={setIsPersonalizedMode}
                            />
                        </motion.div>
                        <AnimatePresence>
                            {isPersonalizedMode && (
                                <div className="lg:col-span-3 flex flex-col h-[80vh]">
                                    <motion.div className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.6, ease:"easeOut", delay: 0.3 }}>
                                        <GradedWorkList performanceData={performanceData} />
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
                */}
            </div>
        </div>
    );
}