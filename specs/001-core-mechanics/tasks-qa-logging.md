---
description: "QA task list for logging review and debug package integration"
---

# Tasks: QA Logging & Debug Package Integration

**Feature**: Improve logging consistency and structure across FishBowl
**Priority**: Foundational - should be addressed before next PR
**Scope**: Review existing console.log statements, introduce structured logging with `debug` package

**Current Status**:
- 11 files contain `console.log` statements
- Mix of active, commented-out, and debug-only logs
- No structured logging hierarchy
- Inconsistent emoji prefixes and message formats

**Objective**: Establish standardized, structured logging that can be enabled/disabled by module for better debugging and cleaner production code.

---

## Phase 1: Logging Audit & Analysis

**Purpose**: Catalog all existing logging and establish baseline for refactoring

### Logging Inventory Tasks

- [ ] T001 Audit console.log in src/main.tsx - document 9 initialization logs in src/main.tsx:6,12,13,21,22,25,27,29,34
- [ ] T002 Audit console.log in src/store/slices/tankSlice.ts - document 3 economy/purchase logs at lines 249,253,260
- [ ] T003 Audit console.log in src/game/engine/RenderingEngine.ts - document 3 commented logs at lines 155,156,183
- [ ] T004 Audit console.log in src/game/views/FishSprite.ts - document 7 active logs at lines 13,60,81,84,88,92 + commented logs
- [ ] T005 Audit console.log in src/game/controllers/FishController.ts - document 8 commented logs at lines 25,43,53,70,76,80
- [ ] T006 Audit console.log in src/game/views/TankContainer.ts - document 4 commented logs at lines 64,84,96
- [ ] T007 Audit console.log in src/game/managers/RenderingEngineManager.ts - document 1 log with bracket notation at line 127
- [ ] T008 Audit console.log in src/game/managers/FishRenderManager.ts - document 3 commented logs at lines 12,20,24
- [ ] T009 Audit console.log in src/services/FishService.ts - document 1 commented log at line 29
- [ ] T010 Audit console.log in src/services/monitoring/PerformanceService.ts - document 2 logs at lines 25,37 (performance metrics)
- [ ] T011 Audit console.log in src/lib/debug/TankDebugger.ts - document 5 logs at lines 27,47,58,74,92 (debug-specific module)

### Analysis Tasks

- [ ] T012 Categorize logs by type: initialization, economy/gameplay, rendering, performance, debugging
- [ ] T013 Document emoji usage patterns (🚀 startup, 🛒 economy, 🐟 fish, 🎨 rendering, 📊 performance)
- [ ] T014 Identify logs that should be removed (debug-only comments)
- [ ] T015 Identify logs that should be structured (PerformanceService, TankDebugger candidates for debug package)
- [ ] T016 Create logging guidelines document at specs/001-core-mechanics/LOGGING_GUIDELINES.md

---

## Phase 2: Debug Package Evaluation

**Purpose**: Evaluate and prototype `debug` package integration for structured logging

### Package Research

- [ ] T017 Evaluate npm package `debug` - review latest version, features, size impact in specs/001-core-mechanics/research.md
- [ ] T018 Compare alternatives: `pino`, `winston`, `bunyan` for weight/simplicity (debug is ~500B, lightest)
- [ ] T019 Document decision rationale - recommend `debug` package for FishBowl (feature-gated, no overhead when disabled)

### Prototype Integration

- [ ] T020 [P] Create src/lib/debug/loggerConfig.ts - setup debug instance factories per module (game, store, services)
- [ ] T021 [P] Create src/lib/debug/moduleLoggers.ts - export pre-configured loggers: gameLogger, storeLogger, renderingLogger, performanceLogger
- [ ] T022 Update src/lib/debug/TankDebugger.ts - replace console.log with debug instances for cleaner API

### Example Implementation (Prototype)

```typescript
// src/lib/debug/moduleLoggers.ts
import createDebug from 'debug'

export const gameLogger = createDebug('fishbowl:game')
export const storeLogger = createDebug('fishbowl:store')
export const renderingLogger = createDebug('fishbowl:rendering')
export const performanceLogger = createDebug('fishbowl:performance')
export const debugLogger = createDebug('fishbowl:debug')

// Usage in code:
storeLogger('🛒 buyFish called for species: %s', species)
performanceLogger('FPS: %d | Fish: %d', fps, fishCount)
gameLogger('Tank state updated: %O', tank)
```

---

## Phase 3: Code Refactoring (QA Tasks for Review)

**Purpose**: Replace console.log with structured logging; prepare for PR review

### Priority: Remove/Fix Debug Comments

