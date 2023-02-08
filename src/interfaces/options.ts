import { FileStat } from 'tar'

import URLInfo from './url'
import { AxiosHeaders, RawAxiosRequestHeaders } from 'axios'

export default interface GitlyOptions {
  /**
   * Use cache only (default: undefined)
   */
  cache?: boolean
  /**
   * Use both cache and local (default: undefined)
   */
  force?: boolean
  /**
   * Throw an error when fetching (default: undefined)
   */
  throw?: boolean
  /**
   * Set cache directory (default: '~/.gitly')
   */
  temp?: string
  /**
   * Set the host name (default: undefined)
   */
  host?: string
  url?: {
    /**
     * Extend the url filtering method
     * @param info The URLInfo object
     */
    filter?(info: URLInfo): string
  }
  extract?: {
    /**
     * Extend the extract filtering method for the 'tar' library
     */
    filter?(path: string, stat: FileStat): boolean
  }
  headers?: RawAxiosRequestHeaders | AxiosHeaders
}
