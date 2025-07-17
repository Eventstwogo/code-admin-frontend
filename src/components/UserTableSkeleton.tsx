'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function UserTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-20 skeleton-shimmer" />
          <Skeleton className="h-4 w-48 skeleton-shimmer" />
        </div>
        <Skeleton className="h-10 w-24 skeleton-shimmer" />
      </div>

      {/* Table Skeleton */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 skeleton-shimmer" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 bg-muted/50">
                  <TableHead className="w-16 px-6 py-4">
                    <Skeleton className="h-4 w-8 skeleton-shimmer" />
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    <Skeleton className="h-4 w-20 skeleton-shimmer" />
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    <Skeleton className="h-4 w-16 skeleton-shimmer" />
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    <Skeleton className="h-4 w-12 skeleton-shimmer" />
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    <Skeleton className="h-4 w-16 skeleton-shimmer" />
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    <Skeleton className="h-4 w-16 skeleton-shimmer" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-border/50">
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-8 skeleton-shimmer" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full skeleton-shimmer" />
                        <Skeleton className="h-4 w-24 skeleton-shimmer" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full skeleton-shimmer" />
                        <Skeleton className="h-4 w-32 skeleton-shimmer" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full skeleton-shimmer" />
                        <Skeleton className="h-5 w-16 rounded-full skeleton-shimmer" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-5 w-9 rounded-full skeleton-shimmer" />
                        <Skeleton className="h-5 w-12 rounded-full skeleton-shimmer" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-16 skeleton-shimmer" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Username Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 skeleton-shimmer" />
        <Skeleton className="h-10 w-full skeleton-shimmer" />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12 skeleton-shimmer" />
        <Skeleton className="h-10 w-full skeleton-shimmer" />
      </div>

      {/* Role Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-10 skeleton-shimmer" />
        <Skeleton className="h-10 w-full skeleton-shimmer" />
      </div>

      {/* Submit Button */}
      <Skeleton className="h-10 w-full skeleton-shimmer" />
    </div>
  );
}