import axios, { AxiosResponse } from 'axios'
import { Readable } from 'stream'

const validateStatus = (status: number) => status >= 200 && status < 500
const isHTTPError = ({status: code}: AxiosResponse) => code >= 400
const isHTTPRedirect = ({status: code}: AxiosResponse) => code >= 300 && code < 400

/**
 * Returns a `ReadableStream` from the given url
 * @param url
 */
export const fetch = async (url: string): Promise<Readable> => {
  const response = await axios.get<Readable>(url, {
    responseType: 'stream', validateStatus
  })
  const {statusText: message, headers} = response
  // Handle any redirects or errors
  if (isHTTPError(response)) throw new Error(message)
  else if (isHTTPRedirect(response)) {
    return await fetch(headers.location)
  }
  return response.data
}