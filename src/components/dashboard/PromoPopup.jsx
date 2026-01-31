import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, FileText, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromoPopup({ isOpen, onClose, userRole }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Popup Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20"
                    >
                        {/* Gradient Header */}
                        <div className="absolute inset-0 h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-10" />
                        
                        <div className="relative p-8 text-center space-y-6">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </Button>

                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-2">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {userRole === 'student' ? "New! Learn Mode!" : "New Student Feature!"}
                                </h2>
                                <p className="text-slate-600 text-lg font-medium">
                                    {userRole === 'student' 
                                        ? "Master your subjects faster than ever." 
                                        : "Your students can now learn smarter, not harder."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                                    <Zap className="w-6 h-6 text-indigo-500" />
                                    <h3 className="font-bold text-slate-800">Unlimited Uploads</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Upload unlimited files and text to generate comprehensive study sets instantly.
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                                    <BrainCircuit className="w-6 h-6 text-purple-500" />
                                    <h3 className="font-bold text-slate-800">Smart Learning</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Flashcards, Learn Mode, and Adaptive Tests powered by advanced AI.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button 
                                    onClick={onClose}
                                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl transform transition-all hover:scale-[1.02]"
                                >
                                    {userRole === 'student' ? "Start Learning Now" : "Got it!"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}