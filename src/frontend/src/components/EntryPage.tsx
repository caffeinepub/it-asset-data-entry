import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddAsset, useGetOptions } from "../hooks/useQueries";

const defaultForm = {
  assetName: "",
  macId: "",
  serviceTag: "",
  category: "",
  department: "",
  vendor: "",
  status: "",
  purchaseDate: "",
  lastServiceDate: "",
  notes: "",
};

export function EntryPage({
  onGoToDashboard,
}: { onGoToDashboard: () => void }) {
  const [form, setForm] = useState(defaultForm);
  const [lastRegistered, setLastRegistered] = useState<string | null>(null);
  const addAsset = useAddAsset();

  const { data: categories = [] } = useGetOptions("category");
  const { data: departments = [] } = useGetOptions("department");
  const { data: vendors = [] } = useGetOptions("vendor");
  const { data: statuses = [] } = useGetOptions("status");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetName || !form.category || !form.status) {
      toast.error("Asset Name, Category, and Status are required.");
      return;
    }
    try {
      await addAsset.mutateAsync(form);
      setLastRegistered(form.assetName);
      setForm(defaultForm);
      toast.success(`"${form.assetName}" registered successfully.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to register asset.",
      );
    }
  };

  const field = (id: string, label: string, value: string, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        className="bg-input border-border font-mono text-sm h-9"
        data-ocid={`entry.${id}.input`}
      />
    </div>
  );

  const selectField = (
    id: string,
    label: string,
    value: string,
    options: string[],
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => setForm((f) => ({ ...f, [id]: v }))}
      >
        <SelectTrigger
          id={id}
          className="bg-input border-border font-mono text-sm h-9"
          data-ocid={`entry.${id}.select`}
        >
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="font-mono text-sm">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {options.length === 0 && (
        <p className="text-xs font-mono text-muted-foreground">
          No options yet — add them in Admin Settings
        </p>
      )}
    </div>
  );

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ChevronRight className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-xl text-foreground tracking-wide">
              Register New Asset
            </h2>
          </div>
          <p className="text-sm font-mono text-muted-foreground pl-6">
            Fill in the details below to add a new IT asset to the inventory.
          </p>
        </div>

        <AnimatePresence>
          {lastRegistered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/10 px-5 py-3"
              data-ocid="entry.success_state"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm font-mono text-foreground">
                  <span className="text-primary font-semibold">
                    &ldquo;{lastRegistered}&rdquo;
                  </span>{" "}
                  was registered.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary font-mono text-xs gap-1"
                onClick={onGoToDashboard}
                data-ocid="entry.dashboard.link"
              >
                View Inventory <ArrowRight className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-ocid="entry.form.panel"
        >
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Asset Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {field("assetName", "Asset Name *", form.assetName)}
              {field("macId", "MAC ID", form.macId)}
              {field("serviceTag", "Service Tag", form.serviceTag)}
              {selectField("category", "Category *", form.category, categories)}
              {selectField(
                "department",
                "Department",
                form.department,
                departments,
              )}
              {selectField("vendor", "Vendor", form.vendor, vendors)}
              {selectField("status", "Status *", form.status, statuses)}
              {field(
                "purchaseDate",
                "Purchase Date",
                form.purchaseDate,
                "date",
              )}
              {field(
                "lastServiceDate",
                "Last Service Date",
                form.lastServiceDate,
                "date",
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="notes"
                className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
              >
                Notes
              </Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="bg-input border-border font-mono text-sm resize-none"
                rows={3}
                data-ocid="entry.notes.textarea"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={addAsset.isPending}
              className="font-mono gap-2 px-8"
              data-ocid="entry.submit_button"
            >
              {addAsset.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Register Asset <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
