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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Building2,
  Download,
  Package,
  Pencil,
  Search,
  ServerCrash,
  Trash2,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Category, Department, Status } from "../backend";
import type { ITAsset } from "../backend";
import { useDeleteAsset, useGetAllAssets } from "../hooks/useQueries";
import { EditAssetDialog } from "./EditAssetDialog";
import {
  DEPARTMENT_OPTIONS,
  StatusBadge,
  VENDOR_OPTIONS,
  getCategoryIcon,
} from "./shared";

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="font-display font-bold text-2xl text-foreground">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function exportToCSV(assets: ITAsset[]) {
  const headers = [
    "ID",
    "Name",
    "Category",
    "Serial Number",
    "MAC ID",
    "Service Tag",
    "Status",
    "Department",
    "Location",
    "Last Service Date",
    "Purchase Date",
    "Purchase Vendor",
    "Notes",
  ];
  const rows = assets.map((a) => [
    String(a.id),
    a.name,
    a.category,
    a.serialNumber,
    a.macId,
    a.serviceTag,
    a.status,
    a.assignedDepartment,
    a.location,
    a.lastServiceDate,
    a.purchaseDate,
    a.purchaseVendor,
    `"${a.notes.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `it-assets-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported successfully.");
}

export function DashboardPage() {
  const { data: assets = [], isLoading } = useGetAllAssets();
  const deleteAsset = useDeleteAsset();
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.macId.toLowerCase().includes(q);
      const matchDept =
        deptFilter === "all" || a.assignedDepartment === deptFilter;
      const matchVendor =
        vendorFilter === "all" || a.purchaseVendor === vendorFilter;
      return matchSearch && matchDept && matchVendor;
    });
  }, [assets, search, deptFilter, vendorFilter]);

  const totalActive = assets.filter((a) => a.status === Status.Active).length;
  const totalRepair = assets.filter((a) => a.status === Status.InRepair).length;

  // Top departments
  const deptCounts = assets.reduce<Record<string, number>>((acc, a) => {
    if (a.assignedDepartment)
      acc[a.assignedDepartment] = (acc[a.assignedDepartment] || 0) + 1;
    return acc;
  }, {});
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];

  const handleDelete = async (id: bigint) => {
    try {
      await deleteAsset.mutateAsync(id);
      toast.success("Asset removed from inventory.");
    } catch {
      toast.error("Failed to delete asset.");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <EditAssetDialog
        asset={editingAsset}
        open={editingAsset !== null}
        onClose={() => setEditingAsset(null)}
      />

      {/* Stat cards */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Assets"
            value={assets.length}
            icon={<Package className="h-5 w-5" />}
            color="bg-primary/10 text-primary"
            delay={0}
          />
          <StatCard
            label="Active"
            value={totalActive}
            icon={<Activity className="h-5 w-5" />}
            color="bg-[oklch(0.72_0.18_145/0.15)] text-[oklch(0.72_0.18_145)]"
            delay={0.06}
          />
          <StatCard
            label="In Repair"
            value={totalRepair}
            icon={<Wrench className="h-5 w-5" />}
            color="bg-[oklch(0.78_0.16_70/0.15)] text-[oklch(0.78_0.16_70)]"
            delay={0.12}
          />
          <StatCard
            label="Top Department"
            value={topDept ? `${topDept[0]} (${topDept[1]})` : "—"}
            icon={<Building2 className="h-5 w-5" />}
            color="bg-[oklch(0.65_0.15_300/0.15)] text-[oklch(0.65_0.15_300)]"
            delay={0.18}
          />
        </div>
      </section>

      {/* Filter bar */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                data-ocid="dashboard.search_input"
                placeholder="Search by name, serial, MAC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 font-mono text-sm bg-card border-border placeholder:text-muted-foreground/50"
              />
            </div>

            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger
                data-ocid="dashboard.dept.select"
                className="w-[180px] font-mono text-sm bg-card border-border"
              >
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="font-mono text-sm">
                  All Departments
                </SelectItem>
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

            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger
                data-ocid="dashboard.vendor.select"
                className="w-[160px] font-mono text-sm bg-card border-border"
              >
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="font-mono text-sm">
                  All Vendors
                </SelectItem>
                {VENDOR_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v} className="font-mono text-sm">
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            data-ocid="dashboard.export.button"
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="font-mono text-xs border-border hover:border-primary/50 hover:text-primary gap-2 shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
            {filtered.length > 0 && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-primary/30 text-primary bg-primary/10 ml-0.5"
              >
                {filtered.length}
              </Badge>
            )}
          </Button>
        </div>
      </motion.section>

      {/* Inventory table */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        data-ocid="dashboard.asset.table"
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display font-semibold text-base text-foreground tracking-wide">
            Asset Inventory
          </h2>
          {assets.length > 0 && (
            <Badge
              variant="outline"
              className="font-mono text-xs border-primary/30 text-primary bg-primary/10"
            >
              {filtered.length}
              {filtered.length !== assets.length ? ` / ${assets.length}` : ""}
            </Badge>
          )}
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div
              data-ocid="dashboard.asset.loading_state"
              className="p-6 space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-muted/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              data-ocid="dashboard.asset.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-muted/30 border border-border flex items-center justify-center mb-4">
                <ServerCrash className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display font-medium text-foreground mb-1">
                {assets.length === 0
                  ? "No assets registered"
                  : "No assets match your filters"}
              </p>
              <p className="text-sm font-mono text-muted-foreground">
                {assets.length === 0
                  ? "Use the Register Asset page to add your first asset."
                  : "Try adjusting or clearing the search and filters."}
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "#",
                      "Asset Name",
                      "Category",
                      "Serial No.",
                      "MAC ID",
                      "Service Tag",
                      "Status",
                      "Department",
                      "Purchase Date",
                      "Vendor",
                      "Last Service",
                      "Location",
                      "Notes",
                      "",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="font-mono text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filtered.map((asset, idx) => (
                      <motion.tr
                        key={String(asset.id)}
                        data-ocid={`dashboard.asset.row.${idx + 1}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                        className="border-border hover:bg-accent/30 transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {getCategoryIcon(asset.category)}
                            </span>
                            {asset.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground bg-muted/30 border border-border px-2 py-0.5 rounded whitespace-nowrap">
                            {asset.category === Category.NetworkDevice
                              ? "Network"
                              : asset.category}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {asset.serialNumber || (
                            <span className="opacity-30">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {asset.macId || <span className="opacity-30">—</span>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
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
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {asset.purchaseDate || (
                            <span className="opacity-30">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {asset.purchaseVendor || (
                            <span className="opacity-30">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {asset.lastServiceDate || (
                            <span className="opacity-30">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {asset.location || (
                            <span className="opacity-30">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {asset.notes || <span className="opacity-30">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              data-ocid={`dashboard.asset.edit_button.${idx + 1}`}
                              onClick={() => setEditingAsset(asset)}
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-ocid={`dashboard.asset.delete_button.${idx + 1}`}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">
                                    Remove Asset
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-mono text-sm">
                                    Delete{" "}
                                    <span className="text-foreground font-medium">
                                      {asset.name}
                                    </span>{" "}
                                    from the inventory? This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    data-ocid="delete.asset.cancel_button"
                                    className="font-mono text-sm"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    data-ocid="delete.asset.confirm_button"
                                    onClick={() => handleDelete(asset.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-sm"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </motion.section>
    </main>
  );
}
