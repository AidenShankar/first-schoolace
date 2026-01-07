
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, X } from "lucide-react";
import { Class } from "@/entities/Class";
import { ClassEnrollment } from "@/entities/ClassEnrollment";
import { User } from "@/entities/User";
import { createPageUrl } from "@/lib/utils"; // Assuming createPageUrl is available from utils

export default function ClassJoin({ onClassJoined, onCancel }) {
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError("Please enter a class code.");
      return;
    }

    setIsJoining(true);
    setError("");
    
    try {
      const user = await User.me();
      
      // FIX: Ensure user has completed setup before joining class
      if (!user.setup_complete) {
        setError("Please complete your account setup first.");
        // Add a small delay for the user to read the message before redirecting
        setTimeout(() => {
          window.location.href = createPageUrl('Setup');
        }, 1500); 
        setIsJoining(false); // Stop joining state
        return;
      }
      
      const classes = await Class.filter({ class_code: classCode.trim().toUpperCase() });
      
      if (classes.length === 0) {
        setError("Class not found. Please double-check the code.");
        setIsJoining(false);
        return;
      }

      const targetClass = classes[0];
      
      // Check if already enrolled
      const existingEnrollments = await ClassEnrollment.filter({ 
        class_id: targetClass.id, 
        student_id: user.id 
      });

      if (existingEnrollments.length > 0) {
        setError("You are already enrolled in this class. Redirecting to dashboard...");
        // FIX: Instead of showing error, redirect to dashboard with the class
        setTimeout(() => {
          window.location.href = createPageUrl(`Dashboard?classId=${targetClass.id}`);
        }, 1500);
        setIsJoining(false); // Stop joining state, as redirect will happen
        return;
      }

      // Create new enrollment
      await ClassEnrollment.create({
        class_id: targetClass.id,
        student_id: user.id,
        student_name: user.full_name || user.email,
        student_email: user.email,
        enrolled_at: new Date().toISOString()
      });

      // FIX: Ensure proper redirect after successful enrollment
      // Removed setConversation as it's not defined in this component's scope
      
      // Add a small delay to ensure the enrollment is processed or message is seen
      setTimeout(() => {
        onClassJoined(targetClass);
      }, 500);
      
    } catch (err) {
      console.error("Error joining class:", err);
      setError("Failed to join class. Please try again.");
      setIsJoining(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
      <CardHeader className="text-center relative">
        {onCancel && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="absolute right-2 top-2"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        <CardTitle className="text-2xl font-bold text-slate-900">Join a Class</CardTitle>
        <p className="text-slate-600">Enter the class code to join</p>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6 py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
          
          <form onSubmit={handleJoinClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classCode" className="text-sm font-semibold text-slate-700">
                Enter Class Code
              </Label>
              <Input
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="e.g., ABC123"
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-center text-lg font-mono tracking-widest"
                maxLength={8}
                required
                autoCapitalize="characters"
              />
              <p className="text-xs text-slate-500">
                Get the 6-digit class code from your teacher.
              </p>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={isJoining || !classCode.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium"
            >
              {isJoining ? "Joining..." : "Join Class"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
