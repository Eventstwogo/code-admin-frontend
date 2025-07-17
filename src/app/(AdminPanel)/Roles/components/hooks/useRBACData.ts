import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Ref to track if component is mounted to prevent memory leaks
  const isMountedRef = useRef(true);
  
  // Loading states
  const [rolesLoading, setRolesLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false);
  
  // Data states
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

  // Data fetching functions with useCallback for optimization and memory leak prevention
  const fetchRoles = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setRolesLoading(true);
      const response = await roleService.getAll();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setRoles(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to fetch roles');
        console.error('Error fetching roles:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setRolesLoading(false);
      }
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setPermissionsLoading(true);
      const response = await permissionService.getAll();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setPermissions(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to fetch permissions');
        console.error('Error fetching permissions:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setPermissionsLoading(false);
      }
    }
  }, []);

  const fetchRolePermissions = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setRolePermissionsLoading(true);
      const response = await rolePermissionService.getAll();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setRolePermissions(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to fetch role permissions');
        console.error('Error fetching role permissions:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setRolePermissionsLoading(false);
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchRolePermissions();
  }, [fetchRoles, fetchPermissions, fetchRolePermissions]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
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