'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Plus, 
  Shield, 
  Key, 
  Link2,
  Search,
  Settings
} from 'lucide-react';
import { Role, Permission } from '@/services/rbac';
import dynamic from 'next/dynamic';

// Import our new components
import { useRBACData } from './components/hooks/useRBACData';
import { useRoleActions } from './components/hooks/useRoleActions';
import { usePermissionActions } from './components/hooks/usePermissionActions';
import { useRolePermissionActions } from './components/hooks/useRolePermissionActions';
import { StatsCards } from './components/StatsCards';
import { RoleForm } from './components/RoleForm';
import { PermissionForm } from './components/PermissionForm';
import { RolePermissionForm } from './components/RolePermissionForm';
import { RoleTable } from './components/RoleTable';
import { PermissionTable } from './components/PermissionTable';
import { RolePermissionTable } from './components/RolePermissionTable';
import { DeleteConfirmState, RoleFormData, PermissionFormData, RolePermissionFormData } from './components/types';

const ConfirmDialog = dynamic(() => import('@/components/ConfirmDialog').then(mod => mod.ConfirmDialog), { ssr: false });

export default function RBACPage() {
  // State management
  const [activeTab, setActiveTab] = useState('roles');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Dialog states
  const [roleDialog, setRoleDialog] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [rolePermissionDialog, setRolePermissionDialog] = useState(false);
  
  // Editing states
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  
  // Confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    type: 'role',
    id: '',
    name: ''
  });

  // Custom hooks
  const {
    roles,
    permissions,
    rolePermissions,
    rolesLoading,
    permissionsLoading,
    rolePermissionsLoading,
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
  } = useRBACData();

  const {
    loading: roleLoading,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    handleToggleRoleStatus,
  } = useRoleActions({ fetchRoles });

  const {
    loading: permissionLoading,
    handleCreatePermission,
    handleUpdatePermission,
    handleDeletePermission,
    handleTogglePermissionStatus,
  } = usePermissionActions({ fetchPermissions });

  const {
    loading: rolePermissionLoading,
    handleCreateRolePermission,
    handleDeleteRolePermission,
    handleToggleRolePermissionStatus,
  } = useRolePermissionActions({ fetchRolePermissions });

  // Form handlers with useCallback optimization
  const handleRoleSubmit = useCallback(async (data: RoleFormData) => {
    if (editingRole) {
      await handleUpdateRole(editingRole.role_id, data);
      setEditingRole(null);
    } else {
      await handleCreateRole(data);
    }
  }, [editingRole, handleUpdateRole, handleCreateRole]);

  const handlePermissionSubmit = useCallback(async (data: PermissionFormData) => {
    if (editingPermission) {
      await handleUpdatePermission(editingPermission.permission_id, data);
      setEditingPermission(null);
    } else {
      await handleCreatePermission(data);
    }
  }, [editingPermission, handleUpdatePermission, handleCreatePermission]);

  const handleRolePermissionSubmit = useCallback(async (data: RolePermissionFormData) => {
    await handleCreateRolePermission(data);
  }, [handleCreateRolePermission]);

  // Edit handlers with useCallback optimization
  const handleEditRole = useCallback((role: Role) => {
    setEditingRole(role);
    setRoleDialog(true);
  }, []);

  const handleEditPermission = useCallback((permission: Permission) => {
    setEditingPermission(permission);
    setPermissionDialog(true);
  }, []);

  // Dialog handlers with useCallback optimization
  const handleOpenRoleDialog = useCallback(() => {
    setEditingRole(null);
    setRoleDialog(true);
  }, []);

  const handleOpenPermissionDialog = useCallback(() => {
    setEditingPermission(null);
    setPermissionDialog(true);
  }, []);

  const handleOpenRolePermissionDialog = useCallback(() => {
    setRolePermissionDialog(true);
  }, []);

  // Dialog close handlers with useCallback optimization
  const handleCloseRoleDialog = useCallback((open: boolean) => {
    setRoleDialog(open);
    if (!open) {
      setEditingRole(null);
    }
  }, []);

  const handleClosePermissionDialog = useCallback((open: boolean) => {
    setPermissionDialog(open);
    if (!open) {
      setEditingPermission(null);
    }
  }, []);

  const handleCloseRolePermissionDialog = useCallback((open: boolean) => {
    setRolePermissionDialog(open);
  }, []);

  const handleCloseDeleteConfirm = useCallback((open: boolean) => {
    setDeleteConfirm(prev => ({ ...prev, open }));
  }, []);

  // Delete confirmation handler with useCallback optimization
  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm.type === 'role') {
      handleDeleteRole(deleteConfirm.id);
    } else if (deleteConfirm.type === 'permission') {
      handleDeletePermission(deleteConfirm.id);
    } else if (deleteConfirm.type === 'rolePermission') {
      handleDeleteRolePermission(deleteConfirm.id);
    }
    setDeleteConfirm({ open: false, type: 'role', id: '', name: '' });
  }, [deleteConfirm, handleDeleteRole, handleDeletePermission, handleDeleteRolePermission]);

  const isStatsLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">RBAC Management</h1>
            </div>
            <p className="text-muted-foreground">
              Manage roles, permissions, and their relationships for comprehensive access control
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          roles={roles}
          permissions={permissions}
          rolePermissions={rolePermissions}
          isLoading={isStatsLoading}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="role-permissions" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Role-Permissions
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles Management
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={globalFilter ?? ''}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button 
                    onClick={handleOpenRoleDialog}
                    className="gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <RoleTable
                  roles={roles}
                  loading={rolesLoading}
                  sorting={sorting}
                  setSorting={setSorting}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  onEdit={handleEditRole}
                  onDelete={setDeleteConfirm}
                  onToggleStatus={handleToggleRoleStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Permissions Management
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={globalFilter ?? ''}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button 
                    onClick={handleOpenPermissionDialog}
                    className="gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Permission
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <PermissionTable
                  permissions={permissions}
                  loading={permissionsLoading}
                  sorting={sorting}
                  setSorting={setSorting}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  onEdit={handleEditPermission}
                  onDelete={setDeleteConfirm}
                  onToggleStatus={handleTogglePermissionStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role-Permissions Tab */}
          <TabsContent value="role-permissions" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Role-Permission Relationships
                  </CardTitle>
                </div>
                <Button 
                  onClick={handleOpenRolePermissionDialog}
                  className="gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Assign Permissions
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <RolePermissionTable
                  rolePermissions={rolePermissions}
                  roles={roles}
                  permissions={permissions}
                  loading={rolePermissionsLoading}
                  sorting={sorting}
                  setSorting={setSorting}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  onDelete={setDeleteConfirm}
                  onToggleStatus={handleToggleRolePermissionStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <RoleForm
          open={roleDialog}
          onOpenChange={handleCloseRoleDialog}
          editingRole={editingRole}
          onSubmit={handleRoleSubmit}
          loading={roleLoading}
        />

        <PermissionForm
          open={permissionDialog}
          onOpenChange={handleClosePermissionDialog}
          editingPermission={editingPermission}
          onSubmit={handlePermissionSubmit}
          loading={permissionLoading}
        />

        <RolePermissionForm
          open={rolePermissionDialog}
          onOpenChange={handleCloseRolePermissionDialog}
          roles={roles}
          permissions={permissions}
          onSubmit={handleRolePermissionSubmit}
          loading={rolePermissionLoading}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={handleCloseDeleteConfirm}
          title={`Delete ${deleteConfirm.type === 'rolePermission' ? 'Role Permission' : deleteConfirm.type === 'role' ? 'Role' : 'Permission'}`}
          description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}