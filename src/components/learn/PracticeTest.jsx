import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PracticeTest({ cards, onRetake }) {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        generateTest();
    }, [cards]);

    const generateTest = () => {
        // Generate a mix of questions
        // Limit to 20 questions max or card length
        const testCards = [...cards].sort(() => Math.random() - 0.5).slice(0, 20);
        
        const newQuestions = testCards.map((card, index) => {
            const type = Math.random() > 0.5 ? 'mc' : 'tf'; // Simplified: MC or True/False
            
            let options = [];
            let correctAnswer = card.definition;
            let questionText = card.term;
            let tfAnswer = true;

            if (type === 'mc') {
                const distractors = cards
                    .filter(c => c.id !== card.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(c => c.definition);
                options = [...distractors, card.definition].sort(() => Math.random() - 0.5);
            } else if (type === 'tf') {
                // 50% chance of showing correct definition
                if (Math.random() > 0.5) {
                    questionText = `Term: ${card.term}\nDefinition: ${card.definition}`;
                    tfAnswer = true;
                } else {
                    const randomDef = cards.filter(c => c.id !== card.id)[0]?.definition || "Something else";
                    questionText = `Term: ${card.term}\nDefinition: ${randomDef}`;
                    tfAnswer = false;
                }
            }

            return {
                id: card.id,
                type,
                questionText: type === 'mc' ? card.term : questionText,
                correctAnswer: type === 'mc' ? correctAnswer : tfAnswer.toString(),
                options
            };
        });

        setQuestions(newQuestions);
        setUserAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    const handleAnswer = (questionId, value) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });
        setScore(Math.round((correctCount / questions.length) * 100));
        setIsSubmitted(true);
        window.scrollTo(0, 0);
    };

    if (questions.length === 0) return <div className="text-center p-8">Loading test...</div>;

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto py-10 space-y-8 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
                >
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Complete!</h2>
                    <div className="text-6xl font-black text-indigo-600 mb-4">{score}%</div>
                    <p className="text-slate-500 mb-8">You got {Math.round((score / 100) * questions.length)} out of {questions.length} correct.</p>
                    
                    <div className="flex gap-4 justify-center">
                        <Button onClick={generateTest} size="lg" className="rounded-xl">Take New Test</Button>
                        <Button variant="outline" onClick={onRetake} size="lg" className="rounded-xl">Study Flashcards</Button>
                    </div>
                </motion.div>

                <div className="text-left space-y-6">
                    <h3 className="text-xl font-bold text-slate-800">Review</h3>
                    {questions.map((q, i) => {
                        const isCorrect = userAnswers[q.id] === q.correctAnswer;
                        return (
                            <div key={q.id} className={`p-6 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex gap-3 mb-2">
                                    <span className="font-bold text-slate-400">#{i + 1}</span>
                                    <span className="font-medium text-slate-800 whitespace-pre-line">{q.questionText}</span>
                                </div>
                                <div className="ml-8 text-sm">
                                    <p className={isCorrect ? "text-green-700" : "text-red-600"}>
                                        Your answer: {q.type === 'tf' ? (userAnswers[q.id] === 'true' ? 'True' : 'False') : userAnswers[q.id]}
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-slate-600 mt-1">
                                            Correct answer: {q.type === 'tf' ? (q.correctAnswer === 'true' ? 'True' : 'False') : q.correctAnswer}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-8">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div>
                    <h2 className="text-xl font-bold text-indigo-900">Practice Test</h2>
                    <p className="text-indigo-600">{questions.length} questions • Mixed format</p>
                </div>
            </div>

            <div className="space-y-8">
                {questions.map((q, i) => (
                    <div key={q.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex gap-4 mb-6">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm shrink-0">
                                {i + 1}
                            </span>
                            <div className="space-y-4 w-full">
                                <h3 className="text-lg font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                                    {q.questionText}
                                </h3>

                                {q.type === 'mc' && (
                                    <RadioGroup onValueChange={(val) => handleAnswer(q.id, val)} value={userAnswers[q.id]}>
                                        <div className="grid gap-3">
                                            {q.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center space-x-2 border p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                                    <RadioGroupItem value={opt} id={`q${q.id}-opt${idx}`} />
                                                    <Label htmlFor={`q${q.id}-opt${idx}`} className="flex-grow cursor-pointer">{opt}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                )}

                                {q.type === 'tf' && (
                                    <RadioGroup onValueChange={(val) => handleAnswer(q.id, val)} value={userAnswers[q.id]}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center space-x-2 border p-4 rounded-xl flex-1 hover:bg-slate-50">
                                                <RadioGroupItem value="true" id={`q${q.id}-true`} />
                                                <Label htmlFor={`q${q.id}-true`}>True</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 border p-4 rounded-xl flex-1 hover:bg-slate-50">
                                                <RadioGroupItem value="false" id={`q${q.id}-false`} />
                                                <Label htmlFor={`q${q.id}-false`}>False</Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky bottom-4 flex justify-end">
                <Button 
                    size="lg" 
                    onClick={handleSubmit}
                    disabled={Object.keys(userAnswers).length < questions.length}
                    className="shadow-xl rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                    Submit Test
                </Button>
            </div>
        </div>
    );
}