import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const FACTS = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    "A day on Venus is longer than a year on Venus.",
    "Bananas are curved because they grow towards the sun.",
    "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
    "Octopuses have three hearts.",
    "The world's oldest wooden wheel has been around for more than 5,000 years.",
    "It's impossible to hum while holding your nose.",
    "The unicorn is the national animal of Scotland.",
    "A group of flamingos is called a 'flamboyance'.",
    "There are more stars in the universe than grains of sand on all the Earth's beaches."
];

export const LOADING_DURATION = 2500;

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
                className="flex flex-col items-center justify-center max-w-2xl px-6 text-center"
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
                    Did You Know?
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
            </motion.div>
        </div>
    );
}