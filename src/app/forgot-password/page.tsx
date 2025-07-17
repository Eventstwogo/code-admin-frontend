"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import BackgroundImage from "@/components/BackgroundImage";
import Image from 'next/image';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await axiosInstance.post("/api/v1/admin/forgot-password", new URLSearchParams({ email: data.email }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setSubmitted(true);
      toast.success("Password reset link sent to registered email address.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <BackgroundImage />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 rounded-3xl p-10 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center mb-4 gap-2">
          <Image src="/logo.png" alt="Logo" width={60} height={60} className="object-contain drop-shadow-lg" />
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Forgot your password?</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">We'll send you a reset link</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center text-indigo-700 dark:text-indigo-300">Forgot Password</h2>
        {submitted ? (
          <p className="text-green-600 dark:text-green-400 text-center">Check your email for the reset link.</p>
        ) : (
          <>
            <div className="mb-2">
              <Label htmlFor="email" className="text-sm mb-1 block">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="pl-10 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-all"
                  disabled={isSubmitting}
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 dark:text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg text-lg font-semibold py-2 transition-all duration-200 flex items-center justify-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
              <svg className="h-5 w-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Button>
          </>
        )}
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