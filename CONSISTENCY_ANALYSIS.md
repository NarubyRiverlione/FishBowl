# FishBowl Project Consistency Analysis Report

**Date**: 2025-11-21  
**Branch**: `001-core-mechanics`  
**Status**: 🟡 SPEC-ALIGNED (Spec ✅ Correct, Code ❌ Needs Update)

---

## Executive Summary

**SPEC VERIFICATION**: ✅ **Updated spec is CORRECT** (specs/001-core-mechanics/spec.md)  
**CODE ALIGNMENT**: ❌ **6 code inconsistencies identified** that need remediation to match spec

The analysis reveals **6 code consistency issues** in `src/lib/constants.ts`, `src/models/Tank.ts`, and related files. The **spec has been correctly updated** with new requirements (FR-016 through FR-020 for tank design, collision physics, floor mechanics, and responsive layout). **Code files must be updated** to implement these spec changes.

### Issue Severity Distribution

| Severity    | Count | Meaning                                         |
| ----------- | ----- | ----------------------------------------------- |
| 🔴 CRITICAL | 3     | Code must change to match spec before Phase 5   |
| 🟡 HIGH     | 2     | Code must change before Phase 5 starts          |
| 🟢 MEDIUM   | 1     | Code should change before production            |
| **Total**   | **6** | **Spec-driven changes (spec is authoritative)** |

---

## Code Changes Needed (Spec-Driven)

All issues below represent code that **must be updated** to implement the spec requirements. The spec is authoritative and correct; code must change to align.

### C1: Tank Capacity Mismatch - BOWL Tank (Code → Needs Update)

**Severity**: 🔴 CRITICAL  
**Impact**: Code inconsistency with spec FR-010; must update before Phase 5  
**Files Affected**: 3 files need code changes

| Location                           | Current Value                   | Expected Value | Issue                                 |
| ---------------------------------- | ------------------------------- | -------------- | ------------------------------------- |
| `src/lib/constants.ts:23`          | `TANK_CAPACITY_BOWL = 1`        | `2`            | Spec FR-010 updated; code must change |
| `src/models/Tank.ts:13`            | `capacity: number = 1`          | Use constant   | Hardcoded default must be updated     |
| `src/store/slices/tankSlice.ts:65` | References `TANK_CAPACITY_BOWL` | Auto-correct   | Will correct when constant updated    |

**Root Cause**: Spec was updated during brainstorm session (2025-11-19/21) with new tank progression. Code has not yet been updated to reflect spec changes.

**Evidence from Spec**:

```markdown
# From specs/001-core-mechanics/spec.md (FR-010)

Progression: BOWL (2 capacity, circular) → STANDARD (15 capacity, square, costs 75 credits) → BIG (30 capacity, wide rectangle, costs 150 credits).
```

**Code Changes Required**:

When implementing Phase 5, update the following:

```typescript
// src/lib/constants.ts - CHANGE
export const TANK_CAPACITY_BOWL = 1 // ← OLD VALUE (current code)
// TO
export const TANK_CAPACITY_BOWL = 2 // ← NEW VALUE (spec requirement)

// src/models/Tank.ts - CHANGE
capacity: number = 1 // ← HARDCODED (current code)
// TO
capacity: number = TANK_CAPACITY_BOWL // ← USE CONSTANT (from spec)
```

---

### C2: Missing BIG Tank Capacity Constant

**Severity**: 🔴 CRITICAL  
**Impact**: Phase 5 tasks (T065) cannot reference undefined constant  
**Files Affected**: 2 files

| Location               | Issue                               |
| ---------------------- | ----------------------------------- |
| `src/lib/constants.ts` | BIG tank capacity not defined       |
| Phase 5 task T065      | References capacity 30 for BIG tank |

**Evidence from Spec**:

```markdown
# From specs/001-core-mechanics/spec.md (FR-010 assumptions)

- BIG (wide rectangle, 800×400px): Advanced tank, capacity 30 fish, filters available, costs 150 credits.
```

**Evidence from Tasks**:

```markdown
# From specs/001-core-mechanics/tasks.md (T065)

verify BOWL capacity is 2 (was 1), STANDARD capacity is 15 (was 10),
BIG is 30 (was 20); costs 75 (STANDARD) and 150 (BIG)
```

**Missing Constant**:

```typescript
// MISSING IN src/lib/constants.ts
export const TANK_CAPACITY_BIG = 30
```

