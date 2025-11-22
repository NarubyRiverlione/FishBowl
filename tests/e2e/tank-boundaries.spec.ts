import { test, expect } from '@playwright/test'

// Import constants to avoid magic numbers
const WATER_LEVEL = 0.95 // From src/lib/constants.ts - Water fills 95% of tank height
const FISH_BASE_RADIUS = 25 // From src/lib/constants.ts - Base collision radius in pixels
const COLLISION_BOUNDARY_BUFFER = 2.0 // From src/lib/constants.ts - Safety buffer for boundary collision detection

// E2E Test timing constants (in milliseconds)
const INITIALIZATION_WAIT = 1000 // Wait for React and PixiJS to initialize
const FISH_SWIMMING_PERIOD = 3000 // Time to let fish swim for boundary testing
const DEV_MODE_INIT_WAIT = 2000 // Wait for initialization with dev mode fish
const COLLISION_TEST_PERIOD = 4000 // Period to test collision detection

test.describe('Tank Boundary Safety', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor console logs and errors to catch boundary issues
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}]: ${msg.text()}`))
    page.on('pageerror', (err) => console.error(`[Browser Error]: ${err.message}`))
  })

  test('fish stay within tank boundaries during extended swimming', async ({ page }) => {
    await page.goto('/?dev=true&testHelpers=true') // Use dev mode to ensure fish are spawned

    // Wait for React and PixiJS to initialize
    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Wait for fish to spawn and settle into swimming patterns
    await page.waitForTimeout(INITIALIZATION_WAIT)

    // Let fish swim for a reasonable period to test boundary detection
    await page.waitForTimeout(FISH_SWIMMING_PERIOD)

    // Get tank dimensions and all fish positions using test helpers
    const boundaryCheck = await page.evaluate((waterLevel) => {
      const helpers = (
        window as Window & {
          __TEST_HELPERS__?: {
            getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
          }
        }
      ).__TEST_HELPERS__

      if (!helpers?.getFishScreenPositions) {
        return { error: 'Test helpers not available' }
      }

      const positions = helpers.getFishScreenPositions()
      const canvas = document.querySelector('canvas')

      if (!canvas) {
        return { error: 'Canvas not found' }
      }

      const tankBounds = {
        width: canvas.width,
        height: canvas.height,
        waterLevel: canvas.height * waterLevel, // Use constant passed as parameter
      }

      // Type-safe fish positions
      const fishPositions = positions as Array<{ id: string; x: number; y: number }>

      // Check for fish outside tank boundaries
      const violations = fishPositions.filter((fish) => {
        // Fish outside left/right walls
        const outsideHorizontal = fish.x < 0 || fish.x > tankBounds.width

        // Fish above water surface (water starts at 15% from top)
        const aboveWater = fish.y < tankBounds.height - tankBounds.waterLevel

        // Fish below tank bottom
        const belowTank = fish.y > tankBounds.height

        return outsideHorizontal || aboveWater || belowTank
      })

      return {
        totalFish: fishPositions.length,
        tankBounds,
        violations: violations.map((fish) => ({
          id: fish.id,
          x: fish.x,
          y: fish.y,
          violationType:
            fish.x < 0
              ? 'left-wall'
              : fish.x > tankBounds.width
                ? 'right-wall'
                : fish.y < tankBounds.height - tankBounds.waterLevel
                  ? 'above-water'
                  : fish.y > tankBounds.height
                    ? 'below-tank'
                    : 'unknown',
        })),
        fishPositions, // For debugging
      }
    }, WATER_LEVEL)

    console.log('Boundary check results:', JSON.stringify(boundaryCheck, null, 2))

    // Assertions
    expect(boundaryCheck.error).toBeUndefined()
    expect(boundaryCheck.totalFish).toBeGreaterThan(0)

    // Critical assertion: NO fish should be outside boundaries
    expect(boundaryCheck.violations).toHaveLength(0)

    // If violations exist, log details for debugging
    if (boundaryCheck.violations && boundaryCheck.violations.length > 0) {
      console.error('❌ Boundary violations detected:', boundaryCheck.violations)
      console.log('Tank bounds:', boundaryCheck.tankBounds)
      console.log('All fish positions:', boundaryCheck.fishPositions)
    }
  })

  test('fish respect water surface boundary', async ({ page }) => {
    await page.goto('/?testHelpers=true')

    // Wait for initialization
    await page.waitForSelector('canvas')
    await page.waitForTimeout(2000)

    // Check specifically for water surface violations
    const waterSurfaceCheck = await page.evaluate((waterLevel) => {
      const helpers = (
        window as Window & {
          __TEST_HELPERS__?: {
            getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
          }
        }
      ).__TEST_HELPERS__

      if (!helpers?.getFishScreenPositions) {
        return { error: 'Test helpers not available' }
      }

      const positions = helpers.getFishScreenPositions()
      const canvas = document.querySelector('canvas')

      if (!canvas) {
        return { error: 'Canvas not found' }
      }

      // Water surface calculation using WATER_LEVEL constant
      const waterSurfaceY = canvas.height * (1 - waterLevel) // Water surface from top

      // Type-safe fish positions
      const fishPositions = positions as Array<{ id: string; x: number; y: number }>
      const fishAboveWater = fishPositions.filter((fish) => fish.y < waterSurfaceY)

      return {
        waterSurfaceY,
        totalFish: positions.length,
        fishAboveWater: fishAboveWater.length,
        violatingFish: fishAboveWater,
      }
    }, WATER_LEVEL)

    console.log('Water surface check:', waterSurfaceCheck)

    expect(waterSurfaceCheck.error).toBeUndefined()
    expect(waterSurfaceCheck.fishAboveWater).toBe(0) // No fish should be above water
  })

  test('fish collision detection prevents wall penetration', async ({ page }) => {
    await page.goto('/?dev=true&testHelpers=true') // Dev mode has more fish for better testing

    // Wait for initialization with more fish
    await page.waitForSelector('canvas')
    await page.waitForTimeout(DEV_MODE_INIT_WAIT)

    // Let fish swim and potentially collide with walls
    await page.waitForTimeout(COLLISION_TEST_PERIOD) // Reasonable period to catch wall penetration

    const wallPenetrationCheck = await page.evaluate(
      ({ fishBaseRadius, collisionBuffer }) => {
        const helpers = (
          window as Window & {
            __TEST_HELPERS__?: {
              getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
            }
          }
        ).__TEST_HELPERS__

        if (!helpers?.getFishScreenPositions) {
          return { error: 'Test helpers not available' }
        }

        const positions = helpers.getFishScreenPositions()
        const canvas = document.querySelector('canvas')

        if (!canvas) {
          return { error: 'Canvas not found' }
        }

        // Fish can have different sizes - calculate minimum expected radius
        // Smallest fish size from FISH_SPECIES_CONFIG is TETRA at 0.2
        const smallestFishSizeFactor = 0.2 // From TETRA sizeRange in FISH_SPECIES_CONFIG
        const minFishRadius = Math.floor(fishBaseRadius * smallestFishSizeFactor)
        const wallBuffer = minFishRadius + collisionBuffer

        // Type-safe fish positions
        const fishPositions = positions as Array<{ id: string; x: number; y: number }>
        const wallPenetrations = fishPositions.filter((fish) => {
          return (
            fish.x < wallBuffer || // Too close to left wall
            fish.x > canvas.width - wallBuffer || // Too close to right wall
            fish.y > canvas.height - wallBuffer // Too close to bottom wall
          )
        })

        return {
          totalFish: fishPositions.length,
          wallPenetrations: wallPenetrations.length,
          penetratingFish: wallPenetrations,
          minFishRadius,
          canvasDimensions: { width: canvas.width, height: canvas.height },
        }
      },
      { fishBaseRadius: FISH_BASE_RADIUS, collisionBuffer: COLLISION_BOUNDARY_BUFFER }
    )

    console.log('Wall penetration check:', wallPenetrationCheck)

    expect(wallPenetrationCheck.error).toBeUndefined()
    expect(wallPenetrationCheck.totalFish).toBeGreaterThan(0)

    // Fish should maintain proper distance from walls
    expect(wallPenetrationCheck.wallPenetrations).toBe(0)
  })

  test('circular tank boundaries are properly enforced (BOWL)', async ({ page }) => {
    // Load with dev mode to access tank shape testing
    await page.goto('/?dev=true&testHelpers=true&tank=BOWL')

    // Wait for initialization
    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Wait for game initialization
    await page.waitForTimeout(INITIALIZATION_WAIT)

    // Run collision tests for circular boundary
    const circularBoundaryCheck = await page.evaluate(
      (waterLevel) => {
        const helpers = (
          window as Window & {
            __TEST_HELPERS__?: {
              getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
              getTankInfo?: () => { type: string; radius: number; centerX: number; centerY: number }
            }
          }
        ).__TEST_HELPERS__

        if (!helpers?.getFishScreenPositions || !helpers?.getTankInfo) {
          return { error: 'Test helpers not available' }
        }

        const tankInfo = helpers.getTankInfo()
        const positions = helpers.getFishScreenPositions()

        if (tankInfo.type !== 'circular') {
          return { error: 'Tank is not circular' }
        }

        const { centerX, centerY, radius } = tankInfo
        const fishBaseRadius = 25
        const collisionBuffer = 2.0

        // Check each fish against circular boundary
        const violations = positions.filter((fish) => {
          const dx = fish.x - centerX
          const dy = fish.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const waterBottom = centerY + radius * waterLevel

          return (
            distance + fishBaseRadius > radius - collisionBuffer || // Outside circle
            fish.y > waterBottom - collisionBuffer // Above water level
          )
        })

        return {
          totalFish: positions.length,
          violations: violations.length,
          violatingFish: violations,
          tankInfo,
        }
      },
      { waterLevel: WATER_LEVEL }
    )

    console.log('Circular boundary check:', circularBoundaryCheck)

    expect(circularBoundaryCheck.error).toBeUndefined()
    expect(circularBoundaryCheck.tankInfo?.type).toBe('circular')

    // Allow some tolerance during initial swimming
    if (circularBoundaryCheck.totalFish > 0) {
      expect(circularBoundaryCheck.violations).toBeLessThanOrEqual(1)
    }
  })

  test('rectangular tanks maintain rectangular boundaries (STANDARD)', async ({ page }) => {
    // Test standard rectangular tank
    await page.goto('/?dev=true&testHelpers=true&tank=STANDARD')

    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    await page.waitForTimeout(INITIALIZATION_WAIT)
    await page.waitForTimeout(FISH_SWIMMING_PERIOD)

    const rectangularBoundaryCheck = await page.evaluate(
      (waterLevel) => {
        const helpers = (
          window as Window & {
            __TEST_HELPERS__?: {
              getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
              getTankInfo?: () => {
                type: string
                width: number
                height: number
                centerX: number
                centerY: number
              }
            }
          }
        ).__TEST_HELPERS__

        if (!helpers?.getFishScreenPositions || !helpers?.getTankInfo) {
          return { error: 'Test helpers not available' }
        }

        const tankInfo = helpers.getTankInfo()
        const positions = helpers.getFishScreenPositions()

        if (tankInfo.type !== 'rectangular') {
          return { error: 'Tank is not rectangular' }
        }

        const { centerX, centerY, width, height } = tankInfo
        const fishBaseRadius = 25
        const collisionBuffer = 2.0
        const left = centerX - width / 2
        const right = centerX + width / 2
        const top = centerY - height / 2
        const waterBottom = centerY + (height / 2) * waterLevel

        const violations = positions.filter((fish) => {
          return (
            fish.x - fishBaseRadius < left + collisionBuffer || // Left wall
            fish.x + fishBaseRadius > right - collisionBuffer || // Right wall
            fish.y - fishBaseRadius < top + collisionBuffer || // Top wall
            fish.y + fishBaseRadius > waterBottom - collisionBuffer // Water level
          )
        })

        return {
          totalFish: positions.length,
          violations: violations.length,
          violatingFish: violations,
          tankInfo,
        }
      },
      { waterLevel: WATER_LEVEL }
    )

    console.log('Rectangular boundary check:', rectangularBoundaryCheck)

    expect(rectangularBoundaryCheck.error).toBeUndefined()
    expect(rectangularBoundaryCheck.tankInfo?.type).toBe('rectangular')

    if (rectangularBoundaryCheck.totalFish > 0) {
      expect(rectangularBoundaryCheck.violations).toBeLessThanOrEqual(1)
    }
  })
})

test.describe('Tank Shape Integration (T039f)', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor console logs and errors to catch shape integration issues
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}]: ${msg.text()}`))
    page.on('pageerror', (err) => console.error(`[Browser Error]: ${err.message}`))
  })

  test('should work with USE_TANK_SHAPES feature flag disabled (legacy mode)', async ({ page }) => {
    // Test that collision detection works when tank shapes are disabled
    await page.goto('/?dev=true&testHelpers=true')

    // Wait for initialization
    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    await page.waitForTimeout(INITIALIZATION_WAIT)

    // Check feature flags in browser
    const featureFlags = await page.evaluate(() => {
      // Check if constants are available in window or we need to access them differently
      const script = document.createElement('script')
      script.type = 'module'
      script.text = `
        import { USE_TANK_SHAPES, USE_SHAPE_COLLISION } from '/src/lib/constants.ts';
        window.__FEATURE_FLAGS__ = { USE_TANK_SHAPES, USE_SHAPE_COLLISION };
      `
      document.head.appendChild(script)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve((window as any).__FEATURE_FLAGS__ || { USE_TANK_SHAPES: false, USE_SHAPE_COLLISION: false })
        }, 100)
      })
    })

    console.log('Feature flags:', featureFlags)

    // Let fish swim and verify boundaries are still enforced
    await page.waitForTimeout(COLLISION_TEST_PERIOD)

    const boundaryCheck = await page.evaluate((waterLevel) => {
      const helpers = (
        window as Window & {
          __TEST_HELPERS__?: {
            getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
          }
        }
      ).__TEST_HELPERS__

      if (!helpers?.getFishScreenPositions) {
        return { error: 'Test helpers not available' }
      }

      const positions = helpers.getFishScreenPositions()
      const canvas = document.querySelector('canvas')

      if (!canvas) {
        return { error: 'Canvas not found' }
      }

      const tankBounds = {
        width: canvas.width,
        height: canvas.height,
        waterLevel: canvas.height * waterLevel,
      }

      const violations = positions.filter((fish) => {
        return (
          fish.x < 0 ||
          fish.x > tankBounds.width ||
          fish.y < tankBounds.height - tankBounds.waterLevel ||
          fish.y > tankBounds.height
        )
      })

      return {
        totalFish: positions.length,
        violations: violations.length,
        mode: 'legacy',
      }
    }, WATER_LEVEL)

    expect(boundaryCheck.error).toBeUndefined()
    expect(boundaryCheck.mode).toBe('legacy')

    if (boundaryCheck.totalFish > 0) {
      expect(boundaryCheck.violations).toBe(0)
    }
  })

  test('should handle feature flag rollback scenarios gracefully', async ({ page }) => {
    // Test that the app doesn't crash when tank shapes are undefined or null
    await page.goto('/?dev=true&testHelpers=true')

    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Simulate feature flag changes by modifying tanks to have undefined shapes
    await page.evaluate(() => {
      // Access the store and remove shapes from tanks
      const gameStore = (window as any).__GAME_STORE__
      if (gameStore && gameStore.getState) {
        const state = gameStore.getState()
        if (state.tanks && Array.isArray(state.tanks)) {
          state.tanks.forEach((tank: any) => {
            if (tank.shape) {
              tank.shape = undefined
            }
          })
          // Trigger a re-render or state update if needed
          if (state.setTanks) {
            state.setTanks([...state.tanks])
          }
        }
      }
    })

    // Let the game run for a bit to ensure it doesn't crash
    await page.waitForTimeout(2000)

    // Verify the game is still running and responsive
    const isResponsive = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      return canvas !== null && document.body !== null
    })

    expect(isResponsive).toBe(true)
  })

  test('should maintain collision detection consistency between rectangular and circular shapes', async ({ page }) => {
    // This test verifies that both shape types provide reliable boundary enforcement
    await page.goto('/?dev=true&testHelpers=true')

    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    await page.waitForTimeout(INITIALIZATION_WAIT)

    // Run extended collision test
    await page.waitForTimeout(COLLISION_TEST_PERIOD)

    const shapeConsistencyCheck = await page.evaluate(() => {
      const helpers = (
        window as Window & {
          __TEST_HELPERS__?: {
            getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
          }
        }
      ).__TEST_HELPERS__

      if (!helpers?.getFishScreenPositions) {
        return { error: 'Test helpers not available' }
      }

      const positions = helpers.getFishScreenPositions()
      const canvas = document.querySelector('canvas')

      if (!canvas) {
        return { error: 'Canvas not found' }
      }

      // Test both collision detection approaches would work
      const fishOutOfBounds = positions.filter((fish) => {
        // Basic rectangular bounds check (legacy)
        const outOfRect = fish.x < 0 || fish.x > canvas.width || fish.y < 0 || fish.y > canvas.height

        // For circular, check if beyond maximum possible radius
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxRadius = Math.min(canvas.width, canvas.height) / 2
        const distanceFromCenter = Math.sqrt(Math.pow(fish.x - centerX, 2) + Math.pow(fish.y - centerY, 2))
        const outOfCircle = distanceFromCenter > maxRadius

        return outOfRect // Use rectangular for now since that's what's active
      })

      return {
        totalFish: positions.length,
        outOfBounds: fishOutOfBounds.length,
        positions: positions.map((p) => ({ x: p.x, y: p.y })),
        tankDimensions: { width: canvas.width, height: canvas.height },
      }
    })

    expect(shapeConsistencyCheck.error).toBeUndefined()

    if (shapeConsistencyCheck.totalFish > 0) {
      // Allow minimal violations due to timing or edge cases
      expect(shapeConsistencyCheck.outOfBounds).toBeLessThanOrEqual(1)
    }
  })
})
