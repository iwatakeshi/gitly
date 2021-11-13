import { join } from 'path'
import { GITLY_PATH } from '../constants'
import { curry, flip } from 'rambda'
import { GitURL } from '../url/git-url'

/**
 * Creates a cache path for gitly to store the repository.
 * @param url The git url containing the required repository metadata
 * @param directory The root directory where the cache is stored
 */
export function createCachePath(url: GitURL, directory?: string): string {
  return join(
    directory || GITLY_PATH,
    url.provider,
    /* istanbul ignore next */
    url.repository ?? url.pathname,
    `${url.branch}.tar.gz`
  )
}

/**
 * Creates a cache path for gitly to store the repository.
 * @param directory The root directory where the cache is stored
 * @returns A curried version of `createCachePath()`
 */
export const $createCachePath = curry(flip(createCachePath)) as (
  directory?: string
) => (url: GitURL) => string
