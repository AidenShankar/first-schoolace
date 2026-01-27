import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GradedWorkList({ performanceData }) {
    if (!performanceData) return null;

    const assignments = performanceData.assignments || [];
    const quizzes = performanceData.quizzes || [];
    
    // Combine and sort by date (most recent first)
    const allWork = [
        ...assignments.map(a => ({ ...a, type: 'assignment' })),
        ...quizzes.map(q => ({ ...q, type: 'quiz' }))
    ].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    return (
        <Card className="h-full bg-white/80 backdrop-blur-xl border-indigo-100 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileCheck className="w-5 h-5" />
                        Graded Work
                    </h3>
                    <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
                        I have access to all your assignment file submissions, quiz results, and feedback, feel free to ask me anything!
                    </p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {allWork.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No graded work yet.</p>
                        </div>
                    ) : (
                        allWork.map((work, index) => (
                            <motion.div
                                key={`${work.type}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={`
                                                text-[10px] uppercase tracking-wider font-bold
                                                ${work.type === 'quiz' 
                                                    ? 'bg-purple-50 text-purple-600 border-purple-200' 
                                                    : 'bg-blue-50 text-blue-600 border-blue-200'}
                                            `}>
                                                {work.type}
                                            </Badge>
                                            <span className="text-xs text-slate-400">
                                                {work.submitted_at ? new Date(work.submitted_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 truncate pr-2 group-hover:text-indigo-700 transition-colors">
                                            {work.title}
                                        </h4>
                                        <div className="text-xs text-slate-500 mt-1 truncate">
                                            {work.subject}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-lg font-bold ${
                                                work.percentage >= 90 ? 'text-emerald-600' :
                                                work.percentage >= 80 ? 'text-blue-600' :
                                                work.percentage >= 70 ? 'text-indigo-600' :
                                                'text-amber-600'
                                            }`}>
                                                {work.percentage}%
                                            </span>
                                            {work.percentage >= 90 && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full mt-1">
                                            {work.score_display}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Hover Effect Indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
}