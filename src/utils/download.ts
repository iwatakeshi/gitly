import axios from 'axios'

import write from './write'

export default async function download(url: string, file: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const response = await axios.get(url, {
      responseType: 'stream',
      validateStatus(status) {
        return status >= 200 && status < 500
      }
    })
    const status = response.status
    if (status >= 400) reject({ status, message: response.statusText })
    else if (status >= 300 && status < 400) {
      return download(response.headers.location, file).then(resolve)
    } else response.data.pipe(await write(file)).on('close', () => resolve(file))
  })
}
