
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Lock,
  UserCheck,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleBuilder() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [building, setBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await base44.entities.SchedulingScenario.list();
      setScenarios(data);
      const active = data.find(s => s.is_active);
      if (active) setSelectedScenario(active);
    } catch (error) {
      console.error("Error loading scenarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuildSchedule = async (validateOnly = false) => {
    if (!selectedScenario) {
      alert("Please select a scenario");
      return;
    }

    setBuilding(true);
    setBuildStatus({ stage: "Initializing", progress: 0 });

    try {
      // Update scenario status
      await base44.entities.SchedulingScenario.update(selectedScenario.id, {
        status: "building",
        build_started_at: new Date().toISOString()
      });

      setBuildStatus({ stage: "Loading data", progress: 20 });

      // Call the build function
      const { data, error } = await base44.functions.invoke('buildMasterSchedule', {
        scenario_id: selectedScenario.id,
        school_year: selectedScenario.school_year,
        validate_only: validateOnly
      });

      if (error) {
        throw new Error(error.response?.data?.error || error.message);
      }

      setBuildStatus({ stage: "Finalizing", progress: 90 });

      // Update scenario with results
      await base44.entities.SchedulingScenario.update(selectedScenario.id, {
        status: data.success ? "built" : "setup",
        build_completed_at: new Date().toISOString(),
        total_conflicts: data.conflicts || 0,
        requests_satisfied_percent: data.satisfaction_rate || 0
      });

      setBuildStatus({
        stage: "Complete",
        progress: 100,
        success: data.success,
        summary: {
          sectionsCreated: data.sections_created || 0,
          conflicts: data.conflicts || 0,
          satisfactionRate: data.satisfaction_rate || 0
        }
      });

      // Reload scenarios to get updated data
      await loadScenarios();

    } catch (error) {
      console.error("Build error:", error);
      setBuildStatus({
        stage: "Error",
        progress: 0,
        success: false,
        error: error.message
      });
      
      // Reset scenario status
      if (selectedScenario) {
        await base44.entities.SchedulingScenario.update(selectedScenario.id, {
          status: "setup"
        });
      }
    } finally {
      setBuilding(false);
    }
  };

  const handleLoadStudents = async () => {
    if (!selectedScenario || selectedScenario.status !== "built") {
      alert("Please build the schedule first");
      return;
    }

    setLoadingStudents(true);
    try {
      // Get all sections and course requests
      const [sections, requests] = await Promise.all([
        base44.entities.ScheduleSection.filter({ 
          scenario_id: selectedScenario.id,
          school_year: selectedScenario.school_year 
        }),
        base44.entities.CourseRequest.filter({ 
          school_year: selectedScenario.school_year,
          status: "approved"
        })
      ]);

      // Group requests by student
      const studentRequests = {};
      requests.forEach(req => {
        if (!studentRequests[req.student_id]) {
          studentRequests[req.student_id] = [];
        }
        studentRequests[req.student_id].push(req);
      });

      // Assign students to sections
      let totalAssignments = 0;
      for (const [studentId, reqs] of Object.entries(studentRequests)) {
        for (const request of reqs) {
          // Find a section for this course with available space
          const availableSections = sections.filter(s => 
            s.course_id === request.course_id &&
            (s.enrolled_count || 0) < s.capacity
          );

          if (availableSections.length > 0) {
            // Pick the section with the most available space
            const bestSection = availableSections.sort((a, b) => 
              (a.enrolled_count || 0) - (b.enrolled_count || 0)
            )[0];

            // Create student schedule record
            await base44.entities.StudentSchedule.create({
              student_id: studentId,
              student_name: request.student_name,
              section_id: bestSection.id,
              course_id: request.course_id,
              school_year: selectedScenario.school_year,
              term: request.term || "Full Year"
            });

            // Update section enrollment count
            await base44.entities.ScheduleSection.update(bestSection.id, {
              enrolled_count: (bestSection.enrolled_count || 0) + 1
            });

            totalAssignments++;
          }
        }
      }

      alert(`Successfully loaded ${totalAssignments} student assignments!`);
      
    } catch (error) {
      console.error("Error loading students:", error);
      alert("Failed to load students. Please try again.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCommit = async () => {
    if (!selectedScenario || selectedScenario.status !== "built") {
      alert("Please build and review the schedule first");
      return;
    }

    if (!confirm("Are you sure you want to commit this schedule? This action cannot be undone.")) {
      return;
    }

    setCommitting(true);
    try {
      // Update scenario status to committed
      await base44.entities.SchedulingScenario.update(selectedScenario.id, {
        status: "committed"
      });

      alert("Schedule committed successfully! The schedule is now locked and official.");
      await loadScenarios();
      
    } catch (error) {
      console.error("Error committing schedule:", error);
      alert("Failed to commit schedule. Please try again.");
    } finally {
      setCommitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Build Master Schedule</h2>
        <p className="text-slate-600">Generate and optimize the school's master schedule</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Active Scenario</Label>
            <Select 
              value={selectedScenario?.id || ""} 
              onValueChange={(id) => setSelectedScenario(scenarios.find(s => s.id === id))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a scenario" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name} ({scenario.school_year}) - {scenario.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedScenario && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge className="mt-1">{selectedScenario.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Conflicts</p>
                <p className="text-lg font-semibold text-slate-900">{selectedScenario.total_conflicts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Satisfaction Rate</p>
                <p className="text-lg font-semibold text-slate-900">{selectedScenario.requests_satisfied_percent || 0}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Build Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleBuildSchedule(true)}
              disabled={building || !selectedScenario || selectedScenario.status === "committed"}
              variant="outline"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Validate Only
            </Button>
            
            <Button
              onClick={() => handleBuildSchedule(false)}
              disabled={building || !selectedScenario || selectedScenario.status === "committed"}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {building ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" />Build Schedule</>
              )}
            </Button>

            <Button
              onClick={handleLoadStudents}
              disabled={loadingStudents || !selectedScenario || selectedScenario.status !== "built"}
              variant="outline"
            >
              {loadingStudents ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
              ) : (
                <><UserCheck className="w-4 h-4 mr-2" />Load Students</>
              )}
            </Button>

            <Button
              onClick={handleCommit}
              disabled={committing || !selectedScenario || selectedScenario.status !== "built"}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              {committing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Committing...</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" />Commit Schedule</>
              )}
            </Button>
          </div>

          {selectedScenario?.status === "committed" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Lock className="w-5 h-5" />
                <p className="font-semibold">This schedule has been committed and is locked.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {buildStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={buildStatus.success === false ? "border-red-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {buildStatus.success === true && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {buildStatus.success === false && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {buildStatus.success === undefined && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
                  Build Status: {buildStatus.stage}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={buildStatus.progress} className="h-2" />
                
                {buildStatus.summary && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-600">Sections Created</p>
                      <p className="text-2xl font-bold text-slate-900">{buildStatus.summary.sectionsCreated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Conflicts</p>
                      <p className={`text-2xl font-bold ${buildStatus.summary.conflicts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {buildStatus.summary.conflicts}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Satisfaction Rate</p>
                      <p className="text-2xl font-bold text-slate-900">{buildStatus.summary.satisfactionRate}%</p>
                    </div>
                  </div>
                )}

                {buildStatus.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-900">{buildStatus.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
