import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  onExport: () => void;
}

export function PageHeader({ onExport }: PageHeaderProps) {
  return (
    <>
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Organizer Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Manage organizer registrations and business details
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>
    </>
  );
}