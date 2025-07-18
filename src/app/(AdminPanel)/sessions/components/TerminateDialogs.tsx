import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Session } from '../types';
import { getDeviceIcon, getTimeAgo } from '../utils';

interface TerminateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onConfirm: () => void;
  loading: boolean;
  isMySession?: boolean;
}

export const TerminateSessionDialog: React.FC<TerminateSessionDialogProps> = ({
  open,
  onOpenChange,
  session,
  onConfirm,
  loading,
  isMySession = false
}) => {
  if (!session) return null;

  const DeviceIcon = getDeviceIcon(session.device_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminate Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to terminate this session? {isMySession ? 'You will be logged out from this device.' : 'The user will be logged out from this device.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <DeviceIcon className="h-4 w-4" />
            <span className="font-medium">{session.device_type || 'Unknown Device'}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            IP: {session.ip_address || 'Unknown IP'} • Location: {session.location || 'Unknown'}
          </p>
          <p className="text-sm text-muted-foreground">
            Last Activity: {getTimeAgo(session.last_activity)}
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Terminate Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TerminateAllSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  setUserId: (userId: string) => void;
  keepCurrent: boolean;
  setKeepCurrent: (keep: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  isMySession?: boolean;
}

export const TerminateAllSessionsDialog: React.FC<TerminateAllSessionsDialogProps> = ({
  open,
  onOpenChange,
  userId,
  setUserId,
  keepCurrent,
  setKeepCurrent,
  onConfirm,
  loading,
  isMySession = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminate All Sessions</DialogTitle>
          <DialogDescription>
            {isMySession 
              ? 'This will terminate all of your sessions. This action cannot be undone.'
              : 'This will terminate all sessions for the specified user. This action cannot be undone.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isMySession && (
            <div className="space-y-2">
              <Label htmlFor="terminate-user-id">User ID</Label>
              <Input
                id="terminate-user-id"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="keep-current"
              checked={keepCurrent}
              onCheckedChange={setKeepCurrent}
            />
            <Label htmlFor="keep-current">Keep current session</Label>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Terminate All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};