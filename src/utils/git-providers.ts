import type GitlyOptions from '../interfaces/options'
import type URLInfo from '../interfaces/url'

/**
 * Git hosting provider interface
 * Follows Strategy pattern for different providers
 */
export interface IGitProvider {
  readonly name: string
  readonly hostname: string

  /**
   * Generate archive URL for the provider
   */
  getArchiveUrl(info: URLInfo): string

  /**
   * Check if this provider matches the given hostname
   */
  matches(hostname: string): boolean
}

/**
 * Abstract base class for git providers
 * Follows Template Method pattern
 */
export abstract class BaseGitProvider implements IGitProvider {
  abstract readonly name: string
  abstract readonly hostname: string

  abstract getArchiveUrl(info: URLInfo): string

  matches(hostname: string): boolean {
    return hostname === this.hostname
  }
}

/**
 * GitHub provider
 */
export class GitHubProvider extends BaseGitProvider {
  readonly name = 'GitHub'
  readonly hostname = 'github'

  getArchiveUrl(info: URLInfo): string {
    const { path, type } = info
    return `https://github.com${path}/archive/${type}.tar.gz`
  }
}

/**
 * GitLab provider
 */
export class GitLabProvider extends BaseGitProvider {
  readonly name = 'GitLab'
  readonly hostname = 'gitlab'

  getArchiveUrl(info: URLInfo): string {
    const { path, type } = info
    const repoName = path.split('/')[2]
    return `https://gitlab.com${path}/-/archive/${type}/${repoName}-${type}.tar.gz`
  }
}

/**
 * Bitbucket provider
 */
export class BitbucketProvider extends BaseGitProvider {
  readonly name = 'Bitbucket'
  readonly hostname = 'bitbucket'

  getArchiveUrl(info: URLInfo): string {
    const { path, type } = info
    return `https://bitbucket.org${path}/get/${type}.tar.gz`
  }
}

/**
 * Sourcehut (sr.ht) provider
 */
export class SourcehutProvider extends BaseGitProvider {
  readonly name = 'Sourcehut'
  readonly hostname = 'sourcehut'

  getArchiveUrl(info: URLInfo): string {
    const { path, type } = info
    return `https://git.sr.ht${path}/archive/${type}.tar.gz`
  }

  matches(hostname: string): boolean {
    return hostname === 'sourcehut' || hostname === 'sr.ht'
  }
}

/**
 * Codeberg provider
 */
export class CodebergProvider extends BaseGitProvider {
  readonly name = 'Codeberg'
  readonly hostname = 'codeberg'

  getArchiveUrl(info: URLInfo): string {
    const { path, type } = info
    return `https://codeberg.org${path}/archive/${type}.tar.gz`
  }
}

/**
 * Gitea provider (generic Gitea instances)
 */
export class GiteaProvider extends BaseGitProvider {
  readonly name = 'Gitea'
  readonly hostname = 'gitea'

  constructor(private readonly baseUrl: string = 'https://gitea.com') {
    super()
  }

  getArchiveUrl(info: URLInfo): string {
    const { path, type } = info
    return `${this.baseUrl}${path}/archive/${type}.tar.gz`
  }
}

/**
 * Registry of all git providers
 * Follows Registry pattern and Dependency Inversion Principle
 */
export class GitProviderRegistry {
  private static providers: IGitProvider[] = [
    new GitHubProvider(),
    new GitLabProvider(),
    new BitbucketProvider(),
    new SourcehutProvider(),
    new CodebergProvider(),
  ]

  /**
   * Register a custom provider
   */
  static register(provider: IGitProvider): void {
    GitProviderRegistry.providers.push(provider)
  }

  /**
   * Get provider by hostname
   */
  static getProvider(hostname: string): IGitProvider {
    const provider = GitProviderRegistry.providers.find((p) => p.matches(hostname))
    if (!provider) {
      // Default to GitHub for unknown providers
      return new GitHubProvider()
    }
    return provider
  }

  /**
   * Get archive URL using the appropriate provider
   */
  static getArchiveUrl(info: URLInfo, options: GitlyOptions = {}): string {
    // Allow custom URL filter to override
    if (options.url?.filter) {
      return options.url.filter(info)
    }

    const provider = GitProviderRegistry.getProvider(info.hostname)
    return provider.getArchiveUrl(info)
  }

  /**
   * Get all registered providers
   */
  static getAllProviders(): readonly IGitProvider[] {
    return [...GitProviderRegistry.providers]
  }
}
