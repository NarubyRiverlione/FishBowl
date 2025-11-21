# Tank Capacity Update: STANDARD Tank Increased to 15 Fish

## Summary

Updated the STANDARD tank capacity from 10 to 15 fish to provide more gameplay space and accommodate the 12 developer mode fish plus room for additional fish.

## Changes Made

### Core Configuration

- **`src/lib/constants.ts`**: Updated `TANK_CAPACITY_STANDARD` from 20 to 15
  - Note: The constant was previously set to 20 but most code used hardcoded 10
  - Now consistently uses 15 throughout the codebase

### Game Logic Updates

- **`src/store/slices/gameSlice.ts`**: Updated both dev mode initialization functions
  - `setMode('dev')` now creates tank with `capacity: 15`
  - `initializeFromQuery(?dev=true)` now creates tank with `capacity: 15`

### Test Updates

All relevant tests updated to expect the new capacity:

- **`tests/unit/GameMode.test.ts`**: Updated dev mode test expectation to 15
- **`tests/integration/DeveloperModeInit.test.ts`**: Updated capacity expectation to 15
- **`tests/integration/MultiTank.test.ts`**: Updated standard tank capacity tests to 15
- **`tests/integration/PollutionSystem.test.ts`**: Updated capacity expectation to 15

## Benefits

1. **Better Dev Experience**: Dev mode creates 12 fish and now has room for 3 more
2. **More Gameplay Space**: Players can manage larger fish populations
3. **Consistent Configuration**: All hardcoded values now use the constant
4. **Future Proofing**: Easier to adjust capacity in the future

## Verification

- ✅ All 121 tests pass
- ✅ TypeScript compilation successful
- ✅ Linting and formatting passed
- ✅ Dev mode functionality verified
- ✅ Tank upgrade progression works correctly

The STANDARD tank now provides a more spacious environment for fish management while maintaining game balance.
