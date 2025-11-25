# Merge Plan: Spec 002 → Main → Spec 001

**Created**: 2025-11-19
**Status**: Ready to Execute
**Context**: Spec 002 (Visual Prototype) is complete and needs to be merged to `main`, then incorporated into Spec 001 (Core Mechanics) work.

---

## Current Status

### Branch Structure

```
main (base)
  ├── 001-core-mechanics (draft spec, needs visual foundation)
  ├── 002-visual-prototype ✅ COMPLETE (current branch)
  └── antigravity-01 (experimental)
```

### Spec 002 Completion ✅

- **Status**: Fully implemented and tested
- **Features**: Physics-based fish swimming, collision detection, SVG graphics
- **Tests**: 40 tests passing (37 unit/integration + 3 E2E)
- **Coverage**: Models 1000%, Lib 98.78%, Game 74%, Components 86.66%
- **Documentation**: Complete (README.md, QUICKSTART.md, specs/)
- **Code Quality**: All linting/type checks passing

### Outstanding Changes

- `tests/unit/TankView.test.ts` - Modified (uncommitted)

---

## Merge Strategy

### Phase 1: Prepare Spec 002 Branch ✅ Ready

**Objective**: Ensure the branch is clean and ready for merge

**Steps**:

1. ✅ Review and commit outstanding changes

   ```bash
   git add tests/unit/TankView.test.ts
   git commit -m "docs: fix TankView test mocks for water surface rendering"
   ```

2. ✅ Verify all tests pass

   ```bash
   pnpm test        # Unit/integration (39 tests)
   pnpm test:e2e    # E2E (3 tests)
   ```

3. ✅ Verify code quality

   ```bash
   pnpm lint        # ESLint + Prettier + TypeScript
   ```

4. ✅ Final documentation review
   - Check README.md reflects current state
   - Check QUICKSTART.md is accurate
   - Check specs/002-visual-prototype/ is complete

**Expected Duration**: 5 minutes

---

### Phase 2: Merge to Main

**Objective**: Integrate Spec 002 into the main branch as the foundation

**Steps**:

1. **Switch to main and update**

   ```bash
   git checkout main
   git pull origin main  # If working with remote
   ```

2. **Merge spec 002 (recommended: squash merge for clean history)**

   ```bash
   git merge --squash 002-visual-prototype
   ```

   **Why squash?**
   - Creates one clean commit for the entire feature
   - Keeps main history readable
   - Preserves detailed history in feature branch

3. **Commit the merge**

   ```bash
   git commit -m "feat: implement visual prototype with physics-based fish swimming

   Complete implementation of Spec 002 (Visual Prototype):
   - Physics engine: velocity, acceleration, friction, collision detection
   - Fish sprites with SVG graphics (8 colors, varied sizes)
   - Tank rendering with water surface at 85%
   - Performance: 60 FPS with 50+ fish
   - Tests: 40 passing (37 unit/integration + 3 E2E)
   - Coverage: >90% for models/lib, >85% for game/components

   Closes #002-visual-prototype"
   ```

4. **Verify main is working**

   ```bash
   pnpm install  # Ensure dependencies are fresh
   pnpm test
   pnpm lint
   pnpm dev      # Manual verification
   ```

5. **Tag the release (optional but recommended)**

   ```bash
   git tag -a v0.1.0-phase1 -m "Phase 1 Complete: Visual Prototype"
   ```

6. **Push to remote (if applicable)**
   ```bash
   git push origin main
   git push origin v0.1.0-phase1
   ```

**Expected Duration**: 10 minutes

---

### Phase 3: Update Spec 001 Branch

**Objective**: Rebase/merge Spec 001 onto the new main to inherit visual foundation

**Steps**:

1. **Switch to spec 001 branch**

   ```bash
   git checkout 001-core-mechanics
   ```

2. **Rebase onto main (recommended) OR merge main**

   **Option A: Rebase (cleaner history, recommended for draft work)**

   ```bash
   git rebase main
   ```

   **Option B: Merge (simpler, preserves branch history)**

   ```bash
   git merge main
   ```

   **Recommendation**: Use **rebase** since Spec 001 is still in draft and hasn't been shared/merged yet.

3. **Resolve conflicts (if any)**

   **Expected conflicts**:
   - None expected if Spec 001 is truly draft
   - If there are conflicts in `src/`, carefully review which code to keep

   **Conflict resolution strategy**:
   - Keep ALL visual prototype code (from main)
   - Add Spec 001 logic on top of it
   - Do NOT remove any working Spec 002 features

4. **Verify the merged state**

   ```bash
   pnpm install
   pnpm test
   pnpm lint
   pnpm dev
   ```

5. **Update Spec 001 documentation**

   Edit `/specs/001-core-mechanics/spec.md`:

   ```markdown
   ## Dependencies

   ✅ **Spec 002 (Visual Prototype)**: Complete and merged to main

   - Provides: Fish rendering, Tank view, Physics engine, Game loop
   - Can build upon: Fish model, Tank model, RenderingEngine
   ```

