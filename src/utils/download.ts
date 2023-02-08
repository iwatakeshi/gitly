import GitlyOptions from '../interfaces/options'

import execute from './execute'
import exists from './exists'
import fetch from './fetch'
import { isOffline } from './offline'
import parse from './parse'
import { getFile, getUrl } from './tar'

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
  const file = getFile(info, options)
  const url = getUrl(info, options)
  const local = async () => exists(file)
  const remote = async () => fetch(url, file, options)
  let order = [local, remote]
  if ((await isOffline()) || options.cache) {
    order = [local]
  } else if (options.force || info.type === 'master') {
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
