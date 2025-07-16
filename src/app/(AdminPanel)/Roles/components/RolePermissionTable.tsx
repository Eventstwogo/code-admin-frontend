import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowUpDown, Trash2, Shield, Key, Link2 } from 'lucide-react';
import { Role, Permission, RolePermission } from '@/services/rbac';
import { RolePermissionTableSkeleton } from '@/components/LoadingSpinner';
import { DeleteConfirmState } from './types';

interface RolePermissionTableProps {
  rolePermissions: RolePermission[];
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  onDelete: (confirm: DeleteConfirmState) => void;
  onToggleStatus: (recordId: string, status: boolean) => void;
}

export function RolePermissionTable({
  rolePermissions,
  roles,
  permissions,
  loading,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
  onDelete,
  onToggleStatus,
}: RolePermissionTableProps) {
  const columns: ColumnDef<RolePermission>[] = [
    {
      accessorKey: 'record_id',
      header: 'Record ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">{row.getValue('record_id')}</div>
      ),
    },
    {
      accessorKey: 'role_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <Shield className="mr-2 h-4 w-4" />
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rolePermission = row.original;
        const role = roles.find(r => r.role_id === rolePermission.role_id);
        return (
          <div className="font-semibold text-foreground">
            {role?.role_name || rolePermission.role_id}
          </div>
        );
      },
    },
    {
      accessorKey: 'permission_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <Key className="mr-2 h-4 w-4" />
          Permission
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rolePermission = row.original;
        const permission = permissions.find(p => p.permission_id === rolePermission.permission_id);
        return (
          <div className="font-semibold text-foreground">
            {permission?.permission_name || rolePermission.permission_id}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rolePermission = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={!rolePermission.status}
              onCheckedChange={(checked) => onToggleStatus(rolePermission.record_id, !checked)}
              size="sm"
            />
            <span className={`text-sm font-medium ${
              !rolePermission.status 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {rolePermission.status ? 'Inactive' : 'Active'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const role = roles.find(r => r.role_id === row.original.role_id);
              const permission = permissions.find(p => p.permission_id === row.original.permission_id);
              onDelete({
                open: true,
                type: 'rolePermission',
                id: row.original.record_id,
                name: `${role?.role_name || 'Unknown'} - ${permission?.permission_name || 'Unknown'}`
              });
            }}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rolePermissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
  });

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <RolePermissionTableSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id} 
                className="hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Link2 className="h-8 w-8" />
                  <p className="text-lg font-medium">No role-permission relationships found</p>
                  <p className="text-sm">Create your first item to get started</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}