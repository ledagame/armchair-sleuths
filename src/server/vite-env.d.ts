/// <reference types="vite/client" />

/**
 * TypeScript declarations for Vite raw imports
 * Enables importing .md files as strings at build time
 */

declare module '*.md' {
  const content: string;
  export default content;
}
