"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionTable } from "../components/SessionTable";
import { SessionStats } from "../components/SessionStats";
import { SessionFilters } from "../components/SessionFilters";
import { mockSessionData, mockEmptyResponse } from "../components/SessionTestData";
import { Session, SessionStats as SessionStatsType } from "../types";

export default function SessionsDemoPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [limit, setLimit] = useState(10);
  const [terminatingSession, setTerminatingSession] = useState<number | null>(null);

  const calculateStats = (sessionsData: Session[]): SessionStatsType => {
    return {
      total_sessions: sessionsData.length,
      active_sessions: sessionsData.filter(s => s.is_active).length,
      inactive_sessions: sessionsData.filter(s => !s.is_active).length,
      unique_users: new Set(sessionsData.map(s => s.user_id)).size
    };
  };

  const [sessionStats, setSessionStats] = useState<SessionStatsType>(calculateStats([]));

  const handleSearch = () => {
    if (!searchUserId.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      if (searchUserId.trim() === "user123") {
        const filteredSessions = mockSessionData.filter(session => {
          const matchesUser = session.user_id === searchUserId.trim();
          const matchesActive = !activeOnly || session.is_active;
          return matchesUser && matchesActive;
        }).slice(0, limit);
        
        setSessions(filteredSessions);
        setSessionStats(calculateStats(filteredSessions));
      } else if (searchUserId.trim() === "empty") {
        setSessions([]);
        setSessionStats(calculateStats([]));
      } else {
        setError("User not found");
        setSessions([]);
        setSessionStats(calculateStats([]));
      }
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setSearchUserId("");
    setSessions([]);
    setSessionStats(calculateStats([]));
    setError(null);
  };

  const handleTerminateSession = (session: Session) => {
    setTerminatingSession(session.id);
    
    // Simulate API call
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.id !== session.id));
      setSessionStats(calculateStats(sessions.filter(s => s.id !== session.id)));
      setTerminatingSession(null);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Session Management Demo</h1>
          <p className="text-muted-foreground">
            Test the session management functionality with sample data
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Badge variant="outline" className="mb-2">Test User ID</Badge>
                <p className="text-sm text-muted-foreground">
                  Enter <code className="bg-muted px-1 rounded">user123</code> to see sample sessions
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Empty Result</Badge>
                <p className="text-sm text-muted-foreground">
                  Enter <code className="bg-muted px-1 rounded">empty</code> to see empty state
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Error State</Badge>
                <p className="text-sm text-muted-foreground">
                  Enter any other ID to see error handling
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
        onTerminateSession={handleTerminateSession}
        terminatingSession={terminatingSession}
      />
    </div>
  );
}