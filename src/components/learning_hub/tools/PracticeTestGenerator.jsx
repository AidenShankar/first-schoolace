import React, { useState } from 'react';
import { FileQuestion, Sparkles, CheckCircle2, AlertCircle, Timer, RotateCcw, FileText, Upload, X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { InvokeLLM, UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Loader2 } from "lucide-react";

export default function PracticeTestGenerator({ onClose }) {
    const [mode, setMode] = useState('setup'); // 'setup', 'taking', 'results'
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [questionCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState('medium');
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);

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

            const prompt = `Generate a ${questionCount}-question practice test on the topic: "${topic}".
            ${contextContent}
            
            Difficulty Level: ${difficulty}.
            
            Include a mix of Multiple Choice questions.
            
            Return ONLY a valid JSON object with a "questions" array. 
            Each question object should have:
            - id: number
            - text: string (the question)
            - options: array of strings (4 choices)
            - correctOption: number (index of correct option, 0-3)
            - explanation: string (explanation of the correct answer)
            `;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        questions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    text: { type: "string" },
                                    options: { type: "array", items: { type: "string" } },
                                    correctOption: { type: "number" },
                                    explanation: { type: "string" }
                                },
                                required: ["id", "text", "options", "correctOption", "explanation"]
                            }
                        }
                    },
                    required: ["questions"]
                }
            });

            if (response.questions && response.questions.length > 0) {
                setQuestions(response.questions);
                setMode('taking');
                setUserAnswers({});
            } else {
                setError("Failed to generate test. Please try again.");
            }

        } catch (err) {
            console.error(err);
            setError("An error occurred while generating the test.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, optionIndex) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const submitTest = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctOption) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setMode('results');
    };

    const reset = () => {
        setMode('setup');
        setQuestions([]);
        setUserAnswers({});
        setScore(0);
        setTopic('');
        setFile(null);
    };

    return (
        <div className="h-full flex flex-col">
            {mode === 'setup' && (
                <div className="space-y-6 p-6 h-full overflow-y-auto">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto text-blue-600">
                            <FileQuestion className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Practice Test Generator</h2>
                        <p className="text-slate-500">Custom quizzes to test your knowledge</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Subject or Topic</label>
                                <Input 
                                    placeholder="e.g. Photosynthesis, World War II, Linear Algebra..." 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Reference Material (Optional)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        accept=".pdf,.txt,.docx,.md"
                                    />
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-blue-600">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Number of Questions: {questionCount}</label>
                                    <Slider 
                                        value={[questionCount]} 
                                        onValueChange={(v) => setQuestionCount(v[0])} 
                                        max={20} 
                                        min={3} 
                                        step={1} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Difficulty</label>
                                    <select 
                                        className="w-full rounded-md border border-slate-200 p-2 text-sm"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <X className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700" 
                                size="lg"
                                onClick={handleGenerate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Test...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" /> Generate Test
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {mode === 'taking' && (
                <div className="flex flex-col h-full w-full max-w-3xl mx-auto overflow-hidden">
                    <div className="flex-none p-4 bg-white border-b border-slate-100 flex justify-between items-center z-20 shadow-sm">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Practice Test</h3>
                            <p className="text-xs text-slate-500">{questions.length} Questions • {difficulty} Difficulty</p>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                            <Timer className="w-4 h-4" />
                            <span>In Progress</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 p-4">
                        <div className="space-y-8 pb-4">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <div className="flex gap-4 mb-6">
                                        <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                            {idx + 1}
                                        </span>
                                        <h4 className="text-lg font-medium text-slate-900 pt-1 leading-relaxed">
                                            {q.text}
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-3 pl-12">
                                        {q.options.map((opt, optIdx) => {
                                            const isSelected = userAnswers[q.id] === optIdx;
                                            return (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => handleAnswer(q.id, optIdx)}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-center gap-4 group active:scale-[0.99] ${
                                                        isSelected 
                                                            ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20' 
                                                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300 group-hover:border-slate-400'
                                                    }`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`text-base ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                                                        {opt}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-none p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                        <div className="max-w-3xl mx-auto flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">
                                {Object.keys(userAnswers).length} of {questions.length} answered
                            </span>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none active:translate-y-0 active:shadow-sm"
                                onClick={submitTest}
                                disabled={Object.keys(userAnswers).length < questions.length}
                            >
                                Submit Test
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'results' && (
                <div className="flex flex-col h-full w-full max-w-3xl mx-auto overflow-y-auto p-8">
                    <div className="text-center space-y-6 py-10 bg-white rounded-3xl border border-slate-100 shadow-sm mb-8 flex-shrink-0">
                        <div className="relative inline-block">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="60" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                                <circle 
                                    cx="64" 
                                    cy="64" 
                                    r="60" 
                                    stroke={score / questions.length >= 0.7 ? "#22c55e" : "#f97316"} 
                                    strokeWidth="8" 
                                    fill="none" 
                                    strokeDasharray={2 * Math.PI * 60}
                                    strokeDashoffset={2 * Math.PI * 60 * (1 - score / questions.length)}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold text-slate-900">
                                    {Math.round((score / questions.length) * 100)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {score / questions.length >= 0.8 ? "Excellent Job! 🎉" : score / questions.length >= 0.5 ? "Good Practice! 👍" : "Keep Practicing! 💪"}
                            </h2>
                            <p className="text-slate-500 mt-1">You scored {score} out of {questions.length} correct</p>
                        </div>
                        <Button onClick={reset} className="bg-slate-900 text-white hover:bg-slate-800 px-6 rounded-full">
                            <RotateCcw className="w-4 h-4 mr-2" /> Take Another Test
                        </Button>
                    </div>

                    <div className="space-y-6 pb-12">
                        <h3 className="font-bold text-xl text-slate-900 px-2">Detailed Review</h3>
                        {questions.map((q, idx) => {
                            const isCorrect = userAnswers[q.id] === q.correctOption;
                            return (
                                <div key={q.id} className={`bg-white rounded-xl border p-6 ${isCorrect ? 'border-green-200 bg-green-50/10' : 'border-red-200 bg-red-50/10'}`}>
                                    <div className="flex gap-4 mb-4">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-slate-900 leading-relaxed">
                                                {q.text}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pl-12">
                                        {q.options.map((opt, optIdx) => {
                                            const isSelected = userAnswers[q.id] === optIdx;
                                            const isCorrectOption = q.correctOption === optIdx;
                                            
                                            let style = "p-3 rounded-lg border text-base flex items-center justify-between ";
                                            if (isCorrectOption) {
                                                style += "bg-green-100 border-green-300 text-green-900 font-medium";
                                            } else if (isSelected && !isCorrectOption) {
                                                style += "bg-red-50 border-red-200 text-red-700";
                                            } else {
                                                style += "bg-white border-slate-100 text-slate-500 opacity-60";
                                            }
                                            
                                            return (
                                                <div key={optIdx} className={style}>
                                                    <span>{opt}</span>
                                                    {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                                    {isSelected && !isCorrectOption && <AlertCircle className="w-5 h-5 text-red-500" />}
                                                </div>
                                            );
                                        })}
                                        
                                        <div className="mt-4 pt-4 border-t border-slate-100/50">
                                            <div className="flex gap-2 items-start">
                                                <Sparkles className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                                                <div className="text-sm text-slate-600 leading-relaxed">
                                                    <span className="font-semibold text-indigo-600">Explanation:</span> {q.explanation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}