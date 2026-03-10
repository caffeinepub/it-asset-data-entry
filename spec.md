# IT Asset Registry

## Current State
A full-stack IT asset registry app with a registration form and inventory table. The `ITAsset` record has: id, name, category, serialNumber, status, location, notes. The form has fields for all of these.

## Requested Changes (Diff)

### Add
- `macId` (text) field to ITAsset
- `serviceTag` (text) field to ITAsset
- `assignedDepartment` (variant enum) field to ITAsset: IT, Biomedical, Engineering, Accounts, HR, Finance, Administration, Maintenance, Other
- `lastServiceDate` (text, optional date string) field to ITAsset
- `purchaseDate` (text, optional date string) field to ITAsset
- `purchaseVendor` (text, selection from predefined vendors) field to ITAsset
- Predefined vendor list: Dell, HP, Lenovo, Apple, Microsoft, Cisco, Samsung, Acer, ASUS, Toshiba, Other
- All new fields added to the registration form
- New columns in the inventory table for key new fields (department, vendor, purchase date)

### Modify
- `addAsset` backend function to accept new fields
- `ITAsset` record type to include new fields
- Frontend form to include new input fields
- Inventory table to show new columns

### Remove
Nothing removed.

## Implementation Plan
1. Regenerate Motoko backend with updated ITAsset record and addAsset function signature
2. Update useQueries.ts to pass new fields
3. Update App.tsx form to add new fields with appropriate input types
4. Update inventory table to show new columns
