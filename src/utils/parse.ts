import GitlyOptions from '../types/options'
import URLInfo from '../types/url'

/**
 * Parses a url and returns the metadata
 *
 * @example
 * ```markdown
 * 1. owner/repo
 * 2. owner/repo#tag
 * 3. https://host.com/owner/repo
 * 4. host.com/owner/repo
 * 5. host.com/owner/repo#tag
 * 6. host:owner/repo
 * 7. host:owner/repo#tag
 * ```
 */
export default (url: string, options: GitlyOptions = {}): URLInfo => {
  const { url: normalized, host } = normalizeURL(url, options)

  // Parse the url
  const result = new URL(normalized)
  const paths = (result.pathname || '').split('/').filter((p) => !!p)
  const owner = paths.shift() || ''
  const repository = paths.shift() || ''
  return {
    protocol: (result.protocol || 'https').replace(/:/g, ''),
    host: result.host || host || 'github.com',
    hostname: (result.hostname || host || 'github').replace(/\.(\S+)/, ''),
    hash: result.hash || '',
    href: result.href || '',
    path: result.pathname || '',
    repository,
    owner,
    branch: (result.hash || '#master').substr(1),
  }
}

function normalizeURL(url: string, options: GitlyOptions) {
  // Remove 'www.'
  url = url.replace('www.', '')
  // Remove '.git'
  url = url.replace('.git', '')
  const httpRegex = /http(s)?:\/\//
  const tldRegex = /[\S]+\.([\D]+)/
  let host = options.host || ''
  if (/([\S]+):.+/.test(url) && !httpRegex.test(url)) {
    /**
     * Matches host:owner/repo
     */
    const matches = url.match(/([\S]+):.+/)
    // Get the host
    host = matches ? matches[1] : ''
    // Remove the host from the url
    url = host ? url.replace(`${host}:`, '') : url
    // Add the host back in the correct format
    url = `https://${host}.com/${url}`
  } else if (tldRegex.test(url) && !httpRegex.test(url)) {
    /**
     * Matches github.com/...
     */
    url = `https://${url}`
  } else if (/[\S]+\/[\S]+/.test(url) && !httpRegex.test(url)) {
    /**
     * Matches owner/repo
     */

    // Get the TLD if any
    const matches = ((options.host as string) || '').match(tldRegex)
    let match = 'com'
    if (matches) match = matches[1]
    let domain = options.host || 'github'
    domain = domain.replace(`.${match}`, '')

    url = `https://${domain}.${match}/${url}`
  }

  return { url, host }
}
