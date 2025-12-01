import os from 'node:os'
import { join } from 'node:path'
import * as tar from 'tar'

import type GitlyOptions from '../interfaces/options'
import type URLInfo from '../interfaces/url'
import { CommitResolverRegistry } from './commit-resolver'
import { GitProviderRegistry } from './git-providers'

export function getArchiveUrl(info: URLInfo, options: GitlyOptions = {}): string {
  return GitProviderRegistry.getArchiveUrl(info, options)
}

/**
 * Get archive path with optional commit hash resolution
 * When resolveCommit is enabled, uses commit SHA instead of branch/tag name
 */
export async function getArchivePath(info: URLInfo, options: GitlyOptions = {}): Promise<string> {
  const { path, hostname: site } = info
  let cacheKey = info.type

  // Resolve commit hash for more accurate caching
  // Skip if: resolveCommit explicitly disabled, or cache-only mode
  const shouldResolve = (options.resolveCommit ?? true) && !options.cache
  if (shouldResolve) {
    try {
      const commitInfo = await CommitResolverRegistry.resolveCommit(info, options)
      cacheKey = commitInfo.sha
    } catch (error) {
      // Fall back to branch/tag name on error - don't warn in tests
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`Failed to resolve commit, using ${info.type}:`, error)
      }
    }
  }

  return join(options.temp || join(os.homedir(), '.gitly'), site, path, `${cacheKey}.tar.gz`)
}

/**
 * Legacy synchronous version for backwards compatibility
 * @deprecated Use async getArchivePath instead
 */
export function getArchivePathSync(info: URLInfo, options: GitlyOptions = {}): string {
  const { path, type, hostname: site } = info

  return join(options.temp || join(os.homedir(), '.gitly'), site, path, `${type}.tar.gz`)
}

export const extract = tar.extract
