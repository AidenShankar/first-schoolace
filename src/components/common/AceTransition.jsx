import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

// const FACTS = [
//     "Octopuses have three hearts.",
//     "Bananas are berries, but strawberries aren't.",
//     "The Eiffel Tower can be 15 cm taller during the summer.",
//     "A day on Venus is longer than a year on Venus.",
//     "A group of flamingos is called a 'flamboyance'.",
//     "Hot water turns into ice faster than cold water.",
//     "The shortest war in history lasted 38 minutes.",
//     "A snail can sleep for three years.",
//     "Elephants are the only animal that can't jump.",
//     "The heart of a shrimp is located in its head.",
//     "Sloths can hold their breath longer than dolphins can.",
//     "A cloud can weigh more than a million pounds.",
//     "Your nose and ears never stop growing.",
//     "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
//     "Butterflies taste with their feet.",
//     "Sea otters hold hands when they sleep to keep from drifting apart.",
//     "Cows have best friends and get stressed when they are separated.",
//     "The moon has moonquakes.",
//     "Goats have rectangular pupils.",
//     "There are more stars in the universe than grains of sand on Earth.",
//     "A blue whale's heart is so big a human could swim through its arteries.",
//     "The unicorn is the national animal of Scotland.",
//     "Venus is the only planet to spin clockwise.",
//     "Koalas have fingerprints that are almost indistinguishable from human ones.",
//     "It rains diamonds on Saturn and Jupiter.",
//     "The average person walks the equivalent of five times around the world in a lifetime.",
//     "An ostrich's eye is bigger than its brain.",
//     "The longest time between two twins being born is 87 days."
// ];

const FACTS = [
    "You can ask ACE about any of your past assignments.",
    "Learn mode adapts in real-time to how *you* learn best.",
    "ACE analyzes your quiz scores to figure out exactly what you need to study next.",
    "Upload a picture of your notes, and ACE can turns them into a study guide.",
    "Schoolace gets smarter and more personalized the more you use it.",
    "Your AI tutor is ready 24/7 to answer any question you have.",
    "Schoolace connects with your other apps to keep your entire academic life in one place.",
    "Schoolace started as a sketch on a napkin during a boring history lecture.",
    "The first version of ACE was trained on thousands of textbooks to understand how students think.",
    "Schoolace was designed by students who were tired of having 20 tabs open.",
    "Our team stayed up for 48 hours straight just to perfect the study algorithm.",
    "The 'Learn' button was clicked 10,000 times in our very first hour of testing.",
    "You can ask ACE to generate a custom practice quiz for you instantly, right inside the chat.",
    "Schoolace's first line of code was written at 3 AM in a dorm room.",
    "We designed the interface to feel less like homework and more like your favorite app.",
    "Schoolace's color palette was specifically chosen to reduce eye strain during late-night study sessions.",
    "You can switch up your entire aesthetic by changing the color theme in your dashboard settings.",
    "The name 'Schoolace' was originally a typo in a group chat that just stuck.",
    "Our first server crashed because too many students tried to join the beta at once.",
    "ACE's personality is modeled after the most patient teacher we ever knew.",
    "Our team pulled two all-nighters in a row on launch day just to fix the bugs.",
    "Our logo was almost a shoelace because, 'Schoolace' sounds like 'shoelace'.",
    "Schoolace's first prototype was built entirely during a weekend hackathon.",
    "We celebrated our first 100 users with a dinner of instant ramen.",
    "ACE's personality changes based on the time of day."
];

export const LOADING_DURATION = 2000;

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
                    Did You Know
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-medium leading-relaxed whitespace-pre-line"
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