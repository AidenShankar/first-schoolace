import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Trophy, Calendar, FileText, BrainCircuit } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CircularScore = ({ percentage, size = 60, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Color determination
    let colorClass = "text-emerald-500";
    if (percentage < 60) colorClass = "text-red-500";
    else if (percentage < 80) colorClass = "text-amber-500";
    else if (percentage < 90) colorClass = "text-blue-500";

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={colorClass}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-sm font-bold", colorClass)}>
                    {percentage}%
                </span>
            </div>
        </div>
    );
};

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
        <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            {/* Header Section */}
            <div className="relative p-6 bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0 overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                            <FileCheck className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            Graded Work
                        </h3>
                    </div>
                    <p className="text-indigo-100 text-sm leading-relaxed max-w-md">
                        I have access to all your assignment file submissions, quiz results, and feedback, feel free to ask me anything!
                    </p>
                </div>
            </div>

            {/* List Section */}
            <ScrollArea className="flex-1 bg-slate-50/50">
                <div className="p-4 space-y-3">
                    {allWork.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <FileCheck className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No graded work yet</p>
                            <p className="text-slate-400 text-sm mt-1">Complete assignments to see them here</p>
                        </div>
                    ) : (
                        allWork.map((work, index) => (
                            <motion.div
                                key={`${work.type}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white hover:bg-white rounded-2xl p-4 transition-all duration-300 hover:shadow-lg border border-slate-200/60 hover:border-indigo-200"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon Box */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                        work.type === 'quiz' 
                                            ? "bg-purple-50 text-purple-600 group-hover:bg-purple-100" 
                                            : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                    )}>
                                        {work.type === 'quiz' ? (
                                            <BrainCircuit className="w-6 h-6" />
                                        ) : (
                                            <FileText className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                                                work.type === 'quiz' 
                                                    ? "bg-purple-100 text-purple-700" 
                                                    : "bg-blue-100 text-blue-700"
                                            )}>
                                                {work.type}
                                            </span>
                                            <span className="flex items-center text-xs text-slate-400 font-medium">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {work.submitted_at ? new Date(work.submitted_at).toLocaleDateString() : 'No date'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors text-base">
                                            {work.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                            {work.subject}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="shrink-0 flex flex-col items-end gap-1 pl-2">
                                        <CircularScore percentage={work.percentage} />
                                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                                            {work.score_display}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}