import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trash2, Bot, Gift, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Assuming this might be needed for accessibility if title is hidden, but I'll add a proper title.

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

export default function NewFeaturesBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [seenCount, setSeenCount] = useState(0);

    useEffect(() => {
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

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setSeenCount(features.length);
            localStorage.setItem('schoolace_features_seen_count', features.length.toString());
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-xl shadow-sm transition-all duration-300 backdrop-blur-sm"
                >
                    <div className="relative">
                        <Gift className="w-4 h-4" />
                        {hasNewUpdates && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white/20"></span>
                        )}
                    </div>
                    <span className="text-sm font-medium">What's New</span>
                    {hasNewUpdates && (
                        <span className="ml-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {newUpdatesCount}
                        </span>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-2xl border-0">
                <DialogTitle className="sr-only">What's New</DialogTitle>
                <div className="relative h-auto min-h-[300px] flex flex-col">
                    <div className="absolute top-2 right-2 z-10">
                        <button onClick={() => handleOpenChange(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${features[currentIndex].color}`}>
                                    {React.createElement(features[currentIndex].icon, { className: "w-10 h-10" })}
                                </div>
                                
                                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${features[currentIndex].badge === 'Free Access' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {features[currentIndex].badge}
                                </span>
                                
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{features[currentIndex].title}</h3>
                                
                                <p className="text-slate-600 text-base leading-relaxed max-w-md">
                                    {features[currentIndex].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="p-6 flex justify-center gap-2 z-10 bg-slate-50/50">
                        {features.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === currentIndex ? "bg-indigo-600 w-8" : "bg-slate-300 hover:bg-indigo-300 w-2"
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}