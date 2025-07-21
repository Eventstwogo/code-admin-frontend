
'use client';

import React, { useCallback, useEffect } from 'react';
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
import Image from 'next/image';
import useSWR from 'swr';

// Image component with fallback
const CategoryImage = React.memo(({ src, alt, name }: { src?: string; alt: string; name: string }) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const firstLetter = name.charAt(0).toUpperCase();

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

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
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className={`w-10 h-10 rounded-lg object-cover shadow-sm border border-border transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
      />
    </div>
  );
});

CategoryImage.displayName = 'CategoryImage';

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

// SWR fetcher for categories
const fetchCategories = async () => {
  try {
    const response = await axiosInstance('/api/v1/categories/list');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

function useCategoriesSWR() {
  const { data, error, isLoading, mutate } = useSWR('categories-list', fetchCategories, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
  return {
    categories: data || [],
    error,
    isLoading,
    mutate,
  };
}

const CategoriesTable = () => {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [switchOpen, setSwitchOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);
  const [desiredStatus, setDesiredStatus] = React.useState<'active' | 'inactive' | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const router = useRouter();
  const { categories, error, isLoading, mutate } = useCategoriesSWR();

  const refreshCategories = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  }, [mutate]);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);


  const updateCategoryStatus = useCallback(async (id: string, status: 'active' | 'inactive') => {
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
      await mutate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setSwitchOpen(false);
      setSelectedRow(null);
      setDesiredStatus(null);
    }
  }, [mutate]);

  const normalizedData = React.useMemo(() => {
    return categories.map((cat: { category_id: any; category_name: any; category_slug: any; category_description: any; category_img_thumbnail: any; category_status: any; subcategories: any; }) => ({
      id: cat.category_id,
      name: cat.category_name,
      slug: cat.category_slug,
      description: cat.category_description || "No description",
      image: cat.category_img_thumbnail || null,
      status: cat.category_status ? 'inactive' : 'active',
      type: 'category',
      subcategories: (cat.subcategories || []).map((sub: { subcategory_id: any; subcategory_name: any; subcategory_slug: any; subcategory_description: any; subcategory_img_thumbnail: any; subcategory_status: any; }) => ({
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

  const handleSwitchChange = useCallback((row: any, checked: boolean) => {
    setSelectedRow(row);
    setDesiredStatus(checked ? 'active' : 'inactive');
    setSwitchOpen(true);
  }, []);

  const handleEditClick = useCallback((id: string) => {
    router.push(`/Categories/AddCategory?id=${id}`);
  }, [router]);

  const handleDialogCancel = useCallback(() => {
    setSwitchOpen(false);
    setSelectedRow(null);
    setDesiredStatus(null);
  }, []);

  const handleDialogConfirm = useCallback(async () => {
    if (!selectedRow || !desiredStatus) return;

    // Prevent activating subcategory if parent is inactive
    if (
      selectedRow.type === 'subcategory' &&
      desiredStatus === 'active'
    ) {
      const parent = categories.find(
        (cat: { category_id: any; }) => cat.category_id === selectedRow.parentId
      );
      console.log(parent.category_status)
      if (parent && parent.category_status) {
        toast.error('Cannot activate subcategory while parent is inactive');
        setSwitchOpen(false);
        setSelectedRow(null);
        setDesiredStatus(null);
        return;
      }
    }

    await updateCategoryStatus(selectedRow.id, desiredStatus);
  }, [selectedRow, desiredStatus, categories, updateCategoryStatus]);

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
          normalizedData.find((cat: { id: any; }) => cat.id === row.original.parentId)?.status === 'inactive';

        const isDisabled = isParentInactive;

        return isCategory || row.original.type === 'subcategory' ? (
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              disabled={isDisabled}
              onCheckedChange={(checked) => handleSwitchChange(row.original, checked)}
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
            onClick={() => handleEditClick(row.original.id)}
            disabled={row.original.status === 'inactive'}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ], [expandedRows, normalizedData, toggleRow, handleSwitchChange, handleEditClick]);

  const tableConfig = React.useMemo(() => ({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => `${row.type}-${row.id}`,
  }), [data, columns]);

  const table = useReactTable(tableConfig);

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
            onClick={refreshCategories}
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
              onClick={handleDialogCancel}
              className="hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDialogConfirm}
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
