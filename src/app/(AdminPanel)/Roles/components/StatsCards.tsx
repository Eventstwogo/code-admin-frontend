import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, Link2, Users } from 'lucide-react';
import { Role, Permission, RolePermission } from '@/services/rbac';
import { StatsCardSkeleton } from '@/components/LoadingSpinner';

interface StatsCardsProps {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  isLoading: boolean;
}

export function StatsCards({ roles, permissions, rolePermissions, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  const coveragePercentage = roles.length > 0 
    ? Math.round((rolePermissions.length / (roles.length * permissions.length)) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Roles
          </CardTitle>
          <Shield className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{roles.length}</div>
          <p className="text-xs text-muted-foreground">
            {roles.filter(r => !r.role_status).length} active
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Permissions
          </CardTitle>
          <Key className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{permissions.length}</div>
          <p className="text-xs text-muted-foreground">
            {permissions.filter(p => !p.permission_status).length} active
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Role-Permissions
          </CardTitle>
          <Link2 className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{rolePermissions.length}</div>
          <p className="text-xs text-muted-foreground">
            {rolePermissions.filter(rp => !rp.status).length} active
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Coverage
          </CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {coveragePercentage}%
          </div>
          <p className="text-xs text-muted-foreground">
            Permission coverage
          </p>
        </CardContent>
      </Card>
    </div>
  );
}