import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const FACTS = [
    "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
    "Bananas are berries, but strawberries aren't.",
    "A group of flamingos is called a 'flamboyance'.",
    "Octopuses have three hearts.",
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.",
    "The shortest war in history lasted 38 minutes.",
    "The unicorn is the national animal of Scotland.",
    "A day on Venus is longer than a year on Venus.",
    "There are more stars in the universe than grains of sand on all the Earth's beaches.",
    "Wombat poop is cube-shaped.",
    "The first computer bug was an actual real bug (a moth).",
    "It takes 8 minutes and 20 seconds for light to travel from the Sun to the Earth.",
    "DNA is fireproof.",
    "The inventor of the Pringles can is now buried in one.",
    "Hot water turns into ice faster than cold water.",
    "The strongest muscle in the body is the tongue.",
    "Ants take rest for around 8 minutes in 12-hour period.",
    "Coca-Cola was originally green.",
    "The most common name in the world is Mohammed.",
    "When the moon is directly overhead, you will weigh slightly less."
];

export default function AceTransition() {
    const [fact, setFact] = useState("");

    useEffect(() => {
        setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-[9999] flex-col">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center max-w-md px-6 text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                >
                    <BrainCircuit className="w-16 h-16 text-indigo-500" />
                </motion.div>

                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white font-bold tracking-widest text-sm mb-4 uppercase"
                >
                    Did You Know
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-300 text-lg font-medium leading-relaxed"
                >
                    {fact}
                </motion.p>
            </motion.div>
        </div>
    );
}