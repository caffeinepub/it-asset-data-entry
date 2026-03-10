import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  ChevronRight,
  Code,
  Cpu,
  HardDrive,
  Monitor,
  Network,
  Package,
  Plus,
  Printer,
  ServerCrash,
  Smartphone,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, Department, Status } from "./backend";
import {
  useAddAsset,
  useDeleteAsset,
  useGetAllAssets,
} from "./hooks/useQueries";

const CATEGORY_OPTIONS: {
  value: Category;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: Category.Computer,
    label: "Computer",
    icon: <Cpu className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Monitor,
    label: "Monitor",
    icon: <Monitor className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Printer,
    label: "Printer",
    icon: <Printer className="h-3.5 w-3.5" />,
  },
  {
    value: Category.NetworkDevice,
    label: "Network Device",
    icon: <Network className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Phone,
    label: "Phone",
    icon: <Smartphone className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Peripheral,
    label: "Peripheral",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Software,
    label: "Software",
    icon: <Code className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Other,
    label: "Other",
    icon: <HardDrive className="h-3.5 w-3.5" />,
  },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: Status.Active, label: "Active" },
  { value: Status.Inactive, label: "Inactive" },
  { value: Status.InRepair, label: "In Repair" },
  { value: Status.Retired, label: "Retired" },
];

const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: Department.IT, label: "IT" },
  { value: Department.Biomedical, label: "Biomedical" },
  { value: Department.Engineering, label: "Engineering" },
  { value: Department.Accounts, label: "Accounts" },
  { value: Department.HR, label: "HR" },
  { value: Department.Finance, label: "Finance" },
  { value: Department.Administration, label: "Administration" },
  { value: Department.Maintenance, label: "Maintenance" },
  { value: Department.Other, label: "Other" },
];

const VENDOR_OPTIONS = [
  "Dell",
  "HP",
  "Lenovo",
  "Apple",
  "Microsoft",
  "Cisco",
  "Samsung",
  "Acer",
  "ASUS",
  "Toshiba",
  "Other",
];

function getCategoryIcon(category: Category) {
  const found = CATEGORY_OPTIONS.find((c) => c.value === category);
  return found?.icon ?? <HardDrive className="h-3.5 w-3.5" />;
}

