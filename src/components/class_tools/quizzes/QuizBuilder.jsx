import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Wand2 } from 'lucide-react';
import { Quiz } from '@/entities/Quiz';
import { QuizQuestion } from '@/entities/QuizQuestion';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import FileUpload from '@/components/ai_tools/inputs/FileUpload';
import { useTranslation } from '../../i18n/useTranslation';
import { base44 } from '@/api/base44Client';

function AIGenerator({ onQuestionsGenerated, t }) {
    const [aiFormData, setAiFormData] = useState({
        contextType: 'topic',
        topic: '',
        url: '',
        file: null,
        num_questions: 5,
        question_type: 'multiple-choice',
        difficulty: 'Medium',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);

        try {
            let uploadedFileUrl = null;

            // Handle file upload first if needed
            if (aiFormData.contextType === 'file' && aiFormData.file) {
                try {
                    const { file_url } = await UploadFile({ file: aiFormData.file });
                    if (!file_url || file_url.startsWith('blob:')) {
                        throw new Error("Invalid file URL returned from upload.");
                    }
                    uploadedFileUrl = file_url;
                } catch (error) {
                    console.error("Error uploading file:", error);
                    alert("Failed to upload file. Please try again.");
                    setIsLoading(false);
                    return;
                }
            } else if (aiFormData.contextType === 'file' && !aiFormData.file) {
                 alert("Please select a file to upload.");
                 setIsLoading(false);
                 return;
            } else if (aiFormData.contextType === 'topic' && !aiFormData.topic) {
                alert("Please enter a topic.");
                setIsLoading(false);
                return;
            } else if (aiFormData.contextType === 'url' && !aiFormData.url) {
                alert("Please enter a URL.");
                setIsLoading(false);
                return;
            }

            // Call backend function
            const { data, error } = await base44.functions.invoke('generateQuiz', {
                contextType: aiFormData.contextType,
                topic: aiFormData.topic,
                url: aiFormData.url,
                file_url: uploadedFileUrl,
                file_name: aiFormData.file ? aiFormData.file.name : null,
                num_questions: aiFormData.num_questions,
                question_type: aiFormData.question_type,
                difficulty: aiFormData.difficulty
            });

            if (error) throw new Error(error.message || "Unknown backend error");
            if (!data || !data.questions) throw new Error("Invalid response from AI");

            const generatedQuestions = data.questions.map((q, index) => {
                let options = q.options || {};
                if (q.question_type === 'true-false') {
                    options = { A: "True", B: "False" };
                } else if (q.question_type === 'multiple-choice' && (!options.A || !options.B || !options.C || !options.D)) {
                    // Fallback if AI didn't provide complete options
                    options = { A: "Option A", B: "Option B", C: "Option C", D: "Option D" };
                }

                return {
                    id: `new_${index}_${Date.now()}`,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: options,
                    correct_answer: q.correct_answer,
                };
            });
            
            onQuestionsGenerated(generatedQuestions);

        } catch (e) {
            console.error("Error generating quiz with AI:", e);
            let errorMessage = e.message || "Please check the input and try again.";
            if (errorMessage.includes("500") || errorMessage.includes("timeout")) {
                 errorMessage = "The file is too large or complex for the AI to process within the time limit. Please try a smaller file (under 10MB) or a shorter document.";
            }
            alert(`AI generation failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg space-y-4 my-4 bg-slate-50">
            <h3 className="font-semibold flex items-center gap-2"><Wand2 className="w-4 h-4 text-purple-500" /> {t('classTools.aiQuizGenerator')}</h3>
            <Select value={aiFormData.contextType} onValueChange={(val) => setAiFormData(prev => ({...prev, contextType: val}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="topic">{t('classTools.topic')}</SelectItem>
                    <SelectItem value="url">{t('classTools.websiteUrl')}</SelectItem>
                    <SelectItem value="file">{t('classTools.fileUpload')}</SelectItem>
                </SelectContent>
            </Select>
            {aiFormData.contextType === 'topic' && (
                <Input 
                    placeholder={t('classTools.enterTopic')}
                    value={aiFormData.topic} 
                    onChange={e => setAiFormData(prev => ({...prev, topic: e.target.value}))} 
                />
            )}
            {aiFormData.contextType === 'url' && (
                <Input 
                    placeholder={t('classTools.enterUrl')}
                    value={aiFormData.url} 
                    onChange={e => setAiFormData(prev => ({...prev, url: e.target.value}))} 
                />
            )}
            {aiFormData.contextType === 'file' && (
                <FileUpload 
                    id="quiz-ai-file"
                    label="Upload Content"
                    onFileChange={(file) => setAiFormData(prev => ({...prev, file: file}))}
                />
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>{t('classTools.numberOfQuestions')}</Label>
                    <Input 
                        type="number" 
                        min="1"
                        max="20"
                        value={aiFormData.num_questions} 
                        onChange={e => setAiFormData(prev => ({...prev, num_questions: Number(e.target.value)}))} 
                    />
                </div>
                <div>
                    <Label>{t('classTools.difficulty')}</Label>
                    <Select value={aiFormData.difficulty} onValueChange={(val) => setAiFormData(prev => ({...prev, difficulty: val}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Easy">{t('classTools.easy')}</SelectItem>
                            <SelectItem value="Medium">{t('classTools.medium')}</SelectItem>
                            <SelectItem value="Hard">{t('classTools.hard')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label>{t('classTools.questionType')}</Label>
                <Select value={aiFormData.question_type} onValueChange={(val) => setAiFormData(prev => ({...prev, question_type: val}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="multiple-choice">{t('classTools.multipleChoice')}</SelectItem>
                        <SelectItem value="true-false">{t('classTools.trueFalse')}</SelectItem>
                        <SelectItem value="free-response">Free Response</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? t('classTools.generating') : t('classTools.generateQuestions')}
            </Button>
        </div>
    );
}

export default function QuizBuilder({ user, currentClass, quiz, onSave, onCancel }) {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState(0);
    const [isUnlimited, setIsUnlimited] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [questions, setQuestions] = useState([]);
    
    useEffect(() => {
        if (quiz) {
            setTitle(quiz.title);
            setDescription(quiz.description || '');
            setTimeLimit(quiz.time_limit_minutes || 0);
            setIsUnlimited(!quiz.time_limit_minutes || quiz.time_limit_minutes === 0);
            setShowResults(quiz.show_results || false);
            const fetchQuestions = async () => {
                const existingQuestions = await QuizQuestion.filter({ quiz_id: quiz.id });
                setQuestions(existingQuestions);
            };
            fetchQuestions();
        } else {
            // Defaults for new quiz
            setIsUnlimited(true);
            setTimeLimit(0);
            setShowResults(false);
        }
    }, [quiz]);

    const addQuestion = () => {
        setQuestions([...questions, { 
            id: `new-${Date.now()}`, 
            question_text: '', 
            question_type: 'multiple-choice', 
            options: {A: '', B: '', C: '', D: ''}, 
            correct_answer: 'A' 
        }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };
    
    const handleOptionChange = (qIndex, optKey, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[optKey] = value;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        const finalTimeLimit = isUnlimited ? 0 : timeLimit;
        
        const quizData = {
            title,
            description,
            time_limit_minutes: finalTimeLimit,
            show_results: showResults
        };

        let savedQuiz;
        if (quiz) {
            await Quiz.update(quiz.id, quizData);
            savedQuiz = quiz;
        } else {
            savedQuiz = await Quiz.create({ 
                ...quizData,
                class_id: currentClass.id, 
                teacher_id: user.id 
            });
        }
        
        // Delete old questions if editing
        if(quiz) {
            const oldQuestions = await QuizQuestion.filter({quiz_id: quiz.id});
            for(const q of oldQuestions) {
                await QuizQuestion.delete(q.id);
            }
        }
        
        // Create new questions
        for (const q of questions) {
            const { id, ...questionToSave } = q;
            await QuizQuestion.create({ ...questionToSave, quiz_id: savedQuiz.id });
        }
        onSave();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{quiz ? t('classTools.editQuiz') : t('classTools.createQuiz')}</h2>
            <div className="space-y-4">
                <div>
                    <Label>{t('classTools.quizTitle')}</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('classTools.quizTitlePlaceholder')} />
                </div>
                <div>
                    <Label>{t('classTools.quizDescription')}</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('classTools.quizDescriptionPlaceholder')} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label>{t('classTools.timeLimit')}</Label>
                        <RadioGroup value={isUnlimited ? "unlimited" : "limited"} onValueChange={(val) => setIsUnlimited(val === "unlimited")}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unlimited" id="unlimited" />
                                <Label htmlFor="unlimited">{t('classTools.unlimitedTime')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="limited" id="limited" />
                                <Label htmlFor="limited" className="whitespace-nowrap">{t('classTools.setTimeLimit')}</Label>
                                {!isUnlimited && (
                                    <Input 
                                        type="number" 
                                        value={timeLimit || ''} 
                                        onChange={e => setTimeLimit(Number(e.target.value))} 
                                        placeholder=""
                                        className="w-24 ml-2"
                                        min="1"
                                    />
                                )}
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-3">
                        <Label>{t('classTools.afterCompletion')}</Label>
                        <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                           <Switch
                                id="show-results"
                                checked={showResults}
                                onCheckedChange={setShowResults}
                            />
                            <Label htmlFor="show-results" className="cursor-pointer">
                                {t('classTools.allowStudentsViewResults')}
                            </Label>
                        </div>
                    </div>
                </div>
            </div>
            
            <AIGenerator onQuestionsGenerated={(newQs) => setQuestions([...questions, ...newQs])} t={t} />
            
            {questions.map((q, qIndex) => (
                <div key={q.id || `q-${qIndex}`} className="p-4 border rounded-lg space-y-3 bg-white">
                    <div className="flex justify-between items-start">
                        <Label className="text-base font-semibold">{t('classTools.question')} {qIndex + 1}</Label>
                        <Button variant="destructive" size="sm" onClick={() => removeQuestion(qIndex)}>
                            <Trash2 className="w-4 h-4 mr-1" /> {t('classTools.remove')}
                        </Button>
                    </div>
                    <Textarea 
                        value={q.question_text} 
                        onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)} 
                        placeholder={t('classTools.enterQuestion')}
                        className="text-base"
                    />
                    <div>
                        <Label>{t('classTools.questionType')}</Label>
                        <Select value={q.question_type} onValueChange={(val) => {
                            handleQuestionChange(qIndex, 'question_type', val);
                            if (val === 'true-false') {
                                handleQuestionChange(qIndex, 'options', { A: 'True', B: 'False' });
                                handleQuestionChange(qIndex, 'correct_answer', 'A');
                            } else if (val === 'multiple-choice') {
                                handleQuestionChange(qIndex, 'options', { A: '', B: '', C: '', D: '' });
                                handleQuestionChange(qIndex, 'correct_answer', 'A');
                            }
                        }}>
                            <SelectTrigger className="w-48">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="multiple-choice">{t('classTools.multipleChoice')}</SelectItem>
                                <SelectItem value="true-false">{t('classTools.trueFalse')}</SelectItem>
                                <SelectItem value="free-response">Free Response</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {q.question_type === 'multiple-choice' && (
                        <div className="grid grid-cols-1 gap-3">
                            <Label>{t('classTools.answerOptions')}</Label>
                            {Object.keys(q.options || {}).map(optKey => (
                                <div key={optKey} className="flex items-center gap-3">
                                    <Label className="w-8 font-bold text-center">{optKey}.</Label>
                                    <Input 
                                        value={q.options[optKey]} 
                                        onChange={e => handleOptionChange(qIndex, optKey, e.target.value)} 
                                        placeholder={`Option ${optKey}`}
                                        className="flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {q.question_type === 'true-false' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <Label className="font-bold">A.</Label>
                                <span className="text-sm text-slate-600">True</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="font-bold">B.</Label>
                                <span className="text-sm text-slate-600">False</span>
                            </div>
                        </div>
                    )}

                    {q.question_type === 'free-response' && (
                        <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 italic">
                            Students will type their own answer.
                        </div>
                    )}
                    
                    <div>
                        <Label>{q.question_type === 'free-response' ? 'Sample Correct Answer / Rubric Key' : t('classTools.correctAnswer')}</Label>
                        {q.question_type === 'free-response' ? (
                            <Textarea 
                                value={q.correct_answer} 
                                onChange={(e) => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
                                placeholder="Enter a sample correct answer or key points to grade against..."
                                className="mt-1"
                            />
                        ) : (
                            <Select value={q.correct_answer} onValueChange={(val) => handleQuestionChange(qIndex, 'correct_answer', val)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(q.options || {}).map(optKey => (
                                        <SelectItem key={optKey} value={optKey}>
                                            {optKey} - {q.question_type === 'true-false' ? 
                                                (optKey === 'A' ? 'True' : 'False') : 
                                                (q.options[optKey] || `Option ${optKey}`)
                                            }
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            ))}
            
            <Button variant="outline" onClick={addQuestion} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> {t('classTools.addQuestion')}
            </Button>
            
            <div className="flex gap-2">
                <Button onClick={handleSave} disabled={questions.length === 0} className="bg-indigo-600 hover:bg-indigo-700">
                    {t('classTools.saveQuiz')}
                </Button>
                <Button variant="ghost" onClick={onCancel}>{t('classTools.cancel')}</Button>
            </div>
        </div>
    );
}