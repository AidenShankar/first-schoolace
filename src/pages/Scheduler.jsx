import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Building, Copy, CheckCircle } from "lucide-react";

import CourseRequestPortal from "../components/scheduler/CourseRequestPortal";
import CourseCatalog from "../components/scheduler/CourseCatalog";
import TeacherSetup from "../components/scheduler/TeacherSetup";
import RoomSetup from "../components/scheduler/RoomSetup";
import ConstraintsManager from "../components/scheduler/ConstraintsManager";
import SchedulingSetup from "../components/scheduler/SchedulingSetup";
import ScheduleBuilder from "../components/scheduler/ScheduleBuilder";
import VisualScheduler from "../components/scheduler/VisualScheduler";
import SchedulerReports from "../components/scheduler/SchedulerReports";
import ScenarioManager from "../components/scheduler/ScenarioManager";

export default function Scheduler({ user: layoutUser }) {
  const [user, setUser] = useState(layoutUser);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Redirect if not admin
      if (userData.app_role !== 'admin') {
        window.location.href = '/Dashboard';
        return;
      }
      
      // Load active scenario - get all scenarios and find active one
      const allScenarios = await base44.entities.SchedulingScenario.list(1000);
      const activeOne = allScenarios.find(s => s.is_active === true);
      if (activeOne) {
        setActiveScenario(activeOne);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Failed to load user data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = async (scenario) => {
    setActiveScenario(scenario);
  };

  const handleCopyCode = () => {
    if (user?.admin_code) {
      navigator.clipboard.writeText(user.admin_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.app_role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">Only school administrators can access the scheduler.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {user.school_name || 'School'} Scheduler
              </h1>
              <p className="text-slate-600">Master schedule builder and management</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-2">Admin Code (for teachers to join):</p>
              <div className="flex items-center gap-2">
                <code className="bg-indigo-100 text-indigo-900 px-4 py-2 rounded-lg font-mono text-lg font-bold">
                  {user.admin_code}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1 rounded-lg">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="requests">Student Requests</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="constraints">Constraints</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="visual">Visual Scheduler</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <ScenarioManager 
              adminId={user.id} 
              onScenarioChange={handleScenarioChange}
              activeScenario={activeScenario}
            />
          </TabsContent>

          <TabsContent value="requests">
            <CourseRequestPortal adminId={user.id} />
          </TabsContent>

          <TabsContent value="courses">
            <CourseCatalog adminId={user.id} />
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherSetup adminId={user.id} />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomSetup adminId={user.id} />
          </TabsContent>

          <TabsContent value="constraints">
            <ConstraintsManager adminId={user.id} />
          </TabsContent>

          <TabsContent value="setup">
            <SchedulingSetup adminId={user.id} />
          </TabsContent>

          <TabsContent value="build">
            <ScheduleBuilder activeScenario={activeScenario} adminId={user.id} />
          </TabsContent>

          <TabsContent value="visual">
            <VisualScheduler scenario={activeScenario} adminId={user.id} />
          </TabsContent>

          <TabsContent value="reports">
            <SchedulerReports scenario={activeScenario} adminId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}