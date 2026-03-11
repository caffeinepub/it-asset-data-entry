import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAddAsset, useGetOptions } from "@/hooks/useQueries";
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onGoToDashboard: () => void;
}

type SpecFields = Record<string, string>;

function getCategoryType(category: string): string | null {
  const c = category.toLowerCase();
  if (/desktop|cpu|laptop|computer|workstation|\bpc\b/.test(c))
    return "computer";
  if (/printer/.test(c)) return "printer";
  if (/monitor|display|screen/.test(c)) return "monitor";
  if (/server/.test(c)) return "server";
  if (/network|router|switch|firewall/.test(c)) return "network";
  if (/ups|power/.test(c)) return "ups";
  if (/phone|mobile|tablet/.test(c)) return "phone";
  if (/scanner/.test(c)) return "scanner";
  return null;
}

function buildNotes(specs: SpecFields, notes: string): string {
  const entries = Object.entries(specs).filter(([, v]) => v.trim());
  if (!entries.length) return notes;
  const specStr = entries.map(([k, v]) => `${k}: ${v}`).join(" | ");
  return `[SPECS] ${specStr}\n[NOTES] ${notes}`;
}

const EMPTY_FORM = {
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

export function EntryPage({ onGoToDashboard }: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [specs, setSpecs] = useState<SpecFields>({});
  const [saved, setSaved] = useState(false);

  const categories = useGetOptions("category");
  const departments = useGetOptions("department");
  const vendors = useGetOptions("vendor");
  const statuses = useGetOptions("status");
  const addAsset = useAddAsset();

  const categoryType = getCategoryType(form.category);

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "category") {
      setSpecs({});
    }
  }

  function setSpec(key: string, value: string) {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.assetName || !form.category || !form.status) {
      toast.error("Asset Name, Category, and Status are required.");
      return;
    }
    try {
      const notesWithSpecs = buildNotes(specs, form.notes);
      await addAsset.mutateAsync({ ...form, notes: notesWithSpecs });
      toast.success("Asset registered successfully!");
      setForm({ ...EMPTY_FORM });
      setSpecs({});
      setSaved(true);
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  function renderSelect(
    label: string,
    field: keyof typeof form,
    options: string[] | undefined,
    ocid: string,
    required = false,
  ) {
    return (
      <div className="space-y-1.5">
        <Label
          htmlFor={field}
          className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={form[field] || undefined}
          onValueChange={(val) => setField(field, val)}
        >
          <SelectTrigger
            data-ocid={ocid}
            className="bg-muted/30 border-border h-9 text-sm"
          >
            <SelectValue
              placeholder={
                options?.length === 0
                  ? "No options — add in Admin"
                  : `Select ${label}`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
            {(options ?? []).length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No options yet — add in Admin
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function renderSpecSelect(
    label: string,
    specKey: string,
    options: string[],
    ocid: string,
  ) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </Label>
        <Select
          value={specs[specKey] || undefined}
          onValueChange={(val) => setSpec(specKey, val)}
        >
          <SelectTrigger
            data-ocid={ocid}
            className="bg-muted/30 border-border h-9 text-sm"
          >
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function renderSpecInput(label: string, specKey: string, ocid: string) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </Label>
        <Input
          data-ocid={ocid}
          value={specs[specKey] || ""}
          onChange={(e) => setSpec(specKey, e.target.value)}
          className="bg-muted/30 border-border h-9 text-sm"
          placeholder={label}
        />
      </div>
    );
  }

  function renderSpecFields() {
    if (!categoryType) return null;
    return (
      <div className="mt-2 p-4 bg-muted/20 border border-border/60 rounded-lg space-y-4">
        <p className="text-xs font-mono text-primary uppercase tracking-widest">
          — Spec Fields —
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categoryType === "computer" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecInput(
                "Processor",
                "processor",
                "spec.processor.input",
              )}
              {renderSpecSelect(
                "RAM",
                "ram",
                ["4GB", "8GB", "16GB", "32GB", "64GB"],
                "spec.ram.select",
              )}
              {renderSpecSelect(
                "Storage Type",
                "storageType",
                ["HDD", "SSD", "Both"],
                "spec.storagetype.select",
              )}
              {renderSpecSelect(
                "Storage Capacity",
                "storageCapacity",
                ["128GB", "256GB", "512GB", "1TB", "2TB"],
                "spec.storagecapacity.select",
              )}
            </>
          )}
          {categoryType === "printer" && (
            <>
              {renderSpecInput(
                "Model Name",
                "modelName",
                "spec.modelname.input",
              )}
              {renderSpecSelect(
                "Printer Type",
                "printerType",
                ["Ink", "Cartridge", "Barcode", "Laser", "Thermal"],
                "spec.printertype.select",
              )}
            </>
          )}
          {categoryType === "monitor" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecInput(
                "Screen Size",
                "screenSize",
                "spec.screensize.input",
              )}
              {renderSpecSelect(
                "Resolution",
                "resolution",
                ["HD", "Full HD", "2K", "4K"],
                "spec.resolution.select",
              )}
            </>
          )}
          {categoryType === "server" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecInput(
                "Processor",
                "processor",
                "spec.processor.input",
              )}
              {renderSpecSelect(
                "RAM",
                "ram",
                ["4GB", "8GB", "16GB", "32GB", "64GB", "128GB", "256GB"],
                "spec.ram.select",
              )}
              {renderSpecSelect(
                "Storage Type",
                "storageType",
                ["HDD", "SSD", "Both"],
                "spec.storagetype.select",
              )}
              {renderSpecSelect(
                "Storage Capacity",
                "storageCapacity",
                ["512GB", "1TB", "2TB", "4TB", "8TB"],
                "spec.storagecapacity.select",
              )}
              {renderSpecInput("OS / Software", "os", "spec.os.input")}
            </>
          )}
          {categoryType === "network" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecSelect(
                "Ports",
                "ports",
                ["4", "8", "16", "24", "48"],
                "spec.ports.select",
              )}
              {renderSpecSelect(
                "Speed",
                "speed",
                ["100Mbps", "1Gbps", "10Gbps"],
                "spec.speed.select",
              )}
            </>
          )}
          {categoryType === "ups" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecInput(
                "Capacity VA",
                "capacityVA",
                "spec.capacityva.input",
              )}
            </>
          )}
          {categoryType === "phone" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecInput("IMEI", "imei", "spec.imei.input")}
            </>
          )}
          {categoryType === "scanner" && (
            <>
              {renderSpecInput("Model", "model", "spec.model.input")}
              {renderSpecSelect(
                "Scanner Type",
                "scannerType",
                ["Flatbed", "Sheet-fed", "Handheld", "Barcode"],
                "spec.scannertype.select",
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {saved && (
        <div
          data-ocid="register.success_state"
          className="mb-6 flex items-center justify-between gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-primary">
              Asset registered successfully!
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="register.dashboard.link"
            onClick={onGoToDashboard}
            className="text-xs font-mono border-primary/40 text-primary hover:bg-primary/10"
          >
            View Inventory →
          </Button>
        </div>
      )}

      <Card className="border-border bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Register New Asset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Asset Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  data-ocid="register.assetname.input"
                  value={form.assetName}
                  onChange={(e) => setField("assetName", e.target.value)}
                  className="bg-muted/30 border-border h-9 text-sm"
                  placeholder="e.g. Dell Laptop #42"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  MAC ID
                </Label>
                <Input
                  data-ocid="register.macid.input"
                  value={form.macId}
                  onChange={(e) => setField("macId", e.target.value)}
                  className="bg-muted/30 border-border h-9 text-sm"
                  placeholder="AA:BB:CC:DD:EE:FF"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Service Tag
                </Label>
                <Input
                  data-ocid="register.servicetag.input"
                  value={form.serviceTag}
                  onChange={(e) => setField("serviceTag", e.target.value)}
                  className="bg-muted/30 border-border h-9 text-sm"
                  placeholder="SVC-001"
                />
              </div>
              {renderSelect(
                "Category",
                "category",
                categories.data,
                "register.category.select",
                true,
              )}
              {renderSelect(
                "Department",
                "department",
                departments.data,
                "register.department.select",
              )}
              {renderSelect(
                "Vendor",
                "vendor",
                vendors.data,
                "register.vendor.select",
              )}
              {renderSelect(
                "Status",
                "status",
                statuses.data,
                "register.status.select",
                true,
              )}
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Purchase Date
                </Label>
                <Input
                  data-ocid="register.purchasedate.input"
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setField("purchaseDate", e.target.value)}
                  className="bg-muted/30 border-border h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Last Service Date
                </Label>
                <Input
                  data-ocid="register.lastservicedate.input"
                  type="date"
                  value={form.lastServiceDate}
                  onChange={(e) => setField("lastServiceDate", e.target.value)}
                  className="bg-muted/30 border-border h-9 text-sm"
                />
              </div>
            </div>

            {/* Dynamic Spec Fields */}
            {renderSpecFields()}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Notes
              </Label>
              <Textarea
                data-ocid="register.notes.textarea"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="bg-muted/30 border-border text-sm resize-none"
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                data-ocid="register.submit_button"
                disabled={addAsset.isPending}
                className="flex-1 sm:flex-none font-mono text-sm"
              >
                {addAsset.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Register Asset"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="register.cancel_button"
                onClick={() => {
                  setForm({ ...EMPTY_FORM });
                  setSpecs({});
                  setSaved(false);
                }}
                className="font-mono text-sm"
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
