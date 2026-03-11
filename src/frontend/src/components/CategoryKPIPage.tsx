import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllAssets } from "@/hooks/useQueries";
import { Loader2, Package } from "lucide-react";

const COLORS = [
  "oklch(0.75 0.14 195)",
  "oklch(0.72 0.18 145)",
  "oklch(0.78 0.16 70)",
  "oklch(0.65 0.2 25)",
  "oklch(0.65 0.15 300)",
  "oklch(0.7 0.18 240)",
  "oklch(0.68 0.16 160)",
  "oklch(0.6 0.12 40)",
];

export function CategoryKPIPage() {
  const { data: assets = [], isLoading } = useGetAllAssets();

  if (isLoading) {
    return (
      <div
        data-ocid="kpi.loading_state"
        className="flex items-center justify-center py-32"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const total = assets.length;

  const categoryMap: Record<string, number> = {};
  for (const a of assets) {
    const cat = a.category || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const entries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Total card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card/60 sm:col-span-1">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/15">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Total Assets
                </p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Distribution by Category
          </h3>
          <div
            className="flex rounded-full overflow-hidden h-4"
            data-ocid="kpi.distribution.section"
          >
            {entries.map(([cat, count], idx) => (
              <div
                key={cat}
                style={{
                  width: `${(count / total) * 100}%`,
                  background: COLORS[idx % COLORS.length],
                }}
                title={`${cat}: ${count} (${((count / total) * 100).toFixed(1)}%)`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {entries.map(([cat], idx) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI cards grid */}
      {entries.length === 0 ? (
        <div
          data-ocid="kpi.categories.empty_state"
          className="flex flex-col items-center justify-center py-16 gap-2"
        >
          <Package className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-mono text-muted-foreground">
            No assets registered yet.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="kpi.categories.section"
        >
          {entries.map(([cat, count], idx) => (
            <Card
              key={cat}
              data-ocid={`kpi.categories.card.${idx + 1}`}
              className="border-border bg-card/60 hover:bg-card/80 transition-colors"
            >
              <CardHeader className="pb-1 pt-4 px-4">
                <div
                  className="w-1 h-6 rounded-full mb-2"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider truncate">
                  {cat}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-3xl font-display font-bold">{count}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {((count / total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
