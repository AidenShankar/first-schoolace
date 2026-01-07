import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react";

export default function ConstraintsManager() {
  const [teacherConstraints, setTeacherConstraints] = useState([]);
  const [courseConstraints, setCourseConstraints] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  
  const currentYear = new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
  
  const [teacherForm, setTeacherForm] = useState({
    teacher_id: "",
    period_id: "",
    constraint_type: "unavailable",
    reason: "",
    school_year: currentYear
  });
  
  const [courseForm, setCourseForm] = useState({
    course_id: "",
    constraint_type: "requires_lab",
    required_room_id: "",
    required_facility: "",
    priority: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (user.app_role !== 'admin') {
        setError('Only admins can manage constraints');
        setLoading(false);
        return;
      }

      // Load all data in parallel
      const [
        teachersResult,
        coursesData,
        periodsData,
        roomsData,
        teacherConstraintsData,
        courseConstraintsData
      ] = await Promise.allSettled([
        base44.functions.invoke('getAdminTeachers'),
        base44.entities.ScheduleCourse.list(1000),
        base44.entities.SchedulePeriod.list(100),
        base44.entities.ScheduleRoom.list(1000),
        base44.entities.TeacherConstraint.list(1000),
        base44.entities.CourseConstraint.list(1000)
      ]);

      // Handle teachers
      if (teachersResult.status === 'fulfilled') {
        const teacherData = teachersResult.value;
        if (teacherData?.data?.teachers) {
          setTeachers(teacherData.data.teachers);
        } else if (Array.isArray(teacherData)) {
          setTeachers(teacherData);
        } else {
          console.error("Unexpected teacher data format:", teacherData);
          setTeachers([]);
        }
      } else {
        console.error("Failed to load teachers:", teachersResult.reason);
        setTeachers([]);
      }

      // Handle other data
      setCourses(coursesData.status === 'fulfilled' ? coursesData.value : []);
      setPeriods(periodsData.status === 'fulfilled' ? periodsData.value : []);
      setRooms(roomsData.status === 'fulfilled' ? roomsData.value : []);
      setTeacherConstraints(teacherConstraintsData.status === 'fulfilled' ? teacherConstraintsData.value : []);
      setCourseConstraints(courseConstraintsData.status === 'fulfilled' ? courseConstraintsData.value : []);

    } catch (error) {
      console.error("Error loading constraints:", error);
      setError("Failed to load data: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacherConstraint = async () => {
    if (!teacherForm.teacher_id || !teacherForm.period_id) {
      alert("Please select a teacher and period");
      return;
    }

    setSaving(true);
    try {
      const teacher = teachers.find(t => t.id === teacherForm.teacher_id);
      const newConstraint = {
        teacher_id: teacherForm.teacher_id,
        period_id: teacherForm.period_id,
        constraint_type: teacherForm.constraint_type,
        reason: teacherForm.reason || "",
        school_year: teacherForm.school_year,
        teacher_name: teacher?.full_name || teacher?.email || 'Unknown'
      };

      const created = await base44.entities.TeacherConstraint.create(newConstraint);
      
      // Immediately update local state with the new constraint
      setTeacherConstraints(prev => [...prev, created]);
      
      // Reset form
      setTeacherForm({
        teacher_id: "",
        period_id: "",
        constraint_type: "unavailable",
        reason: "",
        school_year: currentYear
      });
      
      alert("Teacher constraint added successfully!");
    } catch (error) {
      console.error("Error adding teacher constraint:", error);
      alert("Failed to add constraint: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddCourseConstraint = async () => {
    if (!courseForm.course_id) {
      alert("Please select a course");
      return;
    }

    setSaving(true);
    try {
      const newConstraint = {
        course_id: courseForm.course_id,
        constraint_type: courseForm.constraint_type,
        required_room_id: courseForm.required_room_id || null,
        required_facility: courseForm.required_facility || "",
        priority: parseInt(courseForm.priority) || 1
      };

      const created = await base44.entities.CourseConstraint.create(newConstraint);
      
      // Immediately update local state
      setCourseConstraints(prev => [...prev, created]);
      
      // Reset form
      setCourseForm({
        course_id: "",
        constraint_type: "requires_lab",
        required_room_id: "",
        required_facility: "",
        priority: 1
      });
      
      alert("Course constraint added successfully!");
    } catch (error) {
      console.error("Error adding course constraint:", error);
      alert("Failed to add constraint: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeacherConstraint = async (id) => {
    if (!confirm("Delete this teacher constraint?")) {
      return;
    }

    try {
      await base44.entities.TeacherConstraint.delete(id);
      
      // Immediately update local state
      setTeacherConstraints(prev => prev.filter(c => c.id !== id));
      
      alert("Constraint deleted successfully!");
    } catch (error) {
      console.error("Error deleting constraint:", error);
      alert("Failed to delete constraint: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteCourseConstraint = async (id) => {
    if (!confirm("Delete this course constraint?")) {
      return;
    }

    try {
      await base44.entities.CourseConstraint.delete(id);
      
      // Immediately update local state
      setCourseConstraints(prev => prev.filter(c => c.id !== id));
      
      alert("Constraint deleted successfully!");
    } catch (error) {
      console.error("Error deleting constraint:", error);
      alert("Failed to delete constraint: " + (error.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading constraints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.app_role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">Only admins can manage constraints</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scheduling Constraints</h2>
          <p className="text-slate-600 mt-1">
            Define teacher availability and course requirements
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="teacher" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teacher">Teacher Constraints</TabsTrigger>
          <TabsTrigger value="course">Course Constraints</TabsTrigger>
        </TabsList>

        <TabsContent value="teacher" className="space-y-6">
          {/* Add Teacher Constraint Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Teacher Constraint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Select
                    value={teacherForm.teacher_id}
                    onValueChange={(value) => setTeacherForm({...teacherForm, teacher_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500">No teachers found</div>
                      ) : (
                        teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.full_name || teacher.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={teacherForm.period_id}
                    onValueChange={(value) => setTeacherForm({...teacherForm, period_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500">No periods defined</div>
                      ) : (
                        periods.map(period => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.period_name} ({period.start_time} - {period.end_time})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Constraint Type</Label>
                  <Select
                    value={teacherForm.constraint_type}
                    onValueChange={(value) => setTeacherForm({...teacherForm, constraint_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                      <SelectItem value="preferred">Preferred</SelectItem>
                      <SelectItem value="lunch_free">Lunch Free</SelectItem>
                      <SelectItem value="planning_period">Planning Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason (Optional)</Label>
                  <Input
                    value={teacherForm.reason}
                    onChange={(e) => setTeacherForm({...teacherForm, reason: e.target.value})}
                    placeholder="e.g., Meeting"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddTeacherConstraint} 
                className="w-full"
                disabled={saving || !teacherForm.teacher_id || !teacherForm.period_id}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Teacher Constraint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Constraints List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Teacher Constraints ({teacherConstraints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {teacherConstraints.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No teacher constraints defined</p>
              ) : (
                <div className="space-y-2">
                  {teacherConstraints.map(constraint => {
                    const teacher = teachers.find(t => t.id === constraint.teacher_id);
                    const period = periods.find(p => p.id === constraint.period_id);
                    
                    return (
                      <div key={constraint.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {constraint.teacher_name || teacher?.full_name || teacher?.email || 'Unknown Teacher'}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            {period?.period_name || 'Unknown Period'} - {constraint.constraint_type.replace('_', ' ')}
                            {constraint.reason && <span className="ml-2 text-slate-500">({constraint.reason})</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeacherConstraint(constraint.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="course" className="space-y-6">
          {/* Add Course Constraint Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Course Constraint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select
                    value={courseForm.course_id}
                    onValueChange={(value) => setCourseForm({...courseForm, course_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500">No courses found</div>
                      ) : (
                        courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.course_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Constraint Type</Label>
                  <Select
                    value={courseForm.constraint_type}
                    onValueChange={(value) => setCourseForm({...courseForm, constraint_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requires_lab">Requires Lab</SelectItem>
                      <SelectItem value="requires_gym">Requires Gym</SelectItem>
                      <SelectItem value="requires_specific_room">Requires Specific Room</SelectItem>
                      <SelectItem value="department_only">Department Only</SelectItem>
                      <SelectItem value="consecutive_periods">Consecutive Periods</SelectItem>
                      <SelectItem value="avoid_first_period">Avoid First Period</SelectItem>
                      <SelectItem value="avoid_last_period">Avoid Last Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {courseForm.constraint_type === 'requires_specific_room' && (
                  <div className="space-y-2">
                    <Label>Required Room</Label>
                    <Select
                      value={courseForm.required_room_id}
                      onValueChange={(value) => setCourseForm({...courseForm, required_room_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.room_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Priority (1=Highest)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={courseForm.priority}
                    onChange={(e) => setCourseForm({...courseForm, priority: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddCourseConstraint} 
                className="w-full"
                disabled={saving || !courseForm.course_id}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course Constraint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Course Constraints List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Course Constraints ({courseConstraints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {courseConstraints.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No course constraints defined</p>
              ) : (
                <div className="space-y-2">
                  {courseConstraints.map(constraint => {
                    const course = courses.find(c => c.id === constraint.course_id);
                    
                    return (
                      <div key={constraint.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {course?.course_name || 'Unknown Course'}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            {constraint.constraint_type.replace(/_/g, ' ')}
                            <Badge variant="outline" className="ml-2">Priority: {constraint.priority}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourseConstraint(constraint.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}