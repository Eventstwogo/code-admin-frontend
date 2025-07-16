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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, Edit, Plus, Loader2, XCircle } from 'lucide-react';
import { Permission } from '@/services/rbac';
import { permissionSchema, PermissionFormData } from './types';

interface PermissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPermission: Permission | null;
  onSubmit: (data: PermissionFormData) => Promise<void>;
  loading: boolean;
}

export function PermissionForm({ open, onOpenChange, editingPermission, onSubmit, loading }: PermissionFormProps) {
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: { permission_name: '' },
  });

  const handleSubmit = async (data: PermissionFormData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  // Update form when editing permission changes
  React.useEffect(() => {
    if (editingPermission) {
      form.setValue('permission_name', editingPermission.permission_name);
    } else {
      form.reset();
    }
  }, [editingPermission, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {editingPermission ? 'Edit Permission' : 'Create New Permission'}
          </DialogTitle>
          <DialogDescription>
            {editingPermission 
              ? 'Update the permission name below.' 
              : 'Create a new permission by providing a name.'
            }
          </DialogDescription>
        </DialogHeader>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-4 mt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="permission_name" className="text-sm font-medium">
              Permission Name <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="permission_name" 
              {...form.register('permission_name')} 
              placeholder="Enter permission name (e.g., READ, WRITE)"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            {form.formState.errors.permission_name && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {form.formState.errors.permission_name.message}
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
                  {editingPermission ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingPermission ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingPermission ? 'Update Permission' : 'Create Permission'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}