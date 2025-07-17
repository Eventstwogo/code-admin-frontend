"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import Link from "next/link";
import { useMemo } from "react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const passwordRequirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
    { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(newPassword) },
  ];
  const allMet = passwordRequirements.every(r => r.met);
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const validatePassword = useCallback((password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must include at least one number.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password))
      return "Password must include at least one special character.";
    return null;
  }, []);

  const handleReset = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.patch('/api/v1/admin/reset-password', {
        email: email,
        new_password: newPassword
      });
      
      if (response.data.statusCode === 200) {
        toast.success('Password reset successfully');
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to reset the password');
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, email, validatePassword, router, isLoading]);

  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <BackgroundImage />
      <div className="absolute top-6 left-0 w-full flex justify-center z-50 mt-5">
        <Link
          href="/login"
          className="text-sm font-medium flex items-center gap-1 px-5 py-2 rounded-full border border-indigo-200 dark:border-indigo-700 bg-white/90 dark:bg-gray-900/80 text-indigo-700 dark:text-indigo-200 shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-800 hover:text-indigo-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <span aria-hidden="true">←</span> Back to Login
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-40 w-full max-w-md bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-800 p-8 sm:p-10 space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-200 text-center">Reset Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
            Enter your new password below to reset access.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          {/* New Password Field */}
          <div className="relative">
            <Label htmlFor="new-password" className="mb-2">
              New Password
            </Label>
            <Input
              type={showNewPassword ? "text" : "password"}
              id="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={toggleNewPasswordVisibility}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {/* Password requirements checklist */}
            <ul className="mt-2 mb-1 space-y-1 text-xs">
              {passwordRequirements.map((req, idx) => (
                <li key={idx} className={req.met ? "text-green-600 dark:text-green-400 flex items-center" : "text-gray-500 dark:text-gray-400 flex items-center"}>
                  <svg className={req.met ? "h-4 w-4 mr-1 text-green-500" : "h-4 w-4 mr-1 text-gray-400"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {req.label}
                </li>
              ))}
            </ul>
            {/* Password strength meter */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  allMet
                    ? 'bg-green-500 w-full'
                    : passwordStrength >= 3
                    ? 'bg-blue-400 w-4/5'
                    : passwordStrength === 2
                    ? 'bg-yellow-400 w-3/5'
                    : passwordStrength === 1
                    ? 'bg-red-400 w-1/5'
                    : ''
                }`}
              />
            </div>
          </div>
          {/* Confirm Password Field */}
          <div className="relative">
            <Label htmlFor="confirm-password" className="mb-2">
              Confirm Password
            </Label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 dark:text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}
          {/* Submit */}
          <Button 
            onClick={handleReset} 
            disabled={isLoading || !allMet}
            className="w-full text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
