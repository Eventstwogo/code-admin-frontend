import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { permissionService } from '@/services/rbac';
import { PermissionFormData } from '../types';

interface UsePermissionActionsProps {
  fetchPermissions: () => Promise<void>;
}

export function usePermissionActions({ fetchPermissions }: UsePermissionActionsProps) {
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  const handleCreatePermission = useCallback(async (data: PermissionFormData) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      await permissionService.create(data.permission_name);
      
      if (isMountedRef.current) {
        toast.success('Permission created successfully');
        await fetchPermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to create permission');
        console.error('Error creating permission:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchPermissions]);

  const handleUpdatePermission = useCallback(async (permissionId: string, data: PermissionFormData) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      await permissionService.update(permissionId, data.permission_name);
      
      if (isMountedRef.current) {
        toast.success('Permission updated successfully');
        await fetchPermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to update permission');
        console.error('Error updating permission:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchPermissions]);

  const handleDeletePermission = useCallback(async (permissionId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      await permissionService.delete(permissionId);
      
      if (isMountedRef.current) {
        toast.success('Permission deleted successfully');
        await fetchPermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to delete permission');
        console.error('Error deleting permission:', error);
      }
    }
  }, [fetchPermissions]);

  const handleTogglePermissionStatus = useCallback(async (permissionId: string, status: boolean) => {
    if (!isMountedRef.current) return;
    
    try {
      await permissionService.updateStatus(permissionId, status);
      
      if (isMountedRef.current) {
        toast.success('Permission status updated successfully');
        await fetchPermissions();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to update permission status');
        console.error('Error updating permission status:', error);
      }
    }
  }, [fetchPermissions]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    loading,
    handleCreatePermission,
    handleUpdatePermission,
    handleDeletePermission,
    handleTogglePermissionStatus,
  };
}