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
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddAsset, useGetOptions } from "../hooks/useQueries";

type SpecFieldConfig = {
  id: string;
  label: string;
  type: "text" | "select";
  options?: string[];
};

function getSpecFields(category: string): SpecFieldConfig[] {
  const c = category.toLowerCase();

  if (/desktop|cpu|laptop|computer|workstation|\bpc\b/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      { id: "processor", label: "Processor", type: "text" },
      {
        id: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
      },
      {
        id: "storageType",
        label: "Storage Type",
        type: "select",
        options: ["HDD", "SSD", "Both"],
      },
      {
        id: "storageCapacity",
        label: "Storage Capacity",
        type: "select",
        options: ["128GB", "256GB", "512GB", "1TB", "2TB"],
      },
    ];
  }
  if (/printer/.test(c)) {
    return [
      { id: "modelName", label: "Model Name", type: "text" },
      {
        id: "printerType",
        label: "Printer Type",
        type: "select",
        options: ["Ink", "Cartridge", "Barcode", "Laser", "Thermal"],
      },
    ];
  }
  if (/monitor|display|screen/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      { id: "screenSize", label: "Screen Size", type: "text" },
      {
        id: "resolution",
        label: "Resolution",
        type: "select",
        options: ["HD", "Full HD", "2K", "4K"],
      },
    ];
  }
  if (/server/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      { id: "processor", label: "Processor", type: "text" },
      {
        id: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
      },
      {
        id: "storageType",
        label: "Storage Type",
        type: "select",
        options: ["HDD", "SSD", "Both"],
      },
      {
        id: "storageCapacity",
        label: "Storage Capacity",
        type: "select",
        options: ["128GB", "256GB", "512GB", "1TB", "2TB"],
      },
      { id: "osSoftware", label: "OS / Software", type: "text" },
    ];
  }
  if (/network|router|switch|firewall|access point/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      {
        id: "ports",
        label: "Ports",
        type: "select",
        options: ["4", "8", "16", "24", "48"],
      },
      {
        id: "speed",
        label: "Speed",
        type: "select",
        options: ["100Mbps", "1Gbps", "10Gbps"],
      },
    ];
  }
  if (/ups|power/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      { id: "capacityVA", label: "Capacity VA", type: "text" },
    ];
  }
  if (/phone|mobile|tablet/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      { id: "imei", label: "IMEI", type: "text" },
    ];
  }
  if (/scanner/.test(c)) {
    return [
      { id: "model", label: "Model", type: "text" },
      {
        id: "scannerType",
        label: "Scanner Type",
        type: "select",
        options: ["Flatbed", "Sheet-fed", "Handheld", "Barcode"],
      },
    ];
  }
  return [];
}

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
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [lastRegistered, setLastRegistered] = useState<string | null>(null);
  const addAsset = useAddAsset();

  const { data: categories = [] } = useGetOptions("category");
  const { data: departments = [] } = useGetOptions("department");
  const { data: vendors = [] } = useGetOptions("vendor");
  const { data: statuses = [] } = useGetOptions("status");

  const specFields = getSpecFields(form.category);

  const handleCategoryChange = (v: string) => {
    setForm((f) => ({ ...f, category: v }));
    setSpecs({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetName || !form.category || !form.status) {
      toast.error("Asset Name, Category, and Status are required.");
      return;
    }
    try {
      const specEntries = Object.entries(specs)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
      const combinedNotes = specEntries
        ? `[SPECS] ${specEntries}\n[NOTES] ${form.notes}`
        : form.notes;
      await addAsset.mutateAsync({ ...form, notes: combinedNotes });
      setLastRegistered(form.assetName);
      setForm(defaultForm);
      setSpecs({});
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
    onChange?: (v: string) => void,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <Select
        value={value || undefined}
        onValueChange={onChange ?? ((v) => setForm((f) => ({ ...f, [id]: v })))}
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

  const specTextField = (cfg: SpecFieldConfig) => (
    <div key={cfg.id} className="flex flex-col gap-1.5">
      <Label
        htmlFor={`spec-${cfg.id}`}
        className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
      >
        {cfg.label}
      </Label>
      <Input
        id={`spec-${cfg.id}`}
        type="text"
        value={specs[cfg.id] ?? ""}
        onChange={(e) => setSpecs((s) => ({ ...s, [cfg.id]: e.target.value }))}
        className="bg-input border-border font-mono text-sm h-9"
        data-ocid={`spec.${cfg.id}.input`}
      />
    </div>
  );

  const specSelectField = (cfg: SpecFieldConfig) => (
    <div key={cfg.id} className="flex flex-col gap-1.5">
      <Label
        htmlFor={`spec-${cfg.id}`}
        className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
      >
        {cfg.label}
      </Label>
      <Select
        value={specs[cfg.id] || undefined}
        onValueChange={(v) => setSpecs((s) => ({ ...s, [cfg.id]: v }))}
      >
        <SelectTrigger
          id={`spec-${cfg.id}`}
          className="bg-input border-border font-mono text-sm h-9"
          data-ocid={`spec.${cfg.id}.select`}
        >
          <SelectValue placeholder={`Select ${cfg.label}`} />
        </SelectTrigger>
        <SelectContent>
          {(cfg.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt} className="font-mono text-sm">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
              {selectField(
                "category",
                "Category *",
                form.category,
                categories,
                handleCategoryChange,
              )}
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

          {/* Category-specific Specifications */}
          <AnimatePresence>
            {specFields.length > 0 && (
              <motion.div
                key={form.category}
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
                data-ocid="entry.specs.panel"
              >
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-primary" />
                    <p className="text-xs font-mono text-primary uppercase tracking-widest font-semibold">
                      Specifications — {form.category}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {specFields.map((cfg) =>
                      cfg.type === "select"
                        ? specSelectField(cfg)
                        : specTextField(cfg),
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
