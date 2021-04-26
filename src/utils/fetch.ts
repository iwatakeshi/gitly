import https from 'https'

import { GitlyDownloadError } from './error'
import write from './write'
export default async function fetch(
  url: string,
  file: string
): Promise<string> {
  return new Promise<string>((result, reject) => {
    https
      .get(url, async (response) => {
        const { statusCode: code, statusMessage: message, headers } = response
        if (code && code >= 400)
          return reject(new GitlyDownloadError(message!, code))
        if (code && code > 300 && code < 400)
          return fetch(headers.location!, file).then(result)
        response.pipe((await write(file)).on('finish', () => result(file)))
      })
      .on('error', (error) => new GitlyDownloadError(error.message))
  })
}
