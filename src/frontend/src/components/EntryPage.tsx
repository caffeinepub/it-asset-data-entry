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
import { ArrowRight, CheckCircle2, ChevronRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Category, Department, type Status } from "../backend";
import { useAddAsset } from "../hooks/useQueries";
import {
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  VENDOR_OPTIONS,
} from "./shared";

const defaultForm = {
  name: "",
  category: "" as Category | "",
  serialNumber: "",
  macId: "",
  serviceTag: "",
  status: "" as Status | "",
  assignedDepartment: "" as Department | "",
  location: "",
  lastServiceDate: "",
  purchaseDate: "",
  purchaseVendor: "",
  notes: "",
};

export function EntryPage({
  onGoToDashboard,
}: { onGoToDashboard: () => void }) {
  const [form, setForm] = useState(defaultForm);
  const [lastRegistered, setLastRegistered] = useState<string | null>(null);
  const addAsset = useAddAsset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.status) {
      toast.error("Name, Category, and Status are required.");
      return;
    }
    try {
      await addAsset.mutateAsync({
        name: form.name,
        category: form.category as Category,
        serialNumber: form.serialNumber,
        macId: form.macId,
        serviceTag: form.serviceTag,
        status: form.status as Status,
        assignedDepartment: (form.assignedDepartment ||
          Department.Other) as Department,
        location: form.location,
        lastServiceDate: form.lastServiceDate,
        purchaseDate: form.purchaseDate,
        purchaseVendor: form.purchaseVendor,
        notes: form.notes,
      });
      setLastRegistered(form.name);
      setForm(defaultForm);
      toast.success(`${form.name} registered successfully.`);
    } catch {
      toast.error("Failed to register asset.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Page heading */}
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

        {/* Success banner */}
        <AnimatePresence>
          {lastRegistered && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between bg-[oklch(0.72_0.18_145/0.1)] border border-[oklch(0.72_0.18_145/0.3)] rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-[oklch(0.72_0.18_145)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-mono text-sm">
                    <span className="font-semibold">{lastRegistered}</span> was
                    registered successfully.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGoToDashboard}
                  className="font-mono text-xs text-[oklch(0.72_0.18_145)] hover:text-[oklch(0.72_0.18_145)] hover:bg-[oklch(0.72_0.18_145/0.1)] gap-1.5"
                >
                  View in Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Identity */}
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4">
                Asset Identity
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Asset Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    data-ocid="entry.asset.input"
                    placeholder="e.g. ThinkPad X1 Carbon"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, category: v as Category }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="entry.asset.select"
                      className="font-mono text-sm bg-background border-border"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="font-mono text-sm"
                        >
                          <span className="flex items-center gap-2">
                            {opt.icon}
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, status: v as Status }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="entry.asset.select"
                      className="font-mono text-sm bg-background border-border"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="font-mono text-sm"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="serial"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Serial Number
                  </Label>
                  <Input
                    id="serial"
                    data-ocid="entry.asset.serial.input"
                    placeholder="e.g. SN-2024-001"
                    value={form.serialNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, serialNumber: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="macId"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    MAC ID
                  </Label>
                  <Input
                    id="macId"
                    data-ocid="entry.asset.macid.input"
                    placeholder="e.g. 00:1A:2B:3C:4D:5E"
                    value={form.macId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, macId: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="serviceTag"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Service Tag
                  </Label>
                  <Input
                    id="serviceTag"
                    data-ocid="entry.asset.servicetag.input"
                    placeholder="e.g. ST-ABC123"
                    value={form.serviceTag}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, serviceTag: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Assignment */}
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4">
                Assignment & Procurement
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Assigned Department
                  </Label>
                  <Select
                    value={form.assignedDepartment}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        assignedDepartment: v as Department,
                      }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="entry.asset.select"
                      className="font-mono text-sm bg-background border-border"
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {DEPARTMENT_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="font-mono text-sm"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Purchase Vendor
                  </Label>
                  <Select
                    value={form.purchaseVendor}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, purchaseVendor: v }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="entry.asset.select"
                      className="font-mono text-sm bg-background border-border"
                    >
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {VENDOR_OPTIONS.map((v) => (
                        <SelectItem
                          key={v}
                          value={v}
                          className="font-mono text-sm"
                        >
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="location"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    data-ocid="entry.asset.location.input"
                    placeholder="e.g. Office Floor 3 — Desk 12"
                    value={form.location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, location: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="lastServiceDate"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Last Service Date
                  </Label>
                  <Input
                    id="lastServiceDate"
                    type="date"
                    data-ocid="entry.asset.lastservice.input"
                    value={form.lastServiceDate}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        lastServiceDate: e.target.value,
                      }))
                    }
                    className="font-mono text-sm bg-background border-border [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="purchaseDate"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Purchase Date
                  </Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    data-ocid="entry.asset.purchasedate.input"
                    value={form.purchaseDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, purchaseDate: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="notes"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    data-ocid="entry.asset.textarea"
                    placeholder="Warranty info, condition, etc."
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={1}
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-destructive">*</span> Required fields
              </p>
              <Button
                type="submit"
                data-ocid="entry.asset.submit_button"
                disabled={addAsset.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm gap-2 shadow-glow-sm"
              >
                {addAsset.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Register Asset
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
