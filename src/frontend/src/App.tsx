import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ServerCrash,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AdminPage } from "./components/AdminPage";
import { CategoryKPIPage } from "./components/CategoryKPIPage";
import { DashboardPage } from "./components/DashboardPage";
import { EntryPage } from "./components/EntryPage";
import { LandingPage } from "./components/LandingPage";

type AuthState =
  | { role: "none" }
  | { role: "user"; username: string }
  | { role: "admin" };

type Page = "entry" | "dashboard" | "kpi" | "admin";

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ role: "none" });
  const [activePage, setActivePage] = useState<Page>("entry");

  function handleUserLogin(username: string) {
    setAuth({ role: "user", username });
    setActivePage("entry");
  }

  function handleAdminLogin() {
    setAuth({ role: "admin" });
    setActivePage("entry");
  }

  function handleLogout() {
    setAuth({ role: "none" });
    setActivePage("entry");
  }

  if (auth.role === "none") {
    return (
      <>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "font-mono text-sm bg-card border-border",
            },
          }}
        />
        <LandingPage
          onUserLogin={handleUserLogin}
          onAdminLogin={handleAdminLogin}
        />
      </>
    );
  }

  const allNavItems: {
    id: Page;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
  }[] = [
    {
      id: "entry",
      label: "Register",
      icon: <ClipboardList className="h-3.5 w-3.5" />,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
    },
    {
      id: "kpi",
      label: "KPI",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
    },
    {
      id: "admin",
      label: "Admin",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      adminOnly: true,
    },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.adminOnly || auth.role === "admin",
  );

  // If user is on admin page but not admin, redirect to entry
  const currentPage =
    activePage === "admin" && auth.role !== "admin" ? "entry" : activePage;

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded bg-primary/10 border border-primary/30">
              <ServerCrash className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-sm tracking-wide text-foreground">
                IT Asset Registry
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                INVENTORY MANAGEMENT SYSTEM
              </p>
            </div>
            <div className="block sm:hidden">
              <h1 className="font-display font-bold text-sm tracking-wide text-foreground">
                IT Assets
              </h1>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-0.5 bg-background/60 border border-border rounded-lg p-1 overflow-x-auto shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                data-ocid={`nav.${item.id}.tab`}
                onClick={() => setActivePage(item.id)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-xs transition-colors whitespace-nowrap ${
                  currentPage === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {currentPage === item.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-card border border-border rounded-md"
                    transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User info + Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {auth.role === "user" && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30 border border-border">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground max-w-24 truncate">
                  {auth.username}
                </span>
              </div>
            )}
            {auth.role === "admin" && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/25">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-mono text-primary">Admin</span>
              </div>
            )}
            <button
              type="button"
              data-ocid="header.logout.button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent hover:border-border transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">
        {currentPage === "entry" ? (
          <EntryPage onGoToDashboard={() => setActivePage("dashboard")} />
        ) : currentPage === "dashboard" ? (
          <DashboardPage />
        ) : currentPage === "kpi" ? (
          <CategoryKPIPage />
        ) : (
          <AdminPage />
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
