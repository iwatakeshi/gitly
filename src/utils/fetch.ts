import axios from 'axios'
import * as stream from 'node:stream'
import { promisify } from 'node:util'

import { GitlyDownloadError } from './error'
import write from './write'
import type GitlyOptions from '../interfaces/options'

const pipeline = promisify(stream.pipeline)

export default async function fetch(
  url: string,
  file: string,
  options: GitlyOptions = {}
): Promise<string> {
  const response = await axios.get(url, {
    headers: options.headers,
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
