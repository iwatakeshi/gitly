import type { AxiosProxyConfig } from 'axios'
import axios from 'axios'
import type GitlyOptions from '../interfaces/options'
import type URLInfo from '../interfaces/url'
import { injectAuthHeaders } from './auth'

/**
 * Commit information from git provider API
 */
export interface CommitInfo {
  sha: string
  url: string
  date?: string
}

/**
 * Strategy for fetching commit information from different providers
 * Follows Strategy pattern
 */
export interface ICommitResolver {
  /**
   * Get the latest commit SHA for a branch/tag
   */
  resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo>
}

/**
 * Base class for commit resolvers
 */
export abstract class BaseCommitResolver implements ICommitResolver {
  abstract resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo>

  protected async makeRequest(url: string, info: URLInfo, options?: GitlyOptions): Promise<any> {
    const response = await axios.get(url, {
      headers: injectAuthHeaders(info, options),
      proxy: this.getProxy(options?.proxy),
      timeout: 10000,
    })
    return response.data
  }

  private getProxy(proxy?: AxiosProxyConfig): AxiosProxyConfig | false {
    if (proxy) return proxy

    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy
    const proxyUrl = httpsProxy || httpProxy

    if (!proxyUrl) return false

    try {
      const url = new URL(proxyUrl)
      if (!url.port) return false

      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port, 10),
      }
    } catch {
      return false
    }
  }
}

/**
 * GitHub commit resolver using GitHub API
 */
export class GitHubCommitResolver extends BaseCommitResolver {
  async resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo> {
    // GitHub API: GET /repos/:owner/:repo/commits/:ref
    const [_, owner, repo] = info.path.split('/')
    const ref = info.type || 'HEAD'
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${ref}`

    try {
      const data = await this.makeRequest(apiUrl, info, options)
      return {
        sha: data.sha,
        url: data.html_url,
        date: data.commit?.committer?.date,
      }
    } catch (error) {
      // Fallback to using the branch/tag name if API fails
      throw new Error(`Failed to resolve commit for ${owner}/${repo}@${ref}`)
    }
  }
}

/**
 * GitLab commit resolver using GitLab API
 */
export class GitLabCommitResolver extends BaseCommitResolver {
  async resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo> {
    // GitLab API: GET /api/v4/projects/:id/repository/commits/:sha
    const [_, owner, repo] = info.path.split('/')
    const ref = info.type || 'HEAD'
    const projectId = encodeURIComponent(`${owner}/${repo}`)
    const apiUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${ref}`

    try {
      const data = await this.makeRequest(apiUrl, info, options)
      return {
        sha: data.id,
        url: data.web_url,
        date: data.committed_date,
      }
    } catch (error) {
      throw new Error(`Failed to resolve commit for ${owner}/${repo}@${ref}`)
    }
  }
}

/**
 * Bitbucket commit resolver using Bitbucket API
 */
export class BitbucketCommitResolver extends BaseCommitResolver {
  async resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo> {
    // Bitbucket API: GET /2.0/repositories/:workspace/:repo_slug/commit/:revision
    const [_, owner, repo] = info.path.split('/')
    const ref = info.type || 'HEAD'
    const apiUrl = `https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/commit/${ref}`

    try {
      const data = await this.makeRequest(apiUrl, info, options)
      return {
        sha: data.hash,
        url: data.links?.html?.href,
        date: data.date,
      }
    } catch (error) {
      throw new Error(`Failed to resolve commit for ${owner}/${repo}@${ref}`)
    }
  }
}

/**
 * Sourcehut commit resolver using sr.ht API
 */
export class SourcehutCommitResolver extends BaseCommitResolver {
  async resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo> {
    // Sourcehut uses git refs API
    const [_, owner, repo] = info.path.split('/')
    const ref = info.type || 'HEAD'
    const apiUrl = `https://git.sr.ht/${owner}/${repo}/refs/${ref}`

    try {
      const data = await this.makeRequest(apiUrl, info, options)
      // Sourcehut returns simple text or JSON depending on the endpoint
      const sha = typeof data === 'string' ? data.trim() : data.sha
      return {
        sha,
        url: `https://git.sr.ht/${owner}/${repo}/commit/${sha}`,
      }
    } catch (error) {
      throw new Error(`Failed to resolve commit for ${owner}/${repo}@${ref}`)
    }
  }
}

/**
 * Codeberg commit resolver using Gitea API
 */
export class CodebergCommitResolver extends BaseCommitResolver {
  async resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo> {
    // Codeberg uses Gitea API: GET /api/v1/repos/:owner/:repo/commits/:sha
    const [_, owner, repo] = info.path.split('/')
    const ref = info.type || 'HEAD'
    const apiUrl = `https://codeberg.org/api/v1/repos/${owner}/${repo}/commits/${ref}`

    try {
      const data = await this.makeRequest(apiUrl, info, options)
      return {
        sha: data.sha,
        url: data.html_url,
        date: data.commit?.committer?.date,
      }
    } catch (error) {
      throw new Error(`Failed to resolve commit for ${owner}/${repo}@${ref}`)
    }
  }
}

/**
 * Null resolver for when commit resolution is disabled or fails
 * Follows Null Object pattern
 */
export class NullCommitResolver implements ICommitResolver {
  async resolveCommit(info: URLInfo): Promise<CommitInfo> {
    // Return the branch/tag name as the "sha" for backwards compatibility
    return {
      sha: info.type,
      url: info.href,
    }
  }
}

/**
 * Registry for commit resolvers
 * Follows Registry pattern
 */
export class CommitResolverRegistry {
  private static resolvers = new Map<string, ICommitResolver>([
    ['github.com', new GitHubCommitResolver()],
    ['gitlab.com', new GitLabCommitResolver()],
    ['bitbucket.org', new BitbucketCommitResolver()],
    ['git.sr.ht', new SourcehutCommitResolver()],
    ['codeberg.org', new CodebergCommitResolver()],
  ])

  static getResolver(hostname: string): ICommitResolver {
    // Check for exact match first
    const exactMatch = CommitResolverRegistry.resolvers.get(hostname)
    if (exactMatch) {
      return exactMatch
    }

    // Fallback: check if hostname contains any known providers
    for (const [key, resolver] of CommitResolverRegistry.resolvers.entries()) {
      const keyPrefix = key.split('.')[0]
      if (keyPrefix && hostname.includes(keyPrefix)) {
        return resolver
      }
    }

    return new NullCommitResolver()
  }

  static async resolveCommit(info: URLInfo, options?: GitlyOptions): Promise<CommitInfo> {
    // Skip commit resolution if explicitly disabled
    if (options?.cache && !options?.resolveCommit) {
      return new NullCommitResolver().resolveCommit(info)
    }

    const resolver = CommitResolverRegistry.getResolver(info.hostname)
    try {
      return await resolver.resolveCommit(info, options)
    } catch (error) {
      // Fallback to null resolver if API resolution fails
      console.warn(`Commit resolution failed, using branch/tag name: ${error}`)
      return new NullCommitResolver().resolveCommit(info)
    }
  }
}
