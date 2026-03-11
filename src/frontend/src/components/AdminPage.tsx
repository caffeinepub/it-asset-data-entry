import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddOption,
  useGetOptions,
  useRemoveOption,
  useUpdateOption,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "admin123";

type FieldType = "category" | "department" | "vendor" | "status";

const SECTIONS: { type: FieldType; label: string }[] = [
  { type: "category", label: "Categories" },
  { type: "department", label: "Departments" },
  { type: "vendor", label: "Vendors" },
  { type: "status", label: "Statuses" },
];

function OptionsSection({
  fieldType,
  label,
}: { fieldType: FieldType; label: string }) {
  const { data: options = [], isLoading } = useGetOptions(fieldType);
  const addOption = useAddOption();
  const removeOption = useRemoveOption();
  const updateOption = useUpdateOption();

  const [newValue, setNewValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    try {
      await addOption.mutateAsync({ fieldType, value: trimmed });
      setNewValue("");
      toast.success(`"${trimmed}" added to ${label}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add failed.");
    }
  };

  const handleRemove = async (value: string) => {
    try {
      await removeOption.mutateAsync({ fieldType, value });
      toast.success(`"${value}" removed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed.");
    }
  };

  const startEdit = (index: number, current: string) => {
    setEditingIndex(index);
    setEditValue(current);
  };

  const handleRename = async (oldValue: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldValue) {
      setEditingIndex(null);
      return;
    }
    try {
      await updateOption.mutateAsync({
        fieldType,
        oldValue,
        newValue: trimmed,
      });
      setEditingIndex(null);
      toast.success(`Renamed to "${trimmed}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed.");
    }
  };

  return (
    <div
      className="rounded-xl border border-border bg-card p-5 space-y-4"
      data-ocid={`admin.${fieldType}.panel`}
    >
      {/* Section header with count badge */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-primary" />
        <h3 className="font-display font-semibold text-base text-foreground">
          {label}
        </h3>
        <Badge variant="secondary" className="font-mono text-xs ml-1">
          {options.length}
        </Badge>
      </div>

      {/* Add new — always at the top */}
      <div className="flex gap-2">
        <Input
          placeholder={`New ${label.slice(0, -1).toLowerCase()}...`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="bg-input border-border font-mono text-sm h-9 flex-1"
          data-ocid={`admin.${fieldType}.input`}
        />
        <Button
          size="sm"
          className="gap-1.5 font-mono"
          onClick={handleAdd}
          disabled={addOption.isPending || !newValue.trim()}
          data-ocid={`admin.${fieldType}.primary_button`}
        >
          {addOption.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add
        </Button>
      </div>

      {/* Options list */}
      {isLoading ? (
        <div
          className="flex items-center gap-2 py-4"
          data-ocid={`admin.${fieldType}.loading_state`}
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="font-mono text-sm text-muted-foreground">
            Loading...
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {options.length === 0 && (
            <p
              className="font-mono text-sm text-muted-foreground py-2 text-center border border-dashed border-border rounded-lg py-4"
              data-ocid={`admin.${fieldType}.empty_state`}
            >
              No options yet. Add one above.
            </p>
          )}
          {options.map((opt, i) => (
            <div
              key={opt}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
              data-ocid={`admin.${fieldType}.item.${i + 1}`}
            >
              {/* Index number */}
              <span className="font-mono text-xs text-muted-foreground w-5 shrink-0 text-right">
                {i + 1}.
              </span>

              {editingIndex === i ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(opt);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    className="h-7 text-sm font-mono bg-input border-border flex-1"
                    autoFocus
                    data-ocid={`admin.${fieldType}.edit.input`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-primary shrink-0"
                    onClick={() => handleRename(opt)}
                    data-ocid={`admin.${fieldType}.save_button.${i + 1}`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setEditingIndex(null)}
                    data-ocid={`admin.${fieldType}.cancel_button.${i + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-mono text-sm text-foreground flex-1">
                    {opt}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(i, opt)}
                    data-ocid={`admin.${fieldType}.edit_button.${i + 1}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(opt)}
                    disabled={removeOption.isPending}
                    data-ocid={`admin.${fieldType}.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (!unlocked) {
    return (
      <main className="max-w-md mx-auto px-4 py-24">
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-xl text-foreground">
              Admin Settings
            </h2>
            <p className="text-sm font-mono text-muted-foreground text-center">
              Enter the admin password to manage categories and dropdown
              options.
            </p>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="admin-password"
              className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
            >
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className={`bg-input border-border font-mono text-sm h-10 ${error ? "border-destructive" : ""}`}
              placeholder="Enter password..."
              data-ocid="admin.password.input"
            />
            {error && (
              <p
                className="text-xs font-mono text-destructive"
                data-ocid="admin.password.error_state"
              >
                Incorrect password. Try again.
              </p>
            )}
          </div>

          <Button
            className="w-full font-mono gap-2"
            onClick={handleUnlock}
            data-ocid="admin.unlock.primary_button"
          >
            <Shield className="h-4 w-4" /> Unlock Settings
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl text-foreground tracking-wide">
            Admin Settings
          </h2>
          <p className="text-sm font-mono text-muted-foreground mt-0.5">
            Manage dropdown options for all asset fields.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-mono gap-2"
          onClick={() => setUnlocked(false)}
          data-ocid="admin.lock.button"
        >
          <Lock className="h-4 w-4" /> Lock
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <OptionsSection key={s.type} fieldType={s.type} label={s.label} />
        ))}
      </div>
    </main>
  );
}
