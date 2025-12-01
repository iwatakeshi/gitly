import type GitlyOptions from '../interfaces/options'
import type URLInfo from '../interfaces/url'
import type { RawAxiosRequestHeaders, AxiosHeaders } from 'axios'

/**
 * Get authentication token from options or environment variables
 * Priority: options.token > provider-specific env var > GIT_TOKEN > null
 */
export function getAuthToken(info: URLInfo, options: GitlyOptions = {}): string | undefined {
  // Explicit token in options takes precedence
  if (options.token) {
    return options.token
  }

  // Check provider-specific environment variables
  const host = info.host.toLowerCase()
  
  if (host.includes('github') || host.includes('gitea') || host.includes('codeberg')) {
    return process.env.GITHUB_TOKEN || process.env.GIT_TOKEN
  }
  
  if (host.includes('gitlab')) {
    return process.env.GITLAB_TOKEN || process.env.GIT_TOKEN
  }
  
  if (host.includes('bitbucket')) {
    return process.env.BITBUCKET_TOKEN || process.env.GIT_TOKEN
  }

  // Fallback to generic GIT_TOKEN
  return process.env.GIT_TOKEN
}

/**
 * Inject authentication headers into request headers
 * Supports GitHub, GitLab, Bitbucket, and Gitea-based platforms
 */
export function injectAuthHeaders(
  info: URLInfo,
  options: GitlyOptions = {}
): RawAxiosRequestHeaders | AxiosHeaders | undefined {
  const token = getAuthToken(info, options)
  
  if (!token) {
    return options.headers
  }

  const host = info.host.toLowerCase()
  const headers: RawAxiosRequestHeaders = options.headers 
    ? { ...(options.headers as RawAxiosRequestHeaders) }
    : {}

  // GitHub, Gitea, Codeberg (Gitea-based) use Bearer token
  if (host.includes('github') || host.includes('gitea') || host.includes('codeberg')) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // GitLab uses PRIVATE-TOKEN header or Bearer token
  else if (host.includes('gitlab')) {
    // Support both header formats (PRIVATE-TOKEN is legacy)
    headers['PRIVATE-TOKEN'] = token
    headers['Authorization'] = `Bearer ${token}`
  }
  // Bitbucket uses Basic auth with username in token or Bearer
  else if (host.includes('bitbucket')) {
    // If token contains ':', treat as username:app_password
    if (token.includes(':')) {
      const encoded = Buffer.from(token).toString('base64')
      headers['Authorization'] = `Basic ${encoded}`
    } else {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  // Default to Bearer token for other providers
  else {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}
