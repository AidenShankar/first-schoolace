import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Quiz } from '@/entities/Quiz';
import { QuizSubmission } from '@/entities/QuizSubmission';
import QuizList from './QuizList';
import QuizBuilder from './QuizBuilder';
import QuizTaker from './QuizTaker';
import QuizResults from './QuizResults';
import { useTranslation } from '../../i18n/useTranslation';

export default function QuizzesView({ user, currentClass, allClasses }) {
    const { t } = useTranslation();
    const [quizzes, setQuizzes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [view, setView] = useState('list');
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    // Add retry logic for rate-limited requests
    const retryWithBackoff = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                // Check if the error is a 429 status code and if there are retries left
                if (error.response?.status === 429 && i < maxRetries - 1) {
                    console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    // Re-throw the error if it's not a 429 or if max retries reached
                    throw error;
                }
            }
        }
        // This part should theoretically not be reached if maxRetries is > 0 and error is always thrown
        throw new Error("Max retries exceeded for rate-limited request.");
    }, []); // Empty dependency array means this function is stable and only created once

    const fetchData = useCallback(async () => {
        if (!currentClass) return;
        
        try {
            const classQuizzes = await retryWithBackoff(() => 
                Quiz.filter({ class_id: currentClass.id }, '-created_date', 100)
            );
            setQuizzes(classQuizzes);
            
            if (user.app_role === 'student') {
                const studentSubmissions = await retryWithBackoff(() => 
                    QuizSubmission.filter({ student_id: user.id }, '-created_date', 200)
                );
                setSubmissions(studentSubmissions);
            }
        } catch (error) {
            console.error("Error fetching quiz data:", error);
            if (error.response?.status === 429) {
                alert("The server is busy at the moment. Please wait a little and refresh the page.");
            }
            setQuizzes([]);
            setSubmissions([]);
        }
    }, [currentClass, user, retryWithBackoff]); // Dependencies for useCallback

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Now fetchData is a stable reference

    const handleQuizCreated = () => {
        fetchData();
        setView('list');
    };

    const handleTakeQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setView('taker');
    };
    
    const handleViewResults = (quiz) => {
        setSelectedQuiz(quiz);
        setView('results');
    };
    
    const handleEditQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setView('builder');
    };

    const renderContent = () => {
        switch (view) {
            case 'builder':
                return <QuizBuilder user={user} currentClass={currentClass} quiz={selectedQuiz} onSave={handleQuizCreated} onCancel={() => setView('list')} />;
            case 'taker':
                return <QuizTaker user={user} quiz={selectedQuiz} onFinish={() => { fetchData(); setView('list'); }} />;
            case 'results':
                return <QuizResults user={user} quiz={selectedQuiz} onBack={() => setView('list')} />;
            case 'list':
            default:
                return (
                    <>
                        {user.app_role === 'teacher' && (
                            <div className="flex justify-end mb-4">
                                <Button onClick={() => {setSelectedQuiz(null); setView('builder')}}>
                                    <Plus className="w-4 h-4 mr-2" /> {t('classTools.createQuiz')}
                                </Button>
                            </div>
                        )}
                        <QuizList 
                            user={user} 
                            quizzes={quizzes} 
                            submissions={submissions}
                            onTakeQuiz={handleTakeQuiz}
                            onViewResults={handleViewResults}
                            onEditQuiz={handleEditQuiz}
                            onUpdate={fetchData}
                            allClasses={allClasses}
                        />
                    </>
                );
        }
    };

    return (
        <Card className="themed-card">
            <CardHeader>
                <CardTitle>{t('classTools.quizzes')}</CardTitle>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}