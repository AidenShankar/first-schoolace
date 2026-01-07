import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Brain, CheckCircle2, Clock, Eye, Save, FileText, AlertCircle, RefreshCw, Lightbulb, Target, BookOpen, Layers } from 'lucide-react';
import { SCREENING_TESTS } from './ScreeningQuestions';
import { Textarea } from "@/components/ui/textarea";

const AIResultCard = ({ title, icon: Icon, items, colorClass, bgClass }) => (
    <div className={`rounded-xl p-4 border ${bgClass} space-y-3`}>
        <h4 className={`font-semibold flex items-center gap-2 ${colorClass}`}>
            <Icon className="w-5 h-5" />
            {title}
        </h4>
        <ul className="space-y-2">
            {items?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function TeacherScreeningDashboard({ user, currentClass, allClasses }) {
    const [students, setStudents] = useState([]);
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState("");
    // We now default to the single test type
    const [selectedTestType, setSelectedTestType] = useState("LearningProfile");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);
    
    // Review Modal State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedScreening, setSelectedScreening] = useState(null);
    const [teacherNotes, setTeacherNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [retryingIds, setRetryingIds] = useState(new Set());

    useEffect(() => {
        fetchData();
    }, [currentClass, allClasses]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch students from ALL classes to populate the dropdown
            let allEnrollments = [];
            if (allClasses && allClasses.length > 0) {
                const classIds = allClasses.map(c => c.id);
                // Fetch enrollments for all classes. Note: This might be large, but usually manageable per teacher.
                // We use batches or just one call if the SDK supports $in.
                allEnrollments = await base44.entities.ClassEnrollment.filter({ class_id: { $in: classIds } });
            } else if (currentClass) {
                allEnrollments = await base44.entities.ClassEnrollment.filter({ class_id: currentClass.id });
            }

            // Deduplicate students by student_id
            const uniqueStudents = [];
            const seenIds = new Set();
            allEnrollments.forEach(enrollment => {
                if (!seenIds.has(enrollment.student_id)) {
                    seenIds.add(enrollment.student_id);
                    uniqueStudents.push(enrollment);
                }
            });
            
            // Sort students by name
            uniqueStudents.sort((a, b) => a.student_name.localeCompare(b.student_name));
            setStudents(uniqueStudents);

            // Fetch existing screenings for the CURRENT class context (to show in the table)
            // Or should we show ALL screenings? The UI is inside "Class Tools", so typically scoped to currentClass.
            // However, if we allow assigning to any student, maybe we should show all?
            // Let's stick to showing screenings for the *current class* in the table to avoid confusion, 
            // OR if the user assigns to a student from another class, it might not show up here if we filter by currentClass.
            // Given the request "it is not showing all the students enrolled in my class" -> "any of the teacher's classes codes",
            // let's fetch screenings for ALL classes too, so the teacher sees everything in this dashboard.
            
            let allScreenings = [];
            if (allClasses && allClasses.length > 0) {
                 const classIds = allClasses.map(c => c.id);
                 allScreenings = await base44.entities.NeuroScreening.filter({ class_id: { $in: classIds } });
            } else if (currentClass) {
                 allScreenings = await base44.entities.NeuroScreening.filter({ class_id: currentClass.id });
            }
            
            // Sort by date desc
            allScreenings.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            setScreenings(allScreenings);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStudent || !selectedTestType) return;
        setAssigning(true);
        try {
            const studentInCurrentClass = await base44.entities.ClassEnrollment.filter({ 
                class_id: currentClass.id, 
                student_id: selectedStudent 
            });

            let targetClassId = currentClass.id;
            let targetStudentName = "";

            if (studentInCurrentClass.length > 0) {
                targetClassId = currentClass.id;
                targetStudentName = studentInCurrentClass[0].student_name;
            } else {
                const teacherClassIds = allClasses.map(c => c.id);
                const studentEnrollments = await base44.entities.ClassEnrollment.filter({
                    student_id: selectedStudent,
                    class_id: { $in: teacherClassIds }
                });
                
                if (studentEnrollments.length > 0) {
                    targetClassId = studentEnrollments[0].class_id;
                    targetStudentName = studentEnrollments[0].student_name;
                } else {
                    throw new Error("Student not found in any of your classes");
                }
            }

            await base44.entities.NeuroScreening.create({
                class_id: targetClassId,
                teacher_id: user.id,
                student_id: selectedStudent,
                student_name: targetStudentName,
                test_type: selectedTestType,
                status: 'assigned',
                answers: {}
            });
            
            await fetchData();
            setIsDialogOpen(false);
            setSelectedStudent("");
            setSelectedTestType("");
        } catch (error) {
            console.error("Error assigning test:", error);
            alert("Failed to assign test: " + error.message);
        } finally {
            setAssigning(false);
        }
    };

    const handleViewDetails = (screening) => {
        setSelectedScreening(screening);
        setTeacherNotes(screening.teacher_notes || "");
        setReviewOpen(true);
    };

    const handleSaveNotes = async () => {
        if (!selectedScreening) return;
        setSavingNotes(true);
        try {
            await base44.entities.NeuroScreening.update(selectedScreening.id, {
                teacher_notes: teacherNotes
            });
            // Update local state
            setScreenings(prev => prev.map(s => s.id === selectedScreening.id ? { ...s, teacher_notes: teacherNotes } : s));
            setReviewOpen(false);
        } catch (error) {
            console.error("Error saving notes:", error);
            alert("Failed to save notes");
        } finally {
            setSavingNotes(false);
        }
    };

    const handleRetryAI = async (screening) => {
        if (retryingIds.has(screening.id)) return;
        
        setRetryingIds(prev => new Set([...prev, screening.id]));
        try {
            // Update to processing first
            await base44.entities.NeuroScreening.update(screening.id, {
                status: 'processing',
                result_summary: 'Retrying AI evaluation...'
            });
            setScreenings(prev => prev.map(s => s.id === screening.id ? { ...s, status: 'processing', result_summary: 'Retrying AI evaluation...' } : s));

            // Prepare answers context again (we need to reconstruct it from the answers object)
            const testDef = SCREENING_TESTS[screening.test_type];
            const answersWithContext = testDef.questions.map(q => ({
                question_id: q.id,
                question: q.text,
                answer: screening.answers[q.id] || "Skipped"
            }));

            // Call function
            await base44.functions.invoke('evaluateNeuroScreening', {
                screening_id: screening.id,
                test_type: screening.test_type,
                answers_with_context: answersWithContext
            });
            
            // Refresh
            await fetchData();
        } catch (error) {
            console.error("Retry failed:", error);
            alert("Retry failed: " + error.message);
            await fetchData();
        } finally {
            setRetryingIds(prev => {
                const next = new Set(prev);
                next.delete(screening.id);
                return next;
            });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Neurodevelopmental Screening</h2>
                    <p className="text-slate-500">Assign and monitor screening tests for all your students.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" /> Assign New Test
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Screening Test</DialogTitle>
                            <DialogDescription>Select a student and a test type to assign.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Student</label>
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {students.map(student => (
                                            <SelectItem key={student.student_id} value={student.student_id}>
                                                {student.student_name} ({student.student_email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Test Type</label>
                                <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select test type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(SCREENING_TESTS).map(key => (
                                            <SelectItem key={key} value={key}>
                                                {SCREENING_TESTS[key].title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssign} disabled={assigning || !selectedStudent || !selectedTestType}>
                                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Test"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Screenings</CardTitle>
                </CardHeader>
                <CardContent>
                    {screenings.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No screening tests assigned yet.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Test Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Result Summary</TableHead>
                                    <TableHead>Assigned Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {screenings.map(screening => (
                                    <TableRow key={screening.id}>
                                        <TableCell className="font-medium">{screening.student_name}</TableCell>
                                        <TableCell>{SCREENING_TESTS[screening.test_type]?.title || screening.test_type}</TableCell>
                                        <TableCell>
                                            {screening.status === 'completed' ? (
                                                <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
                                            ) : screening.status === 'processing' ? (
                                                <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>
                                            ) : screening.status === 'error' ? (
                                                <Badge className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px] truncate text-sm" title={screening.result_summary}>
                                                {screening.result_summary || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(screening.created_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {(screening.status === 'completed' || screening.status === 'error') && (
                                                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(screening)}>
                                                        <Eye className="w-4 h-4 mr-2" /> Review
                                                    </Button>
                                                )}
                                                {(screening.status === 'error' || screening.status === 'processing' || (screening.status === 'completed' && !screening.ai_feedback)) && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => handleRetryAI(screening)}
                                                        disabled={retryingIds.has(screening.id)}
                                                        title="Retry AI Evaluation"
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${retryingIds.has(screening.id) || (screening.status === 'processing' && !retryingIds.has(screening.id)) ? 'animate-spin' : ''}`} />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Screening Results: {selectedScreening?.student_name}</DialogTitle>
                        <DialogDescription>
                            {selectedScreening && SCREENING_TESTS[selectedScreening.test_type]?.title}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedScreening && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Questions & Answers */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-indigo-600" />
                                        Student Responses
                                    </h3>
                                    <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                                        {SCREENING_TESTS[selectedScreening.test_type]?.questions.map((q, idx) => (
                                            <div key={q.id} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                                                <p className="text-sm font-medium text-slate-800 mb-1">
                                                    {idx + 1}. {q.text}
                                                </p>
                                                <p className="text-sm text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                                                    {selectedScreening.answers?.[q.id] || "Skipped"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: AI Feedback & Teacher Notes */}
                                <div className="space-y-6">
                                    {/* AI Feedback */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <Brain className="w-5 h-5 text-indigo-600" />
                                                Learning Profile Analysis
                                            </h3>
                                            {selectedScreening.ai_feedback && (
                                                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                                                    AI Generated
                                                </span>
                                            )}
                                        </div>

                                        {(() => {
                                            try {
                                                if (!selectedScreening.ai_feedback) return <p className="text-slate-500 italic">Analysis processing or unavailable.</p>;
                                                
                                                const feedback = JSON.parse(selectedScreening.ai_feedback);
                                                
                                                if (feedback.error) return <p className="text-red-500">Error: {feedback.error}</p>;

                                                return (
                                                    <div className="space-y-4 animate-in fade-in duration-500">
                                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                                                            <h4 className="font-semibold text-indigo-900 mb-1">Dominant Style: {feedback.dominant_style}</h4>
                                                            <p className="text-sm text-indigo-800 leading-relaxed">{feedback.summary}</p>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-4">
                                                            <AIResultCard 
                                                                title="Teaching Strategies" 
                                                                icon={Lightbulb} 
                                                                items={feedback.teaching_strategies}
                                                                colorClass="text-amber-600"
                                                                bgClass="bg-amber-50 border-amber-100"
                                                            />
                                                            
                                                            <AIResultCard 
                                                                title="Assignment Recommendations" 
                                                                icon={BookOpen} 
                                                                items={feedback.assignment_recommendations}
                                                                colorClass="text-blue-600"
                                                                bgClass="bg-blue-50 border-blue-100"
                                                            />
                                                            
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <AIResultCard 
                                                                    title="Strengths" 
                                                                    icon={Target} 
                                                                    items={feedback.strengths}
                                                                    colorClass="text-green-600"
                                                                    bgClass="bg-green-50 border-green-100"
                                                                />
                                                                <AIResultCard 
                                                                    title="Support Needs" 
                                                                    icon={Layers} 
                                                                    items={feedback.challenges}
                                                                    colorClass="text-rose-600"
                                                                    bgClass="bg-rose-50 border-rose-100"
                                                                />
                                                            </div>

                                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                <h4 className="font-semibold text-slate-700 mb-1 text-sm">Ideal Environment</h4>
                                                                <p className="text-sm text-slate-600">{feedback.environment_needs}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            } catch (e) {
                                                return <p className="text-red-500">Error parsing AI feedback.</p>;
                                            }
                                        })()}
                                    </div>

                                    {/* Teacher Notes */}
                                    <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-slate-600" />
                                            Teacher Notes
                                        </h3>
                                        <Textarea 
                                            placeholder="Add your own observations or next steps..." 
                                            value={teacherNotes}
                                            onChange={(e) => setTeacherNotes(e.target.value)}
                                            className="min-h-[150px]"
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleSaveNotes} disabled={savingNotes} className="gap-2">
                                                {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save Notes
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}