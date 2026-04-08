import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const LOADING_DURATION = 2000;

export default function AceTransition() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: 'rgb(var(--color-background))' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}>
                    <GraduationCap className="w-9 h-9" style={{ color: 'rgb(var(--color-surface))' }} />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text))' }}>SchoolACE</h1>
                <div className="w-6 h-6 border-2 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: 'rgb(var(--color-primary))' }} />
            </motion.div>
        </div>
    );
}