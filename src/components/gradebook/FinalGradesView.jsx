
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

import ScoreInspector from "./ScoreInspector";
import { AnimatePresence } from "framer-motion";

export default function FinalGradesView({ currentClass }) {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    if (currentClass?.id) {
      loadFinalGradesData();
    }
  }, [currentClass]);

  const loadFinalGradesData = async () => {
    setLoading(true);
    try {
      const [enrollments, assignmentsData, categoriesData, scoresData] = await Promise.all([
        base44.entities.ClassEnrollment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookAssignment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookCategory.filter({ class_id: currentClass.id }),
        base44.entities.GradebookScore.list()
      ]);

      setStudents(enrollments);
      setAssignments(assignmentsData);
      setCategories(categoriesData);
      setScores(scoresData);
    } catch (error) {
      console.error("Error loading final grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScore = (assignmentId, studentId) => {
    return scores.find(s => s.assignment_id === assignmentId && s.student_id === studentId);
  };

  const getScoreDisplay = (score, assignment) => {
    if (!score) return "-";
    if (score.special_code) return score.special_code;
    if (score.points_earned !== null && score.points_earned !== undefined) {
      return `${score.points_earned}/${assignment.max_points}`;
    }
    return "-";
  };

  const getCategoryColor = (categoryId) => {
    if (!categories || categories.length === 0 || !categoryId) return "#6366f1";
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#6366f1";
  };

  const calculateFinalGrade = (studentId) => {
    const useWeighting = currentClass?.use_category_weighting ?? true;
    const validCategories = categories.filter(cat => cat.weight > 0);
    
    // If weighting is disabled, use simple points-based calculation
    if (!useWeighting) {
      let totalPoints = 0;
      let earnedPoints = 0;

      assignments.forEach(assignment => {
        if (assignment.exclude_from_final) return; // Exclude if marked
        
        const score = getScore(assignment.id, studentId);
        if (score && !score.special_code && !score.is_unreleased && score.points_earned !== null) {
          totalPoints += assignment.max_points;
          earnedPoints += score.points_earned;
        }
      });

      return totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : "0.0";
    }
    
    // Original weighted calculation (or fallback to points-based if weighting enabled but no categories)
    if (validCategories.length === 0) {
      let totalPoints = 0;
      let earnedPoints = 0;

      assignments.forEach(assignment => {
        if (assignment.exclude_from_final) return; // Exclude if marked
        const score = getScore(assignment.id, studentId);
        if (score && !score.special_code && !score.is_unreleased && score.points_earned !== null) {
          totalPoints += assignment.max_points;
          earnedPoints += score.points_earned;
        }
      });

      return totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : "0.0";
    }

    const categorizedAssignments = {};
    assignments.forEach(assignment => {
      const categoryId = assignment.category_id || 'uncategorized';
      if (!categorizedAssignments[categoryId]) {
        categorizedAssignments[categoryId] = [];
      }
      categorizedAssignments[categoryId].push(assignment);
    });

    const categoriesWithGrades = [];

    validCategories.forEach(category => {
      const categoryAssignments = categorizedAssignments[category.id] || [];
      const percentageScores = [];
      
      categoryAssignments.forEach(assignment => {
        if (assignment.exclude_from_final) return;
        
        const score = getScore(assignment.id, studentId);
        if (!score || score.special_code || score.is_unreleased) return;
        
        if (score.points_earned !== null && score.points_earned !== undefined && assignment.max_points > 0) {
          const percentage = score.points_earned / assignment.max_points;
          percentageScores.push(percentage);
        }
      });

      if (percentageScores.length === 0) return;

      let categoryAverage = percentageScores.reduce((sum, pct) => sum + pct, 0) / percentageScores.length;
      
      if (category.drop_lowest > 0 && percentageScores.length > category.drop_lowest) {
        const sortedPercentages = [...percentageScores].sort((a, b) => a - b);
        const kept = sortedPercentages.slice(category.drop_lowest);
        categoryAverage = kept.reduce((sum, pct) => sum + pct, 0) / kept.length;
      }
      
      categoriesWithGrades.push({
        weight: category.weight,
        average: categoryAverage
      });
    });

    if (categoriesWithGrades.length === 0) {
      // If no assignments within valid categories contributed to a grade, default to 0.0
      return "0.0";
    } else if (categoriesWithGrades.length === 1) {
      return (categoriesWithGrades[0].average * 100).toFixed(1);
    } else {
      const totalWeightWithGrades = categoriesWithGrades.reduce((sum, cat) => sum + cat.weight, 0);
      let finalGrade = 0;
      categoriesWithGrades.forEach(category => {
        const proportionalWeight = category.weight / totalWeightWithGrades;
        finalGrade += category.average * proportionalWeight;
      });
      return (finalGrade * 100).toFixed(1);
    }
  };

  const handleCellClick = (assignment, student) => {
    const score = getScore(assignment.id, student.student_id);
    setSelectedCell({
      assignment,
      student,
      score: score || null
    });
    setInspectorOpen(true);
  };

  const handleScoreUpdate = async (assignmentId, studentId, scoreData) => {
    try {
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

      await loadFinalGradesData();
      setInspectorOpen(false);
      setSelectedCell(null);
    } catch (error) {
      console.error("Error updating score:", error);
      alert("Failed to update score. Please try again.");
    }
  };

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const useWeighting = currentClass?.use_category_weighting ?? true;
  const weightWarning = useWeighting && Math.abs(totalWeight - 100) > 0.01 ? 
    `Warning: Configured category weights sum to ${totalWeight.toFixed(1)}% (expected 100%). Grades may be inaccurate.` : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Final Grades</h2>
            <p className="text-sm text-slate-600 mt-1">
              Spreadsheet view of all student grades
            </p>
          </div>
        </div>

        {weightWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 text-sm">Category Weight Issue</h4>
              <p className="text-sm text-yellow-700 mt-1">{weightWarning}</p>
            </div>
          </div>
        )}

        {students.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No students enrolled</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 border-r border-slate-200 sticky left-0 bg-slate-50 min-w-[200px]">
                      Student
                    </th>
                    {assignments.map((assignment) => (
                      <th
                        key={assignment.id}
                        className="text-left py-3 px-4 font-semibold text-slate-700 border-r border-slate-200 min-w-[150px]"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="truncate">{assignment.name}</span>
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium w-fit"
                            style={{
                              backgroundColor: `${getCategoryColor(assignment.category_id)}20`,
                              color: getCategoryColor(assignment.category_id)
                            }}
                          >
                            {assignment.max_points} pts
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 sticky right-0 bg-slate-50 min-w-[120px]">
                      Final Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 border-r border-slate-200 sticky left-0 bg-white">
                        <div className="font-medium text-slate-900">{student.student_name}</div>
                      </td>
                      {assignments.map((assignment) => {
                        const score = getScore(assignment.id, student.student_id);
                        const display = getScoreDisplay(score, assignment);
                        
                        return (
                          <td
                            key={assignment.id}
                            className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors"
                            onClick={() => handleCellClick(assignment, student)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{display}</span>
                              {score?.is_unreleased && (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Unreleased
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 sticky right-0 bg-white">
                        <span className="text-lg font-bold text-indigo-600">
                          {calculateFinalGrade(student.student_id)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

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
    </>
  );
}
