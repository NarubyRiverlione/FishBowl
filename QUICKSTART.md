# FishBowl - Quick Start Guide

A web-based fish breeding simulation game featuring realistic physics-based swimming behavior and complete game mechanics.

## Prerequisites

- **Node.js**: v20+ recommended
- **pnpm**: v8+ (install via `npm install -g pnpm`)

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

### Run Development Server

```bash
pnpm dev
```

The application will be available at **http://localhost:5173**

**Expected Output**: You should see a fully functional fish breeding game with:

**Visual Elements**:

- Aquarium tank with fish swimming with realistic physics
- Fish with varied colors (8 distinct colors) and sizes
- HUD showing credits, tank status, fish count
- Store menu for buying fish, food, and equipment
- Performance overlay (FPS: 60, collision stats)

**Game Mechanics**:

- Start with 50 credits and a BOWL tank (capacity: 2)
- Buy fish (50 credits), feed them (cost varies), clean tank (10 credits)
- Fish age over time, get hungry, and need care
- Water quality degrades and affects fish health
- Upgrade to STANDARD tank (75 credits) for more capacity and filters
- Click fish to select and view stats, sell for profit

**Developer Mode**: Add `?dev=true` to URL for 1000 credits, STANDARD tank, and 12 pre-spawned fish.

### Console Output

The browser console logs performance metrics:

```
FPS: 60.0 | Fish: 12 | Checks: 66 | Collisions: 0
```

- **FPS**: Frames per second (target: 60)
- **Fish**: Number of active fish
- **Checks**: Collision detection checks performed
- **Collisions**: Boundary collisions resolved

## Testing

### Run Unit & Integration Tests

```bash
pnpm test
```

**Expected**: 197 passing, 5 failing (42 unit/integration files) - test suite under refinement

### Run E2E Tests (Playwright)

```bash
pnpm test:e2e         # Line reporter (CI-friendly)
pnpm test:e2e:html    # HTML report with debugging info
```

**Expected**: 36 E2E tests passing covering:

- Tank boundary physics and collision detection
- Fish clicking and selection UI
- Core game mechanics (buy → feed → tick → sell)
- Multi-tank functionality
- Water quality and cleaning systems

### Run Tests with Coverage

```bash
pnpm test:coverage
```

**Coverage Targets** (Current Status):

- **Statements**: 89.22% ✅ (Target: 85%+)
- **Lines**: 92.20% ✅ (Target: 90%+)
- **Functions**: 83.89% ✅ (Target: 80%+)
- **Branches**: 70.99% ✅ (Target: 70%+)

**Key Areas**:

- **Physics/Collision**: 98%+ coverage with comprehensive boundary testing
- **Game Logic**: 90%+ coverage across all services and stores
- **Models**: 100% coverage for core domain entities
- **E2E Coverage**: All critical user flows tested end-to-end

## Building for Production

```bash
pnpm build
```

Outputs optimized files to `dist/` directory.

## Code Quality

### Linting & Formatting

```bash
# Run linter and formatter
pnpm lint

# Check formatting only
pnpm format:check

# Type checking
pnpm typecheck
```

## Project Structure

```
src/
├── types/         # TypeScript interfaces (IFish, ITank)
├── models/        # Domain logic (Fish, Tank)
├── lib/           # Utilities (physics, collision, random)
├── game/          # Pixi.js rendering (FishSprite, TankView, RenderingEngine)
├── components/    # React UI (AquariumCanvas wrapper)
└── assets/        # SVG graphics (fish.svg)
```

## Key Features Implemented

### ✅ **Visual Prototype** (Complete)

- **Physics-Based Movement**: Velocity, acceleration, friction, and mass
- **Collision Detection**: Comprehensive boundary collision system with 2px safety buffer
- **Visual Variety**: 8 distinct colors and varied fish sizes with life stage progression
- **Performance**: 60 FPS with 50+ fish and full collision detection
- **SVG Graphics**: Detailed fish sprites with realistic rendering

### ✅ **Core Game Mechanics** (MVP Complete)

- **Fish Management**: Buy, feed, clean tank, upgrade tanks, sell fish
- **Economics**: Credits system, fish valuation, equipment costs
- **Lifecycle**: Fish aging, hunger, health, death, life stage visuals
- **Water Quality**: Pollution system, cleaning, filters
- **Tank Progression**: BOWL → STANDARD upgrade path
- **Multi-Tank Support**: Up to 3 tanks with independent management
- **UI/UX**: Full HUD, store menu, fish info panels, developer mode

### 🔧 **Technical Excellence**

- **Testing**: 127 tests (35 unit + 10 E2E) with 89% statement coverage
- **Type Safety**: TypeScript strict mode, zero `any` types
- **Architecture**: Constants-based design, TDD approach
- **Performance**: Real-time physics with boundary enforcement
- **Quality**: Zero linting errors, comprehensive collision system

## Troubleshooting

### Fish Not Visible

- Check browser console for errors
- Ensure Pixi.js loaded successfully (check network tab)
- Try clearing browser cache

### Low FPS

- Reduce number of fish in `src/game/RenderingEngine.ts`
- Check CPU usage (collision detection is O(n²))

### Tests Failing

- Run `pnpm install` to ensure dependencies are up to date
- Check Node.js version (requires v18+)

## Next Steps

- **Breeding System**: Implement fish genetics and reproduction
- **Economy**: Add currency and fish trading
- **User Input**: Click to add/remove fish
- **Persistence**: Save game state to localStorage

## License

See LICENSE file for details.