function StatusBadge({ status }: { status: Status }) {
  const config = {
    [Status.Active]: {
      label: "Active",
      className:
        "bg-[oklch(0.72_0.18_145/0.15)] text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145/0.3)]",
      pulse: true,
    },
    [Status.Inactive]: {
      label: "Inactive",
      className:
        "bg-[oklch(0.55_0.02_240/0.15)] text-[oklch(0.65_0.02_240)] border-[oklch(0.55_0.02_240/0.3)]",
      pulse: false,
    },
    [Status.InRepair]: {
      label: "In Repair",
      className:
        "bg-[oklch(0.78_0.16_70/0.15)] text-[oklch(0.78_0.16_70)] border-[oklch(0.78_0.16_70/0.3)]",
      pulse: false,
    },
    [Status.Retired]: {
      label: "Retired",
      className:
        "bg-[oklch(0.6_0.22_25/0.15)] text-[oklch(0.6_0.22_25)] border-[oklch(0.6_0.22_25/0.3)]",
      pulse: false,
    },
  };

  const { label, className, pulse } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full bg-current ${
          pulse ? "status-pulse" : ""
        }`}
      />
      {label}
    </span>
  );
}

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

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const { data: assets = [], isLoading } = useGetAllAssets();
  const addAsset = useAddAsset();
  const deleteAsset = useDeleteAsset();

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
      setForm(defaultForm);
      toast.success("Asset registered successfully.");
    } catch {
      toast.error("Failed to register asset.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteAsset.mutateAsync(id);
      toast.success("Asset removed from inventory.");
    } catch {
      toast.error("Failed to delete asset.");
    }
  };

  const totalActive = assets.filter((a) => a.status === Status.Active).length;
  const totalRepair = assets.filter((a) => a.status === Status.InRepair).length;

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        data-ocid="app.toast"
        theme="dark"
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "font-mono text-sm bg-card border-border",
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded bg-primary/10 border border-primary/30">
              <ServerCrash className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-wide text-foreground">
                IT Asset Registry
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                INVENTORY MANAGEMENT SYSTEM
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-status-active" />
              <span className="text-foreground font-medium">{totalActive}</span>{" "}
              active
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-repair" />
              <span className="text-foreground font-medium">{totalRepair}</span>{" "}
              in repair
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="text-foreground font-medium">
                {assets.length}
              </span>{" "}
              total assets
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Entry Form */}
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          data-ocid="asset.panel"
        >
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-base text-foreground tracking-wide">
              Register New Asset
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Asset Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    data-ocid="asset.input"
                    placeholder="e.g. ThinkPad X1 Carbon"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Category */}
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
                      data-ocid="asset.select"
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

                {/* Serial Number */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="serial"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Serial Number
                  </Label>
                  <Input
                    id="serial"
                    data-ocid="asset.serial.input"
                    placeholder="e.g. SN-2024-001"
                    value={form.serialNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, serialNumber: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* MAC ID */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="macId"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    MAC ID
                  </Label>
                  <Input
                    id="macId"
                    data-ocid="asset.macid.input"
                    placeholder="e.g. 00:1A:2B:3C:4D:5E"
                    value={form.macId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, macId: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Service Tag */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="serviceTag"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Service Tag
                  </Label>
                  <Input
                    id="serviceTag"
                    data-ocid="asset.servicetag.input"
                    placeholder="e.g. ST-ABC123"
                    value={form.serviceTag}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, serviceTag: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Assigned Department */}
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
                      data-ocid="asset.department.select"
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

                {/* Status */}
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
                      data-ocid="asset.status.select"
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

                {/* Last Service Date */}
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
                    data-ocid="asset.lastservice.input"
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

                {/* Purchase Date */}
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
                    data-ocid="asset.purchasedate.input"
                    value={form.purchaseDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, purchaseDate: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border [color-scheme:dark]"
                  />
                </div>

                {/* Purchase Vendor */}
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
                      data-ocid="asset.vendor.select"
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

                {/* Location */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="location"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    data-ocid="asset.location.input"
                    placeholder="e.g. Office Floor 3 — Desk 12"
                    value={form.location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, location: e.target.value }))
                    }
                    className="font-mono text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <Label
                    htmlFor="notes"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
                  >
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    data-ocid="asset.textarea"
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

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-mono text-muted-foreground">
                  <span className="text-destructive">*</span> Required fields
                </p>
                <Button
                  type="submit"
                  data-ocid="asset.submit_button"
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
        </motion.section>

        {/* Assets Table */}
        <section data-ocid="asset.section">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-base text-foreground tracking-wide">
              Asset Inventory
            </h2>
            {assets.length > 0 && (
              <Badge
                variant="outline"
                className="font-mono text-xs border-primary/30 text-primary bg-primary/10 ml-1"
              >
                {assets.length}
              </Badge>
            )}
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {isLoading ? (
              <div data-ocid="asset.loading_state" className="p-6 space-y-3">
                <Skeleton className="h-10 w-full bg-muted/50" />
                <Skeleton className="h-10 w-full bg-muted/50" />
                <Skeleton className="h-10 w-full bg-muted/50" />
              </div>
            ) : assets.length === 0 ? (
              <motion.div
                data-ocid="asset.empty_state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center"
              >
                <div className="w-16 h-16 rounded-xl bg-muted/30 border border-border flex items-center justify-center mb-4">
                  <ServerCrash className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-display font-medium text-foreground mb-1">
                  No assets registered
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  Use the form above to add your first IT asset
                </p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="asset.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground w-8">
                        #
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[140px]">
                        Asset Name
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[110px]">
                        Category
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        Serial No.
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[140px]">
                        MAC ID
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        Service Tag
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">
                        Status
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        Department
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[110px]">
                        Purchase Date
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[90px]">
                        Vendor
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[110px]">
                        Last Service
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        Location
                      </TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground min-w-[160px]">
                        Notes
                      </TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {assets.map((asset, idx) => (
                        <motion.tr
                          key={String(asset.id)}
                          data-ocid={`asset.row.${idx + 1}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.2 }}
                          className="border-border hover:bg-accent/30 transition-colors"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-sm text-foreground">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {getCategoryIcon(asset.category)}
                              </span>
                              {asset.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground bg-muted/30 border border-border px-2 py-0.5 rounded">
                              {asset.category === Category.NetworkDevice
                                ? "Network"
                                : asset.category}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {asset.serialNumber || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {asset.macId || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {asset.serviceTag || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={asset.status} />
                          </TableCell>
                          <TableCell>
                            {asset.assignedDepartment ? (
                              <span className="font-mono text-xs text-muted-foreground bg-muted/30 border border-border px-2 py-0.5 rounded">
                                {asset.assignedDepartment}
                              </span>
                            ) : (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {asset.purchaseDate || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {asset.purchaseVendor || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {asset.lastServiceDate || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                            {asset.location || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                            {asset.notes || (
                              <span className="opacity-30">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-ocid={`asset.delete_button.${idx + 1}`}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                data-ocid="asset.dialog"
                                className="bg-card border-border"
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">
                                    Remove Asset
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-mono text-sm">
                                    Delete{" "}
                                    <span className="text-foreground font-medium">
                                      {asset.name}
                                    </span>{" "}
                                    from the inventory? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    data-ocid="asset.cancel_button"
                                    className="font-mono text-sm"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    data-ocid="asset.confirm_button"
                                    onClick={() => handleDelete(asset.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-sm"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-12 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs font-mono text-muted-foreground">
            IT Asset Registry &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
