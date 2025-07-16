'use client';

import { useState } from "react";
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
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      // Create form data for OAuth2-style request
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', data.email);
      formData.append('password', data.password);
      formData.append('scope', '');
      formData.append('client_id', '');
      formData.append('client_secret', '');

      const response = await axiosInstance.post("/api/v1/admin/login", formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
 
      console.log('Login response:', response.data);
      const statusCode = response.data.statusCode;
      const userId = response.data.user_id;
      
      if (response.data.success) {
        const { access_token, refresh_token, session_id } = response.data;
        const { user_id } = response.data.data;
        
        // Use the updated login function with all tokens
        login(access_token, refresh_token, session_id.toString());
        localStorage.setItem('id', user_id);
        
        router.push('/Dashboard');
        toast.success(response.data.message || 'Login Successful.');
      } else if (statusCode === 201) {
        router.push(`/ResetPassword?email=${encodeURIComponent(data.email)}`);
        toast.success('Login Success. Please reset your password.');
      }
    } catch (error: unknown) {
      console.log('Login error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: any } };
        const { status, data } = axiosError.response;
        if (status === 401) {
          toast.error(data.detail?.message === "User not found." ? 'User Not Found.' : 'Invalid credentials or account issues.');
        } else if (status === 403) {
          toast.error(data.detail?.message || 'Access forbidden.');
        } else if (status === 423) {
          toast.error(data.detail?.message || 'Account locked.');
        } else if (status === 404) {
          toast.error('Account not found.');
        } else {
          toast.error('Unexpected error: ' + (data.detail?.message || data.message || 'An error occurred.'));
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
        toast.error('An error occurred: ' + errorMessage);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Fullscreen background image */}
      <Image
        src="/loginprofile.webp"
        alt="Background"
        fill
        priority
        className="object-cover z-0"
      />

      {/* Overlay to dim image for readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Login form on top of image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 flex items-center justify-center z-20"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-10 w-full max-w-sm shadow-lg"
        >
            <div className="flex justify-center mb-4">
    <Image
      src="/logo.png" // Replace with your actual logo path
      alt="Logo"
      width={80}
      height={80}
      className="object-contain"
    />
  </div>
          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

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
                className="pl-10"
              />
              <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full"
          >
            Login
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
