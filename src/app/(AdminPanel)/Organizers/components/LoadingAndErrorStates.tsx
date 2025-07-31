import { XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <Card className="border-red-200/50 bg-gradient-to-br from-red-50/80 to-rose-100/80 backdrop-blur-sm dark:border-red-800/50 dark:from-red-950/30 dark:to-rose-950/30">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-100">
            Error Loading Data
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="mt-3 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Users className="w-16 h-16 text-slate-400 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
          No Organizers Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
          {hasFilters
            ? "No organizers match your current filters. Try adjusting your search criteria."
            : "Get started by adding your first organizer to manage business partnerships."}
        </p>
      </CardContent>
    </Card>
  );
}