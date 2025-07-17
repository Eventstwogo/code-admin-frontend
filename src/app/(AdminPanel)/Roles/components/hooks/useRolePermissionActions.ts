import { useState } from 'react';
import { toast } from 'sonner';
import { rolePermissionService } from '@/services/rbac';
import { RolePermissionFormData } from '../types';

interface UseRolePermissionActionsProps {
  fetchRolePermissions: () => Promise<void>;
}

export function useRolePermissionActions({ fetchRolePermissions }: UseRolePermissionActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateRolePermission = async (data: RolePermissionFormData) => {
    try {
      setLoading(true);
      // Create multiple role-permission relationships
      for (const permissionId of data.permission_ids) {
        await rolePermissionService.create(data.role_id, permissionId);
      }
      toast.success('Role permissions assigned successfully');
      await fetchRolePermissions();
    } catch (error) {
      toast.error('Failed to assign role permissions');
      console.error('Error creating role permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRolePermission = async (recordId: string) => {
    try {
      await rolePermissionService.delete(recordId);
      toast.success('Role permission removed successfully');
      await fetchRolePermissions();
    } catch (error) {
      toast.error('Failed to remove role permission');
      console.error('Error deleting role permission:', error);
    }
  };

  const handleToggleRolePermissionStatus = async (recordId: string, status: boolean) => {
    try {
      await rolePermissionService.updateStatus(recordId, status);
      toast.success('Role permission status updated successfully');
      await fetchRolePermissions();
    } catch (error) {
      toast.error('Failed to update role permission status');
      console.error('Error updating role permission status:', error);
    }
  };

  return {
    loading,
    handleCreateRolePermission,
    handleDeleteRolePermission,
    handleToggleRolePermissionStatus,
  };
}