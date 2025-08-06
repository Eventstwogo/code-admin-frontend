"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import BackgroundImage from "@/components/BackgroundImage";
import Image from 'next/image';
import { cn } from "@/lib/utils";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[a-z]/, "Must include at least one lowercase letter")
  .regex(/\d/, "Must include at least one number")
  .regex(/[!@#$%^&*]/, "Must include at least one special character");

const resetPasswordSchema = z.object({
  new_password: passwordSchema,
  confirm_password: z.string(),
});

export default function ResetPasswordWithTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get("email") || "");
  const token = searchParams.get("token") || "";
  const [submitting, setSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(
      resetPasswordSchema.refine(
        (data) => data.new_password === data.confirm_password,
        {
          message: "Passwords do not match",
          path: ["confirm_password"],
        }
      )
    ),
  });

  const password = watch("new_password");
  const confirmPassword = watch("confirm_password");
  // Password requirements
  const requirements = [
    { label: "At least 8 characters", met: password?.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*]/.test(password) },
  ];
  const allMet = requirements.every(r => r.met);
  const passwordsMatch = password === confirmPassword && !!password;

  const onSubmit = useCallback(async (data: z.infer<typeof resetPasswordSchema>) => {
    if (submitting) return; // Prevent multiple simultaneous requests
    
    setSubmitting(true);
    try {
      await axiosInstance.post(
        "/api/v1/admin/reset-password/token",
        new URLSearchParams({
          email,
          token,
          new_password: data.new_password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      
      toast.success("Password reset successful. Please login.");
      router.push("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  }, [email, token, router, submitting]);

  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <BackgroundImage />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 rounded-3xl p-10 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center mb-4 gap-2">
          <Image src="/logo.png" alt="Logo" width={60} height={60} className="object-contain drop-shadow-lg" />
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Reset your password</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Create a strong new password</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center text-indigo-700 dark:text-indigo-300">Reset Password</h2>
        <div className="mb-2">
          <Label htmlFor="new_password" className="text-sm mb-1 block text-gray-700 dark:text-gray-200">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showNewPassword ? "text" : "password"}
              {...register("new_password")}
              className={cn(
                "pl-10 pr-10 w-full rounded-md border border-gray-300 dark:border-gray-700",
                "bg-white text-gray-900 placeholder-gray-400",
                "dark:bg-gray-900 dark:text-white dark:placeholder-gray-500",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600",
                "transition-all"
              )}
              placeholder="Enter your password"
              disabled={submitting}
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 dark:text-indigo-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v1h-4v-1zm-2 4h8v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2h4zm0-4V9a4 4 0 118 0v2" />
            </svg>
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password requirements checklist */}
          <ul className="mt-2 mb-1 space-y-1 text-xs">
            {requirements.map((req, idx) => (
              <li
                key={idx}
                className={cn(
                  "flex items-center",
                  req.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <svg
                  className={cn(
                    "h-4 w-4 mr-1",
                    req.met ? "text-green-500" : "text-gray-400"
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {req.label}
              </li>
            ))}
          </ul>

          {/* Password strength meter */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                allMet
                  ? "bg-green-500 w-full"
                  : requirements.filter(r => r.met).length >= 3
                  ? "bg-blue-400 w-4/5"
                  : requirements.filter(r => r.met).length === 2
                  ? "bg-yellow-400 w-3/5"
                  : requirements.filter(r => r.met).length === 1
                  ? "bg-red-400 w-1/5"
                  : "w-0"
              )}
            />
          </div>

          {errors.new_password && (
            <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>
          )}
        </div>
        <div className="mb-2">
          <Label htmlFor="confirm_password" className="text-sm mb-1 block text-gray-700 dark:text-gray-200">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirm_password")}
              placeholder="Confirm your password"
              className={cn(
                "pl-10 pr-10 w-full rounded-md border border-gray-300 dark:border-gray-700",
                "bg-white text-gray-900 placeholder-gray-400",
                "dark:bg-gray-900 dark:text-white dark:placeholder-gray-500",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600",
                "transition-all"
              )}
              disabled={submitting}
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 dark:text-indigo-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password match feedback */}
          {confirmPassword && !passwordsMatch && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="text-green-600 dark:text-green-400 text-xs mt-1">Passwords match</p>
          )}

          {/* Validation error message */}
          {errors.confirm_password && (
            <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg text-lg font-semibold py-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={submitting || !allMet || !passwordsMatch}
        >
          {submitting ? "Resetting..." : "Reset Password"}
          <svg className="h-5 w-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Button>
        <div className="mt-4 text-center">
          <a
            href="/login"
            className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
          >
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
} 