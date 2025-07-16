import { z } from 'zod';

// Form schemas
export const roleSchema = z.object({
  role_name: z.string().min(2, 'Role name must be at least 2 characters').max(50, 'Role name must be less than 50 characters'),
});

export const permissionSchema = z.object({
  permission_name: z.string().min(2, 'Permission name must be at least 2 characters').max(50, 'Permission name must be less than 50 characters'),
});

export const rolePermissionSchema = z.object({
  role_id: z.string().min(1, 'Role is required'),
  permission_ids: z.array(z.string()).min(1, 'At least one permission is required'),
});

// Form data types
export type RoleFormData = z.infer<typeof roleSchema>;
export type PermissionFormData = z.infer<typeof permissionSchema>;
export type RolePermissionFormData = z.infer<typeof rolePermissionSchema>;

// Delete confirmation state type
export interface DeleteConfirmState {
  open: boolean;
  type: 'role' | 'permission' | 'rolePermission';
  id: string;
  name: string;
}