import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Mail, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherSetup() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (user.app_role !== 'admin') {
        alert('Only admins can access teacher setup');
        setLoading(false);
        return;
      }

      // Use backend function to get teachers
      const { data, error } = await base44.functions.invoke('getAdminTeachers');

      if (error) {
        throw new Error(error.response?.data?.error || error.message);
      }

      setTeachers(data.teachers || []);

    } catch (error) {
      console.error("Error loading teachers:", error);
      alert("Failed to load teachers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!confirm("Remove this teacher? This will not delete their user account, only disconnect them from your school.")) {
      return;
    }

    try {
      // Update their admin_id to null
      await base44.entities.User.update(teacherId, { admin_id: null });
      loadData();
    } catch (error) {
      console.error("Error removing teacher:", error);
      alert("Failed to remove teacher. They may need to disconnect themselves.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.app_role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">Only admins can access teacher setup</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teachers</h2>
          <p className="text-slate-600 mt-1">
            Teachers registered to your school: <strong>{currentUser.school_name}</strong>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">Your Admin Code:</p>
            <Badge variant="outline" className="text-lg font-mono px-4 py-2">
              {currentUser.admin_code}
            </Badge>
            <p className="text-xs text-slate-500 mt-1">Share this with teachers</p>
          </div>
        </div>
      </div>

      {teachers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Teachers Yet
            </h3>
            <p className="text-slate-600 mb-4">
              Share your admin code <strong className="font-mono">{currentUser.admin_code}</strong> with teachers so they can join your school.
            </p>
            <p className="text-sm text-slate-500">
              Teachers will enter this code during their setup process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {teacher.full_name?.charAt(0) || teacher.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {teacher.full_name || 'Unnamed Teacher'}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Mail className="w-3 h-3" />
                          {teacher.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Joined:</span>
                      <span className="font-medium">
                        {new Date(teacher.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                How to Add Teachers
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Share your admin code: <strong className="font-mono">{currentUser.admin_code}</strong></li>
                <li>Teachers sign up for Schoolace and select "Teacher" role</li>
                <li>They enter your admin code during setup</li>
                <li>Click "Refresh" to see newly added teachers</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}