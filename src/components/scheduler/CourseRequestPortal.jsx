import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Save, Users, RefreshCw } from "lucide-react";

export default function CourseRequestPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseGroups, setCourseGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      // Load courses
      const coursesData = await base44.entities.ScheduleCourse.list('-created_date', 1000);
      setCourses(coursesData);

      // Load course groups
      const groupsData = await base44.entities.CourseGroup.list('-order', 100);
      setCourseGroups(groupsData);

      if (user.app_role === 'admin') {
        // Use backend function to get teachers and students
        const { data, error } = await base44.functions.invoke('getAdminTeachers');

        if (error) {
          throw new Error(error.response?.data?.error || error.message);
        }

        setAllStudents(data.students || []);

        // Load all course requests
        const allRequests = await base44.entities.CourseRequest.list('-created_date', 1000);
        const studentIds = (data.students || []).map(s => s.id);
        const relevantRequests = allRequests.filter(r => 
          studentIds.includes(r.student_id)
        );
        setCourseRequests(relevantRequests);

      } else if (user.app_role === 'student') {
        // Load student's own requests
        const myRequests = await base44.entities.CourseRequest.filter({
          student_id: user.id
        });
        setCourseRequests(myRequests);
        setSelectedCourses(myRequests.map(r => r.course_id));
      }

    } catch (error) {
      console.error("Error loading course requests:", error);
      alert("Failed to load course requests: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourse = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSaveRequests = async () => {
    try {
      // Delete old requests
      for (const request of courseRequests.filter(r => r.student_id === currentUser.id)) {
        await base44.entities.CourseRequest.delete(request.id);
      }

      // Create new requests
      const currentYear = new Date().getFullYear();
      const schoolYear = `${currentYear}-${currentYear + 1}`;

      for (let i = 0; i < selectedCourses.length; i++) {
        await base44.entities.CourseRequest.create({
          student_id: currentUser.id,
          student_name: currentUser.full_name || currentUser.email,
          course_id: selectedCourses[i],
          priority: i + 1,
          status: 'pending',
          school_year: schoolYear
        });
      }

      alert('Course requests saved successfully!');
      loadData();
    } catch (error) {
      console.error("Error saving requests:", error);
      alert("Failed to save requests");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course requests...</p>
        </div>
      </div>
    );
  }

  if (currentUser?.app_role === 'admin') {
    // Admin view: Show all student requests
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Student Course Requests</h2>
            <p className="text-slate-600 mt-1">
              All course requests from students in your school
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {allStudents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Students Yet
              </h3>
              <p className="text-slate-600">
                Students will appear here once teachers create classes and students join them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allStudents.map(student => {
              const studentRequests = courseRequests.filter(r => r.student_id === student.id);
              return (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{student.full_name || student.email}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{student.email}</p>
                      </div>
                      <Badge variant="outline">
                        {studentRequests.length} courses requested
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {studentRequests.length === 0 ? (
                      <p className="text-slate-500 text-sm">No course requests yet</p>
                    ) : (
                      <div className="space-y-2">
                        {studentRequests
                          .sort((a, b) => a.priority - b.priority)
                          .map((request, index) => {
                            const course = courses.find(c => c.id === request.course_id);
                            return (
                              <div key={request.id} className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500">{index + 1}.</span>
                                <span className="font-medium">{course?.course_name || 'Unknown Course'}</span>
                                <Badge variant="outline" className="ml-auto">
                                  {request.status}
                                </Badge>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Student view: Course selection
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Course Request Portal</h2>
        <p className="text-slate-600 mt-1">
          Select courses you want to take next year
        </p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Courses Available
            </h3>
            <p className="text-slate-600">
              Your school hasn't added any courses yet. Please check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {courseGroups.length > 0 ? (
              courseGroups.map(group => {
                const groupCourses = courses.filter(c => 
                  group.courses && group.courses.includes(c.id)
                );
                
                if (groupCourses.length === 0) return null;

                return (
                  <Card key={group.id}>
                    <CardHeader>
                      <CardTitle>{group.name}</CardTitle>
                      {group.description && (
                        <p className="text-sm text-slate-600">{group.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupCourses.map(course => (
                          <div key={course.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                            <Checkbox
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => handleToggleCourse(course.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{course.course_name}</div>
                              {course.description && (
                                <p className="text-sm text-slate-600 mt-1">{course.description}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{course.term}</Badge>
                                <Badge variant="outline">{course.credits} credits</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courses.map(course => (
                      <div key={course.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                        <Checkbox
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={() => handleToggleCourse(course.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{course.course_name}</div>
                          {course.description && (
                            <p className="text-sm text-slate-600 mt-1">{course.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{course.term}</Badge>
                            <Badge variant="outline">{course.credits} credits</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveRequests} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save Course Requests ({selectedCourses.length})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}