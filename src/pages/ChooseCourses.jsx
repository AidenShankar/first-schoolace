import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle, Loader2, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChooseCourses() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [gradeRequirements, setGradeRequirements] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [currentSchoolYear, setCurrentSchoolYear] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const userData = await base44.auth.me();
      
      if (!userData) {
        window.location.href = '/';
        return;
      }

      if (userData.app_role !== 'student') {
        setError('Only students can access course requests.');
        setLoading(false);
        return;
      }

      setUser(userData);

      // Generate current school year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const schoolYear = month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      setCurrentSchoolYear(schoolYear);

      // Get student's enrollments
      const enrollments = await base44.entities.ClassEnrollment.filter({ 
        student_id: userData.id 
      });

      if (enrollments.length === 0) {
        setError('You are not enrolled in any classes yet. Please join a class first.');
        setLoading(false);
        return;
      }

      // Get all classes the student is enrolled in
      const classIds = enrollments.map(e => e.class_id);
      const allClasses = await base44.entities.Class.list(1000);
      const studentClasses = allClasses.filter(c => classIds.includes(c.id));

      // Get unique teacher IDs
      const teacherIds = [...new Set(studentClasses.map(c => c.teacher_id))];

      // Get teacher user records to find their admin_id
      const allUsers = await base44.entities.User.list(1000);
      const teacherUsers = allUsers.filter(u => teacherIds.includes(u.id));

      // Find admins (teachers who have admin_id set)
      const adminIds = [...new Set(
        teacherUsers
          .filter(t => t.admin_id)
          .map(t => t.admin_id)
      )];

      if (adminIds.length === 0) {
        setError('None of your teachers are connected to a school admin yet. Course requests are not available at this time.');
        setLoading(false);
        return;
      }

      // For simplicity, use the first admin if multiple exist
      const primaryAdminId = adminIds[0];
      setAdminId(primaryAdminId);

      // Load courses from this admin's catalog
      const allCourses = await base44.entities.ScheduleCourse.list(1000);
      const adminCourses = allCourses.filter(course => {
        // Courses don't have admin_id, so we need to check if they were created by the admin
        // For now, we'll show all courses and let the admin manage their catalog
        return true;
      });

      setAvailableCourses(adminCourses);

      // Load existing requests for this student and school year
      const requests = await base44.entities.CourseRequest.filter({
        student_id: userData.id,
        school_year: schoolYear
      });
      setExistingRequests(requests);

      // Load grade level requirements if available
      try {
        const requirements = await base44.entities.GradeLevelRequirement.list(1000);
        // We don't have student grade level, so we'll just load all requirements
        setGradeRequirements(requirements);
      } catch (err) {
        console.log('No grade requirements found');
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load course information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course.');
      return;
    }

    setSubmitting(true);
    try {
      // Delete existing requests first
      for (const request of existingRequests) {
        await base44.entities.CourseRequest.delete(request.id);
      }

      // Create new requests with priority based on selection order
      const requestPromises = selectedCourses.map((courseId, index) => 
        base44.entities.CourseRequest.create({
          student_id: user.id,
          student_name: user.full_name || user.email,
          course_id: courseId,
          priority: index + 1,
          is_alternate: false,
          status: 'pending',
          school_year: currentSchoolYear
        })
      );

      await Promise.all(requestPromises);

      setSuccess(true);
      
      // Reload data to show updated requests
      setTimeout(() => {
        setSuccess(false);
        loadData();
      }, 3000);

    } catch (err) {
      console.error('Error submitting requests:', err);
      alert('Failed to submit course requests. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading course catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Access Course Requests</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/Dashboard'} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Course Request Form</h1>
              <p className="text-slate-600 mt-1">Select your courses for {currentSchoolYear}</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/Dashboard'}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your course requests have been submitted successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Instructions */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Select the courses you would like to take next year</li>
                  <li>The order of selection determines your priority (first selected = highest priority)</li>
                  <li>You can change your selections and resubmit at any time</li>
                  <li>Your schedule coordinator will review your requests when building the master schedule</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Requests Summary */}
        {existingRequests.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Current Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {existingRequests
                  .sort((a, b) => a.priority - b.priority)
                  .map((request) => {
                    const course = availableCourses.find(c => c.id === request.course_id);
                    return (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{course?.course_name || 'Unknown Course'}</p>
                          <p className="text-sm text-slate-600">{course?.course_code}</p>
                        </div>
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'scheduled' ? 'default' :
                          request.status === 'denied' ? 'destructive' :
                          'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Available Courses
            </CardTitle>
            <p className="text-sm text-slate-600">
              {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
            </p>
          </CardHeader>
          <CardContent>
            {availableCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No courses available yet</p>
                <p className="text-sm text-slate-400 mt-2">
                  Please check back later or contact your school administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableCourses.map((course) => {
                  const isSelected = selectedCourses.includes(course.id);
                  const priority = selectedCourses.indexOf(course.id) + 1;

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-300 bg-indigo-50' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      onClick={() => handleCourseToggle(course.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleCourseToggle(course.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {course.course_name}
                              </h4>
                              <p className="text-sm text-slate-600">{course.course_code}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                  Priority #{priority}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {course.credits} credit{course.credits !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          {course.description && (
                            <p className="text-sm text-slate-600 mt-2">{course.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {course.term}
                            </Badge>
                            {course.is_elective && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Elective
                              </Badge>
                            )}
                            {!course.is_elective && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        {availableCourses.length > 0 && (
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedCourses([])}
              disabled={selectedCourses.length === 0 || submitting}
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedCourses.length === 0 || submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Course Requests
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}