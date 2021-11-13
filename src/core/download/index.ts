import { pipeAsync } from 'rambdax'
import isOnline from '../../utils/net/is-online'
import { execute } from '../../utils/task'
import { parse } from '../../utils/url/parse'
import { orderTasks, setTasks } from './tasks'
import { setURLAndPath } from './set-url-and-path'
import { Readable } from 'stream'
import { GitURL } from '../../utils/url/git-url'

export interface GitlyDownloadOptions {
  /**
   * Allow gitly to throw on error
   */
  throw?: boolean
  /**
   * A custom function that generates the archive url for gitly to download
   * @param url The parsed git url
   * @return {String}
   * @example
   * ```ts
   *  const myCreateArchiveUrl = ({ owner, repo, branch }: GitlyURl) => {
   *    return `https://provider.com/${owner}/${repo}/${branch}.tar.gz`
   *  }
   * ```
   */
  createArchiveURL?: (url: GitURL) => string
  /**
   * Cache options
   */
  cache?: {
    /**
     * Disables gitly's use of cache.
     */
    disable?: boolean
    /**
     *
     */
    directory?: string
  }
  /**
   * A custom function that fetches and downloads the git repository.
   * @deprecated Since `v3.0.0`
   *
   * Note: Consider using the gitly's utilities or contribute to the project.
   */
  fetch?: (url: GitURL, path: string) => Promise<Readable>
  /**
   * Force gitly to fetch remotely first before accessing the cache
   */
  force?: boolean
}

/**
 * Download the tar file from the repository
 * and store it in a temporary directory
 * @param url The repository url to download
 * @param options The gitly options
 * @example
 * ```js
 * // ...
 * const path = await download('iwatakeshi/git-copy')
 * // ...
 * ```
 */
export async function download(
  url: string,
  options?: GitlyDownloadOptions
): Promise<string> {
  try {
    const connected = await isOnline()
    return await pipeAsync<string>(
      parse,
      setURLAndPath(options),
      setTasks,
      orderTasks(connected, options) as any,
      execute
    )(url)
  } catch (e) {
    if (options?.throw) throw e
    return ''
  }
}

/**
 * Download the tar file from the repository
 * and store it in a temporary directory
 * @param options The gitly options
 * @returns A curried version of `download()`
 * @example
 * ```js
 * // ...
 * const path = await ('iwatakeshi/gitly' |> $download())
 * // ...
 * ```
 */
export const $download =
  /*  istanbul ignore next */
  (options?: GitlyDownloadOptions) => async (url: string) =>
    download(url, options)
