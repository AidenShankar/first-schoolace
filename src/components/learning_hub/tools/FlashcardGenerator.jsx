import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCw, ChevronLeft, ChevronRight, Upload, X, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { InvokeLLM, UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Loader2 } from "lucide-react";

export default function FlashcardGenerator({ onClose }) {
    const [mode, setMode] = useState('create'); // 'create', 'study'
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!topic && !file) {
            setError("Please provide a topic or upload a file.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let contextContent = "";
            
            if (file) {
                const { file_url } = await UploadFile({ file });
                const extraction = await ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: { type: 'object', properties: { content: { type: 'string' } } }
                });
                if (extraction.status === 'success') {
                    contextContent = `Content from file: ${extraction.output.content}`;
                }
            }

            const prompt = `Generate 10-15 high-quality study flashcards based on the following topic/content. 
            
            Topic: ${topic}
            ${contextContent}
            
            Each flashcard should have a 'front' (question/term) and a 'back' (answer/definition). 
            Make them challenging but clear. Focus on key concepts, definitions, and relationships.
            
            Return ONLY a valid JSON array of objects with 'front' and 'back' keys.`;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        flashcards: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    front: { type: "string" },
                                    back: { type: "string" }
                                },
                                required: ["front", "back"]
                            }
                        }
                    },
                    required: ["flashcards"]
                }
            });

            if (response.flashcards && response.flashcards.length > 0) {
                setFlashcards(response.flashcards);
                setMode('study');
                setCurrentIndex(0);
                setIsFlipped(false);
            } else {
                setError("Failed to generate flashcards. Please try again.");
            }

        } catch (err) {
            console.error(err);
            setError("An error occurred while generating content.");
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {mode === 'create' && (
                <div className="space-y-6 p-6 h-full overflow-y-auto">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto text-indigo-600">
                            <RotateCw className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Flashcard Generator</h2>
                        <p className="text-slate-500">Create AI-powered flashcards from any topic or document</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Topic or Concept</label>
                                <Input 
                                    placeholder="e.g. The French Revolution, Organic Chemistry, Calculus derivatives..." 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or upload context</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Upload Material (Optional)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        accept=".pdf,.txt,.docx,.md"
                                    />
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <FileText className="w-5 h-5" />
                                            <span className="font-medium">{file.name}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <Upload className="w-8 h-8 mx-auto text-slate-400" />
                                            <p className="text-sm text-slate-500">Drop a file here or click to upload</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <X className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                                size="lg"
                                onClick={handleGenerate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" /> Generate Flashcards
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {mode === 'study' && (
                <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4" tabIndex={0} onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(!isFlipped); }
                    if (e.key === 'ArrowLeft') prevCard();
                    if (e.key === 'ArrowRight') nextCard();
                }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" onClick={() => setMode('create')} className="hover:bg-slate-100 -ml-2">
                            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Generator
                        </Button>
                        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {currentIndex + 1} / {flashcards.length}
                        </div>
                    </div>

                    {/* Flashcard Area */}
                    <div className="flex-1 flex flex-col justify-center min-h-0 relative">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentIndex}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-[400px] cursor-pointer perspective-1000 group relative"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <motion.div 
                                    className="w-full h-full relative preserve-3d"
                                    animate={{ rotateX: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }} // Smoother, faster flip
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Front of Card */}
                                    <div 
                                        className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center p-12"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <div className="text-center w-full">
                                            <h3 className="text-3xl font-medium text-slate-800 leading-relaxed select-none">
                                                {flashcards[currentIndex].front}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Back of Card */}
                                    <div 
                                        className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center p-12"
                                        style={{ 
                                            backfaceVisibility: 'hidden', 
                                            transform: 'rotateX(180deg)' 
                                        }}
                                    >
                                        <div className="text-center w-full">
                                            <p className="text-2xl font-normal text-slate-700 leading-relaxed select-none">
                                                {flashcards[currentIndex].back}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    <div className="mt-8 flex items-center justify-center gap-8 pb-4">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={prevCard}
                            disabled={currentIndex === 0}
                            className="h-14 w-14 rounded-full border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        {/* Progress Bar */}
                        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-indigo-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                            />
                        </div>

                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={nextCard}
                            disabled={currentIndex === flashcards.length - 1}
                            className="h-14 w-14 rounded-full border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-30"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                    
                    <div className="text-center text-xs text-slate-400 mt-2 pb-2">
                        Press Space to flip • Arrow keys to navigate
                    </div>
                </div>
            )}
        </div>
    );
}