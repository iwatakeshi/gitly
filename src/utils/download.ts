import axios from 'axios'
import * as stream from 'stream'
import { promisify } from 'util'

import { GitlyDownloadError } from './error'
import write from './write'

const pipeline = promisify(stream.pipeline)

export default async function download(url: string, file: string): Promise<string> {
  const response = await axios.get(url, {
    responseType: 'stream', validateStatus: status => status >= 200 && status < 500
  })

  const { statusText: message, status: code } = response
  if (code >= 400) throw new GitlyDownloadError(message, code)
  else if (code >= 300 && code < 400) {
    return download(response.headers.location, file)
  } else await pipeline(response.data, await write(file))
  return file
}
