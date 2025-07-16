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
import { Shield, Edit, Plus, Loader2, XCircle } from 'lucide-react';
import { Role } from '@/services/rbac';
import { roleSchema, RoleFormData } from './types';

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: Role | null;
  onSubmit: (data: RoleFormData) => Promise<void>;
  loading: boolean;
}

export function RoleForm({ open, onOpenChange, editingRole, onSubmit, loading }: RoleFormProps) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role_name: '' },
  });

  const handleSubmit = async (data: RoleFormData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  // Update form when editing role changes
  React.useEffect(() => {
    if (editingRole) {
      form.setValue('role_name', editingRole.role_name);
    } else {
      form.reset();
    }
  }, [editingRole, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            {editingRole 
              ? 'Update the role name below.' 
              : 'Create a new role by providing a name.'
            }
          </DialogDescription>
        </DialogHeader>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-4 mt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="role_name" className="text-sm font-medium">
              Role Name <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="role_name" 
              {...form.register('role_name')} 
              placeholder="Enter role name (e.g., ADMIN, EDITOR)"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            {form.formState.errors.role_name && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {form.formState.errors.role_name.message}
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
                  {editingRole ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingRole ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingRole ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}