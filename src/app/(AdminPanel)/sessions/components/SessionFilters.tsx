import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Loader2 } from "lucide-react";

interface SessionFiltersProps {
  searchUserId: string;
  setSearchUserId: (value: string) => void;
  activeOnly: boolean;
  setActiveOnly: (value: boolean) => void;
  limit: number;
  setLimit: (value: number) => void;
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
}

export const SessionFilters: React.FC<SessionFiltersProps> = ({
  searchUserId,
  setSearchUserId,
  activeOnly,
  setActiveOnly,
  limit,
  setLimit,
  loading,
  onSearch,
  onReset
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-user">User ID</Label>
            <Input
              id="search-user"
              placeholder="Enter user ID to search sessions"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="active-only">Active Only</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="active-only"
                checked={activeOnly}
                onCheckedChange={setActiveOnly}
              />
              <span className="text-sm text-muted-foreground">
                {activeOnly ? 'Active only' : 'All sessions'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Limit</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="100"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              className="w-20"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button onClick={onSearch} disabled={loading || !searchUserId.trim()}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Search className="h-4 w-4 mr-2" />
            Search Sessions
          </Button>
          <Button variant="outline" onClick={onReset}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};