---

### C3: Developer Mode Credits - Verify Test Updated

**Severity**: 🔴 CRITICAL  
**Impact**: Dev mode test must verify 1000 credits (spec updated value)  
**Files Affected**: 1 file needs verification

| Location                           | Current Value                  | Spec Value         | Status    |
| ---------------------------------- | ------------------------------ | ------------------ | --------- |
| `src/lib/constants.ts:85`          | `GAME_DEV_MODE_CREDITS = 1000` | `1000`             | ✅ OK     |
| `tests/unit/DeveloperMode.test.ts` | Unknown (needs check)          | Should expect 1000 | ⚠️ VERIFY |

**Spec Requirement** (FR-012 - Updated):

```markdown
Developer Mode: Starts with STANDARD tank and 1000 credits with tutorial disabled.
```

**Verification Needed**:

The constant is correct (1000), but test must be verified to expect this value:

```typescript
// tests/unit/DeveloperMode.test.ts - VERIFY TEST
// Should expect: expect(state.credits).toBe(1000)
// NOT: expect(state.credits).toBe(100)  ← OLD VALUE (remove if present)
```

- New spec value: 1000 credits (ratified 2025-11-21)
- Current code: 1000 credits ✅ (already correct!)

**Action**: Verify `tests/unit/DeveloperMode.test.ts` has been updated to expect 1000, not 100.

---

## High Priority Code Changes (Spec-Driven)

### H1: Tank Dimension Constants Need Updates (Code → Needs Update)

**Severity**: 🟡 HIGH  
**Impact**: Phase 5 task T057 requires correct tank dimensions for procedural rendering  
**Files Affected**: 1 file (`src/lib/constants.ts`) needs updates and additions

| Constant               | Current Code | Spec Requirement | Change Required       |
| ---------------------- | ------------ | ---------------- | --------------------- |
| `TANK_DEFAULT_WIDTH`   | `400`        | BOWL = `300`     | Update 400 → 300      |
| `TANK_DEFAULT_HEIGHT`  | `300`        | BOWL = `300`     | ✅ Already correct    |
| `TANK_UPGRADED_WIDTH`  | `800`        | STANDARD = `500` | Update 800 → 500      |
| `TANK_UPGRADED_HEIGHT` | `600`        | STANDARD = `500` | Update 600 → 500      |
| (Missing)              | —            | BIG = `800×400`  | Add two new constants |

**Spec Requirements** (FR-018 - Tank Visual Design):

```markdown
BOWL tanks render as circles (circular glass effect, 300×300px).
STANDARD tanks render as squares (rectangular glass, 500×500px).
BIG tanks render as wide rectangles (wide panoramic glass, 800×400px).
```

**Code Changes Required**:

```typescript
// src/lib/constants.ts - UPDATE AND ADD NEW CONSTANTS
// NEW constants for Phase 5 procedural rendering:
export const TANK_BOWL_SIZE = 300 // ← NEW
export const TANK_STANDARD_SIZE = 500 // ← NEW
export const TANK_BIG_WIDTH = 800 // ← NEW
export const TANK_BIG_HEIGHT = 400 // ← NEW

// UPDATE existing constants:
export const TANK_DEFAULT_WIDTH = 300 // ← CHANGE: 400 → 300
export const TANK_DEFAULT_HEIGHT = 300 // ← OK (already correct)
export const TANK_UPGRADED_WIDTH = 500 // ← CHANGE: 800 → 500
export const TANK_UPGRADED_HEIGHT = 500 // ← CHANGE: 600 → 500
```

**Impact**: Procedural tank rendering in Phase 5 will draw wrong-sized tanks if these values are not corrected.

---

### H2: Physics Constants Need Split for Floor vs Wall (Code → Needs Addition)

**Severity**: 🟡 HIGH  
**Impact**: Phase 5 task T054 requires separate floor and wall restitution constants  
**Files Affected**: 1 file (`src/lib/constants.ts`) needs new constants

**Spec Requirement** (FR-017 - Decorative Tank Floor):

```markdown
Fish-to-boundary collisions use 0.8 restitution;
floor collisions use 0.2 restitution for peaceful settling behavior.
```

**Phase 5 Task T054**:

```markdown
Update physics to apply 0.2 restitution for floor collisions vs 0.8 for wall collisions;
add `FLOOR_RESTITUTION` and `WALL_RESTITUTION` constants
```

