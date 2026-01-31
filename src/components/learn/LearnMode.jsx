import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, BrainCircuit, ArrowRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function LearnMode({ cards, onComplete }) {
    const [queue, setQueue] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [mode, setMode] = useState("mc"); // "mc" (multiple choice) or "written"
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'incorrect', correctVal: '' }
    const [stats, setStats] = useState({ new: 0, learning: 0, mastered: 0 });
    const [round, setRound] = useState(1);

    useEffect(() => {
        // Initialize queue: first round is all cards
        if (cards.length) {
            const initialQueue = cards.map(c => ({ ...c, status: 'new' }));
            setQueue(initialQueue);
            setStats({ new: cards.length, learning: 0, mastered: 0 });
            pickNextCard(initialQueue);
        }
    }, [cards]);

    const pickNextCard = (currentQueue) => {
        const remaining = currentQueue.filter(c => c.status !== 'mastered_round_' + round);
        
        if (remaining.length === 0) {
            // Round Complete!
            // Check if all are mastered overall (simplified logic for now)
            onComplete();
            return;
        }

        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrentCard(next);
        setFeedback(null);
        setSelectedOption(null);
        setInputValue("");
        
        // Determine mode randomly or based on status (New -> MC, Learning -> Written)
        const nextMode = next.status === 'new' ? 'mc' : 'written';
        setMode(nextMode);

        if (nextMode === 'mc') {
            // Generate options
            const otherCards = cards.filter(c => c.id !== next.id);
            const distractors = otherCards.sort(() => Math.random() - 0.5).slice(0, 3);
            const allOptions = [next, ...distractors].sort(() => Math.random() - 0.5);
            setOptions(allOptions);
        }
    };

    const handleAnswer = (answer) => {
        const isCorrect = answer.toLowerCase().trim() === currentCard.definition.toLowerCase().trim();
        
        if (isCorrect) {
            setFeedback({ type: 'correct' });
            // Update stats
            setStats(prev => ({ 
                ...prev, 
                [currentCard.status === 'new' ? 'new' : 'learning']: prev[currentCard.status === 'new' ? 'new' : 'learning'] - 1,
                [currentCard.status === 'new' ? 'learning' : 'mastered']: prev[currentCard.status === 'new' ? 'learning' : 'mastered'] + 1
            }));
            
            // Update card status in queue
            const newStatus = currentCard.status === 'new' ? 'learning' : 'mastered_round_' + round;
            const updatedQueue = queue.map(c => c.id === currentCard.id ? { ...c, status: newStatus } : c);
            setQueue(updatedQueue);

        } else {
            setFeedback({ type: 'incorrect', correctVal: currentCard.definition });
            // If wrong, reset to 'new' or keep in 'learning'
             setStats(prev => ({ 
                ...prev, 
                mastered: prev.mastered > 0 && currentCard.status === 'mastered' ? prev.mastered - 1 : prev.mastered,
                learning: prev.learning + 1 // Simplified stat update
            }));
            const updatedQueue = queue.map(c => c.id === currentCard.id ? { ...c, status: 'learning' } : c);
            setQueue(updatedQueue);
        }
    };

    const handleContinue = () => {
        pickNextCard(queue);
    };

    if (!currentCard) return <div className="p-10 text-center"><BrainCircuit className="w-10 h-10 animate-spin mx-auto text-indigo-500"/></div>;

    return (
        <div className="max-w-2xl mx-auto w-full py-8 space-y-8">
            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                <span>Remaining: {queue.filter(c => !c.status.startsWith('mastered')).length}</span>
                <div className="flex gap-4">
                    <span className="text-orange-500">New: {stats.new}</span>
                    <span className="text-blue-500">Learning: {stats.learning}</span>
                    <span className="text-green-500">Mastered: {stats.mastered}</span>
                </div>
            </div>

            <motion.div 
                key={currentCard.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Term</span>
                    <h2 className="text-2xl font-medium text-slate-800">{currentCard.term}</h2>
                </div>

                <div className="p-8 bg-slate-50">
                    {!feedback ? (
                        mode === 'mc' ? (
                            <div className="grid gap-3">
                                {options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleAnswer(opt.definition)}
                                        className="w-full text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-slate-700"
                                    >
                                        {opt.definition}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <span className="text-sm font-medium text-slate-500">Type the definition:</span>
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnswer(inputValue)}
                                    placeholder="Type answer..."
                                    className="bg-white text-lg p-6"
                                    autoFocus
                                />
                                <Button onClick={() => handleAnswer(inputValue)} className="w-full">Answer</Button>
                            </div>
                        )
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-xl p-6 ${feedback.type === 'correct' ? 'bg-green-100 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                        >
                            <div className="flex items-start gap-4">
                                {feedback.type === 'correct' ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                                )}
                                <div className="space-y-2 w-full">
                                    <h3 className={`font-bold text-lg ${feedback.type === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                                        {feedback.type === 'correct' ? 'Nicely done!' : 'Not quite right'}
                                    </h3>
                                    {feedback.type === 'incorrect' && (
                                        <div className="space-y-1">
                                            <p className="text-red-600 text-sm font-medium">Correct answer:</p>
                                            <p className="text-slate-800 bg-white/50 p-2 rounded">{feedback.correctVal}</p>
                                            <p className="text-red-600 text-sm font-medium mt-2">You said:</p>
                                            <p className="text-slate-600 bg-white/50 p-2 rounded">{inputValue || "Selected wrong option"}</p>
                                        </div>
                                    )}
                                    <Button onClick={handleContinue} className={`w-full mt-4 ${feedback.type === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}