
// "use client";

// import React, { useState } from "react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";

// const SettingsForm = () => {
//   const [defaultPassword, setDefaultPassword] = useState("");
//   const [enable180DayFlag, setEnable180DayFlag] = useState(false);
//   const [guestBooking, setGuestBooking] = useState(false);
//   const [expiringTime, setExpiringTime] = useState("");
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);

//   const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setLogoPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSave = () => {
//     const settings = {
//       defaultPassword,
//       enable180DayFlag,
//       guestBooking,
//       expiringTime,
//       logoPreview,
//     };
//     console.log("Saved settings:", settings);
//     alert("Settings saved!");
//   };

//   return (
//     <div className="space-y-6 p-3">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Default Password */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Default Password</CardTitle>
//             <CardDescription>Password for newly created user accounts</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Label className="mb-2">Password</Label>
//             <Input
//               value={defaultPassword}
//               onChange={(e) => setDefaultPassword(e.target.value)}
//               placeholder="e.g. Welcome@123"
//             />
//           </CardContent>
//         </Card>

//         {/* 180-Day Flag */}
//         <Card>
//           <CardHeader>
//             <CardTitle>180-Day Flag</CardTitle>
//             <CardDescription>Restrict tickets from being booked beyond 180 days</CardDescription>
//           </CardHeader>
//           <CardContent className="flex items-center justify-between">
//             <Label >Enable Flag</Label>
//             <Switch
//               checked={enable180DayFlag}
//               onCheckedChange={() => setEnable180DayFlag(!enable180DayFlag)}
//             />
//           </CardContent>
//         </Card>

//         {/* Guest Booking */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Guest Booking</CardTitle>
//             <CardDescription>Allow bookings without account login</CardDescription>
//           </CardHeader>
//           <CardContent className="flex items-center justify-between">
//             <Label>Allow Guest Booking</Label>
//             <Switch
//               checked={guestBooking}
//               onCheckedChange={() => setGuestBooking(!guestBooking)}
//             />
//           </CardContent>
//         </Card>

//         {/* Expiring Ticket Time */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Ticket Expiry Time</CardTitle>
//             <CardDescription>
//               Time (in hours) after which an unpaid ticket is auto-cancelled
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Label className="mb-2">Expiry Time (hours)</Label>
//             <Input
//               type="number"
//               value={expiringTime}
//               onChange={(e) => setExpiringTime(e.target.value)}
//               placeholder="e.g. 48"
//             />
//           </CardContent>
//         </Card>

//         {/* Logo Upload */}
//         <Card className="">
//           <CardHeader>
//             <CardTitle>Company Logo</CardTitle>
//             <CardDescription>Upload your branding logo for the system</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {logoPreview && <img src={logoPreview} alt="Logo" className="h-20 mb-3" />}
//             <Input type="file" accept="image/*" onChange={handleLogoChange} />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-end gap-3">
//         <Button variant="outline">Cancel</Button>
//         <Button onClick={handleSave}>Save</Button>
//       </div>
//     </div>
//   );
// };

// export default SettingsForm;


"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

const SettingsForm = () => {
  const [defaultPassword, setDefaultPassword] = useState("");
  const [enable180DayFlag, setEnable180DayFlag] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Password validation
  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return (
      password.length >= 8 &&
      hasUpper &&
      hasLower &&
      hasDigit &&
      hasSpecial
    );
  };

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Logo file must be less than 10MB.");
        return;
      }

      const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Logo must be PNG, JPG, GIF, or WebP.");
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Fetch existing configuration
  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get("/api/v1/config/");
      if (response.data?.data) {
        const config = response.data.data;
        setDefaultPassword(config.default_password || "");
        setEnable180DayFlag(config.global_180_day_flag || false);
        if (config.logo_url) setLogoPreview(config.logo_url);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save updated settings
  const handleSave = async () => {
    if (!validatePassword(defaultPassword)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, digits, and special characters."
      );
      return;
    }

    if (!logoFile && !logoPreview) {
      toast.error("Please upload a logo image.");
      return;
    }

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
      toast.success("Settings updated successfully!");
      fetchSettings();
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(
        error?.response?.data?.detail || "Failed to update settings."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-3">
      {fetching ? (
        <div className="text-center py-10 text-gray-500">Loading settings...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Password */}
            <Card>
              <CardHeader>
                <CardTitle>Default Password</CardTitle>
                <CardDescription>
                  Password for newly created user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label className="mb-2">Password</Label>
                <Input
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  placeholder="e.g. Welcome@123"
                  type="password"
                />
              </CardContent>
            </Card>

            {/* 180-Day Flag */}
            <Card>
              <CardHeader>
                <CardTitle>180-Day Flag</CardTitle>
                <CardDescription>
                  Restrict tickets from being booked beyond 180 days
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Label>Enable Flag</Label>
                <Switch
                  checked={enable180DayFlag}
                  onCheckedChange={() => setEnable180DayFlag(!enable180DayFlag)}
                />
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  Upload your branding logo for the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-20 mb-3 rounded border"
                  />
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleLogoChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={fetchSettings}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsForm;
