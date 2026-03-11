import type { Asset } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  useAddAsset,
  useDeleteAsset,
  useGetAllAssets,
  useGetOptions,
  useUpdateAsset,
} from "@/hooks/useQueries";
import { Download, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
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

const CHART_COLORS = [
  "oklch(0.75 0.14 195)",
  "oklch(0.72 0.18 145)",
  "oklch(0.78 0.16 70)",
  "oklch(0.65 0.2 25)",
  "oklch(0.65 0.15 300)",
  "oklch(0.7 0.18 240)",
  "oklch(0.68 0.16 160)",
];

function getColor(idx: number) {
  return CHART_COLORS[idx % CHART_COLORS.length];
}

function exportCSV(assets: Asset[]) {
  const headers = [
    "id",
    "assetName",
    "macId",
    "serviceTag",
    "category",
    "department",
    "vendor",
    "status",
    "purchaseDate",
    "lastServiceDate",
    "notes",
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
    a.notes.replace(/\n/g, " "),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `assets_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type EditForm = Omit<Asset, "id"> & { id: bigint };

export function DashboardPage() {
  const { data: assets = [], isLoading } = useGetAllAssets();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const addAsset = useAddAsset();
  const categories = useGetOptions("category");
  const departments = useGetOptions("department");
  const vendors = useGetOptions("vendor");
  const statuses = useGetOptions("status");

  const [deptFilter, setDeptFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [editAsset, setEditAsset] = useState<EditForm | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    const deptMatch =
      !deptFilter ||
      a.department.toLowerCase().includes(deptFilter.toLowerCase());
    const vendorMatch =
      !vendorFilter ||
      a.vendor.toLowerCase().includes(vendorFilter.toLowerCase());
    return deptMatch && vendorMatch;
  });

  // Chart data
  const categoryMap: Record<string, number> = {};
  for (const a of assets) {
    const key = a.category || "Uncategorized";
    categoryMap[key] = (categoryMap[key] || 0) + 1;
  }
  const barData = Object.entries(categoryMap).map(([name, count], i) => ({
    name,
    count,
    fill: getColor(i),
  }));

  const statusMap: Record<string, number> = {};
  for (const a of assets) {
    const key = a.status || "Unknown";
    statusMap[key] = (statusMap[key] || 0) + 1;
  }
  const pieData = Object.entries(statusMap).map(([name, value], i) => ({
    name,
    value,
    fill: getColor(i),
  }));

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editAsset) return;
    try {
      await updateAsset.mutateAsync(editAsset);
      toast.success("Asset updated");
      setEditAsset(null);
    } catch (err) {
      toast.error(
        `Update failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteAsset.mutateAsync(deleteId);
      toast.success("Asset deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(
        `Delete failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  function openEdit(asset: Asset) {
    setEditAsset({ ...asset });
  }

  function setEditField(key: keyof EditForm, value: string) {
    setEditAsset((prev) => (prev ? { ...prev, [key]: value } : null));
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        toast.error("CSV file is empty or has no data rows.");
        setIsImporting(false);
        return;
      }

      // Skip header row (index 0), process data rows
      const dataRows = lines.slice(1);

      for (const line of dataRows) {
        try {
          // Parse CSV line (handle quoted fields)
          const cols = parseCSVLine(line);
          // Expected: id, assetName, macId, serviceTag, category, department, vendor, status, purchaseDate, lastServiceDate, notes
          if (cols.length < 10) {
            failCount++;
            continue;
          }
          // Skip col[0] (id) — backend assigns new IDs
          const [
            ,
            assetName,
            macId,
            serviceTag,
            category,
            department,
            vendor,
            status,
            purchaseDate,
            lastServiceDate,
            notes = "",
          ] = cols;

          await addAsset.mutateAsync({
            assetName: assetName ?? "",
            macId: macId ?? "",
            serviceTag: serviceTag ?? "",
            category: category ?? "",
            department: department ?? "",
            vendor: vendor ?? "",
            status: status ?? "",
            purchaseDate: purchaseDate ?? "",
            lastServiceDate: lastServiceDate ?? "",
            notes: notes ?? "",
          });
          successCount++;
        } catch {
          failCount++;
        }
      }

      if (failCount === 0) {
        toast.success(
          `Imported ${successCount} asset${successCount !== 1 ? "s" : ""} successfully.`,
        );
      } else {
        toast.success(
          `Imported ${successCount} asset${successCount !== 1 ? "s" : ""} successfully, ${failCount} failed.`,
        );
      }
    } catch (err) {
      toast.error(
        `Import failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsImporting(false);
    }
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  const tooltipStyle = {
    background: "oklch(0.17 0.01 240)",
    border: "1px solid oklch(0.25 0.015 240)",
    borderRadius: 6,
    fontSize: 12,
    color: "oklch(0.92 0.01 240)",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Charts */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">
                Assets by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 8, left: -10, bottom: 4 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "oklch(0.55 0.02 240)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.55 0.02 240)" }}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">
                Assets by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconSize={10}
                    formatter={(value) => (
                      <span
                        style={{ fontSize: 12, color: "oklch(0.75 0.01 240)" }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters + Export + Import */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          data-ocid="dashboard.department.search_input"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          placeholder="Filter by department..."
          className="bg-muted/30 border-border h-9 text-sm sm:w-52"
        />
        <Input
          data-ocid="dashboard.vendor.search_input"
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          placeholder="Filter by vendor..."
          className="bg-muted/30 border-border h-9 text-sm sm:w-52"
        />
        <div className="flex items-center gap-2 ml-auto">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button
            variant="outline"
            size="sm"
            data-ocid="dashboard.import.upload_button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="font-mono text-xs"
          >
            {isImporting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isImporting ? "Importing..." : "Import CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-ocid="dashboard.export.secondary_button"
            onClick={() => exportCSV(filtered)}
            className="font-mono text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card
        className="border-border bg-card/60"
        data-ocid="dashboard.assets.table"
      >
        <CardContent className="p-0">
          {isLoading ? (
            <div
              data-ocid="dashboard.assets.loading_state"
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="dashboard.assets.empty_state"
              className="flex flex-col items-center justify-center py-16 gap-2"
            >
              <p className="text-sm font-mono text-muted-foreground">
                No assets found.
              </p>
              <p className="text-xs text-muted-foreground">
                Register assets using the Register tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-xs font-mono text-muted-foreground">
                      Asset Name
                    </TableHead>
                    <TableHead className="text-xs font-mono text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-xs font-mono text-muted-foreground">
                      Department
                    </TableHead>
                    <TableHead className="text-xs font-mono text-muted-foreground">
                      Vendor
                    </TableHead>
                    <TableHead className="text-xs font-mono text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-mono text-muted-foreground">
                      Purchase Date
                    </TableHead>
                    <TableHead className="text-xs font-mono text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((asset, idx) => (
                    <TableRow
                      key={String(asset.id)}
                      data-ocid={`dashboard.assets.row.${idx + 1}`}
                      className="border-border hover:bg-muted/20"
                    >
                      <TableCell className="font-medium text-sm">
                        {asset.assetName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asset.category}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asset.department}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asset.vendor}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full bg-muted/40 text-xs font-mono">
                          {asset.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asset.purchaseDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-ocid={`dashboard.assets.edit_button.${idx + 1}`}
                            onClick={() => openEdit(asset)}
                            className="h-7 w-7 p-0 hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-ocid={`dashboard.assets.delete_button.${idx + 1}`}
                            onClick={() => setDeleteId(asset.id)}
                            className="h-7 w-7 p-0 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editAsset} onOpenChange={(o) => !o && setEditAsset(null)}>
        <DialogContent
          data-ocid="dashboard.edit.dialog"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit Asset</DialogTitle>
          </DialogHeader>
          {editAsset && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">
                    Asset Name
                  </Label>
                  <Input
                    data-ocid="dashboard.edit.assetname.input"
                    value={editAsset.assetName}
                    onChange={(e) => setEditField("assetName", e.target.value)}
                    className="bg-muted/30 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">
                    MAC ID
                  </Label>
                  <Input
                    data-ocid="dashboard.edit.macid.input"
                    value={editAsset.macId}
                    onChange={(e) => setEditField("macId", e.target.value)}
                    className="bg-muted/30 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">
                    Service Tag
                  </Label>
                  <Input
                    data-ocid="dashboard.edit.servicetag.input"
                    value={editAsset.serviceTag}
                    onChange={(e) => setEditField("serviceTag", e.target.value)}
                    className="bg-muted/30 h-9 text-sm"
                  />
                </div>
                {(
                  [
                    ["category", "Category", categories.data],
                    ["department", "Department", departments.data],
                    ["vendor", "Vendor", vendors.data],
                    ["status", "Status", statuses.data],
                  ] as [keyof EditForm, string, string[] | undefined][]
                ).map(([field, lbl, opts]) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="text-xs font-mono text-muted-foreground uppercase">
                      {lbl}
                    </Label>
                    <Select
                      value={(editAsset[field] as string) || undefined}
                      onValueChange={(val) => setEditField(field, val)}
                    >
                      <SelectTrigger
                        data-ocid={`dashboard.edit.${field}.select`}
                        className="bg-muted/30 h-9 text-sm"
                      >
                        <SelectValue placeholder={`Select ${lbl}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(opts ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">
                    Purchase Date
                  </Label>
                  <Input
                    data-ocid="dashboard.edit.purchasedate.input"
                    type="date"
                    value={editAsset.purchaseDate}
                    onChange={(e) =>
                      setEditField("purchaseDate", e.target.value)
                    }
                    className="bg-muted/30 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">
                    Last Service Date
                  </Label>
                  <Input
                    data-ocid="dashboard.edit.lastservicedate.input"
                    type="date"
                    value={editAsset.lastServiceDate}
                    onChange={(e) =>
                      setEditField("lastServiceDate", e.target.value)
                    }
                    className="bg-muted/30 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase">
                  Notes
                </Label>
                <Textarea
                  data-ocid="dashboard.edit.notes.textarea"
                  value={editAsset.notes}
                  onChange={(e) => setEditField("notes", e.target.value)}
                  className="bg-muted/30 text-sm resize-none"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="dashboard.edit.cancel_button"
                  onClick={() => setEditAsset(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="dashboard.edit.save_button"
                  disabled={updateAsset.isPending}
                >
                  {updateAsset.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <DialogContent data-ocid="dashboard.delete.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Asset?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="dashboard.delete.cancel_button"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="dashboard.delete.confirm_button"
              onClick={handleDelete}
              disabled={deleteAsset.isPending}
            >
              {deleteAsset.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
