
'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axiosInstance';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Image component with fallback
const CategoryImage = ({ src, alt, name }: { src?: string; alt: string; name: string }) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const firstLetter = name.charAt(0).toUpperCase();

  if (!src || imageError) {
    return (
      <div className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center">
        <span className="text-sm font-semibold text-muted-foreground">
          {firstLetter}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10">
      {isLoading && (
        <div className="absolute inset-0 rounded-lg border border-border bg-muted flex items-center justify-center">
          <span className="text-sm font-semibold text-muted-foreground">
            {firstLetter}
          </span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-10 h-10 rounded-lg object-cover shadow-sm border border-border transition-opacity ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

// Skeleton component for table rows
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-md" />
        <Skeleton className="h-4 w-32" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-40" />
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-16" />
    </TableCell>
  </TableRow>
);

const CategoriesTable = () => {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [switchOpen, setSwitchOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);
  const [desiredStatus, setDesiredStatus] = React.useState<'active' | 'inactive' | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const router = useRouter();
  const fetchCategories = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await axiosInstance('/api/v1/categories/list');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  React.useEffect(() => {
    fetchCategories();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };


const updateCategoryStatus = async (id: string, status: 'active' | 'inactive') => {
  const endpoint =
    status === 'active'
      ? `/api/v1/category-items/${id}/restore`       // PATCH for restore
      : `/api/v1/category-items/${id}/soft`;  // DELETE for soft delete

  try {
    if (status === 'active') {
      await axiosInstance.put(endpoint); // Restore → PATCH
    } else {
      await axiosInstance.delete(endpoint); // Soft delete → DELETE
    }

    toast.success(`Category ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
    await fetchCategories(true);
  } catch (error) {
    toast.error('Failed to update status');
  } finally {
    setSwitchOpen(false);
    setSelectedRow(null);
    setDesiredStatus(null);
  }
};

  const normalizedData = React.useMemo(() => {
    return categories.map((cat) => ({
      id: cat.category_id,
      name: cat.category_name,
      slug: cat.category_slug,
      description: cat.category_description || "No description",
      image: cat.category_img_thumbnail || null,
      status: cat.category_status ? 'inactive' : 'active',
      type: 'category',
      subcategories: (cat.subcategories || []).map((sub) => ({
        id: sub.subcategory_id,
        parentId: cat.category_id,
        name: sub.subcategory_name,
        slug: sub.subcategory_slug,
        description: sub.subcategory_description || "No description",
        image: sub.subcategory_img_thumbnail || null,
        status: sub.subcategory_status ? 'inactive' : 'active',
        type: 'subcategory',
      })),
    }));
  }, [categories]);

  const data = React.useMemo(() => {
    const flatData = [];
    for (const category of normalizedData) {
      flatData.push(category);
      if (expandedRows[category.id] && Array.isArray(category.subcategories)) {
        flatData.push(...category.subcategories);
      }
    }
    return flatData;
  }, [normalizedData, expandedRows]);

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const isCategory = row.original.type === 'category';
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <CategoryImage 
                src={row.original.image}
                alt={row.original.name}
                name={row.original.name}
              />
              {row.original.status === 'inactive' && (
                <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {row.original.name}
              </span>
              {row.original.type === 'subcategory' && (
                <span className="text-xs text-muted-foreground">
                  Subcategory
                </span>
              )}
            </div>
            {isCategory && row.original.subcategories?.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleRow(row.original.id)}
                className="h-8 w-8 hover:bg-accent"
              >
                {expandedRows[row.original.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm text-muted-foreground truncate">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isCategory = row.original.type === 'category';
        const isActive = row.original.status === 'active';

        // Prevent subcategory activation if parent is inactive
        const isParentInactive =
          row.original.type === 'subcategory' &&
          normalizedData.find(cat => cat.id === row.original.parentId)?.status === 'inactive';

        const isDisabled = isParentInactive;

        return isCategory || row.original.type === 'subcategory' ? (
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              disabled={isDisabled}
              onCheckedChange={(checked) => {
                setSelectedRow(row.original);
                setDesiredStatus(checked ? 'active' : 'inactive');
                setSwitchOpen(true);
              }}
            />
            <div className="flex flex-col">
              <Badge 
                variant={isActive ? 'default' : 'secondary'}
                className={`text-xs ${
                  isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
              {isDisabled && (
                <span className="text-xs text-muted-foreground mt-1">
                  Parent inactive
                </span>
              )}
            </div>
          </div>
        ) : (
          <Badge variant={isActive ? 'default' : 'outline'}>
            {row.original.status}
          </Badge>
        );
      },
    },




    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/Categories/AddCategory?id=${row.original.id}`)}
            disabled={row.original.status === 'inactive'}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ], [expandedRows, normalizedData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => `${row.type}-${row.id}`,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-card rounded-lg border">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage your event categories and subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCategories(true)}
            disabled={isRefreshing}
            className="hover:bg-accent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push('/Categories/AddCategory')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            All Categories
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({categories.length} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {!isLoading && table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        className="bg-muted/50 font-semibold text-muted-foreground h-12"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  // Skeleton Loading State
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  // Empty State
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No categories found</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/Categories/AddCategory')}
                        >
                          Create your first category
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data Rows with Animation
                  <AnimatePresence initial={false}>
                    {table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          border-b hover:bg-muted/50 transition-colors
                          ${row.original.type === 'subcategory' 
                            ? 'bg-muted/20 dark:bg-muted/10' 
                            : 'bg-background'
                          }
                        `}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`
                              py-4 px-6 
                              ${row.original.type === 'subcategory' ? 'pl-12' : ''}
                            `}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                desiredStatus === 'active' 
                  ? 'bg-green-500' 
                  : 'bg-gray-500'
              }`} />
              Change Status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to{' '}
              <span className={`font-semibold ${
                desiredStatus === 'active' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {desiredStatus}
              </span>{' '}
              this {selectedRow?.type}?
              {selectedRow?.type === 'category' && desiredStatus === 'inactive' && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-800 dark:text-amber-200 text-sm">
                  ⚠️ This will also deactivate all subcategories
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSwitchOpen(false);
                setSelectedRow(null);
                setDesiredStatus(null);
              }}
              className="hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedRow || !desiredStatus) return;

                // Prevent activating subcategory if parent is inactive
                if (
                  selectedRow.type === 'subcategory' &&
                  desiredStatus === 'active'
                ) {
                  const parent = categories.find(
                    (cat) => cat.category_id === selectedRow.parentId
                  );
                  if (parent && !parent.category_status) {
                    toast.error('Cannot activate subcategory while parent is inactive');
                    setSwitchOpen(false);
                    setSelectedRow(null);
                    setDesiredStatus(null);
                    return;
                  }
                }

                await updateCategoryStatus(selectedRow.id, desiredStatus);
              }}
              className={`${
                desiredStatus === 'active'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                  : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800'
              }`}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
};

export default CategoriesTable;
