/**
 * Generates a random hex color string.
 * @returns Hex color string (e.g., "#FF5733")
 */
export const randomColor = (): string => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Generates a random scale factor between min and max.
 * @param min Minimum scale
 * @param max Maximum scale
 * @returns Random scale factor
 */
export const randomSize = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

/**
 * Generates a random velocity component between -max and max.
 * @param maxSpeed Maximum speed
 * @returns Random velocity
 */
export const randomVelocity = (maxSpeed: number): number => {
  return (Math.random() * 2 - 1) * maxSpeed
}

/**
 * Generates a random position within bounds.
 * @param min Minimum position
 * @param max Maximum position
 * @returns Random position
 */
export const randomPosition = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}
