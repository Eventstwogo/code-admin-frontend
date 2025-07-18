import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  MoreHorizontal, 
  Trash2, 
  AlertCircle,
  Eye,
  MapPin,
  Globe,
  Clock,
  Calendar
} from "lucide-react";
import { Session } from '../types';
import { 
  getDeviceIcon, 
  formatDate, 
  getTimeAgo, 
  getLocationDisplay, 
  getBrowserDisplay, 
  formatIpAddress, 
  getSessionStatusColor, 
  getSessionStatusLabel 
} from '../utils';
import { LoadingSkeleton } from './LoadingSkeleton';

interface SessionTableProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  searchUserId: string;
  onTerminateSession: (session: Session) => void;
  terminatingSession: number | null;
  showUserColumn?: boolean;
}

export const SessionTable: React.FC<SessionTableProps> = ({
  sessions,
  loading,
  error,
  searchUserId,
  onTerminateSession,
  terminatingSession,
  showUserColumn = true
}) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Session Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sessions found</h3>
            <p className="text-muted-foreground">
              {searchUserId ? 'No sessions found for this user.' : 'Enter a user ID to view sessions.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {showUserColumn && <TableHead>User</TableHead>}
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.device_type);
                  
                  return (
                    <TableRow key={session.id}>
                      {showUserColumn && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {session.user_id}
                            </Badge>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="h-4 w-4" />
                          <span className="text-sm">{session.device_type || 'Unknown Device'}</span>
                          {session.is_current && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getLocationDisplay(session.location)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getBrowserDisplay(session.browser)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatIpAddress(session.ip_address)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getTimeAgo(session.last_activity)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={session.is_active ? "default" : "secondary"}
                          className={session.is_active ? getSessionStatusColor(session.is_active) : ""}
                        >
                          {getSessionStatusLabel(session.is_active)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(session.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onTerminateSession(session)}
                              className="text-red-600"
                              disabled={terminatingSession === session.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Terminate Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};