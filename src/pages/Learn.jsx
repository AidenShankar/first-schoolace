import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Search, Layers, BookOpen, User as UserIcon, Sparkles, GraduationCap, ArrowRight, Library, LayoutGrid, List as ListIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from '@/utils';
import { Link } from "react-router-dom";
import SetCreator from "@/components/learn/SetCreator";
import AceTransition from "@/components/common/AceTransition";

export default function LearnPage({ user, currentClass }) {
    const [view, setView] = useState("list"); // "list", "create"
    const [sets, setSets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [initialEditData, setInitialEditData] = useState(null);
    const [layout, setLayout] = useState("grid"); // "grid" or "list"

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

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
            
            // Fetch card counts for each set
            const setsWithCounts = await Promise.all(userSets.map(async (set) => {
                const cards = await base44.entities.Flashcard.filter({ study_set_id: set.id });
                return { ...set, cards_count: cards.length };
            }));

            setSets(setsWithCounts);
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
                await base44.entities.StudySet.update(setId, {
                    title: setData.title,
                    description: setData.description
                });
                
                const existingCards = await base44.entities.Flashcard.filter({ study_set_id: setId });
                await Promise.all(existingCards.map(c => base44.entities.Flashcard.delete(c.id)));
                
                const cardsToCreate = setData.cards.map((c, i) => ({
                    study_set_id: setId,
                    term: c.term,
                    definition: c.definition,
                    rank: i
                }));
                await base44.entities.Flashcard.bulkCreate(cardsToCreate);

            } else {
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

    // Generate a consistent gradient based on the set ID
    const getGradient = (id) => {
        const gradients = [
            "from-pink-500 to-rose-500",
            "from-orange-400 to-pink-500",
            "from-indigo-400 to-cyan-400",
            "from-teal-400 to-emerald-400",
            "from-fuchsia-500 to-purple-600",
            "from-blue-500 to-indigo-600"
        ];
        // Use the sum of char codes to pick a stable gradient
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[sum % gradients.length];
    };

    if (pageLoading) {
        return <AceTransition />;
    }

    if (view === "create") {
        return <SetCreator onCancel={() => { setView("list"); setInitialEditData(null); window.history.pushState({}, '', createPageUrl("Learn")); }} onSave={handleSaveSet} initialData={initialEditData} />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Minimalist Header Area */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Library className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library</h1>
                                <p className="text-slate-500 text-sm font-medium">Manage your study sets</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-grow md:w-80 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border-none bg-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                                    placeholder="Search your sets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                <button 
                                    onClick={() => setLayout("grid")}
                                    className={`p-2 rounded-md transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setLayout("list")}
                                    className={`p-2 rounded-md transition-all ${layout === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <Button 
                                onClick={() => setView("create")}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11 shadow-lg shadow-indigo-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse ${layout === 'grid' ? 'h-56' : 'h-24'}`}></div>
                        ))}
                    </div>
                ) : filteredSets.length === 0 ? (
                    <div className="max-w-md mx-auto text-center py-20">
                        <div className="relative mb-8 group cursor-pointer" onClick={() => setView("create")}>
                            <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border border-slate-100 transform group-hover:scale-105 transition-all duration-300">
                                <Plus className="w-10 h-10 text-indigo-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Create your first study set</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            {searchQuery ? "No sets match your search." : "Get started by creating flashcards to study, test yourself, and master your subjects."}
                        </p>
                        <Button 
                            onClick={() => setView("create")}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
                        >
                            {searchQuery ? "Clear Search" : "Create Study Set"}
                        </Button>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                            {filteredSets.map((set, index) => (
                                <Link to={createPageUrl(`StudySet?id=${set.id}`)} key={set.id} className="block group">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden relative ${
                                            layout === 'list' ? 'flex items-center p-2' : 'flex flex-col h-full'
                                        }`}
                                    >
                                        {/* Grid View Layout */}
                                        {layout === 'grid' && (
                                            <>
                                                {/* Colorful Top Banner */}
                                                <div className={`h-24 bg-gradient-to-r ${getGradient(set.id)} relative overflow-hidden`}>
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                                                        {set.cards_count || 0} Terms
                                                    </div>
                                                </div>
                                                
                                                <div className="p-5 flex-grow flex flex-col">
                                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                        {set.title}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">
                                                        {set.description || "No description provided."}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                                <UserIcon className="w-3 h-3 text-slate-400" />
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-500 truncate max-w-[100px]">
                                                                {set.owner_name || "Me"}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                            Study Now <ArrowRight className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* List View Layout */}
                                        {layout === 'list' && (
                                            <>
                                                <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${getGradient(set.id)} shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm ml-2`}>
                                                    {set.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-grow px-4 py-2 min-w-0">
                                                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {set.title}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm truncate">
                                                        {set.cards_count || 0} terms • {set.description || "No description"}
                                                    </p>
                                                </div>
                                                <div className="px-4 text-slate-300">
                                                    <ArrowRight className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}