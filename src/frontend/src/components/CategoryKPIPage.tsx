import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useGetAllAssets, useGetOptions } from "../hooks/useQueries";

const COLORS = [
  "oklch(0.75 0.14 195)",
  "oklch(0.72 0.18 145)",
  "oklch(0.78 0.16 70)",
  "oklch(0.60 0.22 25)",
  "oklch(0.65 0.15 300)",
  "oklch(0.70 0.14 250)",
];

export function CategoryKPIPage() {
  const { data: assets = [], isLoading: assetsLoading } = useGetAllAssets();
  const { data: categories = [], isLoading: catsLoading } =
    useGetOptions("category");

  const kpiData = useMemo(() => {
    return categories.map((cat, i) => ({
      name: cat,
      count: assets.filter((a) => a.category === cat).length,
      color: COLORS[i % COLORS.length],
    }));
  }, [assets, categories]);

  const total = assets.length;

  const isLoading = assetsLoading || catsLoading;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="mb-6">
        <h2 className="font-display font-semibold text-xl text-foreground tracking-wide">
          Category KPI
        </h2>
        <p className="text-sm font-mono text-muted-foreground mt-1">
          Asset distribution by category
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-24"
          data-ocid="kpi.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, i) => (
              <motion.div
                key={kpi.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2"
                data-ocid={`kpi.category.card.${i + 1}`}
              >
                <div
                  className="h-1.5 rounded-full w-10"
                  style={{ background: kpi.color }}
                />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider truncate">
                  {kpi.name}
                </p>
                <p className="font-display text-3xl font-bold text-foreground">
                  {kpi.count}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {total > 0
                    ? `${((kpi.count / total) * 100).toFixed(1)}%`
                    : "0%"}{" "}
                  of total
                </p>
              </motion.div>
            ))}

            {/* Total card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: kpiData.length * 0.07, duration: 0.35 }}
              className="rounded-xl border border-primary/30 bg-primary/10 p-5 flex flex-col gap-2"
              data-ocid="kpi.total.card"
            >
              <div className="h-1.5 rounded-full w-10 bg-primary" />
              <p className="font-mono text-xs text-primary/70 uppercase tracking-wider">
                Total Assets
              </p>
              <p className="font-display text-3xl font-bold text-primary">
                {total}
              </p>
              <p className="font-mono text-xs text-primary/60">
                All categories
              </p>
            </motion.div>
          </div>

          {/* Distribution Bar */}
          {total > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
                Distribution
              </p>
              <div
                className="flex h-8 rounded-lg overflow-hidden gap-0.5"
                data-ocid="kpi.distribution.panel"
              >
                {kpiData
                  .filter((k) => k.count > 0)
                  .map((kpi) => (
                    <div
                      key={kpi.name}
                      className="flex items-center justify-center transition-all duration-500 overflow-hidden"
                      style={{
                        width: `${(kpi.count / total) * 100}%`,
                        background: kpi.color,
                        minWidth: kpi.count > 0 ? "2px" : "0",
                      }}
                      title={`${kpi.name}: ${kpi.count} (${((kpi.count / total) * 100).toFixed(1)}%)`}
                    >
                      {kpi.count / total > 0.1 && (
                        <span className="text-xs font-mono text-background font-semibold truncate px-1">
                          {kpi.name}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {kpiData
                  .filter((k) => k.count > 0)
                  .map((kpi) => (
                    <div key={kpi.name} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: kpi.color }}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {kpi.name} ({kpi.count})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {kpiData.length === 0 && (
            <div
              className="rounded-xl border border-border bg-card p-10 text-center"
              data-ocid="kpi.categories.empty_state"
            >
              <p className="font-mono text-sm text-muted-foreground">
                No categories configured. Add categories in Admin Settings.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
