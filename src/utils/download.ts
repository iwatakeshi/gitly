import { rm } from 'node:fs/promises'
import type GitlyOptions from '../interfaces/options'
import { getArchivePath, getArchiveUrl } from './archive'
import { injectAuthHeaders } from './auth'
import execute from './execute'
import exists from './exists'
import fetch from './fetch'
import { isOffline } from './offline'
import parse from './parse'

/**
 * Download a repository archive from GitHub, GitLab, or Bitbucket
 * @param repository Repository identifier (e.g., 'owner/repo', 'github:owner/repo#tag')
 * @param options Options for caching, proxy, temp directory, and error handling
 * @returns Promise resolving to archive path, or empty string on failure (when throw=false)
 * @throws {AggregateError} When all download strategies fail (when throw=true)
 * @note Tries local cache first, then remote download
 * @note Uses force=true to skip cache for main/master branches
 * @note Uses commit SHA for caching by default (set resolveCommit: false to disable)
 * @note Returns empty string instead of throwing when options.throw is false
 * @example
 * ```typescript
 * // Download and cache by commit SHA
 * const path = await download('iwatakeshi/gitly')
 *
 * // Force fresh download
 * const path = await download('owner/repo', { force: true })
 *
 * // Use cache only (offline mode)
 * const path = await download('owner/repo', { cache: true })
 *
 * // Disable commit resolution (use branch/tag name)
 * const path = await download('owner/repo', { resolveCommit: false })
 *
 * // With proxy
 * const path = await download('owner/repo', {
 *   proxy: { protocol: 'http', host: 'proxy.example.com', port: 8080 }
 * })
 * ```
 */
export default async function download(
  repository: string,
  options: GitlyOptions = {},
): Promise<string> {
  const info = parse(repository, options)
  const archivePath = await getArchivePath(info, options)
  const url = getArchiveUrl(info, options)

  // Inject authentication headers for private repositories
  const optionsWithAuth: GitlyOptions = {
    ...options,
    headers: injectAuthHeaders(info, options),
  }

  const local = async () => exists(archivePath)
  const remote = async () => {
    // If the repository is cached, remove the old cache
    if (await exists(archivePath)) {
      /* istanbul ignore next */
      await rm(archivePath, { force: true })
    }

    return fetch(url, archivePath, optionsWithAuth)
  }
  let order = [local, remote]
  if ((await isOffline()) || options.cache) {
    order = [local]
  } else if (options.force || ['master', 'main'].includes(info.type)) {
    order = [remote, local]
  }

  try {
    const result = await execute(order)
    if (typeof result === 'boolean') {
      return archivePath
    }
    return result
  } catch (error) {
    if (options.throw) {
      throw error
    }
  }
  return ''
}
