"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { 
  Key, 
  Calendar, 
  Image, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Clock,
  Check,
  Minus
} from "lucide-react";

const SettingsForm = () => {
  const [defaultPassword, setDefaultPassword] = useState("");
  const [enable180DayFlag, setEnable180DayFlag] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    requirements: Array<{
      id: string;
      label: string;
      test: (pwd: string) => boolean;
      met: boolean;
    }>;
    isValid: boolean;
    isEmpty: boolean;
  }>({ score: 0, requirements: [], isValid: false, isEmpty: true });

  // Enhanced password validation with strength calculation
  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isValidLength = password.length >= 8;
    
    return isValidLength && hasUpper && hasLower && hasDigit && hasSpecial;
  };

  // Calculate password strength with detailed requirements
  const calculatePasswordStrength = (password: string) => {
    const requirements = [
      {
        id: 'length',
        label: 'At least 8 characters',
        test: (pwd: string) => pwd.length >= 8,
        met: password.length >= 8
      },
      {
        id: 'uppercase',
        label: 'Contains uppercase letter (A-Z)',
        test: (pwd: string) => /[A-Z]/.test(pwd),
        met: /[A-Z]/.test(password)
      },
      {
        id: 'lowercase',
        label: 'Contains lowercase letter (a-z)',
        test: (pwd: string) => /[a-z]/.test(pwd),
        met: /[a-z]/.test(password)
      },
      {
        id: 'number',
        label: 'Contains number (0-9)',
        test: (pwd: string) => /\d/.test(pwd),
        met: /\d/.test(password)
      },
      {
        id: 'special',
        label: 'Contains special character (!@#$%^&*)',
        test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
        met: /[^A-Za-z0-9]/.test(password)
      }
    ];

    const score = requirements.filter(req => req.met).length;
    
    return { 
      score, 
      requirements,
      isValid: score === 5,
      isEmpty: password.length === 0
    };
  };

  // Handle password change with strength calculation
  const handlePasswordChange = (value: string) => {
    setDefaultPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  // Enhanced logo file handling
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File size validation (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Logo file must be less than 10MB.", {
          description: `Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        });
        return;
      }

      // File type validation
      const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Logo must be PNG, JPG, GIF, or WebP format."
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      toast.success("Logo uploaded successfully", {
        description: `File: ${file.name}`
      });
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.info("Logo removed");
  };

  // Fetch existing configuration with better error handling
  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get("/api/v1/config/");
      
      if (response.data?.data) {
        const config = response.data.data;
        const password = config.default_password || "";
        
        setDefaultPassword(password);
        setPasswordStrength(calculatePasswordStrength(password));
        setEnable180DayFlag(config.global_180_day_flag || false);
        
        if (config.logo_url) {
          setLogoPreview(config.logo_url);
        }
        
        toast.success("Settings loaded successfully");
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Failed to load settings";
      
      toast.error("Failed to load settings", {
        description: errorMessage
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // Enhanced save functionality with better validation and feedback
  const handleSave = async () => {
    // Validate password
    if (!validatePassword(defaultPassword)) {
      toast.error("Invalid password", {
        description: "Password must be at least 8 characters and include uppercase, lowercase, digits, and special characters."
      });
      return;
    }

    // Validate logo (optional but recommended)
    if (!logoFile && !logoPreview) {
      toast.error("Logo required", {
        description: "Please upload a company logo image."
      });
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("default_password", defaultPassword);
    formData.append("global_180_day_flag", String(enable180DayFlag));
    
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      setLoading(true);
      
      await axiosInstance.put("/api/v1/config/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("Settings updated successfully!", {
        description: "All configuration changes have been saved."
      });
      
      // Refresh settings to get updated data
      await fetchSettings();
      
      // Clear the logo file since it's now saved
      setLogoFile(null);
      
    } catch (error: any) {
      console.error("Error updating settings:", error);
      
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Failed to update settings";
      
      toast.error("Update failed", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    fetchSettings();
    setLogoFile(null);
    toast.info("Form reset to saved values");
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = (strength: typeof passwordStrength) => {
    if (strength.isEmpty) return { color: "text-muted-foreground", text: "Enter password", variant: "secondary" as const };
    if (strength.score <= 2) return { color: "text-destructive", text: "Weak", variant: "destructive" as const };
    if (strength.score <= 3) return { color: "text-yellow-600 dark:text-yellow-400", text: "Fair", variant: "secondary" as const };
    if (strength.score <= 4) return { color: "text-blue-600 dark:text-blue-400", text: "Good", variant: "secondary" as const };
    return { color: "text-green-600 dark:text-green-400", text: "Strong", variant: "default" as const };
  };

  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
              <p className="text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
          <Separator className="mt-4" />
        </div>

        {fetching ? (
          <div className="space-y-8">
            {/* Settings Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Default Password Card Skeleton */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="relative">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  
                  {/* Password Strength Skeleton */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    
                    <Skeleton className="h-2 w-full rounded-full" />
                    
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <div className="grid grid-cols-1 gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Expiry Policy Card Skeleton */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-44" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-3 w-52" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border">
                    <Skeleton className="h-4 w-4 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo Upload Card Skeleton */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="relative inline-block">
                    <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                      <Skeleton className="h-20 w-32" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-28" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons Skeleton */}
            <Card>
              <CardFooter className="flex justify-between items-center">
                <Skeleton className="h-4 w-72" />
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Default Password Card */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Default Password</CardTitle>
                      <CardDescription>
                        Set the default password for newly created user accounts
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        value={defaultPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Enter secure password"
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {defaultPassword && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password Strength</span>
                        <Badge variant={strengthInfo.variant} className={strengthInfo.color}>
                          {strengthInfo.text}
                        </Badge>
                      </div>
                      
                      {/* Strength Bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2 
                              ? 'bg-destructive' 
                              : passwordStrength.score <= 3 
                              ? 'bg-yellow-500' 
                              : passwordStrength.score <= 4 
                              ? 'bg-blue-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>

                      {/* Password Requirements Checklist */}
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Requirements:</span>
                        <div className="grid grid-cols-1 gap-2">
                          {passwordStrength.requirements.map((requirement) => (
                            <div key={requirement.id} className="flex items-center gap-2 text-xs">
                              <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${
                                requirement.met 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-muted-foreground/30 text-muted-foreground'
                              }`}>
                                {requirement.met ? (
                                  <Check className="h-2.5 w-2.5" />
                                ) : (
                                  <Minus className="h-2.5 w-2.5" />
                                )}
                              </div>
                              <span className={
                                requirement.met 
                                  ? "text-green-600 dark:text-green-400" 
                                  : "text-muted-foreground"
                              }>
                                {requirement.label}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Overall Status */}
                        {passwordStrength.isValid && (
                          <div className="flex items-center gap-2 text-xs mt-3 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Password meets all requirements!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 180-Day Password Expiry Policy Card */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Password Expiry Policy</CardTitle>
                      <CardDescription>
                        Control user password expiration settings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">180-Day Password Expiry</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {enable180DayFlag 
                          ? "User passwords will expire after 180 days" 
                          : "Password expiry policy is disabled"
                        }
                      </p>
                    </div>
                    <Switch
                      checked={enable180DayFlag}
                      onCheckedChange={setEnable180DayFlag}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">About this policy:</p>
                      <p>When enabled, all user passwords will automatically expire after 180 days, requiring users to create new passwords for enhanced security.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo Upload Card - Full Width */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Company Branding</CardTitle>
                    <CardDescription>
                      Upload your company logo for system branding
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Current Logo Preview */}
                {logoPreview && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Current Logo</Label>
                    <div className="relative inline-block">
                      <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                        <img
                          src={logoPreview}
                          alt="Company Logo"
                          className="h-20 max-w-xs object-contain rounded"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload Section */}
                <div className="space-y-3">
                  <Label htmlFor="logo-upload" className="text-sm font-medium">
                    {logoPreview ? "Replace Logo" : "Upload Logo"}
                  </Label>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Supported formats: PNG, JPG, GIF, WebP</p>
                      <p>• Maximum file size: 10MB</p>
                      <p>• Recommended dimensions: 200x60px</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Make sure to save your changes before leaving this page.
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  
                  <Button 
                    onClick={handleSave} 
                    disabled={loading || !validatePassword(defaultPassword)}
                    className="gap-2 min-w-[100px]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsForm;
