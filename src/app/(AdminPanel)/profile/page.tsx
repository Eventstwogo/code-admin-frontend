"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useStore from "@/lib/Zustand";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { 
  Camera, 
  User, 
  Mail, 
  Shield, 
  Upload, 
  X, 
  Check,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Settings
} from "lucide-react";

type User = {
  id: string;
  username: string;
  role_name: string;
  email: string;
  profile_picture: string;
};

export default function ProfilePage() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Change Password States
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const userId = useStore(state => state.userId);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/v1/admin/users/${userId}`);
      setUser(response.data.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch user data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    fetchUserDetails(userId);
  }, [userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, or PNG images are allowed.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    // Clean up previous preview URL
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedFile(file);
    setShowActions(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setSelectedFile(null);
    setShowActions(false);
  };

  const handleSave = async () => {
    if (!selectedFile || !userId) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append("profile_picture", selectedFile);

    try {
      const response = await axiosInstance.patch(`/api/v1/admin/profile/picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.statusCode === 200) {
        toast.success("Profile image updated successfully");
        setShowActions(false);
        setSelectedFile(null);
        
        // Update user state with new profile picture
        if (user) {
          setUser({
            ...user,
            profile_picture: response.data.data?.profile_picture || avatarPreview || user.profile_picture
          });
        }
        
        // Clean up preview URL
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(null);
      } else {
        toast.error("Failed to update image.");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Error uploading image.";
      toast.error(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    return { score, checks };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  
  const getStrengthLabel = (score: number) => {
    if (score === 0) return { label: "", color: "" };
    if (score <= 2) return { label: "Weak", color: "text-destructive" };
    if (score <= 3) return { label: "Fair", color: "text-yellow-500" };
    if (score <= 4) return { label: "Good", color: "text-blue-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  const strengthInfo = getStrengthLabel(passwordStrength.score);

  // Change Password Handler
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("Please choose a stronger password");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);

      const response = await axiosInstance.post('/api/v1/admin/change-password', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success("Password changed successfully");
        setIsPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Error changing password";
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Enhanced Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-24 bg-muted/50" />
          <Skeleton className="h-5 w-80 bg-muted/30" />
        </div>
        
        {/* Profile Picture Card Skeleton */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded bg-muted/50" />
              <Skeleton className="h-6 w-32 bg-muted/50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Skeleton className="w-32 h-32 rounded-full bg-muted/40" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-9 w-32 bg-muted/50" />
                <Skeleton className="h-4 w-48 bg-muted/30" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card Skeleton */}
        <Card className="border-border bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-muted/50" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded bg-muted/40" />
                    <Skeleton className="h-4 w-20 bg-muted/40" />
                  </div>
                  <Skeleton className="h-10 w-full bg-muted/30 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Card Skeleton */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-muted/50" />
                <Skeleton className="h-4 w-64 bg-muted/30" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32 bg-muted/40" />
                <Skeleton className="h-8 w-32 bg-muted/40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading profile</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => userId && fetchUserDetails(userId)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Camera className="h-5 w-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-border shadow-lg">
                <AvatarImage 
                  src={avatarPreview || user?.profile_picture} 
                  alt={user?.username || "Profile"}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">
                  {user?.username ? getUserInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
              
              {/* Overlay for hover effect */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                   onClick={triggerFileInput}>
                <Upload className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={triggerFileInput}
                className="gap-2 hover:bg-accent hover:text-accent-foreground"
                disabled={uploadLoading}
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, JPEG or PNG. Max size 10MB.
              </p>
            </div>

            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />

            {showActions && (
              <div className="flex gap-3 animate-in slide-in-from-top-2 duration-200">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={uploadLoading}
                  className="gap-2"
                >
                  {uploadLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {uploadLoading ? "Saving..." : "Save"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={uploadLoading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <p className="text-base font-medium text-foreground bg-muted/30 px-3 py-2 rounded-md border">
                {user?.username || "Not provided"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <p className="text-base font-medium text-foreground bg-muted/30 px-3 py-2 rounded-md border">
                {user?.email || "Not provided"}
              </p>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {user?.role_name || "Not assigned"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                User ID
              </Label>
              <p className="text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-2 rounded-md border">
                {user?.id || "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and security settings
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                      resetPasswordForm();
                      setIsPasswordDialogOpen(true);
                    }}
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new secure password.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-sm font-medium">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="pr-10"
                          disabled={passwordLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={passwordLoading}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pr-10"
                          disabled={passwordLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={passwordLoading}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Password strength:</span>
                            <span className={`text-xs font-medium ${strengthInfo.color}`}>
                              {strengthInfo.label}
                            </span>
                          </div>
                          
                          {/* Strength Bar */}
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  level <= passwordStrength.score
                                    ? passwordStrength.score <= 2
                                      ? "bg-destructive"
                                      : passwordStrength.score <= 3
                                      ? "bg-yellow-500"
                                      : passwordStrength.score <= 4
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Password Requirements */}
                          <div className="space-y-1">
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              <div className={`flex items-center gap-1 transition-colors ${
                                passwordStrength.checks.length ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                              }`}>
                                {passwordStrength.checks.length ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                At least 8 characters
                              </div>
                              <div className={`flex items-center gap-1 transition-colors ${
                                passwordStrength.checks.lowercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                              }`}>
                                {passwordStrength.checks.lowercase ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                One lowercase letter
                              </div>
                              <div className={`flex items-center gap-1 transition-colors ${
                                passwordStrength.checks.uppercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                              }`}>
                                {passwordStrength.checks.uppercase ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                One uppercase letter
                              </div>
                              <div className={`flex items-center gap-1 transition-colors ${
                                passwordStrength.checks.number ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                              }`}>
                                {passwordStrength.checks.number ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                One number
                              </div>
                              <div className={`flex items-center gap-1 transition-colors ${
                                passwordStrength.checks.special ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                              }`}>
                                {passwordStrength.checks.special ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                One special character (!@#$%^&*)
                              </div>
                            </div>
                            
                            {/* Success message when all requirements are met */}
                            {passwordStrength.score >= 4 && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                                <Check className="h-3 w-3" />
                                Password meets all security requirements
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pr-10"
                          disabled={passwordLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={passwordLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Passwords do not match
                        </p>
                      )}
                      {currentPassword && newPassword && currentPassword === newPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          New password must be different from current password
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsPasswordDialogOpen(false);
                        resetPasswordForm();
                      }}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        passwordLoading ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        passwordStrength.score < 3 ||
                        currentPassword === newPassword
                      }
                      className="gap-2"
                    >
                      {passwordLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {passwordLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" disabled>
                Privacy Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
