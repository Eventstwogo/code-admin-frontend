import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  MessageSquare,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Organizer } from "../types";
import { getStatusBadge, getRoleBadge } from "./BadgeComponents";

interface OrganizersTableProps {
  organizers: Organizer[];
  onViewOrganizer: (organizer: Organizer) => void;
  onApproveOrganizer: (organizer: Organizer) => void;
  onRejectOrganizer: (organizer: Organizer) => void;
  onDeleteOrganizer: (organizer: Organizer) => void;
  onRestoreOrganizer: (organizer: Organizer) => void;
}

export function OrganizersTable({
  organizers,
  onViewOrganizer,
  onApproveOrganizer,
  onRejectOrganizer,
  onDeleteOrganizer,
  onRestoreOrganizer,
}: OrganizersTableProps) {
  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Organizers ({organizers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                  Organizer&apos;s Email
                </th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                  Location
                </th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                  Role
                </th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((organizer) => (
                <tr
                  key={organizer.id}
                  className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shadow-sm flex-shrink-0">
                        <AvatarImage
                          src={organizer.avatar || null}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                          {organizer.storeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {organizer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {organizer.location}
                    </p>
                  </td>
                  <td className="p-4">{getStatusBadge(organizer.status)}</td>
                  <td className="p-4 hidden lg:table-cell">
                    {getRoleBadge(organizer.role)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrganizer(organizer)}
                        className="h-8 px-3 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(organizer.storeUrl, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Store
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = `mailto:${organizer.email}`;
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Organizer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {organizer.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => onApproveOrganizer(organizer)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => onRejectOrganizer(organizer)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {organizer.isActive ? (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => onRestoreOrganizer(organizer)}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => onDeleteOrganizer(organizer)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}