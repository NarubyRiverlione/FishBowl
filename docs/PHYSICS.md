# FishBowl Physics Engine

Technical documentation for the custom physics implementation used in FishBowl's swimming simulation.

## Core Physics Formulas

### Velocity Update (with friction)

```
v' = v + a
v' = v' * (1 - friction)
```

- `v`: current velocity vector
- `a`: acceleration vector
- `friction`: drag coefficient (0.005 for water resistance)

### Acceleration (Newton's Second Law)

```
a = F / m
```

- `F`: applied force vector
- `m`: fish mass (proportional to size/scale)

## Collision Detection

### Fish-to-Fish (Circle Collision)

Fish are treated as circles for collision detection:

```
distance = sqrt((x1 - x2)² + (y1 - y2)²)
collision = distance < (r1 + r2)
```

Where:

- `(x1, y1)`, `(x2, y2)`: fish center positions
- `r1`, `r2`: fish radii (derived from sprite size)

**Implementation**:

```typescript
// src/services/physics/CollisionService.ts
static checkFishCollision(fish1: IFish, fish2: IFish): boolean {
  const dx = fish1.position.x - fish2.position.x
  const dy = fish1.position.y - fish2.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const minDistance = fish1.radius + fish2.radius
  return distance < minDistance
}
```

**Complexity**: O(n²) for n fish

- 20 fish = 190 collision checks per frame
- 50 fish = 1,225 collision checks per frame
- 100+ fish = spatial hashing recommended (not yet implemented)

### Boundary Collision

Fish collide with:

- **Tank walls** (left, right, bottom)
- **Water surface** (at 85% tank height, open top)

Detection:

```
leftWall:    x - radius < 0
rightWall:   x + radius > tankWidth
bottom:      y + radius > tankHeight
surface:     y - radius < waterSurfaceY
```

## Collision Response

### Elastic Bounce (Conservation of Momentum)

When two fish collide, their velocities are updated based on mass and momentum:

```
v1' = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
v2' = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
```

Where:

- `m1`, `m2`: fish masses
- `v1`, `v2`: velocities before collision
- `v1'`, `v2'`: velocities after collision

**Coefficient of restitution**: 0.8 (slight energy loss, prevents infinite bouncing)

**Implementation**:

```typescript
// src/services/physics/CollisionService.ts
static resolveFishCollision(fish1: IFish, fish2: IFish): void {
  // Calculate collision normal
  const dx = fish2.position.x - fish1.position.x
  const dy = fish2.position.y - fish1.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  const nx = dx / distance  // normalized collision vector
  const ny = dy / distance

  // Relative velocity along collision normal
  const dvx = fish2.velocity.x - fish1.velocity.x
  const dvy = fish2.velocity.y - fish1.velocity.y
  const dvn = dvx * nx + dvy * ny

  // Don't resolve if velocities are separating
  if (dvn > 0) return

  // Calculate impulse scalar
  const restitution = 0.8
  const impulse = (-(1 + restitution) * dvn) / (1 / fish1.mass + 1 / fish2.mass)

  // Apply impulse
  fish1.velocity.x -= (impulse * nx) / fish1.mass
  fish1.velocity.y -= (impulse * ny) / fish1.mass
  fish2.velocity.x += (impulse * nx) / fish2.mass
  fish2.velocity.y += (impulse * ny) / fish2.mass

  // Separate fish to prevent overlap
  const overlap = fish1.radius + fish2.radius - distance
  const separationX = (nx * overlap) / 2
  const separationY = (ny * overlap) / 2

  fish1.position.x -= separationX
  fish1.position.y -= separationY
  fish2.position.x += separationX
  fish2.position.y += separationY
}
```

### Wall Bounce

Simple velocity reversal with energy loss:

```
v' = -v * restitution
```

**Implementation**:

