import { FileStat } from 'tar'

import URLInfo from './url'

export default interface GitlyOptions {
  /** Use cache only (default: undefined) */
  cache?: boolean
  /** Use both cache and local (default: undefined) */
  force?: boolean
  /** Throw an error when fetching (default: undefined) */
  throw?: boolean
  /** Set cache directory (default: '~/.gitly') */
  temp?: string
  /** Set the host name (default: undefined) */
  host?: string
  /** Options for url */
  url?: {
    /**
     * Extend the url filtering method
     * @param info The URLInfo object */
    filter?(info: URLInfo): string
  }
  /** Options for tar extractions */
  extract?: {
    /** Extend the extract filtering method for the 'tar' library */
    filter?(path: string, stat: FileStat): boolean
  }
  /**
   * Override the fetch function
   * @param url The url of the repository to download
   * @param destination The path where the file is to be downloaded
   * @return The destination path
   */
  fetch?: (url: string, destination: string) => Promise<string>
}
