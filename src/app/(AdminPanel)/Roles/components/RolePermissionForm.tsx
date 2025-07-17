import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link2, Key, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { Role, Permission } from '@/services/rbac';
import { rolePermissionSchema, RolePermissionFormData } from './types';

interface RolePermissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  permissions: Permission[];
  onSubmit: (data: RolePermissionFormData) => Promise<void>;
  loading: boolean;
}

export function RolePermissionForm({ 
  open, 
  onOpenChange, 
  roles, 
  permissions, 
  onSubmit, 
  loading 
}: RolePermissionFormProps) {
  const form = useForm<RolePermissionFormData>({
    resolver: zodResolver(rolePermissionSchema),
    defaultValues: { role_id: '', permission_ids: [] },
  });

  const handleSubmit = async (data: RolePermissionFormData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const selectedPermissions = form.watch('permission_ids') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Assign Permissions to Role
          </DialogTitle>
          <DialogDescription>
            Select a role and assign multiple permissions to it.
          </DialogDescription>
        </DialogHeader>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-6 mt-6"
        >
          <div className="space-y-2">
            <Label htmlFor="role_id" className="text-sm font-medium">
              Select Role <span className="text-destructive">*</span>
            </Label>
            <select 
              id="role_id" 
              {...form.register('role_id')}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a role...</option>
              {roles.filter(r => r.role_status).map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {form.formState.errors.role_id && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {form.formState.errors.role_id.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Select Permissions <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-muted/30 dark:bg-muted/10 max-h-60 overflow-y-auto">
              {permissions.filter(p => p.permission_status).map((permission) => {
                const isChecked = selectedPermissions.includes(permission.permission_id);
                return (
                  <label 
                    key={permission.permission_id} 
                    className={`flex items-center space-x-3 p-3 rounded-md border transition-all cursor-pointer hover:bg-accent/50 ${
                      isChecked 
                        ? 'bg-primary/5 border-primary/20 dark:bg-primary/10' 
                        : 'bg-background border-border hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const current = new Set(selectedPermissions);
                        if (checked) {
                          current.add(permission.permission_id);
                        } else {
                          current.delete(permission.permission_id);
                        }
                        form.setValue('permission_ids', Array.from(current));
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{permission.permission_name}</span>
                    </div>
                    {isChecked && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </label>
                );
              })}
            </div>
            {form.formState.errors.permission_ids && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {form.formState.errors.permission_ids.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Assign Permissions
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}