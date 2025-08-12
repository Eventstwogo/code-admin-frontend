"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerStats as PartnerStatsType } from "../types";
import { Users, CheckCircle } from "lucide-react";

interface PartnerStatsProps {
  stats: PartnerStatsType;
}

export function PartnerStats({ stats }: PartnerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All registered partners
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            Currently active partners
          </p>
        </CardContent>
      </Card>
    </div>
  );
}