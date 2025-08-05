import { useState } from "react";
import {
  XCircle,
  CheckCircle,
  MessageSquare,
  RotateCcw,
  Trash2,
  Eye,
  Building,
  Shield,
  History,
  Mail,
  Globe,
  FileText,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Organizer } from "../types";
import { getStatusBadge, getRoleBadge, getAbnStatusBadge } from "./BadgeComponents";

interface OrganizerDetailsDialogProps {
  organizer: Organizer | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (organizer: Organizer) => void;
  onReject: (organizer: Organizer) => void;
  onHold: (organizer: Organizer) => void;
  onDelete: (organizer: Organizer) => void;
  onRestore: (organizer: Organizer) => void;
}

export function OrganizerDetailsDialog({
  organizer,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onHold,
  onDelete,
  onRestore,
}: OrganizerDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!organizer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[95vh]  p-0 bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-sm m-2 sm:m-4 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-700 p-4 md:p-6">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/20 shadow-lg flex-shrink-0">
                  <AvatarImage src={organizer.avatar || null} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg md:text-xl font-bold">
                    {organizer.storeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                    {organizer.storeName}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {getStatusBadge(organizer.status)}
                    {getRoleBadge(organizer.role)}
                  </div>
                </div>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 md:h-10 md:w-10 p-0 flex-shrink-0"
                  >
                    <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 dark:bg-slate-700/80 mb-6 md:mb-8 h-12">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden xs:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 text-sm"
                >
                  <Building className="w-4 h-4" />
                  <span className="hidden xs:inline">Business</span>
                </TabsTrigger>
                <TabsTrigger
                  value="abn"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden xs:inline">ABN</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 text-sm"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden xs:inline">Activity</span>
                </TabsTrigger>
              </TabsList>

              <div className={`space-y-6 ${activeTab === "overview" ? "block" : "hidden"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Email
                        </label>
                        <p className="text-sm text-slate-900 dark:text-slate-100 mt-1 break-all">
                          {organizer.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Organizer ID
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.organizerId}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Location
                        </label>
                        <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.location}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Store
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Store Name
                        </label>
                        <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.storeName}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Store URL
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 mt-1 break-all">
                          {organizer.storeUrl}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm md:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Role
                        </label>
                        <div className="mt-1">{getRoleBadge(organizer.role)}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Status
                        </label>
                        <div className="mt-1">{getStatusBadge(organizer.status)}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Payment
                        </label>
                        <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.paymentPreference}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      Business Purpose
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-slate-900 dark:text-slate-100">
                      {organizer.purpose}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className={`space-y-6 ${activeTab === "business" ? "block" : "hidden"}`}>
                <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Store Name
                        </label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.storeName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Store URL
                        </label>
                        <p className="text-lg font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.storeUrl}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Purpose
                        </label>
                        <p className="text-lg text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.purpose}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Location
                        </label>
                        <p className="text-lg text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.location}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Registration Date
                        </label>
                        <p className="text-lg text-slate-900 dark:text-slate-100 mt-1">
                          {new Date(organizer.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={`space-y-6 ${activeTab === "abn" ? "block" : "hidden"}`}>
                <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      ABN Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Entity Name
                        </label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.abnDetails.entityName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Business Type
                        </label>
                        <p className="text-lg text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.abnDetails.type}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          ABN Status
                        </label>
                        <div className="mt-1">
                          {getAbnStatusBadge(organizer.abnDetails.status)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Business Location
                        </label>
                        <p className="text-lg text-slate-900 dark:text-slate-100 mt-1">
                          {organizer.abnDetails.businessLocation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={`space-y-6 ${activeTab === "activity" ? "block" : "hidden"}`}>
                <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 border-l-4 border-green-500 bg-green-50/80 dark:bg-green-950/20 rounded-r-xl">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            Account Created
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Organizer registered on the platform
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {new Date(organizer.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-950/20 rounded-r-xl">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            Profile Updated
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Business information was updated
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {new Date(organizer.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Tabs>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 bg-slate-50/80 dark:bg-slate-800/80">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              {/* Always show Contact button */}
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/50 bg-transparent"
                onClick={() => (window.location.href = `mailto:${organizer.email}`)}
              >
                <MessageSquare className="w-4 h-4" />
                Contact
              </Button>

              {/* Status-based action buttons */}
              {organizer.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 bg-transparent"
                    onClick={() => onReject(organizer)}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 hover:bg-yellow-50 hover:border-yellow-200 dark:hover:bg-yellow-950/50 bg-transparent"
                    onClick={() => onHold(organizer)}
                  >
                    <Pause className="w-4 h-4" />
                    Hold
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => onApprove(organizer)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                </>
              )}

              {organizer.status === "Rejected" && (
                <Button
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={() => onApprove(organizer)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
              )}

              {organizer.status === "Hold" && (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 bg-transparent"
                    onClick={() => onReject(organizer)}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => onApprove(organizer)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                </>
              )}

              {/* Delete/Restore actions based on active status */}
              {organizer.isActive ? (
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 bg-transparent"
                  onClick={() => onDelete(organizer)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/50 bg-transparent"
                  onClick={() => onRestore(organizer)}
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}