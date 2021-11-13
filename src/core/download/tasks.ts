/* istanbul ignore file */

import { Task } from '../../utils/task'
import { exists } from '../../utils/fs/exists'
import { createWriteStream, promises as fs } from 'fs'
import { dirname } from 'path'
import { fetch } from '../../utils/net/fetch'
import { GitlyDownloadOptions } from './index'

type GitlyTasks = [Task<string>] | [Task<string>, Task<string>]

/**
 * Sets the tasks that determine the path to the cached repository
 * @param data A tuple containing the archive url and path respectively
 * @returns A tuple containing the `cached` and `remote` tasks respectively.
 */
export function setTasks([url, path]: [string, string]): GitlyTasks {
  const cached = async (): Promise<string> => ((await exists(path)) ? path : '')

  const remote = async () => {
    return new Promise<string>(async (resolve, reject) => {
      await fs.mkdir(dirname(path), {recursive: true})
      return fetch(url)
        .then((stream) =>
          stream
            .pipe(createWriteStream(path))
            .on('finish', () => resolve(path))
            .on('error', (e) => reject(e))
        )
        .catch(reject)
    })
  }

  return [cached, remote]
}

/**
 * Sets the execution order for the tasks passed
 */
export function orderTasks(
  connected: boolean,
  options?: GitlyDownloadOptions
): GitlyTasks {
  // @ts-ignore
  return ([cached, remote]) => {
    // If the user disables cache then the only is to fetch
    // from the remote git repository
    if (options?.cache?.disable && connected) {
      return [remote]
    }

    // Fetch the remote first if force is enabled
    if (options?.force && connected) {
      return [remote, cached]
    }

    // Use the cache if we are offline
    /* istanbul ignore next */
    if (!connected) {
      return [cached]
    }

    // The default task is to run the cached first.
    // If the cache exists, then we are done.
    // Otherwise, we will try to fetch from the remote git repository
    return [cached, remote]
  }
}
