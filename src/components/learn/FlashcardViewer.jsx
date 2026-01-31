import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCw, Shuffle, Volume2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashcardViewer({ cards }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [displayCards, setDisplayCards] = useState(cards);
    const [isShuffled, setIsShuffled] = useState(false);

    useEffect(() => {
        setDisplayCards(cards);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [cards]);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % displayCards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + displayCards.length) % displayCards.length);
    };

    // Shuffle removed per request

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space") {
                e.preventDefault(); // prevent scroll
                handleFlip();
            } else if (e.code === "ArrowRight") {
                handleNext();
            } else if (e.code === "ArrowLeft") {
                handlePrev();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFlipped, currentIndex, displayCards]);

    if (!displayCards.length) return <div className="text-center py-20 text-slate-500">No cards to display.</div>;

    const currentCard = displayCards[currentIndex];

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto py-8">
            <div className="perspective-1000 w-full aspect-[5/3] cursor-pointer group" onClick={handleFlip}>
                <motion.div 
                    className="relative w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    {/* Front */}
                    <div 
                        className="absolute inset-0 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 flex flex-col items-center justify-center p-8 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="text-3xl md:text-4xl font-medium text-slate-800 leading-relaxed select-none">
                            {currentCard.term}
                        </div>
                        <div className="absolute top-6 right-6 text-xs font-bold text-slate-300 uppercase tracking-widest select-none">Term</div>
                    </div>

                    {/* Back */}
                    <div 
                        className="absolute inset-0 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 flex flex-col items-center justify-center p-8 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="text-2xl md:text-3xl text-slate-600 leading-relaxed select-none">
                            {currentCard.definition}
                        </div>
                        <div className="absolute top-6 right-6 text-xs font-bold text-indigo-300 uppercase tracking-widest select-none">Definition</div>
                    </div>
                </motion.div>
            </div>

            <div className="flex items-center justify-between w-full px-4">
                <div className="w-10" />

                <div className="flex items-center gap-6">
                    <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full h-12 w-12 border-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-medium text-slate-500 tabular-nums">
                        {currentIndex + 1} / {displayCards.length}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full h-12 w-12 border-2">
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>

                <div className="w-10" />
            </div>
            
            <p className="text-sm text-slate-400 font-medium">
                Press <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 mx-1">Space</kbd> to flip, <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 mx-1">Arrows</kbd> to navigate
            </p>
        </div>
    );
}