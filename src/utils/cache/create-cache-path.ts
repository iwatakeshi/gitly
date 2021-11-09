import {join} from "path";
import {GITLY_PATH} from "../constants";
import {curry, flip} from "rambda";
import {GitURL} from "../url/git-url";

/**
 * @param url The git url containing the required repository metadata
 * @param directory The root directory where the cache is stored
 */
export function createCachePath(
  url: GitURL,
  directory?: string
): string {

  return join(
    directory || GITLY_PATH,
    url.host ?? `${url.provider}`,
    url.pathname ?? url.repository,
    `${url.branch}.tar.gz`
  )
}

/**
 * A curried version of createCachePath
 */
export const $createCachePath = curry(flip(createCachePath)) as
  (directory?: string) => (url: GitURL) => string