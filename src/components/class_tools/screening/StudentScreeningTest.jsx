import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Brain } from 'lucide-react';
import { SCREENING_TESTS } from './ScreeningQuestions';

export default function StudentScreeningTest({ user, currentClass }) {
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTest, setActiveTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentClass, user.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const myScreenings = await base44.entities.NeuroScreening.filter({ 
                class_id: currentClass.id,
                student_id: user.id
            });
            // Show only assigned (not completed) or completed ones for review? Let's just show active ones to take.
            setScreenings(myScreenings);
        } catch (error) {
            console.error("Error fetching screenings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (screening) => {
        setActiveTest(screening);
        setAnswers({});
    };

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        if (!activeTest) return;
        setSubmitting(true);
        try {
            const testDef = SCREENING_TESTS[activeTest.test_type];
            
            // Prepare answers with question text for the AI
            const answersWithContext = testDef.questions.map(q => ({
                question_id: q.id,
                question: q.text,
                answer: answers[q.id] || "Skipped"
            }));

            // First save locally to ensure status update
            await base44.entities.NeuroScreening.update(activeTest.id, {
                answers: answers,
                status: 'processing',
                completed_at: new Date().toISOString(),
                result_summary: "Processing AI evaluation..."
            });

            // Call backend function for AI evaluation WITHOUT awaiting it
            // This prevents the UI from blocking and makes it feel faster.
            // The backend function handles updating the status to 'completed' or 'error'.
            base44.functions.invoke('evaluateNeuroScreening', {
                screening_id: activeTest.id,
                test_type: activeTest.test_type,
                answers_with_context: answersWithContext
            }).catch(async (err) => {
                console.error("Background AI evaluation failed to start:", err);
                // Try to mark as error if the invocation itself failed (e.g. network)
                try {
                    await base44.entities.NeuroScreening.update(activeTest.id, {
                        status: 'error',
                        result_summary: "Evaluation failed to start. Teacher review required."
                    });
                } catch (e) { console.error("Could not update error status:", e); }
            });

            // Immediately show success to student
            setActiveTest(null);
            await fetchData();
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to save submission. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    if (activeTest) {
        const testDef = SCREENING_TESTS[activeTest.test_type];
        return (
            <div className="max-w-3xl mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{testDef.title}</CardTitle>
                        <CardDescription>{testDef.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {testDef.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-3">
                                <h3 className="font-medium text-slate-900">{idx + 1}. {q.text}</h3>
                                <RadioGroup 
                                    value={answers[q.id] || ""} 
                                    onValueChange={(val) => handleAnswer(q.id, val)}
                                >
                                    <div className="space-y-2">
                                        {q.options.map((option, optIdx) => (
                                            <div key={optIdx} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={`${q.id}-${optIdx}`} />
                                                <Label htmlFor={`${q.id}-${optIdx}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setActiveTest(null)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Submit Screening
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">My Screenings</h2>
                    <p className="text-slate-500">Complete assigned screening tests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screenings.filter(s => s.status === 'assigned').map(screening => (
                    <Card key={screening.id} className="border-l-4 border-l-indigo-500">
                        <CardHeader>
                            <CardTitle className="text-lg">{SCREENING_TESTS[screening.test_type]?.title}</CardTitle>
                            <CardDescription>Assigned by Teacher</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">{SCREENING_TESTS[screening.test_type]?.description}</p>
                            <Button onClick={() => handleStartTest(screening)} className="w-full">
                                Take Test
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {screenings.filter(s => s.status === 'assigned').length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No pending screenings assigned to you.</p>
                    </div>
                )}
            </div>

            {screenings.filter(s => s.status === 'completed').length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800">Completed Screenings</h3>
                    <div className="space-y-4">
                        {screenings.filter(s => s.status === 'completed').map(screening => (
                            <div key={screening.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div>
                                    <h4 className="font-medium text-slate-900">{SCREENING_TESTS[screening.test_type]?.title}</h4>
                                    <p className="text-sm text-slate-500">Completed on {new Date(screening.completed_at).toLocaleDateString()}</p>
                                </div>
                                {screening.status === 'processing' ? (
                                    <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
                                ) : screening.status === 'error' ? (
                                    <Badge className="bg-red-100 text-red-700">Error</Badge>
                                ) : (
                                    <Badge className="bg-green-100 text-green-700">Submitted</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}