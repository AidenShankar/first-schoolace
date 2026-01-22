import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trash2, Bot } from 'lucide-react';

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
    }
];

export default function NewFeaturesBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
            <div className="absolute top-2 right-2 z-10">
                <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
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
        </div>
    );
}