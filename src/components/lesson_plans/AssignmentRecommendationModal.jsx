import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Plus } from "lucide-react";
import { InvokeLLM } from '@/integrations/Core';
import { Assignment } from '@/entities/Assignment';
import { motion } from "framer-motion";

export default function AssignmentRecommendationModal({ isOpen, onClose, lessonPlan, classId, teacherId }) {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [creatingIndex, setCreatingIndex] = useState(null);
    const [createdIds, setCreatedIds] = useState(new Set());

    useEffect(() => {
        if (isOpen && lessonPlan) {
            generateRecommendations();
        } else {
            setRecommendations([]);
            setCreatedIds(new Set());
        }
    }, [isOpen, lessonPlan]);

    const generateRecommendations = async () => {
        setIsLoading(true);
        try {
            const prompt = `Based on the following lesson plan, recommend 3 engaging assignments that a teacher could assign to students.
            
            Lesson Plan Title: ${lessonPlan.title}
            Objectives: ${lessonPlan.objectives.join(', ')}
            Activities: ${lessonPlan.activities.map(a => a.title).join(', ')}
            Homework: ${lessonPlan.homework.join(', ')}
            
            For each recommendation, provide:
            - title: A catchy title for the assignment
            - description: A brief description for the student
            - instructions: Detailed step-by-step instructions
            - max_points: Suggested points (default 100)
            - estimated_duration_minutes: Estimated time to complete
            
            Return ONLY a valid JSON array of objects.`;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    instructions: { type: "string" },
                                    max_points: { type: "number" },
                                    estimated_duration_minutes: { type: "number" }
                                },
                                required: ["title", "description", "instructions"]
                            }
                        }
                    },
                    required: ["recommendations"]
                }
            });

            if (response && response.recommendations) {
                setRecommendations(response.recommendations);
            }
        } catch (error) {
            console.error("Error generating recommendations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAssignment = async (rec, index) => {
        setCreatingIndex(index);
        try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Default to 1 week from now

            await Assignment.create({
                title: rec.title,
                description: `${rec.description}\n\n${rec.instructions}`,
                instructions: "",
                max_points: rec.max_points || 100,
                due_date: dueDate.toISOString().split('T')[0],
                class_id: classId,
                teacher_id: teacherId,
                status: 'active',
                is_visible: true,
                allow_submissions: true,
                use_ai_grading: true, // Default to true for convenience
                subject: 'other' // Could be inferred, but 'other' is safe
            });

            setCreatedIds(prev => new Set(prev).add(index));
        } catch (error) {
            console.error("Error creating assignment:", error);
            alert("Failed to create assignment.");
        } finally {
            setCreatingIndex(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Recommended Assignments
                    </DialogTitle>
                    <DialogDescription>
                        ACE AI has generated these assignment ideas based on your lesson plan. 
                        Click "Create" to instantly add them to your dashboard.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                        <p>Analyzing lesson plan...</p>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {recommendations.map((rec, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`border-2 ${createdIds.has(index) ? 'border-green-200 bg-green-50' : 'border-slate-100 hover:border-indigo-200'}`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg font-semibold text-slate-900">
                                                {rec.title}
                                            </CardTitle>
                                            {createdIds.has(index) && (
                                                <span className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Created
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                                        <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-700 border border-slate-100">
                                            <strong>Instructions:</strong> {rec.instructions.length > 150 ? rec.instructions.substring(0, 150) + '...' : rec.instructions}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end pt-0">
                                        <Button 
                                            onClick={() => handleCreateAssignment(rec, index)}
                                            disabled={creatingIndex !== null || createdIds.has(index)}
                                            variant={createdIds.has(index) ? "ghost" : "default"}
                                            className={createdIds.has(index) ? "text-green-600 hover:text-green-700 hover:bg-green-100" : "bg-indigo-600 hover:bg-indigo-700"}
                                        >
                                            {createdIds.has(index) ? (
                                                "Added to Dashboard"
                                            ) : (
                                                <>
                                                    {creatingIndex === index ? (
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 mr-2" />
                                                    )}
                                                    Create Assignment
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}