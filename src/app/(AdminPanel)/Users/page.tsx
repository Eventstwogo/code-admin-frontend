"use client";

/**
 * Users Management Page
 *
 * IMPORTANT: This component follows negation logic for user status:
 * - is_deleted = true means user is INACTIVE
 * - is_deleted = false means user is ACTIVE
 *
 * This is reflected in the UI display, switch states, and API calls.
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  UserTableSkeleton,
  UserFormSkeleton,
} from "@/components/UserTableSkeleton";

import axiosInstance from "@/lib/axiosInstance";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus,
  Edit3,
  Shield,
  Mail,
  User as UserIcon,
  Users,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
} from "lucide-react";

// 🔹 User type (Fixed property name)
type User = {
  id: number;
  user_id?: number; // Optional for compatibility
  username: string;
  email: string;
  role: string;
  role_id: string;
  role_name: string;
  profile_picture: string;
  is_deleted: boolean;
};

// 🔹 Role type
type Role = {
  role_id: string;
  role_name: string;
};

// 🔹 Analytics type
type Analytics = {
  summary: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    locked_users: number;
    with_expiry_flag: number;
    expired_passwords: number;
    high_failed_attempts: number;
    earliest_user: string;
    latest_user: string;
  };
  daily_registrations: {
    date: string;
    count: number;
  }[];
};

// 🔹 Form validation schema
const userSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces allowed"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
});

type FormData = z.infer<typeof userSchema>;

// 🔹 ProfilePicture component
const ProfilePicture = ({
  src,
  username,
  size = 32,
  className = "",
}: {
  src?: string | null;
  username: string;
  size?: number;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const initials = username?.[0]?.toUpperCase() || "?";
  const isValidImage = src && /^https?:\/\//.test(src) && !imageError;

  if (!isValidImage) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-orange-500 text-white font-semibold transition-all duration-200 hover:scale-105 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        title={username}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${username}'s profile`}
      width={size}
      height={size}
      className={`rounded-full object-cover transition-all duration-200 hover:scale-105 ${className}`}
      onError={() => setImageError(true)}
      title={username}
      // placeholder="blur" // Uncomment and add blurDataURL for blur-up effect
      // blurDataURL="/placeholder-avatar.png"
    />
  );
};

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      role: "",
    },
  });

  const watchedRole = watch("role");

  // Memoized filtered users to prevent unnecessary re-renders
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm) ||
        user.role_name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [users, searchTerm]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/roles/?is_active=false"
      );
      setRoles(response.data.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to fetch roles");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const response = await axiosInstance.get("/api/v1/admin/users/");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const response = await axiosInstance.get("/api/v1/admin/analytics");
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to fetch analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        if (isMounted) {
          await Promise.all([fetchRoles(), fetchUsers(), fetchAnalytics()]);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to initialize data:", error);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const table = useReactTable({
    data: filteredUsers,
    columns: [
      {
        accessorKey: "id",
        header: () => <div className="text-center font-semibold">ID</div>,
        cell: ({ row }) => (
          <div className="text-center font-mono text-sm">
            {row.original.user_id}
          </div>
        ),
      },
      {
        accessorKey: "profile_picture",
        header: () => <div className="font-semibold">Profile Picture</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-center h-full w-full">
              <ProfilePicture
                src={user.profile_picture}
                username={user.username}
                size={36}
                className="border border-border/50 mx-auto my-1"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "username",
        header: () => <div className="font-semibold">User Name</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              {/* Only show the username, not the avatar */}
              <span className="font-medium text-foreground">
                {user.username}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: () => <div className="font-semibold">Email</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{row.original.email}</span>
              <span className="text-xs text-muted-foreground">
                {row.original.email.split("@")[1]}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role_name",
        header: () => <div className="font-semibold">Role</div>,
        cell: ({ row }) => {
          const getRoleColor = (role: string) => {
            switch (role.toLowerCase()) {
              case "admin":
                return "bg-red-500/10 text-red-600 border-red-200";
              case "moderator":
                return "bg-orange-500/10 text-orange-600 border-orange-200";
              case "user":
                return "bg-blue-500/10 text-blue-600 border-blue-200";
              default:
                return "bg-gray-500/10 text-gray-600 border-gray-200";
            }
          };

          return (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant="outline"
                className={`text-xs font-medium ${getRoleColor(
                  row.original.role_name
                )}`}
              >
                {row.original.role_name}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "switchStatus",
        header: () => <div className="text-center font-semibold">Status</div>,
        cell: ({ row }) => {
          const user = row.original;
          // Negation logic: is_deleted = true means Inactive, is_deleted = false means Active
          const isUserActive = !user.is_deleted;

          return (
            <div className="flex items-center justify-center gap-3">
              <Switch
                checked={isUserActive}
                onCheckedChange={() => {
                  setSelectedUser(user);
                  setSwitchOpen(true);
                }}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  isUserActive
                    ? "bg-green-500/10 text-green-600 border-green-200"
                    : "bg-red-500/10 text-red-600 border-red-200"
                }`}
              >
                <div className="flex items-center gap-1">
                  {isUserActive ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {isUserActive ? "Active" : "Inactive"}
                </div>
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 hover:bg-primary/10 button-hover transition-all duration-200"
              onClick={() => {
                setEditingUser(row.original);
                setOpen(true);
                setValue("username", row.original.username);
                setValue("email", row.original.email);
                setValue("role", row.original.role_id);
              }}
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (editingUser) {
        // Update existing user - prepare JSON payload
        const updatePayload = {
          new_username: data.username,
          new_role_id: data.role,
        };

        try {
          const userId = editingUser.user_id || editingUser.id;
          const response = await axiosInstance.put(
            `/api/v1/admin/users/${userId}`,
            updatePayload,
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.data.statusCode === 200) {
            toast.success("User updated successfully");
            fetchUsers();
            fetchAnalytics();
          }
        } catch (error: any) {
          console.error("Update error:", error);
          if (error.response) {
            const { data, status } = error.response;
            if (status === 400) {
              toast.error(data?.detail?.message || "Bad request");
            } else if (status === 409) {
              toast.error(data?.detail?.message || "User already exists");
            } else {
              toast.error(data?.detail?.message || "Update failed");
            }
          } else {
            // Handle network errors or other non-HTTP errors
            toast.error(error.message || "Network error occurred");
          }
        }
      } else {
        // Create new user - prepare JSON payload
        const createPayload = {
          username: data.username,
          email: data.email,
          role_id: data.role,
        };

        try {
          const response = await axiosInstance.post(
            "/api/v1/admin/register",
            createPayload,
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.data.statusCode === 201) {
            toast.success("User added successfully");
            fetchUsers();
            fetchAnalytics();
          }
        } catch (error: any) {
          console.error("Create error:", error);
          if (error.response) {
            const { data, status } = error.response;
            if (status === 409) {
              toast.error(data?.detail?.message || "User already exists");
            } else if (status === 403) {
              toast.error(data?.detail?.message || "Forbidden");
            } else {
              toast.error(data?.detail?.message || "Creation failed");
            }
          } else {
            // Handle network errors or other non-HTTP errors
            toast.error(error.message || "Network error occurred");
          }
        }
      }
    } catch (error: any) {
      console.error("General error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
      reset();
      setOpen(false);
      setEditingUser(null);
    }
  };

  // Show skeleton while loading
  if (isInitialLoading) {
    return (
      <div className="p-6 space-y-6">
        <UserTableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Users
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>

        <Button
          className="flex items-center gap-2 button-hover"
          onClick={() => {
            setEditingUser(null);
            reset();
            setOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>

        {/* Custom Modal Implementation - React 19 Compatible */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setOpen(false);
                reset();
                setEditingUser(null);
              }}
            />

            {/* Modal Content */}
            <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-[425px] max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-2">
                  {editingUser ? (
                    <>
                      <Edit3 className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Edit User</h2>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Add New User</h2>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    reset();
                    setEditingUser(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <div className="px-6 pt-2 pb-4">
                <p className="text-sm text-muted-foreground">
                  {editingUser
                    ? "Update the user information below."
                    : "Fill in the details to create a new user account."}
                </p>
              </div>

              {/* Form Content */}
              <div className="px-6 pb-6">
                {loading ? (
                  <UserFormSkeleton />
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile Picture Preview */}
                    {editingUser && (
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <ProfilePicture
                          src={editingUser.profile_picture}
                          username={editingUser.username}
                          size={60}
                          className="border-2 border-border shadow-sm"
                        />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">Current Profile</p>
                          <p className="text-xs text-muted-foreground">
                            {editingUser.profile_picture
                              ? "Custom image"
                              : "Generated from username"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <UserIcon className="h-4 w-4" />
                        User Name
                      </Label>
                      <Input
                        id="username"
                        {...register("username")}
                        className="form-field-animate form-focus"
                        placeholder="Enter username"
                      />
                      {errors.username && (
                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="form-field-animate form-focus"
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Role
                      </Label>
                      <Select
                        onValueChange={(val) => setValue("role", val)}
                        value={watchedRole}
                      >
                        <SelectTrigger className="w-full form-field-animate form-focus">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.role_id} value={role.role_id}>
                              <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                {role.role_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                          {errors.role.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 button-hover"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          {editingUser ? "Updating..." : "Adding..."}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {editingUser ? (
                            <Edit3 className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          {editingUser ? "Update User" : "Add User"}
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-border/50 shadow-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                {analyticsLoading ? (
                  <div className="w-16 h-8 bg-muted rounded skeleton-shimmer"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-foreground">
                    {analytics?.summary.total_users || 0}
                  </h3>
                )}
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-border/50 shadow-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                {analyticsLoading ? (
                  <div className="w-16 h-8 bg-muted rounded skeleton-shimmer"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-green-600">
                    {analytics?.summary.active_users || 0}
                  </h3>
                )}
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Users */}
        <Card className="border-border/50 shadow-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive Users
                </p>
                {analyticsLoading ? (
                  <div className="w-16 h-8 bg-muted rounded skeleton-shimmer"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-orange-600">
                    {analytics?.summary.inactive_users || 0}
                  </h3>
                )}
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <XCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Users */}
        <Card className="border-border/50 shadow-sm card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  High Risk
                </p>
                {analyticsLoading ? (
                  <div className="w-16 h-8 bg-muted rounded skeleton-shimmer"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-red-600">
                    {analytics?.summary.high_failed_attempts || 0}
                  </h3>
                )}
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Registration Chart */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="w-24 h-5 bg-muted rounded skeleton-shimmer"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      Registrations:
                    </div>
                    <div className="w-8 h-6 bg-muted rounded skeleton-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.daily_registrations &&
              analytics.daily_registrations.length > 0 ? (
                analytics.daily_registrations.slice(-7).map((day, index) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Registrations:
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {day.count}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>No registration data available</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-border/50 shadow-sm card-hover">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                User Management
                <Badge variant="secondary" className="ml-2">
                  {filteredUsers.length} of {users.length} user
                  {users.length !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchUsers();
                  fetchAnalytics();
                }}
                className="flex items-center gap-2 hover:bg-primary/10"
              >
                <Activity className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-field-animate form-focus"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow
                    key={group.id}
                    className="border-border/50 bg-muted/50"
                  >
                    {group.headers.map((header) => (
                      <TableHead key={header.id} className="px-6 py-4">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => {
                    const isUserActive = !row.original.is_deleted;
                    return (
                      <TableRow
                        key={row.id}
                        className={`border-border/50 transition-colors table-hover ${
                          isUserActive
                            ? "table-row-active"
                            : "table-row-inactive"
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-6 py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {searchTerm ? (
                          <>
                            <Search className="h-8 w-8" />
                            <p>
                              No users found matching &quot;{searchTerm}&quot;
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                              className="mt-2"
                            >
                              Clear search
                            </Button>
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-8 w-8" />
                            <p>No users available.</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Status Change Dialog */}
      <AlertDialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change User Status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to{" "}
              <span className="font-semibold text-foreground">
                {selectedUser?.is_deleted ? "activate" : "deactivate"}
              </span>{" "}
              this user? This will{" "}
              {selectedUser?.is_deleted ? "allow" : "prevent"} them from
              accessing the system.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Current status:{" "}
                {selectedUser?.is_deleted ? "Inactive" : "Active"}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedUser(null);
              }}
              className="button-hover"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedUser) return;

                const userId = selectedUser.user_id || selectedUser.id;
                const endpoint = selectedUser.is_deleted
                  ? `/api/v1/admin/users/${userId}/reactivate`
                  : `/api/v1/admin/users/${userId}/deactivate`;

                try {
                  await axiosInstance.patch(endpoint);
                  toast.success(
                    `User ${
                      selectedUser.is_deleted ? "activated" : "deactivated"
                    } successfully`
                  );
                  fetchUsers();
                  fetchAnalytics();
                } catch (error: any) {
                  console.error("Status update error:", error);
                  toast.error("Failed to update status");
                } finally {
                  setSwitchOpen(false);
                  setSelectedUser(null);
                }
              }}
              className="button-hover"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