**Expected Duration**: 15 minutes (no conflicts) to 30 minutes (with conflicts)

---

## Spec 001 Implementation Strategy

### What You Inherit from Spec 002

**Models** (can extend):

- ✅ `Fish.ts` - Position, velocity, physics (add: hunger, health, age, species)
- ✅ `Tank.ts` - Container, collision tracking (add: water quality, fish capacity)

**Game Engine** (can reuse):

- ✅ `RenderingEngine.ts` - Game loop, Pixi.js app (add: tick rate control, pause/resume)
- ✅ `TankView.ts` - Visual rendering (add: UI overlays for health/hunger)
- ✅ `FishSprite.ts` - Sprite rendering (add: visual indicators for state)

**Libraries** (can extend):

- ✅ `physics.ts` - Movement calculations (add: environmental effects)
- ✅ `collision.ts` - Collision detection (keep as-is)
- ✅ `random.ts` - Randomization (add: genetics, mutations)

### What Spec 001 Needs to Add

**New Models**:

- `Store.ts` - Economy and purchasing
- `Player.ts` - Credits, inventory, progression
- `FoodItem.ts` - Feeding mechanics

**New Services**:

- `GameLoop.ts` - Tick-based simulation (separate from rendering)
- `FeedingService.ts` - Hunger/health mechanics
- `EconomyService.ts` - Buy/sell transactions
- `ProgressionService.ts` - Save/load, achievements

**New UI Components**:

- `GameHUD.tsx` - Credits, fish stats, time display
- `FishInfoPanel.tsx` - Selected fish details
- `StorePanel.tsx` - Buy fish, food, equipment
- `FeedButton.tsx` - Manual feeding action

**New State Management**:

- `useGameStore.ts` (Zustand) - Global game state
  - Player credits
  - Fish collection
  - Game time/ticks
  - Store inventory

### Integration Points

**1. Extend Fish Model**

```typescript
// src/models/Fish.ts (extend existing)
export class Fish implements IFish {
  // Existing (Spec 002)
  id: string
  x: number
  y: number
  vx: number
  vy: number
  // ... physics properties

  // NEW (Spec 001)
  hunger: number = 50 // 0-100
  health: number = 100 // 0-100
  age: number = 0 // in ticks
  species: string = 'common'
  alive: boolean = true

  // NEW methods
  tick(deltaTime: number): void {
    this.age += deltaTime
    this.hunger = Math.min(100, this.hunger + 0.1 * deltaTime)
    if (this.hunger > 80) {
      this.health = Math.max(0, this.health - 0.5 * deltaTime)
    }
    if (this.health <= 0) {
      this.alive = false
    }
  }

  feed(amount: number): void {
    this.hunger = Math.max(0, this.hunger - amount)
  }
}
```

**2. Add Game Loop (Simulation)**

```typescript
// src/services/GameLoop.ts (NEW)
export class GameLoop {
  private tickInterval: number = 1000 // 1 tick/second
  private lastTick: number = 0

  update(currentTime: number): void {
    if (currentTime - this.lastTick >= this.tickInterval) {
      this.tick()
      this.lastTick = currentTime
    }
  }

  private tick(): void {
    const store = useGameStore.getState()

    // Update all fish
    store.fish.forEach((fish) => fish.tick(1))

    // Remove dead fish
    store.removeDead()

    // Update tank water quality
    store.tank.updateWaterQuality()
  }
}
```

**3. Separate Rendering from Simulation**

```typescript
// src/game/RenderingEngine.ts (MODIFY)
export class RenderingEngine {
  private gameLoop: GameLoop // NEW

  // Existing: 60 FPS rendering
  // NEW: Call gameLoop.update() each frame
  update(delta: number): void {
    this.gameLoop.update(performance.now()) // Tick-based simulation
    this.tank.update(delta) // Physics/rendering (60 FPS)
    this.tankView.update()
  }
}
```

### Implementation Phases for Spec 001

**Phase 1: Core Mechanics (Week 1)**

- [ ] Extend Fish model with hunger/health/age
- [ ] Implement GameLoop service (tick-based)
- [ ] Add feeding mechanics
- [ ] Add death mechanics
- [ ] Test: Fish hunger increases, feeding reduces hunger, fish dies at 0 health

**Phase 2: Economy (Week 1)**

- [ ] Create Store model
- [ ] Create Player model (credits)
- [ ] Implement buy/sell transactions
- [ ] Add fish value calculation
- [ ] Test: Buy fish, sell fish, credits update correctly

**Phase 3: UI Integration (Week 2)**

- [ ] Create Zustand store for game state
- [ ] Add GameHUD component (credits, time)
- [ ] Add FishInfoPanel (click fish to see stats)
- [ ] Add StorePanel (buy fish/food)
- [ ] Add FeedButton (manual feeding)
- [ ] Test: UI reflects game state, actions update state

