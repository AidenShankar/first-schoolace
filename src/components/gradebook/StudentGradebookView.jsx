
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Calendar, Award } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function StudentGradebookView({ currentClass, user }) {
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClass?.id && user?.id) {
      loadStudentData();
    }
  }, [currentClass, user]);

  const loadStudentData = async () => {
    try {
      console.log("Loading student data for:", user.id, "in class:", currentClass.id);
      
      const [assignmentsData, categoriesData] = await Promise.all([
        base44.entities.GradebookAssignment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookCategory.filter({ class_id: currentClass.id })
      ]);

      console.log("Loaded assignments:", assignmentsData);
      console.log("Loaded categories:", categoriesData);

      // Load ALL scores first, then filter
      const allScores = await base44.entities.GradebookScore.list();
      console.log("All scores:", allScores);
      
      // Filter for this student's scores
      const studentScores = allScores.filter(s => s.student_id === user.id);
      console.log("Student scores:", studentScores);

      setAssignments(assignmentsData);
      setCategories(categoriesData);
      setScores(studentScores);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScore = (assignmentId) => {
    const score = scores.find(s => s.assignment_id === assignmentId);
    console.log(`Getting score for assignment ${assignmentId}:`, score);
    return score;
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

  const getScoreDisplay = (score, assignment) => {
    if (!score) return "Ungraded";
    if (score.special_code) return score.special_code;
    if (score.points_earned !== null && score.points_earned !== undefined) {
      return `${score.points_earned}/${assignment.max_points}`;
    }
    return "Ungraded";
  };

  const getScoreColor = (score, assignment) => {
    if (!score || score.special_code) return "text-slate-600";
    if (score.points_earned === null || score.points_earned === undefined) return "text-slate-600";
    
    const percentage = (score.points_earned / assignment.max_points) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateOverallGrade = () => {
    const useWeighting = currentClass?.use_category_weighting ?? true;

    // Helper function for simple points-based average calculation
    const getSimpleAverage = () => {
      let totalPoints = 0;
      let earnedPoints = 0;

      assignments.forEach(assignment => {
        // Always respect exclude_from_final in simple average calculation
        if (assignment.exclude_from_final) return;
        
        const score = getScore(assignment.id);
        // Only include scores that are graded, not special codes, and not unreleased
        if (score && !score.special_code && !score.is_unreleased && score.points_earned !== null && score.points_earned !== undefined) {
          totalPoints += assignment.max_points;
          earnedPoints += score.points_earned;
        }
      });

      return totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : "N/A";
    };

    // If weighting is explicitly disabled for the class, use simple points-based calculation
    if (!useWeighting) {
      return getSimpleAverage();
    }

    // If weighting is enabled, proceed with category filtering for weighted calculation
    // CRITICAL: Filter out zero-weight categories
    const validCategories = categories.filter(cat => cat.weight > 0);
    
    // If there are no valid categories to weight (either no categories defined or all have zero weight),
    // fall back to a simple points-based average.
    if (validCategories.length === 0) {
      return getSimpleAverage();
    }

    // Otherwise, perform the weighted calculation by categories
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
      if (categoryAssignments.length === 0) return;

      const percentageScores = [];
      
      categoryAssignments.forEach(assignment => {
        if (assignment.exclude_from_final) return;
        
        const score = getScore(assignment.id);
        // Skip unreleased scores, special codes
        if (!score || score.special_code || score.is_unreleased) return;
        
        if (score.points_earned !== null && score.points_earned !== undefined && assignment.max_points > 0) {
          const percentage = score.points_earned / assignment.max_points;
          percentageScores.push(percentage);
        }
      });

      if (percentageScores.length === 0) { // If no eligible scores in this category, skip it.
        return; 
      }

      let categoryAverage = percentageScores.reduce((a, b) => a + b, 0) / percentageScores.length;
      
      // Apply drop lowest if specified
      if (category.drop_lowest > 0 && percentageScores.length > category.drop_lowest) {
        const sortedPercentages = [...percentageScores].sort((a, b) => a - b);
        const kept = sortedPercentages.slice(category.drop_lowest);
        
        if (kept.length > 0) {
          categoryAverage = kept.reduce((a, b) => a + b, 0) / kept.length;
        } else {
          // All scores were dropped, this category effectively contributes 0
          return;
        }
      }
      
      categoriesWithGrades.push({
        weight: category.weight,
        average: categoryAverage
      });
    });

    if (categoriesWithGrades.length === 0) {
      // If after processing, no categories ended up with grades, fall back to N/A
      // This should ideally be caught by validCategories.length === 0, but as a safeguard.
      return "N/A";
    } else if (categoriesWithGrades.length === 1) {
      // Only one category - use its average directly
      return (categoriesWithGrades[0].average * 100).toFixed(1);
    } else {
      // Multiple categories - apply proportional weighting
      const totalWeightWithGrades = categoriesWithGrades.reduce((sum, cat) => sum + cat.weight, 0);
      
      let finalGrade = 0;
      // Only calculate if there's a total weight to avoid division by zero
      if (totalWeightWithGrades > 0) {
        categoriesWithGrades.forEach(category => {
          const proportionalWeight = category.weight / totalWeightWithGrades;
          finalGrade += category.average * proportionalWeight;
        });
      }
      
      return (finalGrade * 100).toFixed(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const overallGrade = calculateOverallGrade();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Grades</h2>
          <p className="text-sm text-slate-600 mt-1">
            {currentClass.name}
          </p>
        </div>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{overallGrade}%</div>
            <div className="text-sm text-slate-600 mt-1">Overall Grade</div>
          </div>
        </Card>
      </div>

      {assignments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments yet</h3>
          <p className="text-sm text-slate-600">Your teacher hasn't added any assignments to the gradebook</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const score = getScore(assignment.id);
            const scoreDisplay = getScoreDisplay(score, assignment);
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
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
                      {score?.is_unreleased && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Not Yet Released
                        </span>
                      )}
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
                    </div>
                  </div>

                  <div className="text-right">
                    {!score?.is_unreleased ? (
                      <>
                        <div className={`text-2xl font-bold ${getScoreColor(score, assignment)}`}>
                          {scoreDisplay}
                        </div>
                        {score && !score.special_code && score.points_earned !== null && (
                          <div className="text-sm text-slate-600 mt-1">
                            {((score.points_earned / assignment.max_points) * 100).toFixed(1)}%
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-slate-500 text-sm">
                        Grade pending
                      </div>
                    )}
                  </div>
                </div>

                {score?.comment && !score?.is_unreleased && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Teacher Comment:</span> {score.comment}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
