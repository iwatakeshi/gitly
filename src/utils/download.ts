import GitlyOptions from '../interfaces/options'

import execute from './execute'
import exists from './exists'
import fetch from './fetch'
import { isOffline } from './offline'
import parse from './parse'
import { getArchivePath, getArchiveUrl } from './archive'
import { rm } from 'shelljs'

/**
 * Download the tar file from the repository
 * and store it in a temporary directory
 * @param repository The repository to download
 *
 * @example
 * ```js
 * // ..
 * const path = await download('iwatakeshi/git-copy')
 * // ...
 * ```
 */
export default async function download(
  repository: string,
  options: GitlyOptions = {}
): Promise<string> {
  const info = parse(repository, options)
  const archivePath = getArchivePath(info, options)
  const url = getArchiveUrl(info, options)
  const local = async () => exists(archivePath)
  const remote = async () => {
    // If the repository is cached, remove the old cache
    if (await exists(archivePath)) {
      /* istanbul ignore next */
      rm(archivePath)
    }
    
    return fetch(url, archivePath, options)
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
