import spawn from 'cross-spawn'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import * as tar from 'tar'
import type GitlyOptions from '../interfaces/options'
import { getArchivePath } from './archive'
import { GitlyCloneError } from './error'
import execute from './execute'
import exists from './exists'
import { isOffline } from './offline'
import parse from './parse'
/**
 * Clone a git repository using local git installation
 * @param repository The repository to clone (e.g., 'owner/repo', 'github:owner/repo')
 * @param options Options including temp directory, git depth, and error handling
 * @returns Promise resolving to the path of the created archive
 * @throws {GitlyCloneError} When repository contains injection attempts or invalid options
 * @throws {GitlyCloneError} When git clone fails
 * @note Requires local git installation
 * @note Validates inputs to prevent command injection
 * @note Caches repository by default in ~/.gitly
 * @security Validates --upload-pack parameter to prevent second-order command injection
 * @security Validates depth option to ensure it's a valid number
 * @example
 * ```typescript
 * // Clone latest main branch
 * const path = await clone('iwatakeshi/gitly')
 * 
 * // Clone with specific depth
 * const path = await clone('owner/repo', {
 *   git: { depth: 5 },
 *   temp: '/custom/cache/dir'
 * })
 * ```
 */
export default async function clone(
  repository: string,
  options: GitlyOptions = {}
): Promise<string> {
  const info = parse(repository, options)
  const archivePath = getArchivePath(info, options)
  const directory = archivePath.replace(/\.tar\.gz$/, '')
  const depth = options?.git?.depth ?? 1

  // Validate inputs early to prevent command injection
  if (
    repository.includes('--upload-pack') ||
    directory.includes('--upload-pack') ||
    info.href.includes('--upload-pack')
  ) {
    throw new GitlyCloneError('Invalid argument')
  }

  if (typeof depth !== 'number' || Number.isNaN(depth)) {
    throw new GitlyCloneError('Invalid depth option')
  }

  let order: (() => Promise<boolean | string>)[] = []

  const local = async () => exists(`${archivePath}.tar.gz`)
  const remote = async () => {
    // If the repository is cached, remove the old cache
    if (await exists(archivePath)) {
      /* istanbul ignore next */
      await rm(archivePath)
    }

    const child = spawn('git', [
      'clone',
      '--depth',
      depth.toString(),
      info.href,
      directory,
    ])

    await new Promise((resolve, reject) => {
      child.on('error', (reason) => reject(new GitlyCloneError(reason.message)))
      child.on('close', (code) => {
        /* istanbul ignore next */
        if (code === 0) {
          // delete the .git directory to make the archive smaller
          rm(path.resolve(directory, '.git'), { recursive: true })
            .then(() =>
              // Create the archive after cloning
              tar.create(
                {
                  gzip: true,
                  file: archivePath,
                  // Go one level up to include the repository name in the archive
                  cwd: path.resolve(archivePath, '..'),
                  portable: true,
                },
                [info.type]
              )
            )
            .then(() =>
              rm(path.resolve(directory), {
                recursive: true,
              })
            )
            .then(resolve)
            .catch((error) => reject(new GitlyCloneError(error.message)))
        } /* istanbul ignore next */ else {
          reject(new GitlyCloneError('Failed to clone the repository'))
        }
      })
    })
    return archivePath
  }
  /* istanbul ignore next */
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
