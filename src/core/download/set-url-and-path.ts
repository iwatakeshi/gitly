import {GitlyDownloadOptions} from "./index";
import {defaultTo} from "rambdax";
import {createArchiveURL} from "../../utils/git/create-archive-url";
import {createCachePath} from "../../utils/cache/create-cache-path";
import {GitURL} from "../../utils/url/git-url";

/**
 * Sets the archive url and the cache path
 */
export function setURLAndPath(options?: GitlyDownloadOptions) {
  return (url: GitURL): [string, string] => {
    const archiveURL = defaultTo(
      createArchiveURL,
      options?.createArchiveURL,
    )(url)
    const path = createCachePath(url, options?.cache?.directory)
    return [archiveURL, path]
  }
}