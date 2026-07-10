import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@/entities/User";
import { createPageUrl } from '@/utils';

export default function AuthModal({ onLogin }) {
  // If the user is already authenticated, continue into the app.
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await User.me();
        if (user) {
          if (onLogin) {
            onLogin();
          } else {
            window.location.href = createPageUrl('Dashboard');
          }
        }
      } catch (error) {
        // Not authenticated — stay on this screen and let the user sign in.
      }
    };

    checkAuthStatus();
  }, [onLogin]);

  // Delegate all credential handling to the platform's secure login flow.
  // We never collect or store passwords in app state.
  const handleSignIn = () => {
    User.redirectToLogin(window.location.pathname + window.location.search);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Welcome to SchoolACE
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Sign in securely to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <Button
              onClick={handleSignIn}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base rounded-xl"
            >
              Sign In / Sign Up
            </Button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By continuing, you agree to our terms and conditions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}