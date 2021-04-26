import GitlyOptions from './types/options'

import execute from './utils/execute'
import exists from './utils/exists'
import fetch from './utils/fetch'
import isOffline from './utils/is-offline'
import parse from './utils/parse'
import { createArchiveFilePath, createArchiveUrl } from './utils/git'

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
  const url = createArchiveUrl(info, options)
  const file = createArchiveFilePath(info, options)
  const fetcher = options.fetch || fetch
  const local = async () => exists(file)
  const remote = async () => await fetcher(url, file)
  let order = [local, remote]
  if ((await isOffline()) || options.cache) {
    order = [local]
  } else if (options.force || info.branch === 'master') {
    order = [remote, local]
  }

  try {
    const result = await execute(order)
    if (typeof result === 'boolean') {
      return file
    }
    return result
  } catch (error) {
    if (options.throw) {
      throw error
    }
  }
  return ''
}
