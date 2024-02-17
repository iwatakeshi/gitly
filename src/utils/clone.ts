import { rm } from 'fs/promises'
import GitlyOptions from '../interfaces/options'
import { getArchivePath } from './archive'
import { GitlyCloneError } from './error'
import execute from './execute'
import exists from './exists'
import { isOffline } from './offline'
import parse from './parse'
import spawn from 'cross-spawn'
import tar from 'tar'
import path from 'path'
/**
 * Uses local git installation to clone a repository to the destination.
 * @param repository The repository to clone
 * @param options The options to use
 * @returns The path to the cloned repository
 * @throws {GitlyCloneError} When the repository fails to clone
 * @note This method requires a local git installation
 * @note This method caches the repository by default
 * @example
 * ```js
 * // ...
 * const path = await clone('iwatakeshi/git-copy')
 * // ...
 * ```
 */
export default async function clone(
  repository: string,
  options: GitlyOptions = {}
): Promise<string> {
  const info = parse(repository, options)
  const archivePath = getArchivePath(info, options)
  const directory = archivePath.replace(/\.tar\.gz$/, '')
  let order: (() => Promise<boolean | string>)[] = []

  const local = async () => exists(archivePath + '.tar.gz')
  const remote = async () => {
    // If the repository is cached, remove the old cache
    if (await exists(archivePath)) {
      /* istanbul ignore next */
      await rm(archivePath)
    }

    // Prevent second order command injection
    
    const depth = options?.git?.depth || 1

    /* istanbul ignore if */
    if (typeof depth !== 'number') {
      throw new GitlyCloneError('Invalid depth option')
    }

    /* istanbul ignore if */
    if (info.href.includes('--upload-pack') || directory.includes('--upload-pack')) {
      throw new GitlyCloneError('Invalid argument')
    }


    const child = spawn('git', [
      'clone',
      '--depth',
      depth.toString(),
      info.href,
      directory,
    ])

    await new Promise((resolve, reject) => {
      child.on('error', (reason) =>
        reject(new GitlyCloneError(reason.message))
      )
      child.on('close', (code) => {
        /* istanbul ignore next */
        if (code === 0) {
          // Create the archive after cloning
          tar
            .create(
              {
                gzip: true,
                file: archivePath,
                // Go one level up to include the repository name in the archive
                cwd: path.resolve(archivePath, '..'),
                portable: true,
              },
              [info.type]
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