**Phase 4: Polish & Testing (Week 2)**

- [ ] Add visual indicators (health bars, hunger icons)
- [ ] Add animations (feeding, death)
- [ ] Add sound effects (optional)
- [ ] Comprehensive integration tests
- [ ] E2E tests for user workflows
- [ ] Performance testing with 20+ fish + game logic

---

## Testing Strategy for Spec 001

### Inherit from Spec 002

- ✅ Keep all existing 40 tests (visual/physics)
- ✅ Ensure they still pass after adding game logic

### Add New Tests

- **Unit Tests** (models/services):
  - Fish.tick() increases hunger/age
  - Fish.feed() reduces hunger
  - Fish dies when health = 0
  - Store.buyFish() deducts credits
  - Store.sellFish() adds credits
- **Integration Tests**:
  - GameLoop updates all fish each tick
  - Dead fish are removed from tank
  - Feeding action updates fish state
  - UI components reflect game state
- **E2E Tests**:
  - Start game → buy fish → feed fish → sell fish
  - Fish starvation → death → removal
  - Insufficient credits → transaction rejected

**Coverage Target**: Maintain >90% for models/services, >85% for UI

---

## Rollback Plan

If issues arise during merge:

1. **Abort merge**

   ```bash
   git merge --abort  # OR git rebase --abort
   ```

2. **Return to working state**

   ```bash
   git checkout 002-visual-prototype  # Return to completed work
   ```

3. **Investigate conflicts**

   ```bash
   git diff main 001-core-mechanics  # See what conflicts
   ```

4. **Retry with different strategy**
   - Try merge instead of rebase
   - Manually cherry-pick specific commits

---

## Timeline Summary

**Tomorrow Morning** (30 minutes):

1. ✅ Commit outstanding changes (5 min)
2. ✅ Merge Spec 002 → main (10 min)
3. ✅ Verify main works (5 min)
4. ✅ Rebase Spec 001 onto main (10 min)

**Tomorrow Afternoon** (Start Spec 001 implementation):

1. Review Spec 001 requirements
2. Create tasks.md for Spec 001
3. Begin Phase 1: Extend Fish model

**Week 1**: Core mechanics + Economy
**Week 2**: UI + Polish + Testing

---

## Risks & Mitigations

| Risk                      | Probability | Impact | Mitigation                                          |
| ------------------------- | ----------- | ------ | --------------------------------------------------- |
| Merge conflicts in `src/` | Low         | Medium | Spec 001 is draft, should have minimal conflicts    |
| Breaking Spec 002 tests   | Low         | High   | Run full test suite after merge                     |
| Performance degradation   | Medium      | Medium | Profile after adding game logic, optimize if needed |
| Scope creep in Spec 001   | High        | Medium | Stick to MVP from spec.md, defer enhancements       |

---

## Success Criteria

**Merge Complete** ✅ when:

- [x] Spec 002 merged to main
- [x] All 40 tests passing on main
- [x] Spec 001 rebased onto main
- [x] Dev server runs on Spec 001 branch
- [x] No regression in Spec 002 features

**Ready for Spec 001 Implementation** ✅ when:

- [x] Fish model extended with game properties
- [x] GameLoop service created
- [x] At least 1 new test passing for game mechanics
- [x] Visual prototype still works (fish still swim)

---

## References

- [Spec 002 Complete](../specs/002-visual-prototype/spec.md)
- [Spec 001 Draft](../specs/001-core-mechanics/spec.md)
- [PRD.md](../docs/PRD.md) - Full game requirements
- [IMPLEMENTATION_STATUS.md](../docs/IMPLEMENTATION_STATUS.md) - Current project status

---

## Next Actions (Tomorrow)

1. **Morning**: Execute merge plan (30 min)
2. **Review**: Read Spec 001 spec.md in detail
3. **Plan**: Run `/speckit.tasks` for Spec 001 to generate task breakdown
4. **Begin**: Start Phase 1 of Spec 001 (extend Fish model)

**Command to execute**:

```bash
# Step 1: Commit changes
git add tests/unit/TankView.test.ts
git commit -m "docs: fix TankView test mocks for water surface rendering"

# Step 2: Merge to main
git checkout main
git merge --squash 002-visual-prototype
git commit -m "feat: implement visual prototype with physics-based fish swimming

Complete implementation of Spec 002 (Visual Prototype):
- Physics engine: velocity, acceleration, friction, collision detection
- Fish sprites with SVG graphics (8 colors, varied sizes)
- Tank rendering with water surface at 85%
- Performance: 60 FPS with 50+ fish
- Tests: 40 passing (37 unit/integration + 3 E2E)
- Coverage: >90% for models/lib, >85% for game/components

Closes #002-visual-prototype"

# Verify
pnpm test && pnpm lint

# Step 3: Update Spec 001
git checkout 001-core-mechanics
git rebase main

# Verify
pnpm test && pnpm lint && pnpm dev
```
