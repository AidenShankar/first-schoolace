import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, RefreshCw, FileText, TrendingUp, Users } from "lucide-react";

export default function SchedulerReports() {
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState(null);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();

      // Load scenarios
      const scenarios = await base44.entities.SchedulingScenario.list('-created_date', 100);
      const active = scenarios.find(s => s.is_active);
      setActiveScenario(active);

      if (!active) {
        setLoading(false);
        return;
      }

      // Load data for reports
      const [sectionsData, coursesData, requestsData] = await Promise.all([
        base44.entities.ScheduleSection.filter({ scenario_id: active.id }),
        base44.entities.ScheduleCourse.list('-created_date', 1000),
        base44.entities.CourseRequest.list('-created_date', 1000)
      ]);

      setSections(sectionsData);
      setCourses(coursesData);
      setCourseRequests(requestsData);

      // Get teachers and students if admin
      if (user.app_role === 'admin') {
        const { data, error } = await base44.functions.invoke('getAdminTeachers');
        if (!error) {
          setTeachers(data.teachers || []);
          setStudents(data.students || []);
        }
      }

    } catch (error) {
      console.error("Error loading reports:", error);
      alert("Failed to load reports: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!activeScenario) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Active Scenario
          </h3>
          <p className="text-slate-600">
            Create and activate a scenario in the Setup tab to view reports.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalSections = sections.length;
  const conflictingSections = sections.filter(s => 
    s.has_teacher_conflict || s.has_room_conflict || s.is_over_capacity
  ).length;
  const totalRequests = courseRequests.length;
  const satisfiedRequests = courseRequests.filter(r => r.status === 'scheduled').length;
  const satisfactionRate = totalRequests > 0 ? Math.round((satisfiedRequests / totalRequests) * 100) : 0;

  // Course enrollment data for chart
  const courseEnrollmentData = courses.slice(0, 10).map(course => {
    const courseSections = sections.filter(s => s.course_id === course.id);
    const totalEnrollment = courseSections.reduce((sum, s) => sum + (s.enrolled_count || 0), 0);
    
    return {
      name: course.course_name.substring(0, 20),
      enrolled: totalEnrollment,
      capacity: courseSections.reduce((sum, s) => sum + (s.capacity || 25), 0)
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scheduling Reports</h2>
          <p className="text-slate-600 mt-1">
            Scenario: <strong>{activeScenario.name}</strong>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Sections</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalSections}</p>
              </div>
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conflicts</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{conflictingSections}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Satisfaction Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{satisfactionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment" className="w-full">
        <TabsList>
          <TabsTrigger value="enrollment">Course Enrollment</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="requests">Student Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollment vs Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseEnrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" fill="#4f46e5" name="Enrolled" />
                  <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflicts Summary ({conflictingSections} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {conflictingSections === 0 ? (
                <p className="text-center text-slate-600 py-8">No conflicts found! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {sections
                    .filter(s => s.has_teacher_conflict || s.has_room_conflict || s.is_over_capacity)
                    .map(section => (
                      <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Section {section.section_number}</div>
                          <div className="text-sm text-slate-600">{section.teacher_name}</div>
                        </div>
                        <div className="flex gap-2">
                          {section.has_teacher_conflict && (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              Teacher
                            </Badge>
                          )}
                          {section.has_room_conflict && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              Room
                            </Badge>
                          )}
                          {section.is_over_capacity && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Capacity
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Request Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900">{totalRequests}</p>
                      <p className="text-sm text-slate-600">Total Requests</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{satisfiedRequests}</p>
                      <p className="text-sm text-slate-600">Satisfied</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{totalRequests - satisfiedRequests}</p>
                      <p className="text-sm text-slate-600">Unsatisfied</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}