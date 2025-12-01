import type { Stats } from 'node:fs'
import { normalize, sep } from 'node:path'
import type { ReadEntry } from 'tar'

/**
 * Subdirectory extraction strategy
 * Follows Strategy pattern for different extraction modes
 */
export interface IExtractionStrategy {
  shouldExtract(entryPath: string): boolean
  transformPath(entryPath: string): string
}

/**
 * Extract entire archive (default behavior)
 */
export class FullExtractionStrategy implements IExtractionStrategy {
  shouldExtract(): boolean {
    return true
  }

  transformPath(entryPath: string): string {
    return entryPath
  }
}

/**
 * Extract only a specific subdirectory
 * Follows Open/Closed Principle - extensible without modification
 */
export class SubdirectoryExtractionStrategy implements IExtractionStrategy {
  private readonly normalizedSubdir: string

  constructor(subdirectory: string) {
    // Normalize path separators and remove leading/trailing slashes
    this.normalizedSubdir = normalize(subdirectory).split(sep).filter(Boolean).join('/')
  }

  shouldExtract(entryPath: string): boolean {
    const normalized = this.normalizePath(entryPath)
    // Match exact subdirectory or any path within it
    return (
      normalized === this.normalizedSubdir || normalized.startsWith(`${this.normalizedSubdir}/`)
    )
  }

  transformPath(entryPath: string): string {
    const normalized = this.normalizePath(entryPath)
    // Remove the subdirectory prefix to flatten the structure
    if (normalized.startsWith(`${this.normalizedSubdir}/`)) {
      return normalized.slice(this.normalizedSubdir.length + 1)
    }
    return normalized.replace(this.normalizedSubdir, '')
  }

  private normalizePath(path: string): string {
    return normalize(path).split(sep).filter(Boolean).join('/')
  }
}

/**
 * Factory for creating extraction strategies
 * Follows Factory pattern
 */
export class ExtractionStrategyFactory {
  static create(subdirectory?: string): IExtractionStrategy {
    if (subdirectory) {
      return new SubdirectoryExtractionStrategy(subdirectory)
    }
    return new FullExtractionStrategy()
  }
}

/**
 * Create a filter function that combines custom filter and subdirectory strategy
 */
export function createExtractionFilter(
  strategy: IExtractionStrategy,
  customFilter?: (path: string, stat: Stats | ReadEntry) => boolean,
): (path: string, stat: Stats | ReadEntry) => boolean {
  return (path: string, stat: Stats | ReadEntry) => {
    // Apply subdirectory strategy first
    if (!strategy.shouldExtract(path)) {
      return false
    }
    // Then apply custom filter if provided
    if (customFilter) {
      return customFilter(path, stat)
    }
    return true
  }
}
