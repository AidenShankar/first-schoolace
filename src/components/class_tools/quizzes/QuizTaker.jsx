
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizQuestion } from '@/entities/QuizQuestion';
import { QuizSubmission } from '@/entities/QuizSubmission';
import { QuizAnswer } from '@/entities/QuizAnswer';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function QuizTaker({ user, quiz, onFinish }) {
    const [submission, setSubmission] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const finishHandler = useRef(onFinish);
    const isSubmittingRef = useRef(isSubmitting);
    
    useEffect(() => {
        isSubmittingRef.current = isSubmitting;
    }, [isSubmitting]);

    const handleFinish = useCallback(async () => {
        if (isSubmittingRef.current) return;
        setIsSubmitting(true);
        isSubmittingRef.current = true;

        try {
            // The submission object might be stale, refetch it
            const currentSubmissions = await QuizSubmission.filter({ quiz_id: quiz.id, student_id: user.id, status: 'in-progress' });
            if (currentSubmissions.length === 0) {
                 setIsCompleted(true);
                 return;
            } // Already submitted elsewhere
            const submissionToUpdate = currentSubmissions[0];

            // Save all answers
            for (const [questionId, studentAnswer] of Object.entries(answers)) {
                const existingAnswers = await QuizAnswer.filter({ 
                    quiz_submission_id: submissionToUpdate.id, 
                    quiz_question_id: questionId 
                });
                
                if (existingAnswers.length === 0) {
                    await QuizAnswer.create({ 
                        quiz_submission_id: submissionToUpdate.id, 
                        quiz_question_id: questionId, 
                        student_answer: studentAnswer 
                    });
                } else {
                    await QuizAnswer.update(existingAnswers[0].id, { student_answer: studentAnswer });
                }
            }

            // Calculate score
            let score = 0;
            const submittedAnswers = await QuizAnswer.filter({ quiz_submission_id: submissionToUpdate.id });
            const allQuestions = await QuizQuestion.filter({ quiz_id: quiz.id });
            for (const ans of submittedAnswers) {
                const q = allQuestions.find(q => q.id === ans.quiz_question_id);
                if (q && q.correct_answer === ans.student_answer) {
                    score++;
                }
            }
            
            const finalScore = allQuestions.length > 0 ? (score / allQuestions.length) * 100 : 0;
            await QuizSubmission.update(submissionToUpdate.id, { 
                status: 'completed', 
                score: parseFloat(finalScore.toFixed(2)), 
                completed_at: new Date().toISOString() 
            });

            // Clear saved quiz state
            localStorage.removeItem(`quiz_${quiz.id}_${user.id}`);
            // Notify layout that quiz is finished
            window.dispatchEvent(new CustomEvent('quiz-state-change', { detail: { quizInProgress: false } }));
            
            setIsCompleted(true);
            alert(`Quiz Submitted! Your score: ${finalScore.toFixed(1)}%`);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("There was an error submitting your quiz. Please try again.");
            setIsSubmitting(false); // Only reset if there's an error
            isSubmittingRef.current = false;
        }
    }, [answers, quiz.id, user.id]);

    // Load quiz state from localStorage on component mount
    useEffect(() => {
        const savedState = localStorage.getItem(`quiz_${quiz.id}_${user.id}`);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            setAnswers(parsed.answers || {});
            setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
        }
    }, [quiz.id, user.id]);

    // Save quiz state to localStorage whenever answers change
    useEffect(() => {
        const quizState = {
            answers,
            currentQuestionIndex,
            timestamp: Date.now()
        };
        localStorage.setItem(`quiz_${quiz.id}_${user.id}`, JSON.stringify(quizState));
    }, [answers, currentQuestionIndex, quiz.id, user.id]);

    useEffect(() => {
        const startQuiz = async () => {
            const existingSubmissions = await QuizSubmission.filter({ quiz_id: quiz.id, student_id: user.id });
            const completedSubmission = existingSubmissions.find(s => s.status === 'completed');
            
            if (completedSubmission) {
                setIsCompleted(true);
                return;
            }

            let sub = existingSubmissions.find(s => s.status === 'in-progress');
            if (!sub) {
                sub = await QuizSubmission.create({ 
                    quiz_id: quiz.id, 
                    student_id: user.id, 
                    student_name: user.full_name,
                    student_email: user.email,
                    status: 'in-progress', 
                    started_at: new Date().toISOString(),
                    focus_loss_count: 0 // Initialize count
                });
            }
            // Notify layout that quiz has started
            window.dispatchEvent(new CustomEvent('quiz-state-change', { detail: { quizInProgress: true } }));
            setSubmission(sub);
            
            const fetchedQuestions = await QuizQuestion.filter({ quiz_id: quiz.id });
            setQuestions(fetchedQuestions);

            if (quiz.time_limit_minutes && quiz.time_limit_minutes > 0) {
                const startTime = new Date(sub.started_at).getTime();
                const timeLimit = quiz.time_limit_minutes * 60 * 1000;
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, timeLimit - elapsed);
                
                if (remaining <= 0) {
                    handleFinish();
                    return;
                } else {
                    setTimeLeft(Math.ceil(remaining / 1000));
                }
            }
        };
        startQuiz();
    }, [quiz, user, handleFinish]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [timeLeft, handleFinish]);

    // New useEffect for focus tracking
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && submission && !isCompleted) {
                const newCount = (submission.focus_loss_count || 0) + 1;
                
                // Update local state immediately for responsiveness
                setSubmission(prev => ({...prev, focus_loss_count: newCount}));

                // Update the database in the background
                QuizSubmission.update(submission.id, { focus_loss_count: newCount });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [submission, isCompleted]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave? Your quiz progress will be saved but the timer will continue running.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
    };

    const handlePrevious = () => {
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };
    
    if (isCompleted) {
        return (
             <Card>
                <CardContent className="p-8 text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Quiz Submitted!</h2>
                    <p className="text-slate-600">Your quiz has been successfully submitted.</p>
                    <Button onClick={() => finishHandler.current()}>Return to Quiz List</Button>
                </CardContent>
            </Card>
        )
    }

    if (!questions.length || !submission) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading quiz...</p>
                </CardContent>
            </Card>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                            {quiz.description && (
                                <p className="text-slate-600 mt-1">{quiz.description}</p>
                            )}
                        </div>
                        {timeLeft !== null && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                timeLeft < 300 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
                                {timeLeft < 300 && <AlertTriangle className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold leading-relaxed">
                            {currentQuestion.question_text}
                        </h3>
                        
                        <RadioGroup 
                            onValueChange={(val) => handleAnswerSelect(currentQuestion.id, val)} 
                            value={answers[currentQuestion.id] || ''}
                        >
                            {Object.entries(currentQuestion.options).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
                                    <RadioGroupItem value={key} id={`${currentQuestion.id}-${key}`} />
                                    <Label 
                                        htmlFor={`${currentQuestion.id}-${key}`}
                                        className="flex-1 cursor-pointer text-base"
                                    >
                                        <span className="font-semibold mr-2">{key}.</span>
                                        {value}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>
                
                <div className="text-sm text-slate-600">
                    {Object.keys(answers).length} of {questions.length} questions answered
                </div>

                <div className="flex gap-2">
                    {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={handleNext}>
                            Next Question
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleFinish}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
