# Performance Testing

This directory contains performance testing resources for FishBowl.

## Current Tests

- `tests/integration/performance.test.ts`: Stress tests for rendering engine and physics loop.
  - Checks FPS with 20 and 50 fish.
  - Verifies collision check counts.

## Running Tests

Run all tests including performance tests:

```bash
pnpm test
```

To run only performance tests:

```bash
pnpm test tests/integration/performance.test.ts
```

## Future Work

- Add browser-based performance profiling using Puppeteer/Playwright.
- Add memory leak detection.
