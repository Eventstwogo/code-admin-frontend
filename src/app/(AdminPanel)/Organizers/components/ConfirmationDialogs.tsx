import { XCircle, RotateCcw, Trash2, Building } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Organizer } from "../types";

interface ConfirmationDialogsProps {
  rejectDialog: {
    open: boolean;
    organizer: Organizer | null;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    rejectionReason: string;
    onReasonChange: (reason: string) => void;
  };
  restoreDialog: {
    open: boolean;
    organizer: Organizer | null;
    onConfirm: () => void;
    onCancel: () => void;
  };
  deleteDialog: {
    open: boolean;
    organizer: Organizer | null;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export function ConfirmationDialogs({
  rejectDialog,
  restoreDialog,
  deleteDialog,
}: ConfirmationDialogsProps) {
  return (
    <>
      {/* Reject Dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={rejectDialog.onCancel}>
        <AlertDialogContent className="border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-sm max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 p-3 shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
                  Reject Organizer
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  Are you sure you want to reject this organizer? This action
                  will mark the organizer as rejected and deactivate their
                  account.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          {rejectDialog.organizer && (
            <div className="my-6 p-4 bg-red-50/80 dark:bg-red-950/30 rounded-xl border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {rejectDialog.organizer.storeName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                    {rejectDialog.organizer.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="rejection-reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason for rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a reason for rejecting this organizer..."
              value={rejectDialog.rejectionReason}
              onChange={(e) => rejectDialog.onReasonChange(e.target.value)}
              className="min-h-[100px] resize-none border-slate-300 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400"
              required
            />
          </div>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1 h-12 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectDialog.onConfirm(rejectDialog.rejectionReason)}
              disabled={!rejectDialog.rejectionReason.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-red-600 to-rose-600 shadow-lg hover:from-red-700 hover:to-rose-700 hover:shadow-xl text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Organizer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialog.open} onOpenChange={restoreDialog.onCancel}>
        <AlertDialogContent className="border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-sm max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-3 shadow-lg">
                <RotateCcw className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-green-600 dark:text-green-400">
                  Restore Organizer
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  Are you sure you want to restore this organizer? This action
                  will reactivate their account and set their status to
                  approved.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          {restoreDialog.organizer && (
            <div className="my-6 p-4 bg-green-50/80 dark:bg-green-950/30 rounded-xl border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {restoreDialog.organizer.storeName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                    {restoreDialog.organizer.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1 h-12 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={restoreDialog.onConfirm}
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:from-green-700 hover:to-emerald-700 hover:shadow-xl text-white rounded-xl"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Organizer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={deleteDialog.onCancel}>
        <AlertDialogContent className="border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-sm max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 p-3 shadow-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
                  Deactivate Organizer
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  Are you sure you want to deactivate this organizer? This will
                  mark the organizer as rejected and deactivate their account.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          {deleteDialog.organizer && (
            <div className="my-6 p-4 bg-red-50/80 dark:bg-red-950/30 rounded-xl border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {deleteDialog.organizer.storeName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                    {deleteDialog.organizer.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1 h-12 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.onConfirm}
              className="flex-1 h-12 bg-gradient-to-r from-red-600 to-rose-600 shadow-lg hover:from-red-700 hover:to-rose-700 hover:shadow-xl text-white rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate Organizer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}