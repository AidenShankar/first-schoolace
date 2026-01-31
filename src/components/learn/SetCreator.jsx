import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, Image as ImageIcon, Trash2, Save, X, Loader2, Upload, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { motion, AnimatePresence } from "framer-motion";

export default function SetCreator({ onCancel, onSave, initialData = null }) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [cards, setCards] = useState(initialData?.cards || [{ id: Date.now(), term: "", definition: "" }]);
    const [isSaving, setIsSaving] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    const addCard = () => {
        setCards([...cards, { id: Date.now(), term: "", definition: "" }]);
    };

    const removeCard = (index) => {
        const newCards = [...cards];
        newCards.splice(index, 1);
        setCards(newCards);
    };

    const updateCard = (index, field, value) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter a title");
            return;
        }
        if (cards.some(c => !c.term.trim() || !c.definition.trim())) {
            alert("Please fill in all terms and definitions");
            return;
        }

        setIsSaving(true);
        try {
            await onSave({ title, description, cards });
        } catch (error) {
            console.error("Error saving set:", error);
            alert("Failed to save set");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImportFromAI = async ({ text, files }) => {
        setShowAIModal(false);
        setIsSaving(true); 
        try {
            const fileUrls = [];
            if (files && files.length > 0) {
                // Upload all files in parallel
                const uploadPromises = files.map(file => UploadFile({ file }));
                const results = await Promise.all(uploadPromises);
                results.forEach((res, index) => {
                    fileUrls.push({
                        url: res.file_url,
                        name: files[index].name
                    });
                });
            }

            const { data, error } = await base44.functions.invoke('generateFlashcards', { 
                file_urls: fileUrls, 
                text: text
            });

            if (error) {
                throw new Error(error.response?.data?.error || error.message);
            }
            
            const result = data;
            
            if (result && result.cards) {
                const newCards = result.cards.map(c => ({ id: Date.now() + Math.random(), ...c }));
                setCards([...cards, ...newCards].filter(c => c.term || c.definition)); 
            }
        } catch (error) {
            console.error("AI Import failed:", error);
            alert(`AI Generation failed: ${error.message || "Please try again."}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white min-h-screen p-6 md:p-8 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 border-b">
                    <h2 className="text-2xl font-bold text-slate-900">{initialData ? "Edit Study Set" : "Create New Study Set"}</h2>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {isSaving ? "Saving..." : "Create"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Title</label>
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder='e.g., "AP Biology Chapter 5"'
                            className="text-lg font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <Textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Add a description..." 
                            className="resize-none h-20"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={() => setShowAIModal(true)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                        Auto-generate with AI
                    </Button>
                </div>

                <div className="space-y-6">
                    {cards.map((card, index) => (
                        <motion.div 
                            key={card.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm relative group"
                        >
                            <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-2">
                                <span className="text-slate-400 font-medium text-sm">{index + 1}</span>
                                <Button variant="ghost" size="icon" onClick={() => removeCard(index)} className="h-8 w-8 text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Input 
                                        value={card.term} 
                                        onChange={e => updateCard(index, "term", e.target.value)}
                                        placeholder="Term" 
                                        className="bg-white border-slate-200 focus:ring-indigo-500"
                                    />
                                    <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Term</div>
                                </div>
                                <div className="space-y-2">
                                    <Input 
                                        value={card.definition} 
                                        onChange={e => updateCard(index, "definition", e.target.value)}
                                        placeholder="Definition" 
                                        className="bg-white border-slate-200 focus:ring-indigo-500"
                                    />
                                    <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Definition</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    <Button 
                        variant="outline" 
                        onClick={addCard}
                        className="w-full py-8 border-dashed border-2 border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-lg"
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Add Card
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {showAIModal && (
                    <AIImportModal 
                        onClose={() => setShowAIModal(false)} 
                        onImport={handleImportFromAI} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function AIImportModal({ onClose, onImport }) {
    const [text, setText] = useState("");
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Magic Import
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Upload Files</label>
                        
                        {/* File List */}
                        {files.length > 0 && (
                            <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
                                {files.map((f, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2 text-sm text-slate-700 overflow-hidden">
                                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <span className="truncate">{f.name}</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-slate-400 hover:text-red-500"
                                            onClick={() => removeFile(idx)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                multiple
                            />
                            <div className="text-slate-500 text-sm group-hover:scale-105 transition-transform">
                                <Plus className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                                <span className="font-semibold text-indigo-600">Add {files.length > 0 ? 'another' : 'a'} file</span>
                                <p className="text-xs mt-1 text-slate-400">PDF, Word, PowerPoint (Multiple allowed)</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">Or paste text</span>
                        </div>
                    </div>

                    <Textarea 
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Paste your notes here..."
                        className="h-32 resize-none font-mono text-sm"
                    />
                </div>
                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={() => onImport({ text, files })} 
                        disabled={!text.trim() && files.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Generate Flashcards
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}