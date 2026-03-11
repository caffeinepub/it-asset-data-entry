import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
  Server,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ADMIN_PASSWORD = "admin123";

interface LandingPageProps {
  onUserLogin: (username: string) => void;
  onAdminLogin: () => void;
}

export function LandingPage({ onUserLogin, onAdminLogin }: LandingPageProps) {
  const [username, setUsername] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");

  function handleUserLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    onUserLogin(username.trim());
  }

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminPass === ADMIN_PASSWORD) {
      setAdminError("");
      onAdminLogin();
    } else {
      setAdminError("Incorrect password. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, oklch(0.6 0.02 240) 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, oklch(0.6 0.02 240) 32px)",
            }}
          />
        </div>

        {/* Logo + tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 shadow-lg">
              <Server className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight">
            IT Asset Registry
          </h1>
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase mb-2">
            Inventory Management System
          </p>
          <p className="text-muted-foreground text-base max-w-md mx-auto mt-4">
            Track, manage, and audit your organization's IT assets with full
            visibility across departments.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              {
                icon: <Database className="h-3 w-3" />,
                label: "Asset Tracking",
              },
              {
                icon: <Shield className="h-3 w-3" />,
                label: "Role-Based Access",
              },
              { icon: <Server className="h-3 w-3" />, label: "Category KPIs" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border text-xs font-mono text-muted-foreground"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Login cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
          {/* End User card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Card className="border-border bg-card/70 backdrop-blur-sm h-full shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-base">
                      End User
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      View &amp; register assets
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Your Name
                    </Label>
                    <Input
                      data-ocid="landing.user.input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your name..."
                      className="bg-muted/30 border-border h-10"
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="landing.user.primary_button"
                    disabled={!username.trim()}
                    className="w-full font-mono"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <Card className="border-border bg-card/70 backdrop-blur-sm h-full shadow-xl border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/25 flex items-center justify-center">
                    <Lock className="h-4.5 w-4.5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-base">
                      Administrator
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Full system access
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Admin Password
                    </Label>
                    <Input
                      data-ocid="landing.admin.input"
                      type="password"
                      value={adminPass}
                      onChange={(e) => {
                        setAdminPass(e.target.value);
                        setAdminError("");
                      }}
                      placeholder="Enter admin password..."
                      className="bg-muted/30 border-border h-10"
                    />
                    {adminError && (
                      <p
                        data-ocid="landing.admin.error_state"
                        className="flex items-center gap-1.5 text-xs text-destructive font-mono"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {adminError}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    data-ocid="landing.admin.primary_button"
                    variant="secondary"
                    disabled={!adminPass}
                    className="w-full font-mono"
                  >
                    Login as Admin
                    <Shield className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-border py-5">
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
