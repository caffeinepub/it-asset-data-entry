import { Toaster } from "@/components/ui/sonner";
import { ClipboardList, LayoutDashboard, ServerCrash } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { DashboardPage } from "./components/DashboardPage";
import { EntryPage } from "./components/EntryPage";

type Page = "entry" | "dashboard";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("entry");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "font-mono text-sm bg-card border-border",
          },
        }}
      />

      {/* Header / Nav */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 bg-background/60 border border-border rounded-lg p-1">
            <button
              type="button"
              data-ocid="nav.entry.tab"
              onClick={() => setActivePage("entry")}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                activePage === "entry"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activePage === "entry" && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-card border border-border rounded-md"
                  transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
                />
              )}
              <ClipboardList className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10 hidden sm:inline">
                Register Asset
              </span>
            </button>

            <button
              type="button"
              data-ocid="nav.dashboard.tab"
              onClick={() => setActivePage("dashboard")}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                activePage === "dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activePage === "dashboard" && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-card border border-border rounded-md"
                  transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
                />
              )}
              <LayoutDashboard className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10 hidden sm:inline">
                Dashboard & Inventory
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">
        {activePage === "entry" ? (
          <EntryPage onGoToDashboard={() => setActivePage("dashboard")} />
        ) : (
          <DashboardPage />
        )}
      </div>

      <footer className="border-t border-border py-5 mt-auto">
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
