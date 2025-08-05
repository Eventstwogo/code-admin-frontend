import axiosInstance from '@/lib/axiosInstance';

// Types
export interface Role {
  role_id: string;
  role_name: string;
  role_status: boolean;
  role_tstamp: string;
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  permission_status: boolean;
  permission_tstamp: string;
}

export interface RolePermission {
  record_id: string;
  role_id: string;
  permission_id: string;
  status: boolean;
  created_at: string;
  role_name?: string;
  permission_name?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: T;
}

// Role API Services
export const roleService = {
  // Create a new role
  create: async (roleName: string): Promise<ApiResponse<Role>> => {
    const response = await axiosInstance.post('/api/v1/roles', {
      role_name: roleName
    });
    return response.data;
  },

  // Get roles by active status
  getAll: async (isActive?: boolean): Promise<ApiResponse<Role[]>> => {
    const params = isActive !== undefined ? { is_active: isActive } : {};
    const response = await axiosInstance.get('/api/v1/roles', { params });
    return response.data;
  },

  // Search role by name
  search: async (name: string): Promise<ApiResponse<Role[]>> => {
    const response = await axiosInstance.get('/api/v1/roles/search', {
      params: { name }
    });
    return response.data;
  },

  // Update role by ID
  update: async (roleId: string, roleName: string): Promise<ApiResponse<Role>> => {
    const response = await axiosInstance.put(`/api/v1/roles/${roleId}`, {
      role_name: roleName
    });
    return response.data;
  },

  // Delete role by ID
  delete: async (roleId: string, hardDelete = false): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete(`/api/v1/roles/${roleId}`, {
      params: { hard_delete: hardDelete }
    });
    return response.data;
  },

  // Update role status
  updateStatus: async (roleId: string, status: boolean): Promise<ApiResponse<Role>> => {
    const response = await axiosInstance.patch(`/api/v1/roles/${roleId}/status`, {
      status
    });
    return response.data;
  }
};

// Permission API Services
export const permissionService = {
  // Create a new permission
  create: async (permissionName: string): Promise<ApiResponse<Permission>> => {
    const response = await axiosInstance.post('/api/v1/permissions', {
      permission_name: permissionName
    });
    return response.data;
  },

  // Get permissions by active status
  getAll: async (isActive?: boolean): Promise<ApiResponse<Permission[]>> => {
    const params = isActive !== undefined ? { is_active: isActive } : {};
    const response = await axiosInstance.get('/api/v1/permissions', { params });
    return response.data;
  },

  // Search permission by name
  search: async (name: string): Promise<ApiResponse<Permission[]>> => {
    const response = await axiosInstance.get('/api/v1/permissions/search', {
      params: { name }
    });
    return response.data;
  },

  // Update permission by ID
  update: async (permissionId: string, permissionName: string): Promise<ApiResponse<Permission>> => {
    const response = await axiosInstance.put(`/api/v1/permissions/${permissionId}`, {
      permission_name: permissionName
    });
    return response.data;
  },

  // Delete permission by ID
  delete: async (permissionId: string, hardDelete = false): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete(`/api/v1/permissions/${permissionId}`, {
      params: { hard_delete: hardDelete }
    });
    return response.data;
  },

  // Update permission status
  updateStatus: async (permissionId: string, status: boolean): Promise<ApiResponse<Permission>> => {
    const response = await axiosInstance.patch(`/api/v1/permissions/${permissionId}/status`, {
      status
    });
    return response.data;
  }
};

// Role-Permission API Services
export const rolePermissionService = {
  // Create role-permission relationship
  create: async (roleId: string, permissionId: string): Promise<ApiResponse<RolePermission>> => {
    const response = await axiosInstance.post('/api/v1/role-permissions', {
      role_id: roleId,
      permission_id: permissionId
    });
    return response.data;
  },

  // Get role-permission records by status
  getAll: async (status?: boolean): Promise<ApiResponse<RolePermission[]>> => {
    const params = status !== undefined ? { status } : {};
    const response = await axiosInstance.get('/api/v1/role-permissions', { params });
    return response.data;
  },

  // Get specific role-permission record
  getById: async (recordId: string): Promise<ApiResponse<RolePermission>> => {
    const response = await axiosInstance.get(`/api/v1/role-permissions/${recordId}`);
    return response.data;
  },

  // Update role-permission relationship
  update: async (recordId: string, roleId: string, permissionId: string): Promise<ApiResponse<RolePermission>> => {
    const response = await axiosInstance.put(`/api/v1/role-permissions/${recordId}`, {
      role_id: roleId,
      permission_id: permissionId
    });
    return response.data;
  },

  // Delete role-permission relationship
  delete: async (recordId: string, hardDelete = false): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete(`/api/v1/role-permissions/${recordId}`, {
      params: { hard_delete: hardDelete }
    });
    return response.data;
  },

  // Update role-permission status
  updateStatus: async (recordId: string, status: boolean): Promise<ApiResponse<RolePermission>> => {
    const response = await axiosInstance.patch(`/api/v1/role-permissions/${recordId}/status`, {
      status
    });
    return response.data;
  }
};