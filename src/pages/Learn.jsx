import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Search, Layers, BookOpen, User as UserIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';
import { Link } from "react-router-dom";
import SetCreator from "@/components/learn/SetCreator";

export default function LearnPage({ user, currentClass }) {
    const [view, setView] = useState("list"); // "list", "create"
    const [sets, setSets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // Add search state

    const [initialEditData, setInitialEditData] = useState(null);

    useEffect(() => {
        const load = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const editSetId = urlParams.get('editSetId');
            
            if (editSetId) {
                setIsLoading(true);
                try {
                    const [set, cards] = await Promise.all([
                        base44.entities.StudySet.get(editSetId),
                        base44.entities.Flashcard.filter({ study_set_id: editSetId })
                    ]);
                    setInitialEditData({ ...set, cards });
                    setView("create");
                } catch (e) {
                    console.error("Failed to load set for editing", e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                loadSets();
            }
        };
        load();
    }, [user]);

    const loadSets = async () => {
        setIsLoading(true);
        try {
            const userSets = await base44.entities.StudySet.filter({ owner_id: user.id }, "-created_date");
            setSets(userSets);
        } catch (error) {
            console.error("Error loading sets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSet = async (setData) => {
        try {
            let setId = initialEditData?.id;

            if (setId) {
                // Update existing set
                await base44.entities.StudySet.update(setId, {
                    title: setData.title,
                    description: setData.description
                });
                
                // Naive approach for cards: delete all and recreate (easiest for syncing) 
                // OR diff them. For MVP, we'll try to update existing and create new.
                // Actually, given SDK limits, simplest robust way is often:
                // Delete existing cards, recreate all.
                
                const existingCards = await base44.entities.Flashcard.filter({ study_set_id: setId });
                // We'll delete them one by one or if there's a bulk delete (usually not exposed safely).
                // Let's iterate delete.
                await Promise.all(existingCards.map(c => base44.entities.Flashcard.delete(c.id)));
                
                // Recreate all
                const cardsToCreate = setData.cards.map((c, i) => ({
                    study_set_id: setId,
                    term: c.term,
                    definition: c.definition,
                    rank: i
                }));
                await base44.entities.Flashcard.bulkCreate(cardsToCreate);

            } else {
                // Create New
                const set = await base44.entities.StudySet.create({
                    title: setData.title,
                    description: setData.description,
                    owner_id: user.id,
                    owner_name: user.full_name,
                    is_public: false,
                    subject: "General"
                });
                setId = set.id;

                const cardsToCreate = setData.cards.map((c, i) => ({
                    study_set_id: setId,
                    term: c.term,
                    definition: c.definition,
                    rank: i
                }));
                await base44.entities.Flashcard.bulkCreate(cardsToCreate);
            }

            setView("list");
            setInitialEditData(null);
            // Clear URL param
            window.history.pushState({}, '', createPageUrl("Learn"));
            loadSets();
        } catch (error) {
            console.error("Failed to save set:", error);
            alert("Failed to save set. Please try again.");
        }
    };

    const filteredSets = sets.filter(set => 
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (set.description && set.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (view === "create") {
        return <SetCreator onCancel={() => { setView("list"); setInitialEditData(null); window.history.pushState({}, '', createPageUrl("Learn")); }} onSave={handleSaveSet} initialData={initialEditData} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Modern Header */}
            <div className="relative bg-indigo-900 text-white overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-90"></div>
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
                
                <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/50 border border-indigo-700 text-indigo-200 text-sm font-medium backdrop-blur-sm"
                            >
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span>AI-Powered Learning</span>
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-extrabold tracking-tight text-white"
                            >
                                Your Learning Library
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-indigo-100 max-w-lg leading-relaxed"
                            >
                                Create, study, and master any subject with our advanced flashcard system and AI tutor.
                            </motion.p>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button 
                                onClick={() => setView("create")} 
                                size="lg"
                                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl shadow-indigo-900/20 border-none rounded-2xl px-8 h-14 text-base font-bold transition-transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Set
                            </Button>
                        </motion.div>
                    </div>

                    {/* Search Bar - Floating */}
                    <div className="mt-12 -mb-24 relative z-20">
                        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-900/10 flex items-center border border-slate-100 max-w-3xl">
                            <div className="pl-4 text-slate-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search your study sets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-4 text-lg bg-transparent border-none focus:outline-none placeholder:text-slate-400 text-slate-700"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="p-2 text-slate-400 hover:text-slate-600">
                                    <span className="sr-only">Clear</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"></div>
                        ))}
                    </div>
                ) : filteredSets.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        {searchQuery ? (
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">No matching sets found</h2>
                                <p className="text-slate-500">Try adjusting your search terms or create a new set.</p>
                                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-4 text-indigo-600">Clear search</Button>
                            </div>
                        ) : (
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3 shadow-lg shadow-indigo-100">
                                    <Layers className="w-12 h-12 text-indigo-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-4">Start your learning journey</h2>
                                <p className="text-slate-500 mb-8 text-lg">Create your first set of flashcards to start learning effectively with our AI tutor.</p>
                                <Button 
                                    onClick={() => setView("create")} 
                                    size="lg" 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-8 shadow-lg shadow-indigo-200"
                                >
                                    Create First Set
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSets.map((set, index) => (
                            <Link to={createPageUrl(`StudySet?id=${set.id}`)} key={set.id}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col group overflow-hidden relative"
                                >
                                    {/* Card Top Decoration */}
                                    <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 w-full"></div>
                                    
                                    <div className="p-8 flex flex-col h-full relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg">
                                                <Layers className="w-3 h-3" />
                                                {set.cards_count || "0"} Cards
                                            </div>
                                            {set.is_public && (
                                                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-medium">Public</div>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {set.title}
                                        </h3>
                                        
                                        <p className="text-slate-500 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
                                            {set.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">{set.owner_name || "Me"}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Subtle hover effect background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}