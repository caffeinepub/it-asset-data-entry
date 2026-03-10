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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Category, Department, type Status } from "../backend";
import type { ITAsset } from "../backend";
import { useUpdateAsset } from "../hooks/useQueries";
import {
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  VENDOR_OPTIONS,
} from "./shared";

type EditForm = {
  name: string;
  category: Category | "";
  serialNumber: string;
  macId: string;
  serviceTag: string;
  status: Status | "";
  assignedDepartment: Department | "";
  location: string;
  lastServiceDate: string;
  purchaseDate: string;
  purchaseVendor: string;
  notes: string;
};

export function EditAssetDialog({
  asset,
  open,
  onClose,
}: {
  asset: ITAsset | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateAsset = useUpdateAsset();
  const [form, setForm] = useState<EditForm>({
    name: "",
    category: "",
    serialNumber: "",
    macId: "",
    serviceTag: "",
    status: "",
    assignedDepartment: "",
    location: "",
    lastServiceDate: "",
    purchaseDate: "",
    purchaseVendor: "",
    notes: "",
  });

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber,
        macId: asset.macId,
        serviceTag: asset.serviceTag,
        status: asset.status,
        assignedDepartment: asset.assignedDepartment,
        location: asset.location,
        lastServiceDate: asset.lastServiceDate,
        purchaseDate: asset.purchaseDate,
        purchaseVendor: asset.purchaseVendor,
        notes: asset.notes,
      });
    }
  }, [asset]);

  const handleSave = async () => {
    if (!asset || !form.name || !form.category || !form.status) {
      toast.error("Name, Category, and Status are required.");
      return;
    }
    try {
      await updateAsset.mutateAsync({
        id: asset.id,
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
      toast.success("Asset updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update asset.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="edit.asset.dialog"
        className="bg-card border-border max-w-2xl p-0 gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-display font-semibold text-foreground flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Asset
            {asset && (
              <span className="font-mono text-sm text-muted-foreground font-normal">
                — {asset.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Asset Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  data-ocid="edit.asset.input"
                  placeholder="e.g. ThinkPad X1 Carbon"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border"
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
                    data-ocid="edit.asset.select"
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
                  Serial Number
                </Label>
                <Input
                  placeholder="e.g. SN-2024-001"
                  value={form.serialNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, serialNumber: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  MAC ID
                </Label>
                <Input
                  placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  value={form.macId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, macId: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Service Tag
                </Label>
                <Input
                  placeholder="e.g. ST-ABC123"
                  value={form.serviceTag}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, serviceTag: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border"
                />
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
                    data-ocid="edit.asset.status.select"
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
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Department
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
                  <SelectTrigger className="font-mono text-sm bg-background border-border">
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
                  <SelectTrigger className="font-mono text-sm bg-background border-border">
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
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Last Service Date
                </Label>
                <Input
                  type="date"
                  value={form.lastServiceDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastServiceDate: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Purchase Date
                </Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, purchaseDate: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Location
                </Label>
                <Input
                  placeholder="e.g. Office Floor 3"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="font-mono text-sm bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Notes
                </Label>
                <Textarea
                  placeholder="Warranty info, condition, etc."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                  className="font-mono text-sm bg-background border-border resize-none"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button
            variant="ghost"
            data-ocid="edit.asset.cancel_button"
            onClick={onClose}
            className="font-mono text-sm"
          >
            Cancel
          </Button>
          <Button
            data-ocid="edit.asset.save_button"
            onClick={handleSave}
            disabled={updateAsset.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm gap-2"
          >
            {updateAsset.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
