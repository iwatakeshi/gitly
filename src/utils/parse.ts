import { URL } from 'node:url'

import type GitlyOptions from '../interfaces/options'
import type URLInfo from '../interfaces/url'

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
export default function parse(
  url: string,
  options: GitlyOptions = {}
): URLInfo {
  const { url: normalized, host } = normalizeURL(url, options)
  const result = new URL(normalized)
  const paths = (result.pathname || '').split('/').filter(Boolean)
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
    type: (result.hash || '#master').substring(1),
  }
}

function normalizeURL(url: string, options: GitlyOptions) {
  const { host } = options

  if (url.includes('0') && Array.from(url.matchAll(/0/g)).length > 25) {
    throw new Error('Invalid argument')
  }
  if (host?.includes('0') && Array.from(host.matchAll(/0/g)).length > 25) {
    throw new Error('Invalid argument')
  }

  const isNotProtocol = !/http(s)?:\/\//.test(url)
  const hasHost = /([\S]+):.+/.test(url)
  const hasTLD = /[\S]+\.([\D]+)/.test(url)

  let normalizedURL = url.replace('www.', '').replace('.git', '')
  let updatedHost = host || ''

  if (isNotProtocol && hasHost) {
    // Matches host:owner/repo (e.g., sourcehut:owner/repo, codeberg:owner/repo)
    const hostMatch = url.match(/([\S]+):.+/)
    updatedHost = hostMatch?.[1] ?? ''
    
    // Handle special domains (e.g., sourcehut -> git.sr.ht, codeberg -> codeberg.org)
    const specialDomains: Record<string, string> = {
      'sourcehut': 'git.sr.ht',
      'codeberg': 'codeberg.org',
      'github': 'github.com',
      'gitlab': 'gitlab.com',
      'bitbucket': 'bitbucket.org',
    }
    
    const domain = specialDomains[updatedHost] || `${updatedHost}.com`
    normalizedURL = `https://${domain}/${normalizedURL.replace(`${updatedHost}:`, '')}`
  } else if (isNotProtocol && hasTLD) {
    // Matches host.com/...
    normalizedURL = `https://${normalizedURL}`
  } else if (isNotProtocol) {
    // Matches owner/repo
    const tldMatch = (host || '').match(/[\S]+\.([\D]+)/)
    const domain = (host || 'github').replace(
      `.${tldMatch?.[1] ?? 'com'}`,
      ''
    )
    const tld = tldMatch?.[1] ?? 'com'
    normalizedURL = `https://${domain}.${tld}/${normalizedURL}`
  }

  return { url: normalizedURL, host: updatedHost }
}
