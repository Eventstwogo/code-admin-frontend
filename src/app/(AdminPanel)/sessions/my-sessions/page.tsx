"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  RefreshCcw, 
  XCircle,
  User,
  ArrowLeft
} from "lucide-react";
import Link from 'next/link';
import { useMySessionManagement } from '../hooks/useMySessionManagement';
import { SessionStats } from '../components/SessionStats';
import { SessionTable } from '../components/SessionTable';
import { TerminateSessionDialog, TerminateAllSessionsDialog } from '../components/TerminateDialogs';
import { Session } from '../types';

export default function MySessionsPage() {
  const {
    sessions,
    loading,
    error,
    sessionStats,
    fetchMySessions,
    terminateMySession,
    terminateAllMySessions,
    resetSessions
  } = useMySessionManagement();

  // UI State
  const [activeOnly, setActiveOnly] = useState(true);
  const [limit, setLimit] = useState(10);
  
  // Loading states
  const [terminatingSession, setTerminatingSession] = useState<number | null>(null);
  const [terminatingAllSessions, setTerminatingAllSessions] = useState(false);
  
  // Dialog states
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [keepCurrentSession, setKeepCurrentSession] = useState(true);

  // Load sessions on component mount
  useEffect(() => {
    fetchMySessions(activeOnly, limit);
  }, [fetchMySessions, activeOnly, limit]);

  // Handlers
  const handleRefresh = () => {
    fetchMySessions(activeOnly, limit);
  };

  const handleReset = () => {
    resetSessions();
  };

  // Session termination handlers
  const handleTerminateSession = async (session: Session) => {
    setTerminatingSession(session.id);
    const success = await terminateMySession(session.id);
    if (success) {
      handleRefresh();
      setShowTerminateDialog(false);
      setSelectedSession(null);
    }
    setTerminatingSession(null);
  };

  const handleTerminateAllSessions = async () => {
    setTerminatingAllSessions(true);
    const result = await terminateAllMySessions(keepCurrentSession);
    
    if (result.success) {
      handleRefresh();
      setShowTerminateAllDialog(false);
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and manage your active sessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/sessions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Sessions
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Show:</label>
          <select
            value={activeOnly ? 'active' : 'all'}
            onChange={(e) => setActiveOnly(e.target.value === 'active')}
            className="px-3 py-2 border rounded-md text-sm"
            disabled={loading}
          >
            <option value="active">Active Sessions Only</option>
            <option value="all">All Sessions</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Limit:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm"
            disabled={loading}
          >
            <option value={10}>10 sessions</option>
            <option value={25}>25 sessions</option>
            <option value={50}>50 sessions</option>
            <option value={100}>100 sessions</option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <SessionTable
        sessions={sessions}
        loading={loading}
        error={error}
        searchUserId="" // Not applicable for my sessions
        onTerminateSession={handleTerminateDialogOpen}
        terminatingSession={terminatingSession}
        showUserColumn={false} // Don't show user column for my sessions
      />

      {/* Terminate Session Dialog */}
      <TerminateSessionDialog
        open={showTerminateDialog}
        onOpenChange={setShowTerminateDialog}
        session={selectedSession}
        onConfirm={() => selectedSession && handleTerminateSession(selectedSession)}
        loading={terminatingSession !== null}
        isMySession={true}
      />

      {/* Terminate All Sessions Dialog */}
      <TerminateAllSessionsDialog
        open={showTerminateAllDialog}
        onOpenChange={setShowTerminateAllDialog}
        userId="" // Not applicable for my sessions
        setUserId={() => {}} // Not applicable for my sessions
        keepCurrent={keepCurrentSession}
        setKeepCurrent={setKeepCurrentSession}
        onConfirm={handleTerminateAllSessions}
        loading={terminatingAllSessions}
        isMySession={true}
      />
    </div>
  );
}