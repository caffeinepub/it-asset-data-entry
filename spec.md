# IT Asset Data Entry

## Current State
Single-page React app with all functionality in App.tsx. Backend supports full CRUD on ITAsset records.

## Requested Changes (Diff)

### Add
- Two-page navigation: "Register Asset" page and "Inventory & Dashboard" page
- Top navigation bar with tabs to switch between pages
- Dashboard page: summary stat cards (total, by department, by status), inventory table with search/filter by department and vendor, export CSV, edit and delete
- Entry page: the existing registration form only

### Modify
- Restructure App.tsx to support two views using local state (no router)
- Move form into EntryPage component
- Move inventory/dashboard into InventoryPage component

### Remove
- Nothing removed functionally

## Implementation Plan
1. Create EntryPage.tsx with the asset registration form
2. Create InventoryPage.tsx with dashboard stat cards, search/filter, inventory table, edit dialog, delete, CSV export
3. Update App.tsx with top navigation tabs (Register Asset / Inventory & Dashboard) and conditional rendering
4. Apply data-ocid markers on nav tabs, form inputs, table rows, and action buttons
