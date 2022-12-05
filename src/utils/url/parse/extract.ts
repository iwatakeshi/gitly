import { complement, dropLast, isEmpty } from "rambda"

type URLExtractResult = {
  protocol: string,
  tld: string
  domain: string
  subdomain: string,
  path: string[]
}
/**
 * Extracts the components of a url.
 * @param url 
 * @returns A result containing the protocol, tld, domain, subdomain, and path of a url.
 */
export function extract(url: string): URLExtractResult {
  const empty = { protocol: '', tld: '', domain: '', subdomain: '', path: [] }

  if (!url || url.length === 0 || !url.includes('.')) return empty


  const protocol = /https?/.test(url) ? url.match(/https?/)!.at(0)! : 'https'

  const normalizedUrl = url
    // Remove https?
    .replace(/https?/, '')
    // Remove ://
    .replace(/:\/\//, '')
    // Remove www+
    .replace(/www*\./, '')

  // Get the host
  const host = normalizedUrl
    // Split paths
    .split('/')
    // Grab the first element
    .at(0) ?? ''

  const delimitedHost = host.split('.')
  const tld = delimitedHost.at(-1) ?? ''
  const domain = delimitedHost.at(-2) ?? ''
  const subdomain = dropLast(2, delimitedHost).join('.')
  const path = normalizedUrl
    .replace(host, '').split('/').filter(complement(isEmpty))


  return { protocol, subdomain, domain, tld, path }

}