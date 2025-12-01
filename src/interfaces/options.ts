import type URLInfo from './url'
import type { AxiosHeaders, AxiosProxyConfig, RawAxiosRequestHeaders } from 'axios'
import type { Stats } from 'node:fs'
import type { ReadEntry } from 'tar'

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
    filter?(path: string, stat: Stats | ReadEntry): boolean
  }
  /**
   * Extract only a specific subdirectory from the archive
   * @example 'packages/lib' to extract only that subdirectory
   */
  subdirectory?: string
  /**
   * Use commit SHA for caching instead of branch/tag name (default: true)
   * When enabled, caches are keyed by specific commit hash for accuracy
   * When disabled, uses branch/tag name (legacy behavior)
   */
  resolveCommit?: boolean
  /**
   * Authentication token for private repositories
   * Falls back to GITHUB_TOKEN, GITLAB_TOKEN, BITBUCKET_TOKEN, or GIT_TOKEN env vars
   * For GitHub/Gitea/Codeberg: 'ghp_...' or 'glpat-...' or any personal access token
   * For GitLab: 'glpat-...' or any personal/project access token
   * For Bitbucket: App password
   */
  token?: string
  /**
   * Set the request headers (default: undefined)
   */
  headers?: RawAxiosRequestHeaders | AxiosHeaders
  /**
   * Set the backend (default: undefined)
   *
   * @example
   * ```markdown
   * 'axios' - default behavior
   * 'git' - use local git installation to clone the repository (allows for cloning private repositories as long as the local git installation has access)
   * ```
   */
  /**
   * Sets the hostname, port, and protocol of the proxy server (default: undefined)
   * Falls back to the https_proxy or http_proxy environment variables if not specified
   */
  proxy?: AxiosProxyConfig
  backend?: 'axios' | 'git'
  /**
   * Set git options (default: undefined)
   */
  git?: {
    depth?: number
  }
}
