import * as stream from 'node:stream'
import { URL } from 'node:url'
import { promisify } from 'node:util'
import axios, { type AxiosProxyConfig } from 'axios'
import type GitlyOptions from '../interfaces/options'
import { GitlyDownloadError } from './error'
import write from './write'

const pipeline = promisify(stream.pipeline)

/**
 * Download a file from a URL with proxy support and redirect handling
 * @param url The URL to download from
 * @param file The destination file path
 * @param options GitlyOptions including proxy configuration and headers
 * @returns Promise resolving to the file path
 * @throws {GitlyDownloadError} When download fails (4xx/5xx status codes)
 * @example
 * ```typescript
 * await fetch('https://github.com/user/repo/archive/main.tar.gz', '/tmp/repo.tar.gz')
 *
 * // With proxy
 * await fetch(url, file, {
 *   proxy: { protocol: 'http', host: 'proxy.example.com', port: 8080 }
 * })
 * ```
 */
export default async function fetch(
  url: string,
  file: string,
  options: GitlyOptions = {},
): Promise<string> {
  const response = await axios.get(url, {
    headers: options.headers,
    proxy: getProxy(options.proxy),
    responseType: 'stream',
    validateStatus: (status) => status >= 200 && status < 500,
  })

  const { statusText: message, status: code } = response
  if (code >= 400) throw new GitlyDownloadError(message, code)
  if (code >= 300 && code < 400 && response.headers.location) {
    return fetch(response.headers.location, file)
  }
  await pipeline(response.data, await write(file))
  return file
}

/**
 * Get proxy configuration from options or environment variables
 * @param proxy Proxy configuration from options
 * @returns AxiosProxyConfig or false if no valid proxy found
 * @note Checks https_proxy and http_proxy environment variables as fallback
 * @note Requires port to be present in proxy URL
 */
function getProxy(proxy: GitlyOptions['proxy']): AxiosProxyConfig | false {
  if (typeof proxy?.host === 'string' && typeof proxy?.port === 'number') {
    return proxy
  }

  const proxyUrl = process.env.https_proxy || process.env.http_proxy
  if (typeof proxyUrl === 'string') {
    try {
      const url = new URL(proxyUrl)
      const { protocol, hostname, port } = url

      // Port is required by AxiosProxyConfig, so only return proxy if port is present
      if (!port) {
        return false
      }

      return {
        protocol: protocol.replace(':', ''),
        host: hostname,
        port: Number.parseInt(port),
      }
    } catch {
      return false
    }
  }

  return false
}
