"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import {
  Users,
  Search,
  RefreshCw,
  User as UserIcon,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Interface for Application User
interface AppUser {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  is_deleted: boolean;
  days_180_flag: boolean;
  last_login: string;
  created_at: string;
}

// Interface for API Response
interface AppUsersApiResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: AppUser[];
}

// ProfilePicture component
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

  const initials = username
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  
  const isValidImage = src && /^https?:\/\//.test(src) && !imageError;

  if (!isValidImage) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold transition-all duration-200 hover:scale-105 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
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
    />
  );
};

// Loading skeleton component
const AppUsersTableSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function AppUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetchedRef = useRef(false);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm) ||
        user.first_name.toLowerCase().includes(lowerSearchTerm) ||
        user.last_name.toLowerCase().includes(lowerSearchTerm) ||
        user.user_id.toLowerCase().includes(lowerSearchTerm)
    );
  }, [users, searchTerm]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => !user.is_deleted).length;
    const inactiveUsers = users.filter((user) => user.is_deleted).length;
    const usersWithExpiryFlag = users.filter((user) => user.days_180_flag).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersWithExpiryFlag,
    };
  }, [users]);

  // Fetch application users
  const fetchAppUsers = useCallback(async () => {
    // Prevent multiple simultaneous calls and check if already fetched
    if (isFetching || hasFetchedRef.current) return;
    
    try {
      hasFetchedRef.current = true;
      setIsFetching(true);
      setIsLoading(true);
      setError(null);

      console.log("Fetching users from:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/for-admins`);
      
      const response = await axiosInstance.get<AppUsersApiResponse>("/api/v1/users/for-admins");
      
      console.log("API Response:", response.data);
      
      if (response.data.statusCode === 200) {
        setUsers(response.data.data);
        toast.success("Application users loaded successfully");
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Failed to fetch application users:", err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch application users";
      setError(errorMessage);
      toast.error(errorMessage);
      hasFetchedRef.current = false; // Reset on error to allow retry
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  useEffect(() => {
    fetchAppUsers();
  }, []); // Empty dependency array ensures this only runs once

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Table configuration
  const table = useReactTable({
    data: filteredUsers,
    columns: [
      {
        id: "serial_number",
        header: () => <div className="text-center font-semibold">S.No</div>,
        cell: ({ row }) => (
          <div className="text-center font-mono text-sm bg-muted/50 px-2 py-1 rounded">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "profile_picture",
        header: () => <div className="font-semibold hidden sm:block">Avatar</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="hidden sm:flex items-center justify-center">
              <ProfilePicture
                src={user.profile_picture}
                username={user.username}
                size={40}
                className="border border-border/50"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "username",
        header: () => <div className="font-semibold">User Details</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              {/* Show avatar on mobile, hide on larger screens */}
              <div className="sm:hidden">
                <ProfilePicture
                  src={user.profile_picture}
                  username={user.username}
                  size={32}
                  className="border border-border/50"
                />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">{user.username}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {user.first_name} {user.last_name}
                </div>
              </div>
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
        accessorKey: "is_deleted",
        header: () => <div className="text-center font-semibold">Status</div>,
        cell: ({ row }) => {
          const user = row.original;
          const isActive = !user.is_deleted;

          return (
            <div className="flex items-center justify-center">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  isActive
                    ? "bg-green-500/10 text-green-600 border-green-200"
                    : "bg-red-500/10 text-red-600 border-red-200"
                }`}
              >
                <div className="flex items-center gap-1">
                  {isActive ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {isActive ? "Active" : "Inactive"}
                </div>
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "days_180_flag",
        header: () => <div className="text-center font-semibold hidden lg:block">Expiry Flag</div>,
        cell: ({ row }) => {
          const hasFlag = row.original.days_180_flag;
          return (
            <div className="hidden lg:flex items-center justify-center">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  hasFlag
                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-200"
                    : "bg-gray-500/10 text-gray-600 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-1">
                  {hasFlag ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {hasFlag ? "Flagged" : "Normal"}
                </div>
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "last_login",
        header: () => <div className="font-semibold hidden md:block">Last Login</div>,
        cell: ({ row }) => (
          <div className="hidden md:flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              {row.original.last_login ? formatDate(row.original.last_login) : "Never"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: () => <div className="font-semibold hidden lg:block">Registration Date</div>,
        cell: ({ row }) => (
          <div className="hidden lg:flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">{formatDate(row.original.created_at)}</div>
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Application Users</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and monitor application users
            </p>
          </div>
        </div>
        <AppUsersTableSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Application Users</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and monitor application users
            </p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={fetchAppUsers} className="flex items-center gap-2" disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Loading...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Application Users</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and monitor application users ({users.length} total)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAppUsers}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isFetching ? 'Loading...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.activeUsers}
            </div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.inactiveUsers}
            </div>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              Deactivated users
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiry Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats.usersWithExpiryFlag}
            </div>
            <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
              180-day flag set
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">Users List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center py-8">
                        <UserIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No users found
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : "No application users available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} users
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}