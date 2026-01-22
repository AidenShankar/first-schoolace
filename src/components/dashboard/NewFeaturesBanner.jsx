import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trash2, Bot, Gift, ChevronRight } from 'lucide-react';

const features = [
    {
        id: 1,
        title: "You're Supercharged!",
        description: "Enjoy free access to the complete AI Tool Suite, your personal AI Agent for automating tasks, and personalized AI-guided learning paths for every student.",
        icon: Bot,
        color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        badge: "Free Access"
    },
    {
        id: 2,
        title: "New: Class Deletion",
        description: "You can now delete classes directly from your dashboard. Keep your workspace clean and organized by removing unused classes.",
        icon: Trash2,
        color: "bg-red-100 text-red-600",
        badge: "New Feature"
    },
    {
        id: 3,
        title: "New: AI Grading Instructions",
        description: "Generate detailed, custom AI grading instructions for your assignments instantly with the power of ACE AI.",
        icon: Sparkles,
        color: "bg-indigo-100 text-indigo-600",
        badge: "New Feature"
    },
    {
        id: 4,
        title: "Track AI Conversations",
        description: "Monitor student interactions with ACE AI in your class tools tab to ensure appropriate usage and track learning progress in real-time.",
        icon: Bot,
        color: "bg-blue-100 text-blue-600",
        badge: "New Tool"
    },
    {
        id: 5,
        title: "Control ACE AI Access",
        description: "You now have the power to hide the ACE AI tab from students directly from your dashboard class settings.",
        icon: Trash2,
        color: "bg-slate-100 text-slate-600",
        badge: "New Control"
    }
];

export default function NewFeaturesBanner({ className = "mb-8" }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [seenCount, setSeenCount] = useState(0);

    useEffect(() => {
        // Load seen count from local storage on mount
        const stored = localStorage.getItem('schoolace_features_seen_count');
        if (stored) {
            setSeenCount(parseInt(stored, 10));
        }
    }, []);

    const newUpdatesCount = Math.max(0, features.length - seenCount);
    const hasNewUpdates = newUpdatesCount > 0;

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        // Mark as seen when closing
        setSeenCount(features.length);
        localStorage.setItem('schoolace_features_seen_count', features.length.toString());
    };

    return (
        <div className={className}>
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.button
                        key="button"
                        layoutId="banner-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setIsOpen(true)}
                        className="group w-full md:w-auto flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 p-3 pr-5 rounded-2xl shadow-sm transition-all duration-300"
                    >
                        <div className="relative">
                            {hasNewUpdates && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            )}
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                                hasNewUpdates 
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
                                    : "bg-slate-100 text-slate-400"
                            }`}>
                                <Gift className="w-6 h-6" />
                            </div>
                            {hasNewUpdates && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className={`font-bold text-sm transition-colors ${hasNewUpdates ? "text-slate-900 group-hover:text-indigo-700" : "text-slate-700"}`}>
                                What's New
                            </h3>
                            <p className="text-xs text-slate-500">
                                {newUpdatesCount} new update{newUpdatesCount !== 1 ? 's' : ''} available
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="banner"
                        layoutId="banner-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200"
                    >
                        <div className="absolute top-2 right-2 z-10">
                            <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="relative h-auto min-h-[160px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 flex flex-col md:flex-row items-start md:items-center p-6 md:p-8"
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-0 md:mr-6 shadow-sm ${features[currentIndex].color}`}>
                                        {React.createElement(features[currentIndex].icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                                    </div>
                                    <div className="flex-1 pr-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${features[currentIndex].badge === 'Free Access' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {features[currentIndex].badge}
                                            </span>
                                            <h3 className="text-lg md:text-xl font-bold text-slate-900">{features[currentIndex].title}</h3>
                                        </div>
                                        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                            {features[currentIndex].description}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            {features.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx === currentIndex ? "bg-indigo-600 w-6" : "bg-slate-200 hover:bg-indigo-300 w-1.5"
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}