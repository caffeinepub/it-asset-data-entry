import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAddOption,
  useGetOptions,
  useRemoveOption,
  useUpdateOption,
} from "@/hooks/useQueries";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FIELD_TYPES = [
  { key: "category", label: "Categories" },
  { key: "department", label: "Departments" },
  { key: "vendor", label: "Vendors" },
  { key: "status", label: "Statuses" },
];

function OptionSection({
  fieldType,
  label,
}: {
  fieldType: string;
  label: string;
}) {
  const { data: options = [], isLoading } = useGetOptions(fieldType);
  const addOption = useAddOption();
  const removeOption = useRemoveOption();
  const updateOption = useUpdateOption();

  const [newValue, setNewValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  async function handleAdd() {
    const val = newValue.trim();
    if (!val) return;
    try {
      await addOption.mutateAsync({ fieldType, value: val });
      toast.success(`Added "${val}" to ${label}`);
      setNewValue("");
    } catch (err) {
      toast.error(
        `Failed to add: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function handleDelete(value: string) {
    try {
      await removeOption.mutateAsync({ fieldType, value });
      toast.success(`Removed "${value}"`);
    } catch (err) {
      toast.error(
        `Failed to remove: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function handleSaveEdit(oldValue: string) {
    const val = editValue.trim();
    if (!val || val === oldValue) {
      setEditingIndex(null);
      return;
    }
    try {
      await updateOption.mutateAsync({ fieldType, oldValue, newValue: val });
      toast.success(`Updated to "${val}"`);
      setEditingIndex(null);
    } catch (err) {
      toast.error(
        `Failed to update: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  function startEdit(idx: number, value: string) {
    setEditingIndex(idx);
    setEditValue(value);
  }

  return (
    <Card className="border-border bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          {label}
          <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-mono">
            {options.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new */}
        <div className="flex gap-2">
          <Input
            data-ocid={`admin.${fieldType}.input`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`Add new ${label.toLowerCase().replace(/s$/, "")}...`}
            className="bg-muted/30 border-border h-8 text-sm flex-1"
          />
          <Button
            type="button"
            size="sm"
            data-ocid={`admin.${fieldType}.primary_button`}
            onClick={handleAdd}
            disabled={addOption.isPending || !newValue.trim()}
            className="h-8 px-3"
          >
            {addOption.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div
            data-ocid={`admin.${fieldType}.loading_state`}
            className="py-4 flex items-center justify-center"
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : options.length === 0 ? (
          <div
            data-ocid={`admin.${fieldType}.empty_state`}
            className="py-3 text-center text-xs font-mono text-muted-foreground"
          >
            No {label.toLowerCase()} yet
          </div>
        ) : (
          <ul className="space-y-1.5">
            {options.map((opt, idx) => (
              <li
                key={opt}
                data-ocid={`admin.${fieldType}.item.${idx + 1}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/20 border border-border/50"
              >
                {editingIndex === idx ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(opt);
                        if (e.key === "Escape") setEditingIndex(null);
                      }}
                      className="h-7 text-sm flex-1 bg-background border-border"
                      autoFocus
                    />
                    <button
                      type="button"
                      data-ocid={`admin.${fieldType}.save_button.${idx + 1}`}
                      onClick={() => handleSaveEdit(opt)}
                      className="text-primary hover:text-primary/80 p-1 rounded"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.${fieldType}.cancel_button.${idx + 1}`}
                      onClick={() => setEditingIndex(null)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-mono">{opt}</span>
                    <button
                      type="button"
                      data-ocid={`admin.${fieldType}.edit_button.${idx + 1}`}
                      onClick={() => startEdit(idx, opt)}
                      className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.${fieldType}.delete_button.${idx + 1}`}
                      onClick={() => handleDelete(opt)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Admin Settings</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {FIELD_TYPES.map(({ key, label }) => (
          <OptionSection key={key} fieldType={key} label={label} />
        ))}
      </div>
    </main>
  );
}
