import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  roleService, 
  permissionService, 
  rolePermissionService,
  Role,
  Permission,
  RolePermission
} from '@/services/rbac';

export function useRBACData() {
  
  // Loading states
  const [rolesLoading, setRolesLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false);
  
  // Data states
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

  // Data fetching functions
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
      console.error('Error fetching roles:', error);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await permissionService.getAll();
      setPermissions(response.data);
    } catch (error) {
      toast.error('Failed to fetch permissions');
      console.error('Error fetching permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      setRolePermissionsLoading(true);
      const response = await rolePermissionService.getAll();
      setRolePermissions(response.data);
    } catch (error) {
      toast.error('Failed to fetch role permissions');
      console.error('Error fetching role permissions:', error);
    } finally {
      setRolePermissionsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchRolePermissions();
  }, []);

  return {
    // Data
    roles,
    permissions,
    rolePermissions,
    
    // Loading states
    rolesLoading,
    permissionsLoading,
    rolePermissionsLoading,
    
    // Refetch functions
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
  };
}