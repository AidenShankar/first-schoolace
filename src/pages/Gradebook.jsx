import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import ScoresheetView from "../components/gradebook/ScoresheetView";
import CategoriesView from "../components/gradebook/CategoriesView";
import AnalyticsView from "../components/gradebook/AnalyticsView";
import FinalGradesView from "../components/gradebook/FinalGradesView";
import StudentGradebookView from "../components/gradebook/StudentGradebookView";
import AceTransition, { LOADING_DURATION } from "@/components/common/AceTransition";

export default function GradebookPage({ user: layoutUser, allClasses: layoutAllClasses }) {
  const [user, setUser] = useState(layoutUser);
  const [currentClass, setCurrentClass] = useState(null);
  const [allClasses, setAllClasses] = useState(layoutAllClasses || []);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    setUser(layoutUser);
    setAllClasses(layoutAllClasses || []);
  }, [layoutUser, layoutAllClasses]);

  useEffect(() => {
    const timer = setTimeout(() => {
        setPageLoading(false);
    }, LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (allClasses && allClasses.length > 0) { // Added 'allClasses &&' for safer access
      const urlParams = new URLSearchParams(window.location.search);
      const classId = urlParams.get('classId');
      
      if (classId) {
        const selectedClass = allClasses.find(c => c.id === classId);
        setCurrentClass(selectedClass || allClasses[0]);
      } else {
        setCurrentClass(allClasses[0]);
      }
      setLoading(false);
    }
  }, [allClasses]);

  const handleClassChange = (classId) => {
    const newClass = allClasses.find(c => c.id === classId);
    if (newClass) {
      setCurrentClass(newClass);
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('classId', classId);
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const syncFromDashboard = async () => {
    setSyncing(true);
    setSyncStatus({ type: 'info', message: 'Syncing assignments and grades...' });

    try {
      const dashboardAssignments = await base44.entities.Assignment.filter({ 
        class_id: currentClass.id 
      });

      const allSubmissions = await base44.entities.Submission.list();
      
      const gradebookAssignments = await base44.entities.GradebookAssignment.filter({ 
        class_id: currentClass.id 
      });

      let syncedCount = 0;
      let gradesCount = 0;

      for (const dashAssignment of dashboardAssignments) {
        let gbAssignment = gradebookAssignments.find(
          gb => gb.source_assignment_id === dashAssignment.id
        );

        if (!gbAssignment) {
          gbAssignment = await base44.entities.GradebookAssignment.create({
            class_id: currentClass.id,
            source_assignment_id: dashAssignment.id,
            name: dashAssignment.title,
            description: dashAssignment.description,
            max_points: dashAssignment.max_points || 100,
            due_date: dashAssignment.due_date,
            term: "Q1",
            weight: 1,
            publish_scores: false,
            category_id: null // No category assigned initially
          });
          syncedCount++;
        }

        const assignmentSubmissions = allSubmissions.filter(
          s => s.assignment_id === dashAssignment.id && s.is_released
        );

        for (const submission of assignmentSubmissions) {
          const existingScore = await base44.entities.GradebookScore.filter({
            assignment_id: gbAssignment.id,
            student_id: submission.student_id
          });

          const finalGrade = submission.teacher_grade !== null && submission.teacher_grade !== undefined
            ? submission.teacher_grade
            : submission.ai_grade;

          // Mark as unreleased if assignment has no category
          const isUnreleased = !gbAssignment.category_id;

          if (existingScore.length === 0 && finalGrade !== null && finalGrade !== undefined) {
            await base44.entities.GradebookScore.create({
              assignment_id: gbAssignment.id,
              student_id: submission.student_id,
              student_name: submission.student_name,
              points_earned: finalGrade,
              special_code: "",
              is_late: false,
              is_missing: false,
              is_unreleased: isUnreleased,
              comment: submission.final_feedback || "",
              scored_date: submission.released_at || new Date().toISOString()
            });
            gradesCount++;
          }
        }
      }

      setSyncStatus({ 
        type: 'success', 
        message: `✅ Synced ${syncedCount} assignments and ${gradesCount} grades!` 
      });
      
      setTimeout(() => setSyncStatus(null), 5000);
      
    } catch (error) {
      console.error("Error syncing:", error);
      setSyncStatus({ 
        type: 'error', 
        message: `❌ Sync failed: ${error.message}` 
      });
    } finally {
      setSyncing(false);
    }
  };

  if (pageLoading || loading || !user || !currentClass) {
    return <AceTransition />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gradebook</h1>
                <p className="text-sm text-slate-600 mt-1">{currentClass.name}</p>
              </div>
              
              {/* Class Selector */}
              {allClasses.length > 1 && (
                <Select value={currentClass.id} onValueChange={handleClassChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {allClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {user.app_role === 'teacher' && (
              <div className="flex items-center gap-3">
                {syncStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm px-4 py-2 rounded-lg ${
                      syncStatus.type === 'success' ? 'bg-green-50 text-green-700' :
                      syncStatus.type === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {syncStatus.message}
                  </motion.div>
                )}
                <Button
                  onClick={syncFromDashboard}
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync from Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {user.app_role === 'teacher' ? (
          <Tabs defaultValue="scoresheet" className="space-y-6">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="scoresheet">Scoresheet</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="final-grades">Final Grades</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="scoresheet" className="mt-0">
              <ScoresheetView currentClass={currentClass} user={user} />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesView currentClass={currentClass} />
            </TabsContent>

            <TabsContent value="final-grades">
              <FinalGradesView currentClass={currentClass} />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsView currentClass={currentClass} />
            </TabsContent>
          </Tabs>
        ) : (
          <StudentGradebookView currentClass={currentClass} user={user} />
        )}
      </div>
    </div>
  );
}