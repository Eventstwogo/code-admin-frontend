// "use client";

// import React, { useRef, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import useStore from "@/lib/Zustand";
// export default function ProfilePage() {
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//    const{userId}=useStore()
//    console.log(userId)
//   const user = {
//     name: "Vineetha",
//     email: "vineetha@example.com",
//     role: "Admin",
//     phone: "+91 98765 43210",
//   };

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAvatarPreview(URL.createObjectURL(file));
//       // You can also send the file to your server here
//       console.log("Selected file:", file);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-semibold">Profile</h1>
//         <p className="text-sm text-gray-500">View your personal and account information</p>
//       </div>

//       {/* Image Upload */}
//       <div className="flex flex-col items-center space-y-4">
//         <img
//           src={avatarPreview ?? "/placeholder-avatar.png"}
//           alt="Profile"
//           className="w-40 h-40 rounded-full object-cover border border-gray-300"
//         />
//         <Button variant="outline" size="sm" onClick={triggerFileInput} className="cursor-pointer">
//           Change Photo
//         </Button>
//         <Input
//           type="file"
//           accept="image/*"
//           ref={fileInputRef}
//           onChange={handleAvatarChange}
//           className="hidden"
//         />
//       </div>

//       <Separator />

//       {/* Profile Info */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//         <div>
//           <Label className="text-gray-600">Full Name</Label>
//           <p className="font-medium">{user.name}</p>
//         </div>
//         <div>
//           <Label className="text-gray-600">Email</Label>
//           <p className="font-medium">{user.email}</p>
//         </div>
//         <div>
//           <Label className="text-gray-600">Role</Label>
//           <p className="font-medium">{user.role}</p>
//         </div>
//         <div>
//           <Label className="text-gray-600">Phone</Label>
//           <p className="font-medium">{user.phone}</p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useRef, useState,useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import useStore from "@/lib/Zustand";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

type User = {
  id: string;
  username: string;
  role_name: string;
  email:string
  profile_picture: string;
};
export default function ProfilePage() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showActions, setShowActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
  const { userId } = useStore();

 const fetchUserDetails=async(userId)=>{
    try{
      const response=axiosInstance.get(`/api/v1/admin-users/admin-users/${userId}`)
setUser((await response).data.data)
setLoading(false)
    }
    catch(error){
      toast.error('failed to Fetch the user data')
    }
  }
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    fetchUserDetails(userId)
     
  }, [userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG or PNG images are allowed.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    setShowActions(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    setShowActions(false);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('user_id',userId)
    formData.append("profile_picture", selectedFile);

    try {
      const response = await axiosInstance.patch(`/api/v1/admin-users/profile-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.statusCode === 200) {
        toast.success("Profile image updated successfully");
        setShowActions(false);
        setSelectedFile(null);
      } else {
        toast.error("Failed to update image.");
      }
    } catch (error) {
      toast.error("Error uploading image.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-500">View your personal and account information</p>
      </div>

      {/* Image Upload */}
      <div className="flex flex-col items-center space-y-4">
        <img
         src={avatarPreview ?? user?.profile_picture ?? "/placeholder-avatar.png"}
          alt="Profile"
          className="w-40 h-40 rounded-full object-cover border border-gray-300"
        />
        <Button variant="outline" size="sm" onClick={triggerFileInput} className="cursor-pointer">
          Change Photo
        </Button>
        <Input
          type="file"
          accept="image/jpeg, image/png"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
        />
        {showActions && (
          <div className="flex gap-4 mt-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Profile Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-gray-600">Full Name</Label>
          <p className="font-medium">{user?.username}</p>
        </div>
        <div>
          <Label className="text-gray-600">Email</Label>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <Label className="text-gray-600">Role</Label>
          <p className="font-medium">{user?.role_name}</p>
        </div>
       
      </div>
    </div>
  );
}
