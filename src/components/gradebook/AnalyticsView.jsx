
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsView({ currentClass }) {
  const [analytics, setAnalytics] = useState({
    classAverage: 0,
    median: 0,
    highestGrade: 0,
    lowestGrade: 0,
    passingRate: 0,
    missingAssignments: 0,
    categoryBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClass?.id) {
      calculateAnalytics();
    }
  }, [currentClass]);

  const calculateAnalytics = async () => {
    try {
      // Load all necessary data
      const [assignments, scores, students, categories] = await Promise.all([
        base44.entities.GradebookAssignment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookScore.list(),
        base44.entities.ClassEnrollment.filter({ class_id: currentClass.id }),
        base44.entities.GradebookCategory.filter({ class_id: currentClass.id })
      ]);

      // Filter scores for this class's assignments
      const assignmentIds = assignments.map(a => a.id);
      const relevantScores = scores.filter(s => assignmentIds.includes(s.assignment_id));

      // Calculate student averages
      const studentAverages = students.map(student => {
        const studentScores = relevantScores.filter(s => s.student_id === student.student_id);
        const validScores = studentScores.filter(s => 
          s.points_earned !== null && 
          s.points_earned !== undefined && 
          !s.special_code
        );

        if (validScores.length === 0) return null;

        let totalPoints = 0;
        let totalPossible = 0;

        for (const score of validScores) {
          const assignment = assignments.find(a => a.id === score.assignment_id);
          if (assignment && !assignment.exclude_from_final) {
            totalPoints += score.points_earned * (assignment.weight || 1);
            totalPossible += assignment.max_points * (assignment.weight || 1);
          }
        }

        return totalPossible > 0 ? (totalPoints / totalPossible) * 100 : null;
      }).filter(avg => avg !== null);

      // Calculate statistics
      const classAverage = studentAverages.length > 0
        ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
        : 0;

      const sortedAverages = [...studentAverages].sort((a, b) => a - b);
      const median = sortedAverages.length > 0
        ? sortedAverages[Math.floor(sortedAverages.length / 2)]
        : 0;

      const highestGrade = studentAverages.length > 0 ? Math.max(...studentAverages) : 0;
      const lowestGrade = studentAverages.length > 0 ? Math.min(...studentAverages) : 0;
      const passingRate = studentAverages.length > 0
        ? (studentAverages.filter(avg => avg >= 60).length / studentAverages.length) * 100
        : 0;

      // Count missing assignments
      const missingAssignments = relevantScores.filter(s => 
        s.special_code === 'MIS' || s.is_missing
      ).length;

      // Category breakdown
      const categoryBreakdown = categories.map(category => {
        const categoryAssignments = assignments.filter(a => a.category_id === category.id);
        const categoryScores = relevantScores.filter(s => 
          categoryAssignments.some(a => a.id === s.assignment_id)
        );

        const validScores = categoryScores.filter(s => 
          s.points_earned !== null && !s.special_code
        );

        if (validScores.length === 0) {
          return { name: category.name, average: 0, color: category.color };
        }

        let totalPoints = 0;
        let totalPossible = 0;

        for (const score of validScores) {
          const assignment = categoryAssignments.find(a => a.id === score.assignment_id);
          if (assignment) {
            totalPoints += score.points_earned;
            totalPossible += assignment.max_points;
          }
        }

        const average = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0;

        return {
          name: category.name,
          average: average.toFixed(1),
          color: category.color
        };
      });

      setAnalytics({
        classAverage: classAverage.toFixed(1),
        median: median.toFixed(1),
        highestGrade: highestGrade.toFixed(1),
        lowestGrade: lowestGrade.toFixed(1),
        passingRate: passingRate.toFixed(1),
        missingAssignments,
        categoryBreakdown
      });
    } catch (error) {
      console.error("Error calculating analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Class Analytics</h2>
        <p className="text-slate-600 mt-1">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="text-3xl font-bold text-slate-900">{analytics.classAverage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Median Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-3xl font-bold text-slate-900">{analytics.median}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Passing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-3xl font-bold text-slate-900">{analytics.passingRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Missing Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-3xl font-bold text-slate-900">{analytics.missingAssignments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{analytics.highestGrade}%</div>
              <div className="text-sm text-slate-600 mt-1">Highest Grade</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">{analytics.lowestGrade}%</div>
              <div className="text-sm text-slate-600 mt-1">Lowest Grade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics.categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">{category.name}</span>
                    <span className="text-sm font-bold text-slate-900">{category.average}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${category.average}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
