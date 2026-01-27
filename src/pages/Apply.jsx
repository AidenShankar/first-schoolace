import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowRight, CheckCircle2, School } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function Apply() {
    const [showPhone, setShowPhone] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl w-full z-10 grid md:grid-cols-2 gap-8 items-center">
                
                {/* Left side - Info */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white space-y-6 md:pr-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-indigo-200">
                        <School className="w-4 h-4" />
                        <span>Join Schoolace Today</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                        Transform Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                            Learning Journey
                        </span>
                    </h1>
                    
                    <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                        Experience the future of education with AI-powered tools, personalized learning paths, and seamless classroom management.
                    </p>

                    <div className="space-y-3 pt-2">
                        {[
                            "Advanced AI Grading & Feedback",
                            "Personalized Learning Paths",
                            "Seamless Classroom Integration"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-4">
                        <Link to={createPageUrl('Landing')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                           <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
                        </Link>
                    </div>
                </motion.div>

                {/* Right side - Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Mail className="w-32 h-32 text-white" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Start Your Application</h2>
                            <p className="text-slate-300">Contact our admissions team to begin.</p>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-indigo-500/20 p-3 rounded-xl">
                                    <Mail className="w-6 h-6 text-indigo-300" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Email Application</p>
                                    <a 
                                        href="mailto:aiden.vc2015@gmail.com" 
                                        className="text-lg font-semibold text-white hover:text-indigo-300 transition-colors break-all"
                                    >
                                        aiden.vc2015@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            {!showPhone ? (
                                <Button 
                                    onClick={() => setShowPhone(true)}
                                    className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                                >
                                    Applying as ABG
                                </Button>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 border border-indigo-500/30 text-center"
                                >
                                    <p className="text-sm text-indigo-200 mb-2 uppercase tracking-wider font-semibold">Priority Contact Line</p>
                                    <a 
                                        href="tel:669-331-6055" 
                                        className="flex items-center justify-center gap-3 text-3xl font-bold text-white hover:text-indigo-200 transition-colors"
                                    >
                                        <Phone className="w-6 h-6" />
                                        669-331-6055
                                    </a>
                                    <p className="text-xs text-slate-400 mt-2">Available Mon-Fri, 9AM - 5PM PST</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}