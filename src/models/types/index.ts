// Domain types for the FishBowl game - Re-exports from specific files
// This file only re-exports, no definitions

// Common utility types
export type UUID = string
export type Timestamp = number
export type Credits = number

// Re-export fish-related types
export * from './fish'

// Re-export tank-related types
export * from './tank'

// Re-export game state types
export * from './game'

// Re-export store types
export * from './storeItem'

// Re-export floor types
export * from './floor'