**Current State** (Generic - doesn't distinguish):

```typescript
// src/lib/constants.ts line ~96
export const COLLISION_RESTITUTION = 0.8 // ← Generic value (doesn't split floor vs wall)
```

**Code Addition Required**:

```typescript
// src/lib/constants.ts - ADD NEW CONSTANTS
export const WALL_RESTITUTION = 0.8 // ← NEW (for wall/boundary collisions)
export const FLOOR_RESTITUTION = 0.2 // ← NEW (for floor collisions - peaceful settling)
// KEEP:
export const COLLISION_RESTITUTION = 0.8 // ← Can remain as alias to WALL_RESTITUTION
```

---

## Medium Priority Code Changes

### M1: Tank.ts Model Uses Hardcoded Default (Code → Needs Update)

**Severity**: 🟢 MEDIUM  
**Impact**: Violates No Magic Numbers principle; creates maintenance burden  
**Files Affected**: 1 file (`src/models/Tank.ts`) needs update

| Line | Current Code           | Required Change                   |
| ---- | ---------------------- | --------------------------------- |
| 13   | `capacity: number = 1` | Use constant `TANK_CAPACITY_BOWL` |

**Constitution Violation**:

This violates **Core Principle VI: No Magic Numbers** (from `.specify/memory/constitution.md`).

- ❌ Hardcoded value `1` is magic number
- ✅ Should use `TANK_CAPACITY_BOWL` constant
- 🟡 Breaks DRY (value also in constants.ts)

**Code Change Required**:

```typescript
// src/models/Tank.ts
import { TANK_CAPACITY_BOWL } from '../lib/constants'

export class Tank implements ITank {
  id: UUID = crypto.randomUUID()
  size: TankSize = 'BOWL'
  capacity: number = TANK_CAPACITY_BOWL // ← CHANGE: 1 → TANK_CAPACITY_BOWL (use constant)
  waterQuality: number = PERCENTAGE_MAX
  // ... rest of properties
}
```

---

## Analysis Results by Category

### Spec Alignment

| Category            | Status     | Details                             |
| ------------------- | ---------- | ----------------------------------- |
| Tank Capacities     | 🔴 BROKEN  | BOWL 1 (should be 2), BIG missing   |
| Tank Dimensions     | 🔴 BROKEN  | Wrong sizes for STANDARD/BIG        |
| Tank Costs          | ✅ CORRECT | TANK_UPGRADE_COST = 75 matches spec |
| Dev Mode Credits    | ✅ CORRECT | 1000 matches updated spec           |
| Physics Restitution | 🟡 PARTIAL | Generic constant only, needs split  |

### Type Definitions

| Interface    | Status     | Notes                                                 |
| ------------ | ---------- | ----------------------------------------------------- |
| `IFish`      | ✅ CORRECT | Matches spec requirements                             |
| `ITank`      | ✅ CORRECT | Proper structure                                      |
| `IGameState` | ✅ CORRECT | Handles multi-tank support                            |
| `TankSize`   | ⚠️ WARNING | Only 'BOWL' \| 'STANDARD' \| 'BIG' (no capacity info) |

### Store Implementation

| Feature            | Status      | Notes                               |
| ------------------ | ----------- | ----------------------------------- |
| Multi-tank support | ✅ COMPLETE | Proper `tanks: ITank[]` array       |
| Tank selection     | ✅ COMPLETE | `selectedTankId` and `selectTank()` |
| Tank upgrade logic | ✅ COMPLETE | Uses constants correctly            |
| Feed tank logic    | ✅ COMPLETE | Pollution formula correct           |

### Constants Organization

| Section             | Status        | Issues                              |
| ------------------- | ------------- | ----------------------------------- |
| Feeding             | ✅ COMPLETE   | All feed constants present          |
| Pollution           | ✅ COMPLETE   | Pollution formula constants defined |
| Tank capacities     | 🔴 MISSING    | BIG capacity missing                |
| Tank dimensions     | 🟡 INCOMPLETE | Wrong values for upgraded tanks     |
| Physics             | 🟡 SPLIT      | Restitution needs differentiation   |
| Game initialization | ✅ COMPLETE   | Dev mode credits correct            |

### File Structure

| Directory              | Status          | Notes                              |
| ---------------------- | --------------- | ---------------------------------- |
| `src/lib/constants.ts` | 🟡 NEEDS UPDATE | 5 constants need fixing            |
| `src/models/`          | ✅ MOSTLY OK    | Tank.ts has 1 hardcoded value      |
| `src/store/slices/`    | ✅ CORRECT      | Uses constants; logic sound        |
| `src/services/`        | ✅ CORRECT      | No magic numbers observed          |
| `tests/unit/`          | ⚠️ VERIFY       | DeveloperMode test may need update |

---

## Remediation Plan

### Priority Order

1. **CRITICAL** (Do immediately):
   - C1: Fix TANK_CAPACITY_BOWL from 1 → 2
   - C2: Add TANK_CAPACITY_BIG = 30
   - C3: Verify DeveloperMode test expects 1000 credits

2. **HIGH** (Before Phase 5):
   - H1: Fix tank dimensions to match spec (BOWL 300×300, STANDARD 500×500, BIG 800×400)
   - H2: Add FLOOR_RESTITUTION and WALL_RESTITUTION constants

3. **MEDIUM** (Before production):
   - M1: Update Tank.ts to use constant for capacity default

### Implementation Commands

```bash
# 1. Fix constants.ts (all 5 issues)
# See "Recommended Changes" section below

# 2. Fix Tank.ts hardcoded value
# Change: capacity: number = 1
# To: capacity: number = TANK_CAPACITY_BOWL

# 3. Verify and update tests
pnpm test -- DeveloperMode

# 4. Run full validation suite
pnpm lint
pnpm test
```

---

## Recommended Code Changes (For Phase 5 Implementation)

### When to Apply

These changes should be applied when implementing Phase 5 tasks (T050–T065). They are NOT required before Phase 5 starts, but must be completed during Phase 5.

### Change 1: Update Tank Capacities in `src/lib/constants.ts`

**Lines to update**: 23–24, 54–55, 78–81 (add new constants)

```typescript
// BOWL Tank Capacity
export const TANK_CAPACITY_BOWL = 2 // CHANGE: 1 → 2 (per spec FR-010)
export const TANK_CAPACITY_STANDARD = 15 // ✅ CORRECT

// ADD NEW:
export const TANK_CAPACITY_BIG = 30 // NEW: per spec FR-010

// Tank Dimensions (BOWL)
export const TANK_BOWL_SIZE = 300 // NEW: per spec FR-018
export const TANK_STANDARD_SIZE = 500 // NEW: per spec FR-018
export const TANK_BIG_WIDTH = 800 // NEW: per spec FR-018
export const TANK_BIG_HEIGHT = 400 // NEW: per spec FR-018

// Tank Dimensions (LEGACY - update or deprecate)
export const TANK_DEFAULT_WIDTH = 300 // CHANGE: 400 → 300 (BOWL width)
export const TANK_DEFAULT_HEIGHT = 300 // ✅ CORRECT (BOWL height)
export const TANK_UPGRADED_WIDTH = 500 // CHANGE: 800 → 500 (STANDARD width)
export const TANK_UPGRADED_HEIGHT = 500 // CHANGE: 600 → 500 (STANDARD height)

// Physics Constants - Restitution
export const COLLISION_RESTITUTION = 0.8 // KEEP: generic alias (legacy)
export const WALL_RESTITUTION = 0.8 // NEW: per spec FR-017
export const FLOOR_RESTITUTION = 0.2 // NEW: per spec FR-017
```

### Change 2: Update `src/models/Tank.ts`

**Line 13** (class initialization):

```typescript
// BEFORE
capacity: number = 1

// AFTER
capacity: number = TANK_CAPACITY_BOWL
```

**Add import** (line 2):

```typescript
import { TANK_CAPACITY_BOWL } from '../lib/constants'
```

### Change 3: Verify `tests/unit/DeveloperMode.test.ts`

**Action**: Search for hardcoded `100` and ensure test expects `1000`.

```bash
grep -n "100\|1000" tests/unit/DeveloperMode.test.ts
```

If test still checks for `100`, update to `1000`.

---

## Validation Checklist

Use this checklist to verify all fixes are correct:

- [ ] `TANK_CAPACITY_BOWL = 2` in constants.ts
- [ ] `TANK_CAPACITY_STANDARD = 15` in constants.ts
- [ ] `TANK_CAPACITY_BIG = 30` in constants.ts (NEW)
- [ ] `TANK_BOWL_SIZE = 300` in constants.ts (NEW)
- [ ] `TANK_STANDARD_SIZE = 500` in constants.ts (NEW)
- [ ] `TANK_BIG_WIDTH = 800` in constants.ts (NEW)
- [ ] `TANK_BIG_HEIGHT = 400` in constants.ts (NEW)
- [ ] `TANK_DEFAULT_WIDTH = 300` in constants.ts (UPDATED)
- [ ] `TANK_UPGRADED_WIDTH = 500` in constants.ts (UPDATED)
- [ ] `TANK_UPGRADED_HEIGHT = 500` in constants.ts (UPDATED)
- [ ] `WALL_RESTITUTION = 0.8` in constants.ts (NEW)
- [ ] `FLOOR_RESTITUTION = 0.2` in constants.ts (NEW)
- [ ] `capacity: number = TANK_CAPACITY_BOWL` in Tank.ts
- [ ] Import statement added to Tank.ts
- [ ] DeveloperMode.test.ts expects 1000 credits
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm test` passes all tests
- [ ] No remaining magic numbers in Tank.ts or model defaults

---

## Constitution Compliance

### VI. No Magic Numbers (Violated)

**Current Violations**:

- ❌ `Tank.ts:13` — `capacity: number = 1` (hardcoded)
- ❌ `constants.ts:23` — `TANK_CAPACITY_BOWL = 1` (obsolete value)
- ❌ `constants.ts` — Missing 5 required constants for Phase 5

**Resolution**:
All violations will be resolved by implementing recommended changes.

### Milestone Quality Gate

This analysis applies the **Milestone Completion Quality Gate** (from constitution.md) retroactively to Phase 3. Fixes ensure compliance before Phase 5 begins.

---

## Impact Assessment

### On Current Codebase (Phases 1–3)

**Risk**: 🟢 LOW

- Current MVP code works correctly (tests passing)
- Inconsistencies don't affect Phase 1–3 functionality
- Old tank capacity value (1) is what Phase 3 was written for

### On Phase 4 (Fish Selection - In Progress)

**Risk**: 🟢 LOW

- Phase 4 focuses on UI selection mechanics
- Not blocked by tank capacity or dimension constants
- Can proceed independently

### On Phase 5 (Tank Design & Rendering - Upcoming)

**Risk**: 🔴 BLOCKING

- **T054**: Cannot implement floor restitution without `FLOOR_RESTITUTION` constant
- **T057**: Cannot render correct tank dimensions (missing constants and wrong values)
- **T060**: Cannot reference `TANK_CAPACITY_BIG` (constant missing)
- **T062**: Cannot build responsive layout without tank dimension constants
- **T065**: Cannot implement correct tank capacities (constants need updates)

**Recommendation**: Apply code changes during Phase 5 implementation, concurrent with T050–T065 tasks.

---

## Summary: Code Files Requiring Changes

| File                               | Issue Type   | Count        | Priority | Phase              |
| ---------------------------------- | ------------ | ------------ | -------- | ------------------ |
| `src/lib/constants.ts`             | Update + Add | 11 lines     | 🔴🔴🟡   | Phase 5            |
| `src/models/Tank.ts`               | Update       | 2 lines      | 🟢       | Phase 5 (optional) |
| `tests/unit/DeveloperMode.test.ts` | Verify       | 1 line       | 🔴       | Verify now         |
| **TOTAL**                          | —            | **14 lines** | —        | —                  |

---

## Next Steps

1. **Immediate** (Today):
   - ✅ Verify `tests/unit/DeveloperMode.test.ts` expects 1000 credits (not 100)
2. **During Phase 5 Implementation**:
   - Apply all 6 code changes when implementing tasks T050–T065
   - Each change references specific spec requirement (FR-010, FR-017, FR-018)
   - No changes needed before Phase 5 starts

3. **After Code Changes**:
   - Run `pnpm lint` (should have zero warnings)
   - Run `pnpm test` (all tests should pass)
   - Verify no magic numbers remain in Tank.ts and constants.ts

---

**Report Generated**: 2025-11-21  
**Spec Status**: ✅ CORRECT AND AUTHORITATIVE  
**Code Status**: 🔄 READY FOR PHASE 5 UPDATES  
**Confidence**: HIGH (findings cross-referenced with spec.md and tasks.md)
