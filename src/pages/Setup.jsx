import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Users, BookOpen, Building } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';
import AceTransition, { LOADING_DURATION } from "@/components/common/AceTransition";

export default function Setup() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        setPageLoading(false);
    }, LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const [loading, setLoading] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [schoolName, setSchoolName] = useState('');

  if (pageLoading) {
    return <AceTransition />;
  }

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
  };

  const generateAdminCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const updateData = { 
        app_role: selectedRole, 
        setup_complete: true 
      };

      // Validate inputs first (before any auth calls)
      if (selectedRole === 'admin') {
        if (!schoolName.trim()) {
          alert('Please enter your school/district name');
          setLoading(false);
          return;
        }
        updateData.admin_code = generateAdminCode();
        updateData.school_name = schoolName;
      } else if (selectedRole === 'teacher' && adminCode.trim()) {
        // Only validate admin code if provided
        try {
          const { data, error } = await base44.functions.invoke('validateAdminCode', {
            admin_code: adminCode.trim().toUpperCase()
          });

          if (error) {
            throw new Error(error.response?.data?.error || error.message);
          }

          if (!data.valid) {
            alert(data.error || 'Invalid admin code. You can skip this step and continue without connecting to an admin.');
            setLoading(false);
            return;
          }

          updateData.admin_id = data.admin_id;
        } catch (error) {
          console.error("Error validating admin code:", error);
          alert('Could not validate admin code: ' + error.message + '. You can skip this step and continue without connecting to an admin.');
          setLoading(false);
          return;
        }
      }

      // Now update user with validated data
      await base44.auth.updateMe(updateData);
      
      // Show success message for admin
      if (selectedRole === 'admin') {
        alert(`Setup complete! Your admin code is: ${updateData.admin_code}\n\nShare this code with teachers so they can join your school.`);
      }
      
      // Small delay to ensure data is saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // If user came from AITutor page and selected student, send them back to AITutor
      const params = new URLSearchParams(window.location.search);
      const fromAITutor = params.get('fromAITutor') === 'true';
      if (fromAITutor && selectedRole === 'student') {
        window.location.href = createPageUrl('AITutor') + '?autoTransfer=true';
      } else {
        window.location.href = createPageUrl('Dashboard');
      }
    } catch (error) {
      console.error("Error completing setup:", error);
      alert(`Failed to complete setup: ${error.message || 'Please try again.'}`);
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'admin',
      title: 'School Admin',
      description: 'Manage teachers, students, and schedules',
      icon: Building,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Create assignments and manage your classroom',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Submit work and track your progress',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Welcome to Schoolace
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {!selectedRole ? 'Choose your role to get started' : 
               selectedRole === 'admin' ? 'Set up your school' :
               selectedRole === 'teacher' ? 'Join your school (optional)' : 
               'Complete your profile'}
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {!selectedRole ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleRoleSelect(role.id)}
                      className="w-full group"
                    >
                      <Card className="border-2 border-transparent hover:border-indigo-500 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                            <role.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {role.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {role.description}
                          </p>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {selectedRole === 'admin' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schoolName">School/District Name *</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g., Lincoln High School"
                        className="mt-2"
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Next Step:</strong> After setup, you'll receive a unique 6-character admin code that teachers can use to join your school.
                      </p>
                    </div>
                  </div>
                )}

                {selectedRole === 'teacher' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="adminCode">Admin Code (Optional)</Label>
                      <Input
                        id="adminCode"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code"
                        className="mt-2 font-mono"
                        maxLength={6}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Get this code from your school admin. Leave blank to skip - you can still use Schoolace for your own classes.
                      </p>
                    </div>
                  </div>
                )}

                {selectedRole === 'student' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>Next Step:</strong> After setup, your teacher will provide you with a class code to join their classroom.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRole(null)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={loading}
                  >
                    {loading ? 'Setting up...' : 'Complete Setup'}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}