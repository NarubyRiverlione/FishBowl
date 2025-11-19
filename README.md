# FishBowl

A web-based fish breeding simulation game built with React, Pixi.js, and TypeScript.

## Tech Stack

- **Runtime**: React 19 + Vite 7
- **Language**: TypeScript 5.9 (Strict Mode)
- **Game Engine**: Pixi.js 8
- **State Management**: Zustand
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm

### Installation

```bash
pnpm install
```

### Development Commands

- **Start Dev Server**:
  ```bash
  pnpm dev
  ```
- **Run Tests**:
  ```bash
  pnpm test
  ```
- **Lint Code**:
  ```bash
  pnpm lint
  ```
- **Format Code**:
  ```bash
  pnpm format
  ```
- **Build for Production**:
  ```bash
  pnpm build
  ```

## Project Structure

```
src/
├── types/       # Shared interfaces
├── models/      # Domain entities (Pure logic)
├── services/    # Business logic
├── store/       # Global state (Zustand)
├── components/  # React UI components
├── game/        # Pixi.js rendering logic
└── lib/         # Utilities
```

## Governance

This project follows a strict constitution defined in `.specify/memory/constitution.md`.
Key principles:

1.  **Feature-Centric Architecture**
2.  **Test-First (TDD)**
3.  **Type Safety**
4.  **Separation of Concerns**
5.  **Continuous Quality**
