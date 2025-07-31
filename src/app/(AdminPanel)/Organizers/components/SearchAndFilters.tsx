import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizerFilters } from "../types";

interface SearchAndFiltersProps {
  filters: OrganizerFilters;
  onFilterChange: (key: keyof OrganizerFilters, value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchAndFilters({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
}: SearchAndFiltersProps) {
  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search organizers by name, email or store name..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange("searchTerm", e.target.value)}
              className="pl-10 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
              <Select 
                value={filters.statusFilter} 
                onValueChange={(value) => onFilterChange("statusFilter", value)}
              >
                <SelectTrigger className="w-full xs:w-40 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={filters.roleFilter} 
                onValueChange={(value) => onFilterChange("roleFilter", value)}
              >
                <SelectTrigger className="w-full xs:w-40 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Organizer">Organizer</SelectItem>
                  <SelectItem value="Premium Organizer">
                    Premium Organizer
                  </SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-slate-500 text-sm">
              {filteredCount} of {totalCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}