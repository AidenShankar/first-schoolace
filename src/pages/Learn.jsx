import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Search, Layers, BookOpen, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';
import { Link } from "react-router-dom";
import SetCreator from "@/components/learn/SetCreator";

export default function LearnPage({ user, currentClass }) {
    const [view, setView] = useState("list"); // "list", "create"
    const [sets, setSets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    if (view === "create") {
        return <SetCreator onCancel={() => { setView("list"); setInitialEditData(null); window.history.pushState({}, '', createPageUrl("Learn")); }} onSave={handleSaveSet} initialData={initialEditData} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-indigo-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Study Sets</h1>
                            <p className="text-indigo-200">Master your subjects with flashcards and AI-powered learning.</p>
                        </div>
                        <Button 
                            onClick={() => setView("create")} 
                            size="lg"
                            className="bg-indigo-500 hover:bg-indigo-400 text-white border-none shadow-lg rounded-xl font-semibold"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Set
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white rounded-xl animate-pulse shadow-sm"></div>
                        ))}
                    </div>
                ) : sets.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layers className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No study sets yet</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Create your first set of flashcards to start learning effectively with our AI tutor.</p>
                        <Button onClick={() => setView("create")} size="lg" className="rounded-xl">Create your first set</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sets.map((set) => (
                            <Link to={createPageUrl(`StudySet?id=${set.id}`)} key={set.id}>
                                <motion.div 
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all h-full flex flex-col group cursor-pointer"
                                >
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{set.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                                        <span className="bg-slate-100 px-2 py-1 rounded-md font-medium">{set.cards_count || "Cards"} terms</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="w-3 h-3" />
                                            {set.owner_name || "Me"}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">
                                        {set.description || "No description provided."}
                                    </p>
                                    <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        <BookOpen className="w-4 h-4" />
                                        Start Studying
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}