```typescript
// src/models/Fish.ts
if (this.position.x - this.radius < 0 || this.position.x + this.radius > tankWidth) {
  this.velocity.x *= -0.8 // reverse + damping
}
if (this.position.y - this.radius < waterSurface || this.position.y + this.radius > tankHeight) {
  this.velocity.y *= -0.8
}
```

## Swimming Behavior

Fish maintain autonomous movement through three mechanisms:

### 1. Random Direction Changes

- **Probability**: 0.5% per frame (~30% chance per second at 60 FPS)
- **Force**: Lateral force applied perpendicular to current velocity
- **Effect**: Creates natural turning behavior

```typescript
// src/models/Fish.ts
if (Math.random() < 0.005) {
  const turnForce = Math.random() * 0.2 - 0.1 // -0.1 to +0.1
  this.acceleration.x += turnForce
}
```

### 2. Speed Boost

When fish slow down too much, apply forward thrust:

- **Threshold**: velocity magnitude < 1 px/frame
- **Boost**: 0.5 px/frame² forward acceleration

```typescript
const speed = Math.sqrt(vx * vx + vy * vy)
if (speed < 1.0) {
  const angle = Math.atan2(vy, vx)
  this.acceleration.x += Math.cos(angle) * 0.5
  this.acceleration.y += Math.sin(angle) * 0.5
}
```

### 3. Natural Gliding

Low friction (0.005) allows fish to coast smoothly:

- Maintains momentum between active swimming movements
- Simulates water's lower drag compared to air
- Creates fluid, realistic motion

## Performance Characteristics

### Target Performance

- **FPS**: 60 frames per second
- **Fish Count**: 50+ fish without degradation
- **Collision Checks**: 1,225/frame at 50 fish (O(n²))

### Measured Performance

- **20 fish**: 60 FPS stable ✅
- **50 fish**: 60 FPS stable ✅
- **100 fish**: Frame drops to ~45 FPS (collision bottleneck)

### Optimization Strategies

**Current** (MVP implementation):

- Brute-force O(n²) collision detection
- Simple circle-circle tests
- No spatial partitioning

**Future** (for 100+ fish):

- **Spatial Hashing**: Divide tank into grid cells, only check fish in adjacent cells
  - Reduces complexity to O(n) in practice
  - Implementation: `src/lib/spatialHash.ts` (planned)
- **Quadtree**: Hierarchical spatial partitioning
  - Better for non-uniform distributions
- **Broad Phase / Narrow Phase**: AABB bounding boxes before circle tests

## Physics Constants

Defined in `src/lib/constants.ts`:

```typescript
export const PHYSICS = {
  FRICTION: 0.005, // Water drag coefficient
  RESTITUTION: 0.8, // Bounciness (0 = no bounce, 1 = perfect elastic)
  TURN_CHANCE: 0.005, // Probability of direction change per frame
  TURN_FORCE: 0.1, // Maximum lateral force for turning
  BOOST_THRESHOLD: 1.0, // Speed threshold for applying boost
  BOOST_FORCE: 0.5, // Forward acceleration when slow
  WATER_SURFACE_Y: 0.85, // Water surface at 85% tank height
}
```

## References

- [src/services/physics/PhysicsService.ts](../src/services/physics/PhysicsService.ts) - Physics update loop
- [src/services/physics/CollisionService.ts](../src/services/physics/CollisionService.ts) - Collision detection and response
- [src/models/Fish.ts](../src/models/Fish.ts) - Fish entity with physics state
- [src/lib/constants.ts](../src/lib/constants.ts) - Physics constants

## Further Reading

- [Elastic Collision (Wikipedia)](https://en.wikipedia.org/wiki/Elastic_collision)
- [2D Physics Engine Tutorial](https://www.toptal.com/game/video-game-physics-part-i-an-introduction-to-rigid-body-dynamics)
- [Spatial Hashing for Game Physics](https://gameprogrammingpatterns.com/spatial-partition.html)
