import { Skeleton } from "@/components/ui/skeleton";
import { ServerCrash } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Category, Status } from "../backend";
import { useGetAllAssets } from "../hooks/useQueries";
import { CATEGORY_OPTIONS, getCategoryIcon } from "./shared";

const STATUS_COLORS: Record<Status, string> = {
  [Status.Active]:
    "text-[oklch(0.72_0.18_145)] bg-[oklch(0.72_0.18_145/0.12)] border-[oklch(0.72_0.18_145/0.3)]",
  [Status.Inactive]:
    "text-[oklch(0.65_0.02_240)] bg-[oklch(0.55_0.02_240/0.12)] border-[oklch(0.55_0.02_240/0.3)]",
  [Status.InRepair]:
    "text-[oklch(0.78_0.16_70)] bg-[oklch(0.78_0.16_70/0.12)] border-[oklch(0.78_0.16_70/0.3)]",
  [Status.Retired]:
    "text-[oklch(0.6_0.22_25)] bg-[oklch(0.6_0.22_25/0.12)] border-[oklch(0.6_0.22_25/0.3)]",
};

const CATEGORY_ACCENT_COLORS: Record<string, string> = {
  [Category.Computer]: "oklch(0.65_0.18_250)",
  [Category.Monitor]: "oklch(0.65_0.15_210)",
  [Category.Printer]: "oklch(0.65_0.14_160)",
  [Category.NetworkDevice]: "oklch(0.65_0.18_290)",
  [Category.Phone]: "oklch(0.72_0.18_145)",
  [Category.Peripheral]: "oklch(0.78_0.16_70)",
  [Category.Software]: "oklch(0.65_0.2_310)",
  [Category.Other]: "oklch(0.6_0.05_240)",
};

export function CategoryKPIPage() {
  const { data: assets = [], isLoading } = useGetAllAssets();

  const categoryStats = useMemo(() => {
    return CATEGORY_OPTIONS.map((cat) => {
      const catAssets = assets.filter((a) => a.category === cat.value);
      const total = catAssets.length;
      const active = catAssets.filter((a) => a.status === Status.Active).length;
      const inactive = catAssets.filter(
        (a) => a.status === Status.Inactive,
      ).length;
      const inRepair = catAssets.filter(
        (a) => a.status === Status.InRepair,
      ).length;
      const retired = catAssets.filter(
        (a) => a.status === Status.Retired,
      ).length;
      const pct =
        assets.length > 0 ? Math.round((total / assets.length) * 100) : 0;
      return { ...cat, total, active, inactive, inRepair, retired, pct };
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [assets]);

  const allZero = !isLoading && categoryStats.length === 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        data-ocid="kpi.page"
      >
        <h2 className="font-display font-bold text-xl text-foreground tracking-wide">
          Category KPI
        </h2>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Key performance indicators broken down by asset category
        </p>
      </motion.div>

      {/* Summary bar */}
      {!isLoading && assets.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          data-ocid="kpi.summary.section"
        >
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Asset distribution by category
            </p>
            <div className="flex rounded-full overflow-hidden h-3 w-full gap-px">
              {categoryStats.map((cat) => (
                <div
                  key={cat.value}
                  style={{
                    width: `${cat.pct}%`,
                    backgroundColor:
                      CATEGORY_ACCENT_COLORS[cat.value] ??
                      "oklch(0.6_0.05_240)",
                  }}
                  title={`${cat.label}: ${cat.pct}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {categoryStats.map((cat) => (
                <div key={cat.value} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor:
                        CATEGORY_ACCENT_COLORS[cat.value] ??
                        "oklch(0.6_0.05_240)",
                    }}
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {cat.label}{" "}
                    <span className="text-foreground">{cat.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* KPI Cards */}
      <section data-ocid="kpi.cards.section">
        {isLoading ? (
          <div
            data-ocid="kpi.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-48 w-full bg-muted/50 rounded-xl"
              />
            ))}
          </div>
        ) : allZero ? (
          <motion.div
            data-ocid="kpi.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-xl bg-muted/30 border border-border flex items-center justify-center mb-4">
              <ServerCrash className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-display font-medium text-foreground mb-1">
              No assets yet
            </p>
            <p className="text-sm font-mono text-muted-foreground">
              Register assets to see KPI data by category.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryStats.map((cat, idx) => {
              const accent =
                CATEGORY_ACCENT_COLORS[cat.value] ?? "oklch(0.6_0.05_240)";
              return (
                <motion.div
                  key={cat.value}
                  data-ocid={`kpi.category.card.${idx + 1}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="px-5 pt-5 pb-4 border-b border-border"
                    style={{ borderTop: `3px solid ${accent}` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: accent }}>{cat.icon}</span>
                      <h3 className="font-display font-semibold text-sm text-foreground">
                        {cat.label}
                      </h3>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="font-display font-bold text-3xl text-foreground">
                        {cat.total}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground mb-1">
                        assets ({cat.pct}%)
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cat.pct}%`,
                          backgroundColor: accent,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      {
                        label: "Active",
                        value: cat.active,
                        status: Status.Active,
                      },
                      {
                        label: "Inactive",
                        value: cat.inactive,
                        status: Status.Inactive,
                      },
                      {
                        label: "In Repair",
                        value: cat.inRepair,
                        status: Status.InRepair,
                      },
                      {
                        label: "Retired",
                        value: cat.retired,
                        status: Status.Retired,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between"
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {s.label}
                        </span>
                        <span
                          className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded border ${STATUS_COLORS[s.status]}`}
                        >
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
