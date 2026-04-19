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
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                    <img src="https://media.base44.com/images/public/687ed6bea54c832b17eb40bc/36948c755_image.png" alt="SchoolACE" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text))' }}>SchoolACE</h1>
                <div className="w-6 h-6 border-2 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: 'rgb(var(--color-primary))' }} />
            </motion.div>
        </div>
    );
}