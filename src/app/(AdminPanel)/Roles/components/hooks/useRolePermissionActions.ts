import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { rolePermissionService } from '@/services/rbac';
import { RolePermissionFormData } from '../types';

interface UseRolePermissionActionsProps {
  fetchRolePermissions: () => Promise<void>;
}

export function useRolePermissionActions({ fetchRolePermissions }: UseRolePermissionActionsProps) {
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  const handleCreateRolePermission = useCallback(async (data: RolePermissionFormData) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      // Create multiple role-permission relationships
      for (const permissionId of data.permission_ids) {
        await rolePermissionService.create(data.role_id, permissionId);
      }
      
      if (isMountedRef.current) {
        toast.success('Role permissions assigned successfully');
        await fetchRolePermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to assign role permissions');
        console.error('Error creating role permissions:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchRolePermissions]);

  const handleDeleteRolePermission = useCallback(async (recordId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      await rolePermissionService.delete(recordId);
      
      if (isMountedRef.current) {
        toast.success('Role permission removed successfully');
        await fetchRolePermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to remove role permission');
        console.error('Error deleting role permission:', error);
      }
    }
  }, [fetchRolePermissions]);

  const handleToggleRolePermissionStatus = useCallback(async (recordId: string, status: boolean) => {
    if (!isMountedRef.current) return;
    
    try {
      await rolePermissionService.updateStatus(recordId, status);
      
      if (isMountedRef.current) {
        toast.success('Role permission status updated successfully');
        await fetchRolePermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to update role permission status');
        console.error('Error updating role permission status:', error);
      }
    }
  }, [fetchRolePermissions]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    loading,
    handleCreateRolePermission,
    handleDeleteRolePermission,
    handleToggleRolePermissionStatus,
  };
}