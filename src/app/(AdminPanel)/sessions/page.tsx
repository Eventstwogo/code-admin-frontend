"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  RefreshCcw, 
  XCircle,
  User
} from "lucide-react";
import Link from 'next/link';
import { useSessionManagement } from './hooks/useSessionManagement';
import { SessionStats } from './components/SessionStats';
import { SessionFilters } from './components/SessionFilters';
import { SessionTable } from './components/SessionTable';
import { TerminateSessionDialog, TerminateAllSessionsDialog } from './components/TerminateDialogs';
import { Session } from './types';

export default function SessionsPage() {
  const {
    sessions,
    loading,
    error,
    sessionStats,
    fetchSessions,
    terminateSession,
    terminateAllSessions,
    resetSessions
  } = useSessionManagement();

  // UI State
  const [searchUserId, setSearchUserId] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [limit, setLimit] = useState(10);
  
  // Loading states
  const [terminatingSession, setTerminatingSession] = useState<number | null>(null);
  const [terminatingAllSessions, setTerminatingAllSessions] = useState(false);
  
  // Dialog states
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [terminateAllUserId, setTerminateAllUserId] = useState("");
  const [keepCurrentSession, setKeepCurrentSession] = useState(true);

  // Handlers
  const handleSearch = () => {
    if (!searchUserId.trim()) {
      return;
    }
    fetchSessions({ user_id: searchUserId.trim(), active_only: activeOnly, limit });
  };

  const handleRefresh = () => {
    if (searchUserId.trim()) {
      fetchSessions({ user_id: searchUserId.trim(), active_only: activeOnly, limit });
    }
  };

  const handleReset = () => {
    setSearchUserId("");
    resetSessions();
  };

  // Session termination handlers
  const handleTerminateSession = async (session: Session) => {
    setTerminatingSession(session.id);
    const success = await terminateSession(session.id, session.user_id);
    if (success) {
      handleRefresh();
      setShowTerminateDialog(false);
      setSelectedSession(null);
    }
    setTerminatingSession(null);
  };

  const handleTerminateAllSessions = async () => {
    if (!terminateAllUserId.trim()) {
      return;
    }

    setTerminatingAllSessions(true);
    const result = await terminateAllSessions(terminateAllUserId.trim(), keepCurrentSession);
    
    if (result.success) {
      // Refresh sessions if we're currently viewing the same user
      if (searchUserId === terminateAllUserId.trim()) {
        handleRefresh();
      }
      setShowTerminateAllDialog(false);
      setTerminateAllUserId("");
    }
    setTerminatingAllSessions(false);
  };

  const handleTerminateDialogOpen = (session: Session) => {
    setSelectedSession(session);
    setShowTerminateDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Session Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user sessions across the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/sessions/my-sessions">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              My Sessions
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || !searchUserId.trim()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Terminate All
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <SessionStats stats={sessionStats} />

      {/* Search and Filters */}
      <SessionFilters
        searchUserId={searchUserId}
        setSearchUserId={setSearchUserId}
        activeOnly={activeOnly}
        setActiveOnly={setActiveOnly}
        limit={limit}
        setLimit={setLimit}
        loading={loading}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Sessions Table */}
      <SessionTable
        sessions={sessions}
        loading={loading}
        error={error}
        searchUserId={searchUserId}
        onTerminateSession={handleTerminateDialogOpen}
        terminatingSession={terminatingSession}
      />

      {/* Terminate Session Dialog */}
      <TerminateSessionDialog
        open={showTerminateDialog}
        onOpenChange={setShowTerminateDialog}
        session={selectedSession}
        onConfirm={() => selectedSession && handleTerminateSession(selectedSession)}
        loading={terminatingSession !== null}
      />

      {/* Terminate All Sessions Dialog */}
      <TerminateAllSessionsDialog
        open={showTerminateAllDialog}
        onOpenChange={setShowTerminateAllDialog}
        userId={terminateAllUserId}
        setUserId={setTerminateAllUserId}
        keepCurrent={keepCurrentSession}
        setKeepCurrent={setKeepCurrentSession}
        onConfirm={handleTerminateAllSessions}
        loading={terminatingAllSessions}
      />
    </div>
  );
}