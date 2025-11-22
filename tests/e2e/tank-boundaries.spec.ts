import { test, expect } from '@playwright/test'

test.describe('Tank Boundary Safety', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor console logs and errors to catch boundary issues
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}]: ${msg.text()}`))
    page.on('pageerror', (err) => console.error(`[Browser Error]: ${err.message}`))
  })

  test('fish stay within tank boundaries during extended swimming', async ({ page }) => {
    await page.goto('/?testHelpers=true')

    // Wait for React and PixiJS to initialize
    await page.waitForSelector('#root > div')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Wait for fish to spawn and settle into swimming patterns
    await page.waitForTimeout(1000)

    // Let fish swim for a reasonable period to test boundary detection
    await page.waitForTimeout(3000)

    // Get tank dimensions and all fish positions using test helpers
    const boundaryCheck = await page.evaluate(() => {
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
        waterLevel: canvas.height * 0.85, // 85% water level from constants
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
    })

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
    const waterSurfaceCheck = await page.evaluate(() => {
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

      // Water surface calculation (85% tank height from bottom)
      const waterSurfaceY = canvas.height * 0.15 // 15% from top = water surface

      // Type-safe fish positions
      const fishPositions = positions as Array<{ id: string; x: number; y: number }>
      const fishAboveWater = fishPositions.filter((fish) => fish.y < waterSurfaceY)

      return {
        waterSurfaceY,
        totalFish: positions.length,
        fishAboveWater: fishAboveWater.length,
        violatingFish: fishAboveWater,
      }
    })

    console.log('Water surface check:', waterSurfaceCheck)

    expect(waterSurfaceCheck.error).toBeUndefined()
    expect(waterSurfaceCheck.fishAboveWater).toBe(0) // No fish should be above water
  })

  test('fish collision detection prevents wall penetration', async ({ page }) => {
    await page.goto('/?dev=true&testHelpers=true') // Dev mode has more fish for better testing

    // Wait for initialization with more fish
    await page.waitForSelector('canvas')
    await page.waitForTimeout(2000)

    // Let fish swim and potentially collide with walls
    await page.waitForTimeout(4000) // Reasonable period to catch wall penetration

    const wallPenetrationCheck = await page.evaluate(() => {
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

      // Assume fish have ~24px radius (from constants), so they should stay at least that far from walls
      const fishRadius = 24
      const wallBuffer = fishRadius + 5 // Small buffer for floating point precision

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
        fishRadius,
        canvasDimensions: { width: canvas.width, height: canvas.height },
      }
    })

    console.log('Wall penetration check:', wallPenetrationCheck)

    expect(wallPenetrationCheck.error).toBeUndefined()
    expect(wallPenetrationCheck.totalFish).toBeGreaterThan(0)

    // Fish should maintain proper distance from walls
    expect(wallPenetrationCheck.wallPenetrations).toBe(0)
  })
})
