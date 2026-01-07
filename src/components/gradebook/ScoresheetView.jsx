
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, ChevronLeft, Edit2, Trash2, Calendar, Award, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import AssignmentDialog from "./AssignmentDialog";
import ScoreInspector from "./ScoreInspector";

// New imports for category assignment dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScoresheetView({ currentClass, user }) {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // New state variables for syncing and category assignment
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [pendingSyncAssignments, setPendingSyncAssignments] = useState([]);
  const [currentSyncIndex, setCurrentSyncIndex] = useState(0);
  const [currentSyncAssignment, setCurrentSyncAssignment] = useState(null);
  const [selectedCategoryForSync, setSelectedCategoryForSync] = useState("");

  // New state variables for fill down grades
  const [showFillDownDialog, setShowFillDownDialog] = useState(false);
  const [fillDownData, setFillDownData] = useState({
    points_earned: null,
    special_code: ""
  });

  useEffect(() => {
    loadScoresheetData();
  }, [currentClass]);

  const loadScoresheetData = async () => {
    try {
      const [enrollments, assignmentsData, categoriesData] = await Promise.all([
        base44.entities.ClassEnrollment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookAssignment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookCategory.filter({ class_id: currentClass.id })
      ]);

      setStudents(enrollments);
      setAssignments(assignmentsData);
      setCategories(categoriesData);

      if (assignmentsData.length > 0) {
        const allScores = [];
        for (const assignment of assignmentsData) {
          const assignmentScores = await base44.entities.GradebookScore.filter({
            assignment_id: assignment.id
          });
          allScores.push(...assignmentScores);
        }
        setScores(allScores);
      } else {
        setScores([]);
      }
    } catch (error) {
      console.error("Error loading scoresheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async (assignmentData) => {
    try {
      if (editingAssignment) {
        // Update existing assignment
        await base44.entities.GradebookAssignment.update(editingAssignment.id, assignmentData);
        
        // If a category was just assigned, clear unreleased flags for all scores of this assignment
        if (assignmentData.category_id && !editingAssignment.category_id) {
          const assignmentScores = scores.filter(s => s.assignment_id === editingAssignment.id);
          for (const score of assignmentScores) {
            if (score.is_unreleased) {
              await base44.entities.GradebookScore.update(score.id, {
                is_unreleased: false
              });
            }
          }
        }
      } else {
        // Create new assignment
        await base44.entities.GradebookAssignment.create({
          ...assignmentData,
          class_id: currentClass.id
        });
      }
      
      setShowAssignmentDialog(false);
      setEditingAssignment(null);
      await loadScoresheetData(); // Make sure to await this
    } catch (error) {
      console.error("Error saving assignment:", error);
      alert("Failed to save assignment.");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment and all its scores?")) return;

    try {
      const assignmentScores = scores.filter(s => s.assignment_id === assignmentId);
      for (const score of assignmentScores) {
        await base44.entities.GradebookScore.delete(score.id);
      }

      await base44.entities.GradebookAssignment.delete(assignmentId);
      
      setSelectedAssignment(null);
      loadScoresheetData();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment.");
    }
  };

  const handleScoreUpdate = async (assignmentId, studentId, scoreData) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      
      // Check if assignment has no category
      if (!assignment.category_id) {
        alert("⚠️ Please edit this assignment and assign a category before saving grades. This ensures accurate grade calculations.");
        return;
      }

      const existingScore = scores.find(
        s => s.assignment_id === assignmentId && s.student_id === studentId
      );

      if (existingScore) {
        await base44.entities.GradebookScore.update(existingScore.id, {
          ...scoreData,
          scored_date: new Date().toISOString()
        });
      } else {
        const student = students.find(s => s.student_id === studentId);
        const studentName = student ? student.student_name : 'Unknown Student';

        await base44.entities.GradebookScore.create({
          assignment_id: assignmentId,
          student_id: studentId,
          student_name: studentName,
          ...scoreData,
          scored_date: new Date().toISOString()
        });
      }

      await loadScoresheetData();
      setInspectorOpen(false);
      setSelectedCell(null);
    } catch (error) {
      console.error("Error updating score:", error);
      alert("Failed to update score. Please try again.");
    }
  };

  const handleCellClick = (assignment, student) => {
    const score = scores.find(
      s => s.assignment_id === assignment.id && s.student_id === student.student_id
    );
    
    setSelectedCell({
      assignment,
      student,
      score: score || null
    });
    setInspectorOpen(true);
  };

  const getScore = (assignmentId, studentId) => {
    return scores.find(s => s.assignment_id === assignmentId && s.student_id === studentId);
  };

  const getCategoryName = (categoryId) => {
    if (!categories || categories.length === 0 || !categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const getCategoryColor = (categoryId) => {
    if (!categories || categories.length === 0 || !categoryId) return "#6366f1";
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#6366f1";
  };

  const calculateAssignmentStats = (assignmentId) => {
    const assignmentScores = scores.filter(
      s => s.assignment_id === assignmentId && 
      s.points_earned !== null && 
      s.points_earned !== undefined &&
      !s.special_code
    );
    
    const graded = assignmentScores.length;
    const total = students.length;
    
    return { graded, total };
  };

  const getScoreDisplay = (score, assignment) => {
    if (!score) return "Ungraded";
    if (score.special_code) return score.special_code;
    if (score.points_earned !== null && score.points_earned !== undefined) {
      return `${score.points_earned}/${assignment.max_points}`;
    }
    return "Ungraded";
  };

  const handleSyncFromDashboard = async () => {
    setIsSyncing(true);
    try {
      const dashboardAssignments = await base44.entities.Assignment.filter({
        class_id: currentClass.id
      });

      const existingGradebookAssignments = await base44.entities.GradebookAssignment.filter({
        class_id: currentClass.id
      });

      const alreadySyncedIds = new Set(
        existingGradebookAssignments
          .filter(ga => ga.source_assignment_id)
          .map(ga => ga.source_assignment_id)
      );

      const newAssignments = dashboardAssignments.filter(
        da => !alreadySyncedIds.has(da.id)
      );

      if (newAssignments.length === 0) {
        alert("All dashboard assignments are already synced!");
        setIsSyncing(false);
        return;
      }

      // Start the category assignment flow
      setPendingSyncAssignments(newAssignments);
      setCurrentSyncIndex(0);
      setCurrentSyncAssignment(newAssignments[0]);
      setSelectedCategoryForSync("");
      setShowCategoryDialog(true);
      setIsSyncing(false);
    } catch (error) {
      console.error("Error syncing from dashboard:", error);
      alert("Failed to sync assignments. Please try again.");
      setIsSyncing(false);
    }
  };

  const handleCategoryAssignment = async () => {
    if (!selectedCategoryForSync) {
      alert("Please select a category");
      return;
    }

    try {
      const assignment = currentSyncAssignment;
      
      await base44.entities.GradebookAssignment.create({
        class_id: currentClass.id,
        source_assignment_id: assignment.id,
        category_id: selectedCategoryForSync,
        name: assignment.title,
        description: assignment.description || "",
        max_points: assignment.max_points || 100,
        due_date: assignment.due_date || null,
        weight: 1,
        is_extra_credit: false,
        exclude_from_final: false,
        publish_scores: false
      });

      const nextIndex = currentSyncIndex + 1;
      if (nextIndex < pendingSyncAssignments.length) {
        setCurrentSyncIndex(nextIndex);
        setCurrentSyncAssignment(pendingSyncAssignments[nextIndex]);
        setSelectedCategoryForSync("");
      } else {
        setShowCategoryDialog(false);
        setPendingSyncAssignments([]);
        setCurrentSyncIndex(0);
        setCurrentSyncAssignment(null);
        alert(`Successfully synced ${pendingSyncAssignments.length} assignment(s)!`);
        loadScoresheetData();
      }
    } catch (error) {
      console.error("Error creating gradebook assignment:", error);
      alert("Failed to create assignment. Please try again.");
    }
  };

  const handleSkipAssignment = () => {
    const nextIndex = currentSyncIndex + 1;
    if (nextIndex < pendingSyncAssignments.length) {
      setCurrentSyncIndex(nextIndex);
      setCurrentSyncAssignment(pendingSyncAssignments[nextIndex]);
      setSelectedCategoryForSync("");
    } else {
      setShowCategoryDialog(false);
      setPendingSyncAssignments([]);
      setCurrentSyncIndex(0);
      setCurrentSyncAssignment(null);
      alert(`Finished processing assignments.`);
      loadScoresheetData();
    }
  };

  const handleFillDown = async () => {
    if (!selectedAssignment) return;
    
    if (fillDownData.points_earned === null && !fillDownData.special_code) {
      alert("Please enter a score or select a special code");
      return;
    }

    if (!confirm(`Are you sure you want to apply this grade to all ${students.length} students for "${selectedAssignment.name}"? This will overwrite existing grades.`)) {
      return;
    }

    try {
      // Check if assignment has no category before filling down
      if (!selectedAssignment.category_id) {
        alert("⚠️ Please assign a category to this assignment before filling down grades. This ensures accurate grade calculations.");
        return;
      }

      for (const student of students) {
        const existingScore = scores.find(
          s => s.assignment_id === selectedAssignment.id && s.student_id === student.student_id
        );

        const scoreData = {
          points_earned: fillDownData.special_code ? null : fillDownData.points_earned,
          special_code: fillDownData.special_code || "",
          is_late: false,
          is_missing: fillDownData.special_code === "MIS",
          is_unreleased: !selectedAssignment.category_id, // Marks as unreleased if assignment has no category
          comment: "",
          scored_date: new Date().toISOString()
        };

        if (existingScore) {
          await base44.entities.GradebookScore.update(existingScore.id, scoreData);
        } else {
          await base44.entities.GradebookScore.create({
            assignment_id: selectedAssignment.id,
            student_id: student.student_id,
            student_name: student.student_name,
            ...scoreData
          });
        }
      }

      setShowFillDownDialog(false);
      setFillDownData({ points_earned: null, special_code: "" });
      await loadScoresheetData();
    } catch (error) {
      console.error("Error filling down grades:", error);
      alert("Failed to fill down grades. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!selectedAssignment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assignments</h2>
            <p className="text-sm text-slate-600 mt-1">
              {students.length} students • {assignments.length} assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSyncFromDashboard}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing..." : "Sync from Dashboard"}
            </Button>
            <Button
              onClick={() => {
                setEditingAssignment(null);
                setShowAssignmentDialog(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Assignment
            </Button>
          </div>
        </div>

        {assignments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments yet</h3>
            <p className="text-sm text-slate-600 mb-6">Create your first assignment or sync from dashboard to start grading</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSyncFromDashboard}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing..." : "Sync from Dashboard"}
              </Button>
              <Button
                onClick={() => {
                  setEditingAssignment(null);
                  setShowAssignmentDialog(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const stats = calculateAssignmentStats(assignment.id);
              
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {assignment.name}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${getCategoryColor(assignment.category_id)}20`,
                            color: getCategoryColor(assignment.category_id)
                          }}
                        >
                          {getCategoryName(assignment.category_id)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {assignment.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{assignment.max_points} pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{stats.graded}/{stats.total} graded</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAssignment(assignment);
                        setShowAssignmentDialog(true);
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showAssignmentDialog && (
            <AssignmentDialog
              open={showAssignmentDialog}
              assignment={editingAssignment}
              categories={categories}
              onSave={handleSaveAssignment}
              onClose={() => {
                setShowAssignmentDialog(false);
                setEditingAssignment(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedAssignment(null)}
            className="text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowFillDownDialog(true);
                setFillDownData({ points_earned: null, special_code: "" }); // Reset data on open
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Fill Down Grade
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setEditingAssignment(selectedAssignment);
                setShowAssignmentDialog(true);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteAssignment(selectedAssignment.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{selectedAssignment.name}</h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${getCategoryColor(selectedAssignment.category_id)}20`,
                  color: getCategoryColor(selectedAssignment.category_id)
                }}
              >
                {getCategoryName(selectedAssignment.category_id)}
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-600">
              {selectedAssignment.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due {format(new Date(selectedAssignment.due_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{selectedAssignment.max_points} points possible</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const score = getScore(selectedAssignment.id, student.student_id);
                  const display = getScoreDisplay(score, selectedAssignment);

                  return (
                    <tr
                      key={student.student_id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleCellClick(selectedAssignment, student)}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{student.student_name}</div>
                          <div className="text-sm text-slate-500">{student.student_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-900 font-medium">{display}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {score?.points_earned !== null && score?.points_earned !== undefined && !score?.special_code ? (
                            <>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Graded
                              </span>
                              {score.is_unreleased && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Unreleased
                                </span>
                              )}
                            </>
                          ) : score?.special_code ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {score.special_code}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              Ungraded
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {inspectorOpen && selectedCell && (
            <ScoreInspector
              cell={selectedCell}
              onSave={(scoreData) => {
                handleScoreUpdate(
                  selectedCell.assignment.id,
                  selectedCell.student.student_id,
                  scoreData
                );
              }}
              onClose={() => setInspectorOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAssignmentDialog && (
            <AssignmentDialog
              open={showAssignmentDialog}
              assignment={editingAssignment}
              categories={categories}
              onSave={handleSaveAssignment}
              onClose={() => {
                setShowAssignmentDialog(false);
                setEditingAssignment(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Category Assignment Dialog for Syncing */}
      <Dialog open={showCategoryDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Category</DialogTitle>
          </DialogHeader>
          
          {currentSyncAssignment && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-1">
                  {currentSyncAssignment.title}
                </h4>
                <p className="text-sm text-slate-600">
                  {currentSyncAssignment.max_points} points
                  {currentSyncAssignment.due_date && 
                    ` • Due: ${format(new Date(currentSyncAssignment.due_date), 'MMM d, yyyy')}`
                  }
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Assignment {currentSyncIndex + 1} of {pendingSyncAssignments.length}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Select Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCategoryForSync}
                  onValueChange={setSelectedCategoryForSync}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.weight}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleSkipAssignment}>
                  Skip
                </Button>
                <Button onClick={handleCategoryAssignment} disabled={!selectedCategoryForSync}>
                  Assign & Continue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fill Down Dialog */}
      <Dialog open={showFillDownDialog} onOpenChange={setShowFillDownDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fill Down Grade</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Apply the same grade to all {students.length} students for "{selectedAssignment?.name}"
            </p>

            <div className="space-y-2">
              <Label htmlFor="special_code_select">Special Code</Label>
              <Select
                value={fillDownData.special_code === null ? "" : fillDownData.special_code} // Use empty string for "None" to make Select happy
                onValueChange={(value) => setFillDownData({ 
                  ...fillDownData, 
                  special_code: value === "" ? null : value, // Convert empty string back to null for logic
                  points_earned: value ? null : fillDownData.points_earned // Clear points if special code selected
                })}
              >
                <SelectTrigger id="special_code_select">
                  <SelectValue placeholder="None (Enter Score)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem> {/* Empty string for no special code */}
                  <SelectItem value="MIS">Missing (MIS)</SelectItem>
                  <SelectItem value="ABS">Absent (ABS)</SelectItem>
                  <SelectItem value="INC">Incomplete (INC)</SelectItem>
                  <SelectItem value="EXC">Excused (EXC)</SelectItem>
                  <SelectItem value="EXE">Exempt (EXE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!fillDownData.special_code && (
              <div className="space-y-2">
                <Label htmlFor="points_earned_input">Points Earned</Label>
                <Input
                  id="points_earned_input"
                  type="number"
                  min="0"
                  max={selectedAssignment?.max_points}
                  step="0.5"
                  value={fillDownData.points_earned ?? ""}
                  onChange={(e) => setFillDownData({ 
                    ...fillDownData, 
                    points_earned: e.target.value === "" ? null : parseFloat(e.target.value)
                  })}
                  placeholder="Enter score"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowFillDownDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleFillDown} disabled={fillDownData.points_earned === null && !fillDownData.special_code}>
                Apply to All Students
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
