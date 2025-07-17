import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { roleService } from '@/services/rbac';
import { RoleFormData } from '../types';

interface UseRoleActionsProps {
  fetchRoles: () => Promise<void>;
}

export function useRoleActions({ fetchRoles }: UseRoleActionsProps) {
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  const handleCreateRole = useCallback(async (data: RoleFormData) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      await roleService.create(data.role_name);
      
      if (isMountedRef.current) {
        toast.success('Role created successfully');
        await fetchRoles();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to create role');
        console.error('Error creating role:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchRoles]);

  const handleUpdateRole = useCallback(async (roleId: string, data: RoleFormData) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      await roleService.update(roleId, data.role_name);
      
      if (isMountedRef.current) {
        toast.success('Role updated successfully');
        await fetchRoles();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to update role');
        console.error('Error updating role:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchRoles]);

  const handleDeleteRole = useCallback(async (roleId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      await roleService.delete(roleId);
      
      if (isMountedRef.current) {
        toast.success('Role deleted successfully');
        await fetchRoles();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to delete role');
        console.error('Error deleting role:', error);
      }
    }
  }, [fetchRoles]);

  const handleToggleRoleStatus = useCallback(async (roleId: string, status: boolean) => {
    if (!isMountedRef.current) return;
    
    try {
      await roleService.updateStatus(roleId, status);
      
      if (isMountedRef.current) {
        toast.success('Role status updated successfully');
        await fetchRoles();
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to update role status');
        console.error('Error updating role status:', error);
      }
    }
  }, [fetchRoles]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    loading,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    handleToggleRoleStatus,
  };
}