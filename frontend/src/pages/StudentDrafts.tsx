import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  listDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  type StudentDraft,
} from "@/lib/drafts";
import { cn } from "@/lib/utils";
import {
  FileText,
  Trash2,
  ArrowRight,
  Clock,
  User,
  Phone,
  Pencil,
  Save,
  X,
  Search,
  StickyNote,
  Hash,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

/* ─── Quick Draft Form ──────────────────────────────────── */

function QuickDraftForm({
  onSaved,
  editDraft,
  onCancel,
}: {
  onSaved: () => void;
  editDraft?: StudentDraft | null;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [dateOfVisit, setDateOfVisit] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editDraft) {
      setName(editDraft.name || "");
      setMobileNo(editDraft.mobileNo || "");
      setSeatNo(editDraft.seatNo || "");
      setDateOfVisit(editDraft.dateOfVisit || new Date().toISOString().slice(0, 10));
      setNotes(editDraft.notes || "");
    } else {
      setName("");
      setMobileNo("");
      setSeatNo("");
      setDateOfVisit(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
  }, [editDraft]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter at least the student's name.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        mobileNo: mobileNo.trim() || undefined,
        seatNo: seatNo.trim() || undefined,
        dateOfVisit: dateOfVisit || undefined,
        notes: notes.trim() || undefined,
      };

      if (editDraft) {
        await updateDraft(editDraft.id, payload);
        toast({ title: "Draft Updated", description: `${name}'s draft has been updated.` });
      } else {
        await createDraft(payload);
        toast({ title: "Draft Saved!", description: `${name} saved as temporary record.` });
      }

      // Reset
      setName("");
      setMobileNo("");
      setSeatNo("");
      setDateOfVisit(new Date().toISOString().slice(0, 10));
      setNotes("");
      onSaved();
    } catch (e) {
        toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-[2rem] border-amber-200/60 bg-gradient-to-br from-amber-50/30 to-white shadow-xl overflow-hidden">
      <div className="bg-amber-500 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {editDraft ? "Edit Draft" : "Quick Draft"}
            </h3>
            <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">
              Save now, register later
            </p>
          </div>
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/10 h-9 w-9 p-0 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Student Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 pl-10 rounded-2xl border-slate-200"
            />
          </div>
        </div>

        {/* Mobile + Seat */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Mobile
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                placeholder="+91 00000"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="h-12 pl-10 rounded-2xl border-slate-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Seat No
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                placeholder="e.g. S-12"
                value={seatNo}
                onChange={(e) => setSeatNo(e.target.value)}
                className="h-12 pl-10 rounded-2xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Date of Visit */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Date Came to Library
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input
              type="date"
              value={dateOfVisit}
              onChange={(e) => setDateOfVisit(e.target.value)}
              className="h-12 pl-10 rounded-2xl border-slate-200"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Notes
          </Label>
          <div className="relative">
            <StickyNote className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
            <Textarea
              placeholder="e.g. Will bring Aadhar on Monday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="pl-10 rounded-2xl border-slate-200 resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-2xl font-black text-base bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200/50 transition-all active:scale-[0.98] gap-2"
        >
          <Save className="h-5 w-5" />
          {editDraft ? "Update Draft" : "Save as Draft"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export default function StudentDrafts({ embedded = false }: { embedded?: boolean }) {
  const [, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<StudentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [editingDraft, setEditingDraft] = useState<StudentDraft | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
        const data = await listDrafts();
        setDrafts(data);
    } catch (e) {
        toast({ title: "Error", description: "Failed to load drafts.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = drafts.filter((d) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.mobileNo && d.mobileNo.includes(q)) ||
      (d.seatNo && d.seatNo.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (id: string) => {
    try {
        await deleteDraft(id);
        refresh();
        setDeleteConfirm(null);
        toast({ title: "Draft Deleted", description: "The temporary record has been removed." });
    } catch (e) {
        toast({ title: "Error", description: "Failed to delete draft.", variant: "destructive" });
    }
  };

  const handleCompleteRegistration = (draft: StudentDraft) => {
    sessionStorage.setItem("cl.draftToRegister", JSON.stringify(draft));
    setSearchParams({ tab: "add" }, { replace: true });
  };

  return (
    <div className={cn("flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700", embedded && "pb-6")}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left: Draft Form */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <QuickDraftForm
            onSaved={() => {
              refresh();
              setEditingDraft(null);
            }}
            editDraft={editingDraft}
            onCancel={editingDraft ? () => setEditingDraft(null) : undefined}
          />
        </div>

        {/* Right: Draft List */}
        <div className="lg:col-span-2 space-y-5">

          {/* Search + Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Saved Drafts
              </h2>
              {drafts.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-black text-xs px-2.5">
                  {drafts.length}
                </Badge>
              )}
            </div>
            {drafts.length > 2 && (
              <div className="relative max-w-xs w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search drafts..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="h-11 pl-10 rounded-2xl border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Empty State */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-slate-50/50 border border-slate-100 border-dashed text-center">
              <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-5 border border-amber-100">
                <FileText className="h-9 w-9 text-amber-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">No Drafts Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Use the form to quickly save a student's basic info.
                Complete the full registration when they bring all details.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((draft) => (
                <Card
                  key={draft.id}
                  className="group rounded-2xl border-slate-100 bg-white hover:shadow-lg hover:border-amber-100 transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">

                      {/* Info */}
                      <div className="flex-1 p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-lg shrink-0">
                              {draft.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 truncate text-base">{draft.name}</h3>
                              <div className="flex items-center flex-wrap gap-2 mt-0.5">
                                {draft.mobileNo && (
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {draft.mobileNo}
                                  </span>
                                )}
                                {draft.seatNo && (
                                  <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-400 px-1.5 h-4">
                                    Seat {draft.seatNo}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] font-black uppercase tracking-widest shrink-0">
                            Draft
                          </Badge>
                        </div>

                        {/* Visit date */}
                        {draft.dateOfVisit && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3 text-slate-300 shrink-0" />
                            <span>Visited {format(new Date(draft.dateOfVisit), "dd MMM, yyyy")}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {draft.notes && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                            <StickyNote className="h-3 w-3 mt-0.5 text-amber-400 shrink-0" />
                            <p className="text-[11px] text-amber-700 line-clamp-2 font-medium">{draft.notes}</p>
                          </div>
                        )}

                        {/* Time info */}
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center justify-end gap-2 p-4 sm:p-5 sm:border-l border-t sm:border-t-0 border-slate-50 bg-slate-50/30 sm:w-48">
                        <Button
                          onClick={() => handleCompleteRegistration(draft)}
                          className="flex-1 sm:w-full h-11 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200/50 gap-1.5 transition-all"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Register Now
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDraft(draft)}
                            className="h-11 w-11 sm:h-10 sm:w-full p-0 sm:px-3 rounded-xl border-slate-200 gap-1.5 font-bold text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(draft.id)}
                            className="h-11 w-11 sm:h-10 sm:w-full p-0 sm:px-3 rounded-xl border-red-100 text-red-500 hover:bg-red-50 gap-1.5 font-bold text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Delete Draft?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            This will permanently remove this temporary record. This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="rounded-xl bg-red-500 hover:bg-red-600 font-bold"
            >
              Delete Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
