
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizSubmission } from '@/entities/QuizSubmission';
import { QuizAnswer } from '@/entities/QuizAnswer';
import { QuizQuestion } from '@/entities/QuizQuestion';
import { Eye, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function QuizResults({ user, quiz, onBack }) {
    const [submissions, setSubmissions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [submissionAnswers, setSubmissionAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const quizQuestions = await QuizQuestion.filter({ quiz_id: quiz.id });
                setQuestions(quizQuestions);
                
                if (user.app_role === 'teacher') {
                    const completedSubs = await QuizSubmission.filter({ quiz_id: quiz.id, status: 'completed' }, '-score');
                    setSubmissions(completedSubs);
                } else {
                    const studentSub = await QuizSubmission.filter({ quiz_id: quiz.id, student_id: user.id, status: 'completed' });
                    if (studentSub.length > 0) {
                        setSubmissions(studentSub);
                        // Automatically show the student their own results if allowed
                        if (quiz.show_results) {
                            handleViewSubmission(studentSub[0]);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching quiz results:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [quiz, user]);

    const handleViewSubmission = async (submission) => {
        setSelectedSubmission(submission);
        const answers = await QuizAnswer.filter({ quiz_submission_id: submission.id });
        setSubmissionAnswers(answers);
    };

    const averageScore = submissions.length > 0 
        ? submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.length 
        : 0;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading results...</p>
                </CardContent>
            </Card>
        );
    }

    if (selectedSubmission) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <Button variant="outline" onClick={() => user.app_role === 'teacher' ? setSelectedSubmission(null) : onBack()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {user.app_role === 'teacher' ? 'Back to All Results' : 'Back to Quizzes'}
                        </Button>
                        <div>
                            <CardTitle>
                                {user.app_role === 'teacher' ? `${selectedSubmission.student_name}'s Answers` : 'Your Answers'}
                            </CardTitle>
                            <p className="text-slate-600">
                                Score: {selectedSubmission.score?.toFixed(1)}% • 
                                Completed: {new Date(selectedSubmission.completed_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {questions.map((question, index) => {
                        const studentAnswer = submissionAnswers.find(a => a.quiz_question_id === question.id);
                        const isCorrect = studentAnswer?.student_answer === question.correct_answer;
                        
                        return (
                            <div key={question.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-base">
                                        Question {index + 1}: {question.question_text}
                                    </h4>
                                    <Badge variant={isCorrect ? "default" : "destructive"} className="flex items-center gap-1">
                                        {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {isCorrect ? "Correct" : "Incorrect"}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-2 ml-4">
                                    {Object.entries(question.options).map(([key, value]) => {
                                        const isStudentChoice = studentAnswer?.student_answer === key;
                                        const isCorrectAnswer = question.correct_answer === key;
                                        
                                        return (
                                            <div 
                                                key={key}
                                                className={`p-2 rounded border text-sm ${
                                                    isCorrectAnswer ? 'bg-green-50 border-green-200' :
                                                    isStudentChoice ? 'bg-red-50 border-red-200' :
                                                    'bg-slate-50 border-slate-200'
                                                }`}
                                            >
                                                <span className="font-semibold mr-2">{key}.</span>
                                                {value}
                                                {isStudentChoice && !isCorrectAnswer && (
                                                    <span className="ml-2 text-red-600 text-xs">(Your answer)</span>
                                                )}
                                                {isCorrectAnswer && (
                                                    <span className="ml-2 text-green-600 text-xs">(Correct answer)</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        );
    }

    // Teacher's view of all results
    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Quiz Results: {quiz.title}</CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                <span>Average Score: <strong>{averageScore.toFixed(1)}%</strong></span>
                                <span>Completed Submissions: <strong>{submissions.length}</strong></span>
                            </div>
                        </div>
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Quizzes
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-lg">No students have completed this quiz yet.</p>
                            <p className="text-slate-400 text-sm mt-2">Results will appear here once students submit their responses.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map(submission => (
                                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-bold">
                                                {submission.score?.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{submission.student_name}</p>
                                            <p className="text-sm text-slate-500">
                                                {submission.student_email}
                                            </p>
                                            {(submission.focus_loss_count || 0) > 0 && (
                                                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Switched tabs {submission.focus_loss_count} time(s) during quiz.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge 
                                            variant={submission.score >= 70 ? "default" : "destructive"}
                                            className="text-sm"
                                        >
                                            {submission.score?.toFixed(1)}%
                                        </Badge>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleViewSubmission(submission)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Answers
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
