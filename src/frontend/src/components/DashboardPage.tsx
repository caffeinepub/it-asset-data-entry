import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Download, Edit2, Loader2, PackageSearch, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { Asset } from "../backend.d";
import {
  useDeleteAsset,
  useGetAllAssets,
  useGetOptions,
  useUpdateAsset,
} from "../hooks/useQueries";

const CHART_COLORS = [
  "oklch(0.75 0.14 195)",
  "oklch(0.72 0.18 145)",
  "oklch(0.78 0.16 70)",
  "oklch(0.60 0.22 25)",
  "oklch(0.65 0.15 300)",
  "oklch(0.70 0.14 250)",
];

export function DashboardPage() {
  const { data: assets = [], isLoading } = useGetAllAssets();
  const { data: categories = [] } = useGetOptions("category");
  const { data: departments = [] } = useGetOptions("department");
  const { data: vendors = [] } = useGetOptions("vendor");
  const { data: statuses = [] } = useGetOptions("status");
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const [filterDept, setFilterDept] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState<Omit<Asset, "id">>({
    macId: "",
    serviceTag: "",
    assetName: "",
    category: "",
    department: "",
    vendor: "",
    status: "",
    purchaseDate: "",
    lastServiceDate: "",
    notes: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const d = a.department.toLowerCase();
      const v = a.vendor.toLowerCase();
      return (
        d.includes(filterDept.toLowerCase()) &&
        v.includes(filterVendor.toLowerCase())
      );
    });
  }, [assets, filterDept, filterVendor]);

  const categoryChart = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of assets) counts[a.category] = (counts[a.category] || 0) + 1;
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [assets]);

  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of assets) counts[a.status] = (counts[a.status] || 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const openEdit = (asset: Asset) => {
    setEditAsset(asset);
    setEditForm({
      macId: asset.macId,
      serviceTag: asset.serviceTag,
      assetName: asset.assetName,
      category: asset.category,
      department: asset.department,
      vendor: asset.vendor,
      status: asset.status,
      purchaseDate: asset.purchaseDate,
      lastServiceDate: asset.lastServiceDate,
      notes: asset.notes,
    });
  };

  const handleUpdate = async () => {
    if (!editAsset) return;
    try {
      await updateAsset.mutateAsync({ id: editAsset.id, ...editForm });
      toast.success("Asset updated.");
      setEditAsset(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAsset.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.assetName}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Asset Name",
      "MAC ID",
      "Service Tag",
      "Category",
      "Department",
      "Vendor",
      "Status",
      "Purchase Date",
      "Last Service Date",
      "Notes",
    ];
    const rows = assets.map((a) => [
      String(a.id),
      a.assetName,
      a.macId,
      a.serviceTag,
      a.category,
      a.department,
      a.vendor,
      a.status,
      a.purchaseDate,
      a.lastServiceDate,
      a.notes,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assets.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const editSelectField = (
    id: keyof Omit<Asset, "id">,
    label: string,
    options: string[],
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Select
        value={editForm[id]}
        onValueChange={(v) => setEditForm((f) => ({ ...f, [id]: v }))}
      >
        <SelectTrigger
          className="bg-input border-border font-mono text-sm h-9"
          data-ocid={`edit.${id}.select`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="font-mono text-sm">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
            Assets by Category
          </p>
          {categoryChart.length === 0 ? (
            <div
              className="h-48 flex items-center justify-center text-muted-foreground font-mono text-sm"
              data-ocid="dashboard.category_chart.empty_state"
            >
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={categoryChart}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.015 240)"
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontFamily: "Geist Mono",
                    fontSize: 11,
                    fill: "oklch(0.55 0.02 240)",
                  }}
                />
                <YAxis
                  tick={{
                    fontFamily: "Geist Mono",
                    fontSize: 11,
                    fill: "oklch(0.55 0.02 240)",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.17 0.01 240)",
                    border: "1px solid oklch(0.25 0.015 240)",
                    fontFamily: "Geist Mono",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.92 0.01 240)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryChart.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
            Assets by Status
          </p>
          {statusChart.length === 0 ? (
            <div
              className="h-48 flex items-center justify-center text-muted-foreground font-mono text-sm"
              data-ocid="dashboard.status_chart.empty_state"
            >
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusChart.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.17 0.01 240)",
                    border: "1px solid oklch(0.25 0.015 240)",
                    fontFamily: "Geist Mono",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "Geist Mono", fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filter by Department"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="bg-input border-border font-mono text-sm h-9 w-52"
          data-ocid="dashboard.department.search_input"
        />
        <Input
          placeholder="Filter by Vendor"
          value={filterVendor}
          onChange={(e) => setFilterVendor(e.target.value)}
          className="bg-input border-border font-mono text-sm h-9 w-52"
          data-ocid="dashboard.vendor.search_input"
        />
        <Button
          variant="outline"
          size="sm"
          className="font-mono gap-2 ml-auto"
          onClick={exportCSV}
          data-ocid="dashboard.export.button"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Inventory ({filtered.length})
          </p>
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16 gap-3"
            data-ocid="dashboard.table.loading_state"
          >
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-mono text-sm text-muted-foreground">
              Loading assets...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="dashboard.table.empty_state"
          >
            <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-mono text-sm text-muted-foreground">
              No assets found
            </p>
          </div>
        ) : (
          <Table data-ocid="dashboard.table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {[
                  "Asset Name",
                  "Category",
                  "Department",
                  "Vendor",
                  "Status",
                  "Purchase Date",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="font-mono text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((asset, i) => (
                <TableRow
                  key={String(asset.id)}
                  className="border-border"
                  data-ocid={`dashboard.asset.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-sm font-medium">
                    {asset.assetName}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {asset.category}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {asset.department}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {asset.vendor}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {asset.purchaseDate}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(asset)}
                        data-ocid={`dashboard.asset.edit_button.${i + 1}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(asset)}
                        data-ocid={`dashboard.asset.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editAsset} onOpenChange={(o) => !o && setEditAsset(null)}>
        <DialogContent className="max-w-2xl" data-ocid="dashboard.edit.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Asset</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {(
              [
                ["assetName", "Asset Name"],
                ["macId", "MAC ID"],
                ["serviceTag", "Service Tag"],
                ["purchaseDate", "Purchase Date"],
                ["lastServiceDate", "Last Service Date"],
              ] as [keyof Omit<Asset, "id">, string][]
            ).map(([id, label]) => (
              <div key={id} className="flex flex-col gap-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {label}
                </Label>
                <Input
                  value={editForm[id]}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, [id]: e.target.value }))
                  }
                  className="bg-input border-border font-mono text-sm h-9"
                  data-ocid={`edit.${id}.input`}
                />
              </div>
            ))}
            {editSelectField("category", "Category", categories)}
            {editSelectField("department", "Department", departments)}
            {editSelectField("vendor", "Vendor", vendors)}
            {editSelectField("status", "Status", statuses)}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Notes
              </Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="bg-input border-border font-mono text-sm resize-none"
                rows={3}
                data-ocid="edit.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditAsset(null)}
              data-ocid="dashboard.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateAsset.isPending}
              data-ocid="dashboard.edit.save_button"
            >
              {updateAsset.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent data-ocid="dashboard.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Asset?</DialogTitle>
          </DialogHeader>
          <p className="text-sm font-mono text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="text-foreground font-semibold">
              &ldquo;{deleteTarget?.assetName}&rdquo;
            </span>
            ? This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="dashboard.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAsset.isPending}
              data-ocid="dashboard.delete.confirm_button"
            >
              {deleteAsset.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
