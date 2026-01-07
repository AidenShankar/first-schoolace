import React, { useState } from 'react';
import { BookOpen, Sparkles, FileText, Upload, X, FileDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { InvokeLLM, UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function StudyGuideGenerator({ onClose }) {
    const [mode, setMode] = useState('create');
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [studyGuide, setStudyGuide] = useState('');
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

            const prompt = `Create a comprehensive, structured study guide for the topic: "${topic}".
            ${contextContent}
            
            The study guide should be formatted in Markdown and include:
            1. **Overview/Summary**: Brief introduction to the topic.
            2. **Key Concepts**: Bullet points of the most important ideas.
            3. **Vocabulary/Terms**: Definitions of essential terms.
            4. **Important Relationships/Formulas**: Connections between concepts or key formulas if applicable.
            5. **Common Pitfalls**: What students often get wrong.
            6. **Practice Questions**: 3-5 open-ended questions to test understanding.
            
            Make it visual, organized, and easy to read. Use bolding, headers, and lists effectively.`;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        markdown_content: { type: "string" }
                    },
                    required: ["markdown_content"]
                }
            });

            if (response.markdown_content) {
                setStudyGuide(response.markdown_content);
                setMode('view');
            } else {
                setError("Failed to generate study guide. Please try again.");
            }

        } catch (err) {
            console.error(err);
            setError("An error occurred while generating the guide.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([studyGuide], {type: 'text/markdown'});
        element.href = URL.createObjectURL(file);
        element.download = `${topic.replace(/\s+/g, '_')}_StudyGuide.md`;
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="h-full flex flex-col">
            {mode === 'create' && (
                <div className="space-y-6 p-6 h-full overflow-y-auto">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto text-green-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Study Guide Creator</h2>
                        <p className="text-slate-500">Turn notes into structured study materials</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Topic</label>
                                <Input 
                                    placeholder="e.g. Cell Biology, The Great Gatsby, Macroeconomics..." 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Upload Notes/Textbook (Optional)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        accept=".pdf,.txt,.docx,.md"
                                    />
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-slate-400">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">Upload file</span>
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
                                className="w-full bg-green-600 hover:bg-green-700" 
                                size="lg"
                                onClick={handleGenerate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Organizing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" /> Generate Guide
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {mode === 'view' && (
                <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm z-10">
                        <Button variant="ghost" onClick={() => setMode('create')} className="hover:bg-slate-100">
                            Back
                        </Button>
                        <Button variant="outline" onClick={handleDownload} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                            <FileDown className="w-4 h-4" /> Download
                        </Button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                        <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
                            <ReactMarkdown>{studyGuide}</ReactMarkdown>
                        </article>
                    </div>
                </div>
            )}
        </div>
    );
}