- [ ] T023 Remove 3 commented logs in src/game/engine/RenderingEngine.ts:155,156,183
- [ ] T024 Remove 1 commented log in src/services/FishService.ts:29
- [ ] T025 Remove 8 commented logs in src/game/controllers/FishController.ts:25,43,53,70,76,80
- [ ] T026 Remove 4 commented logs in src/game/views/TankContainer.ts:64,84,96
- [ ] T027 Remove 3 commented logs in src/game/managers/FishRenderManager.ts:12,20,24

### Priority: Refactor Active Logs (Candidate for Debug Package)

- [ ] T028 [P] Refactor src/main.tsx initialization logs - replace 9 console.log with gameLogger calls (lines 6,12,13,21,22,25,27,29,34)
- [ ] T029 [P] Refactor src/store/slices/tankSlice.ts economy logs - replace 3 console.log with storeLogger calls (lines 249,253,260)
- [ ] T030 [P] Refactor src/game/views/FishSprite.ts rendering logs - replace 7 console.log with renderingLogger calls (lines 13,60,81,84,88,92)
- [ ] T031 [P] Refactor src/game/managers/RenderingEngineManager.ts - replace 1 log with renderingLogger (line 127)
- [ ] T032 Refactor src/services/monitoring/PerformanceService.ts - replace 2 logs with performanceLogger calls (lines 25,37)
- [ ] T033 Refactor src/lib/debug/TankDebugger.ts - replace 5 logs with debugLogger calls (lines 27,47,58,74,92)

### Integration Tests

- [ ] T034 [P] Test: Verify all logs can be enabled with `localStorage.debug = 'fishbowl:*'` (all modules)
- [ ] T035 [P] Test: Verify specific module logs work (`localStorage.debug = 'fishbowl:store'`)
- [ ] T036 [P] Test: Verify logs are silent in production when debug not enabled
- [ ] T037 Test: Verify no console.log or console.error statements exist in final code (except intentional ones)

---

## Phase 4: Documentation & Best Practices

**Purpose**: Document logging standards for future developers

- [ ] T038 Create LOGGING_GUIDELINES.md with module list, log levels, emoji conventions
- [ ] T039 Add comment at top of each refactored file explaining logger import (e.g., `const logger = debug('fishbowl:store')`)
- [ ] T040 Update DEVELOPER_GUIDE.md with debugging section - how to enable logs in DevTools
- [ ] T041 Add ESLint rule to prevent raw console.log (recommend `no-console` rule with exceptions for error/warn only)

---

## Phase 5: PR Review Checklist

**Purpose**: QA checklist before submitting PR to main

### Code Quality

