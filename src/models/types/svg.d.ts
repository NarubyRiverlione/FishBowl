/**
 * Module declaration for SVG imports.
 *
 * Purpose: allow importing SVG assets in TypeScript code as a `string` (URL
 * or data URI) so `import svgUrl from './fish.svg'` type-checks correctly.
 *
 * Rationale: TypeScript doesn't know about non-code assets by default. Without
 * this declaration, the compiler will produce "Cannot find module '*.svg'"
 * errors. Keeping this file minimal (exporting a `string`) matches how Vite
 * and most bundlers emit asset imports by default.
 *
 * Note: If you later decide to use SVGR (import SVGs as React components),
 * update this declaration to also export a `ReactComponent` and configure SVGR
 * in the bundler. Example shape:
 *
 * declare module '*.svg' {
 *   import * as React from 'react'
 *   export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
 *   const src: string
 *   export default src
 * }
 */
declare module '*.svg' {
  const content: string
  export default content
}
