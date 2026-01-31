import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const FACTS = [
    '"You got this!"'
];

export default function AceTransition() {
    const [fact, setFact] = useState("");

    useEffect(() => {
        setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] flex-col" style={{ backgroundColor: 'rgb(var(--color-background))' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center max-w-md px-6 text-center"
            >
                <motion.div
                    animate={{ rotate: 360, scale: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-8"
                >
                    <BrainCircuit className="w-16 h-16 text-indigo-500" />
                </motion.div>

                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-bold tracking-widest text-sm mb-4 uppercase"
                    style={{ color: 'rgb(var(--color-text))' }}
                >
                    Quote of the Day
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-medium leading-relaxed"
                    style={{ color: 'rgb(var(--color-textSecondary))' }}
                >
                    {fact}
                </motion.p>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap');`}</style>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg mt-4 opacity-80"
                    style={{ color: 'rgb(var(--color-textSecondary))', fontFamily: '"Dancing Script", cursive' }}
                >
                    - from, the Schoolace team
                </motion.p>
            </motion.div>
        </div>
    );
}