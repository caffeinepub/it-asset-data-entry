# IT Asset Registry

## Current State
Three pages: Register Asset, Dashboard & Inventory. No dedicated KPI/analytics page by category.

## Requested Changes (Diff)

### Add
- New `CategoryKPIPage` component showing KPI cards per asset category
- Nav tab "Category KPI" in App.tsx
- KPI cards displaying: total count, active count, in-repair count, retired count per category
- A summary bar showing percentage share per category

### Modify
- App.tsx: add `kpi` page type and nav tab

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/components/CategoryKPIPage.tsx` with KPI cards for each category
2. Update `App.tsx` to include the new tab and render the new page