- [ ] T042 Verify `pnpm lint` passes with 0 warnings (no console.log violations)
- [ ] T043 Verify `pnpm test` passes all tests (logging changes don't break tests)
- [ ] T044 Verify `pnpm format` runs without changes needed (all files properly formatted)

### Manual Testing

- [ ] T045 Test in browser DevTools: Open Console → Type in DevTools: `localStorage.setItem('debug', 'fishbowl:*')`
- [ ] T046 Test in browser DevTools: Reload page → Verify game runs and logs appear in console
- [ ] T047 Test: Clear localStorage debug → Reload → Verify no logs appear (clean slate)
- [ ] T048 Test: Set `localStorage.debug = 'fishbowl:store'` → Reload → Verify only store logs show
- [ ] T049 Test: Set `localStorage.debug = 'fishbowl:game'` → Reload → Verify only game logs show
- [ ] T050 Test: Verify game performance not impacted - FPS stable, no lag from logging

### File Verification

- [ ] T051 Verify src/lib/debug/moduleLoggers.ts exports 4+ loggers (game, store, rendering, performance)
- [ ] T052 Verify all imports from moduleLoggers are at top of refactored files
- [ ] T053 Verify no `console.log`, `console.error`, `console.warn` exist outside of approved files (TankDebugger, error handlers)
- [ ] T054 Verify package.json includes `debug` as dependency (add if missing: `pnpm add debug`)
- [ ] T055 Verify TypeScript types for debug package installed (`pnpm add -D @types/debug`)

### Documentation Review

- [ ] T056 Verify LOGGING_GUIDELINES.md exists at specs/001-core-mechanics/LOGGING_GUIDELINES.md
- [ ] T057 Verify LOGGING_GUIDELINES.md documents all 4+ module loggers with examples
- [ ] T058 Verify DEVELOPER_GUIDE.md section "Debugging" explains how to enable logs
- [ ] T059 Verify CHANGELOG.md updated with logging improvements

---

## Phase 6: Production Readiness

**Purpose**: Final validation before merge

### Performance Validation

- [ ] T060 Run profiler: `pnpm run profile` (or similar) → Verify logging overhead < 1% CPU
- [ ] T061 Bundle size check: Verify `debug` package adds < 1KB to final bundle (gzipped)
- [ ] T062 Memory check: Verify no memory leaks from logger instances

### Edge Cases

- [ ] T063 Test: Rapid logging (100 logs/second) → Verify browser doesn't freeze
- [ ] T064 Test: Very long log messages (2000 char) → Verify console handles gracefully
- [ ] T065 Test: Toggle debug on/off at runtime → Verify logs enable/disable immediately

### Final QA Sign-off

- [ ] T066 Create PR with title: "QA: Implement structured logging with debug package"
- [ ] T067 Request code review from team
- [ ] T068 Verify all comments addressed before merge
- [ ] T069 Merge to main → Complete! 🎉

---

## File Changes Summary

### Files with Removed Comments (No Functional Change)
- src/game/engine/RenderingEngine.ts (3 comments removed)
- src/services/FishService.ts (1 comment removed)
- src/game/controllers/FishController.ts (8 comments removed)
- src/game/views/TankContainer.ts (4 comments removed)
- src/game/managers/FishRenderManager.ts (3 comments removed)

### Files with Refactored Logs (console.log → debug)
- src/main.tsx (9 logs refactored to gameLogger)
- src/store/slices/tankSlice.ts (3 logs refactored to storeLogger)
- src/game/views/FishSprite.ts (7 logs refactored to renderingLogger)
- src/game/managers/RenderingEngineManager.ts (1 log refactored to renderingLogger)
- src/services/monitoring/PerformanceService.ts (2 logs refactored to performanceLogger)
- src/lib/debug/TankDebugger.ts (5 logs refactored to debugLogger)

### New Files Created
- src/lib/debug/loggerConfig.ts (debug package config)
- src/lib/debug/moduleLoggers.ts (exported logger instances)
- specs/001-core-mechanics/LOGGING_GUIDELINES.md (standards documentation)

---

## Dependency Management

### To Add
```bash
pnpm add debug
pnpm add -D @types/debug
```

### Verify in package.json
```json
{
  "dependencies": {
    "debug": "^4.3.x"
  },
  "devDependencies": {
    "@types/debug": "^4.1.x"
  }
}
```

---

## Dependencies & Execution Order

### Phase Dependency
- **Phase 1 (Audit)**: No dependencies - can start immediately ✓
- **Phase 2 (Evaluation)**: Depends on Phase 1 - understand current state first
- **Phase 3 (Refactoring)**: Depends on Phase 2 - implement debug package integration
- **Phase 4 (Documentation)**: Depends on Phase 3 - document patterns established
- **Phase 5 (PR Review)**: Depends on Phase 4 - final validation before merge
- **Phase 6 (Production)**: Depends on Phase 5 - ensure quality before main branch

### Parallel Opportunities (Phase 3)

All T-series tasks marked [P] in Phase 3 can run in parallel:

```bash
# Parallel refactoring (different files):
Task T028: src/main.tsx refactoring
Task T029: src/store/slices/tankSlice.ts refactoring
Task T030: src/game/views/FishSprite.ts refactoring
Task T031: src/game/managers/RenderingEngineManager.ts refactoring
```

All integration tests marked [P] in Phase 3 can run in parallel:

```bash
Task T034: Test all modules
Task T035: Test specific modules
Task T036: Test production silence
```

---

## Success Criteria

✅ **Task Completion**:
- [ ] All Phase 1 audit tasks complete (T001-T016)
- [ ] Debug package selected and prototyped (T017-T022)
- [ ] All console.log statements refactored to debug package or removed (T023-T033)
- [ ] All integration tests pass (T034-T037)
- [ ] Documentation complete (T038-T041)
- [ ] PR checklist satisfied (T042-T069)

✅ **Quality Gates**:
- `pnpm lint` passes with 0 warnings
- `pnpm test` passes 100% of tests
- `pnpm format` requires no changes
- No `console.log` in code except error handlers
- Logging can be toggled in DevTools without performance impact

✅ **Code Review Ready**:
- All files have clean diffs (removed comments, refactored logs)
- Commit messages describe each refactoring
- LOGGING_GUIDELINES.md explains standards for future PRs

---

## Notes

- Tasks organized sequentially (Phase → Phase) but individual tasks within Phase 3 can run in parallel
- Each task is independently completable with exact file paths specified
- QA review should focus on: code cleanliness, logging consistency, no performance regression
- Future PRs: ALL new logging must use the debug package, not raw console.log
- Uncommitted debug comments should be removed before PR (T023-T027)

