import { useState } from 'react';
import { toast } from 'sonner';
import { roleService } from '@/services/rbac';
import { RoleFormData } from '../types';

interface UseRoleActionsProps {
  fetchRoles: () => Promise<void>;
}

export function useRoleActions({ fetchRoles }: UseRoleActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateRole = async (data: RoleFormData) => {
    try {
      setLoading(true);
      await roleService.create(data.role_name);
      toast.success('Role created successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to create role');
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (roleId: string, data: RoleFormData) => {
    try {
      setLoading(true);
      await roleService.update(roleId, data.role_name);
      toast.success('Role updated successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await roleService.delete(roleId);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const handleToggleRoleStatus = async (roleId: string, status: boolean) => {
    try {
      await roleService.updateStatus(roleId, status);
      toast.success('Role status updated successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update role status');
      console.error('Error updating role status:', error);
    }
  };

  return {
    loading,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    handleToggleRoleStatus,
  };
}