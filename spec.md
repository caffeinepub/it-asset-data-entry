# IT Asset Registry

## Current State
- Multi-page app: Register, Dashboard, KPI, Admin tabs in top nav
- No landing/home page -- app loads directly into the Register form
- Admin page has its own password gate (admin123) but the tab is visible to everyone
- Dashboard has CSV export but no import
- No concept of user sessions or roles

## Requested Changes (Diff)

### Add
- Landing page shown on first visit with two login options: "Admin" and "End User"
- Admin login: password-protected (admin123), grants access to all pages including Admin tab
- End User login: simple entry (username or just a "Continue" button), grants access to Register, Dashboard, KPI -- Admin tab hidden
- Session state stored in React context/state; logout button in header
- Import feature in Dashboard: upload a CSV file to bulk-import assets. The CSV must match the export format. Rows are parsed and added via the existing addAsset backend call. Shows a summary dialog (success/error counts) after import.

### Modify
- App.tsx: add auth state ("none" | "user" | "admin"); show LandingPage when unauthenticated; show/hide Admin nav tab based on role; add logout button in header
- AdminPage.tsx: remove the internal password gate since auth is now handled at the landing page level for admin role
- DashboardPage.tsx: add an Import CSV button next to existing Export CSV button

### Remove
- Internal password prompt inside AdminPage.tsx (replaced by landing page login flow)

## Implementation Plan
1. Create `LandingPage.tsx` with two cards: Admin Login (password field) and End User Login (username + continue)
2. Update `App.tsx` with auth state, route guard for Admin tab, logout in header
3. Update `AdminPage.tsx` to remove its internal password gate
4. Update `DashboardPage.tsx` to add import CSV: file input, parse CSV, call addAsset for each row, show result summary
