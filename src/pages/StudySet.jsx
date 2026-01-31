import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, BrainCircuit, FileText, ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FlashcardViewer from "@/components/learn/FlashcardViewer";
import LearnMode from "@/components/learn/LearnMode";
import PracticeTest from "@/components/learn/PracticeTest";
import { createPageUrl } from '@/utils';
import { Link } from "react-router-dom";
import AceTransition, { LOADING_DURATION } from "@/components/common/AceTransition";

export default function StudySetPage() {
    const [set, setSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("flashcards");
    
    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const setId = urlParams.get('id');

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, LOADING_DURATION);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (setId) {
            loadSetData();
        }
    }, [setId]);

    const loadSetData = async () => {
        try {
            const [fetchedSet, fetchedCards] = await Promise.all([
                base44.entities.StudySet.get(setId),
                base44.entities.Flashcard.filter({ study_set_id: setId })
            ]);
            setSet(fetchedSet);
            setCards(fetchedCards);
        } catch (error) {
            console.error("Error loading set:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (pageLoading || isLoading) return <AceTransition />;
    if (!set) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Set not found</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation & Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl("Learn")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="font-bold text-lg md:text-xl text-slate-900 truncate max-w-md">{set.title}</h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-500">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.location.href = createPageUrl(`Learn?editSetId=${set.id}`)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Set
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to delete this study set?")) {
                                            await base44.entities.StudySet.delete(set.id);
                                            window.location.href = createPageUrl("Learn");
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Set
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <TabsList className="bg-white p-1 rounded-xl border shadow-sm h-auto inline-flex">
                            <TabsTrigger value="flashcards" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-6 py-2.5 rounded-lg gap-2 text-slate-600">
                                <Layers className="w-4 h-4" /> Flashcards
                            </TabsTrigger>
                            <TabsTrigger value="learn" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-6 py-2.5 rounded-lg gap-2 text-slate-600">
                                <BrainCircuit className="w-4 h-4" /> Learn
                            </TabsTrigger>
                            <TabsTrigger value="test" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-6 py-2.5 rounded-lg gap-2 text-slate-600">
                                <FileText className="w-4 h-4" /> Test
                            </TabsTrigger>
                        </TabsList>

                        <div className="text-sm text-slate-500 font-medium">
                            {cards.length} terms in this set
                        </div>
                    </div>

                    <TabsContent value="flashcards" className="mt-0 focus-visible:ring-0">
                        <FlashcardViewer cards={cards} />
                        
                        {/* Terms List Below */}
                        <div className="mt-16 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Terms in this set ({cards.length})</h3>
                            </div>
                            <div className="grid gap-4">
                                {cards.map((card) => (
                                    <div key={card.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 md:items-center">
                                        <div className="md:w-1/3 text-lg font-medium text-slate-800 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                                            {card.term}
                                        </div>
                                        <div className="md:w-2/3 text-slate-600">
                                            {card.definition}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="learn" className="mt-0 focus-visible:ring-0">
                        <LearnMode cards={cards} onComplete={() => alert("Great job! You've reviewed all cards.")} />
                    </TabsContent>

                    <TabsContent value="test" className="mt-0 focus-visible:ring-0">
                        <PracticeTest cards={cards} onRetake={() => setActiveTab('flashcards')} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}