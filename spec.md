# IT Asset Data Entry

## Current State
The app has a Motoko backend storing assets and dropdown options in non-stable Map variables wiped on every canister upgrade.

## Requested Changes (Diff)

### Add
- Stable storage for all options and assets

### Modify
- Replace Map-based storage with stable var arrays

### Remove
- Non-stable Map storage

## Implementation Plan
1. Regenerate Motoko backend with stable var arrays
2. No frontend changes needed
