import axios, { AxiosProxyConfig } from 'axios'
import * as stream from 'node:stream'
import { promisify } from 'node:util'

import { GitlyDownloadError } from './error'
import write from './write'
import type GitlyOptions from '../interfaces/options'
import { URL } from 'node:url'

const pipeline = promisify(stream.pipeline)

export default async function fetch(
  url: string,
  file: string,
  options: GitlyOptions = {}
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

function getProxy(proxy: GitlyOptions['proxy']): AxiosProxyConfig | false {
  if (typeof proxy?.host === 'string' && typeof proxy?.port === 'number') {
    return proxy
  }

  if (typeof process.env.https_proxy === 'string') {
    try {
      const url = new URL(process.env.https_proxy)
      const { protocol, host, port } = url
      
      return {
        protocol,
        host,
        port: Number.parseInt(port) ?? undefined,
      }
    } catch {
      return false;
    }
  }

  return false
}