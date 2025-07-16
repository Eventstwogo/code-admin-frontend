import { useState } from 'react';
import { toast } from 'sonner';
import { permissionService } from '@/services/rbac';
import { PermissionFormData } from '../types';

interface UsePermissionActionsProps {
  fetchPermissions: () => Promise<void>;
}

export function usePermissionActions({ fetchPermissions }: UsePermissionActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCreatePermission = async (data: PermissionFormData) => {
    try {
      setLoading(true);
      await permissionService.create(data.permission_name);
      toast.success('Permission created successfully');
      fetchPermissions();
    } catch (error) {
      toast.error('Failed to create permission');
      console.error('Error creating permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (permissionId: string, data: PermissionFormData) => {
    try {
      setLoading(true);
      await permissionService.update(permissionId, data.permission_name);
      toast.success('Permission updated successfully');
      fetchPermissions();
    } catch (error) {
      toast.error('Failed to update permission');
      console.error('Error updating permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      await permissionService.delete(permissionId);
      toast.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error) {
      toast.error('Failed to delete permission');
      console.error('Error deleting permission:', error);
    }
  };

  const handleTogglePermissionStatus = async (permissionId: string, status: boolean) => {
    try {
      await permissionService.updateStatus(permissionId, status);
      toast.success('Permission status updated successfully');
      fetchPermissions();
    } catch (error) {
      toast.error('Failed to update permission status');
      console.error('Error updating permission status:', error);
    }
  };

  return {
    loading,
    handleCreatePermission,
    handleUpdatePermission,
    handleDeletePermission,
    handleTogglePermissionStatus,
  };
}