"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Image from "next/image";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { toast } from "sonner";
import BackgroundImage from "@/components/BackgroundImage";
import Link from "next/link";
import {jwtDecode } from "jwt-decode";
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/\d/, "Must include at least one number")
    .regex(/[!@#$%^&*]/, "Must include at least one special character"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof loginSchema>) => {
      if (isSubmitting) return; // Prevent multiple simultaneous requests

      setIsSubmitting(true);

      try {
        // Create form data for OAuth2-style request
        const formData = new URLSearchParams();
        formData.append("grant_type", "password");
        formData.append("username", data.email);
        formData.append("password", data.password);
        formData.append("scope", "");
        formData.append("client_id", "");
        formData.append("client_secret", "");

        const response = await axiosInstance.post(
          "/api/v1/admin/login",
          formData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        console.log("Login response:", response.data);
        const statusCode = response.data.statusCode;
        const userId = response.data.user_id;

        if (response.data.success) {
          const { access_token, refresh_token, session_id } = response.data;
          const { user_id } = response.data.data;
       const decoded: { rid: string } = jwtDecode(access_token);
  
 
  if (decoded.rid === '7t94rb') {
    toast.error("Unauthorized role. Only admins can log in here.");
      
 
    return;
  }
          // Use the updated login function with all tokens
          login(access_token, refresh_token, session_id.toString());
          localStorage.setItem("id", user_id);

          router.push("/Dashboard");
          toast.success(response.data.message || "Login Successful.");
        } else if (statusCode === 201) {
          router.push(`/ResetPassword?email=${encodeURIComponent(data.email)}`);
          toast.success("Login Success. Please reset your password.");
        }
      } catch (error: unknown) {
        console.log("Login error:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response: { status: number; data: any };
          };
          const { status, data } = axiosError.response;
          console.log(data);
          if (status === 401) {
            toast.error(
              data.message === "User not found."
                ? "User Not Found."
                : "Invalid credentials or account issues."
            );
          } else if (status === 403) {
            toast.error(data.message || "Access forbidden.");
          } else if (status === 423) {
            toast.error(data.message || "Account locked.");
          } else if (status === 404) {
            toast.error("Account not found.");
          } else {
            toast.error(
              "Unexpected error: " +
                (data.detail?.message || data.message || "An error occurred.")
            );
          }
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error.";
          toast.error("An error occurred: " + errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, router, isSubmitting]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <BackgroundImage />
      <div className="absolute top-6 left-0 w-full flex justify-center z-50 mt-5">
        <Link
          href="/"
          className="text-sm font-medium flex items-center gap-1 px-5 py-2 rounded-full border border-indigo-200 dark:border-indigo-700 bg-white/90 dark:bg-gray-900/80 text-indigo-700 dark:text-indigo-200 shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-800 hover:text-indigo-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <span aria-hidden="true">←</span> Back to Home
        </Link>
      </div>
      {/* Animated blurred shapes for depth */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-400 opacity-30 rounded-full blur-3xl z-10 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl z-10 animate-pulse" />
      {/* Gradient overlay for vibrancy */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 opacity-50 z-20" />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-40 flex flex-col items-center w-full"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 rounded-3xl p-10 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-6"
        >
          <div className="flex flex-col items-center mb-4 gap-2">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain drop-shadow-lg"
            />
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Welcome to Events2Go Admin
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to manage your events
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-center text-indigo-700 dark:text-indigo-300">
            Login
          </h2>
          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email" className="text-sm mb-1 block">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter your email"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <Label htmlFor="password" className="text-sm mb-1 block">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter your password"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg text-lg font-semibold py-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Logging in..." : "Login"}</span>
            <Lock className="h-5 w-5" />
          </Button>
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
