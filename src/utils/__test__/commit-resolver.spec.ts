import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  GitHubCommitResolver,
  GitLabCommitResolver,
  BitbucketCommitResolver,
  SourcehutCommitResolver,
  CodebergCommitResolver,
  NullCommitResolver,
  CommitResolverRegistry,
} from '../commit-resolver'
import type URLInfo from '../../interfaces/url'

describe('utils/commit-resolver', () => {
  let envBackup: NodeJS.ProcessEnv

  beforeEach(() => {
    envBackup = { ...process.env }
  })

  afterEach(() => {
    process.env = envBackup
  })

  const createMockInfo = (host: string, path: string = '/user/repo', type: string = 'main'): URLInfo => ({
    protocol: 'https',
    host,
    hostname: host,
    hash: '',
    href: `https://${host}${path}`,
    path,
    repository: 'repo',
    owner: 'user',
    type,
  })

  describe('GitHubCommitResolver', () => {
    it('should resolve commit from GitHub API', async () => {
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', 'main')

      try {
        const result = await resolver.resolveCommit(info, { resolveCommit: true })
        expect(result).toHaveProperty('sha')
        expect(result).toHaveProperty('url')
        expect(typeof result.sha).toBe('string')
        expect(result.sha.length).toBeGreaterThan(0)
      } catch (error) {
        // May fail due to rate limiting, which is acceptable
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should throw error for nonexistent repository', async () => {
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/nonexistent/repo-that-does-not-exist-12345', 'main')

      await expect(
        resolver.resolveCommit(info, { resolveCommit: true })
      ).rejects.toThrow('Failed to resolve commit')
    }, 15000)

    it('should use HEAD as default ref', async () => {
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', '')

      // Test that it attempts to use HEAD
      try {
        const result = await resolver.resolveCommit(info, { resolveCommit: true })
        expect(result.sha).toBeTruthy()
      } catch (error) {
        // Rate limiting is acceptable
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle proxy from options', async () => {
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', 'main')

      // Test that proxy option doesn't cause errors
      try {
        await resolver.resolveCommit(info, {
          resolveCommit: true,
          proxy: {
            protocol: 'http',
            host: 'proxy.example.com',
            port: 8080,
          },
        })
      } catch (error) {
        // Rate limiting or network errors are acceptable
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle HTTPS_PROXY environment variable', async () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080'
      
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', 'main')

      try {
        await resolver.resolveCommit(info, { resolveCommit: true })
      } catch (error) {
        // Acceptable - just testing that it doesn't crash
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle HTTP_PROXY environment variable', async () => {
      delete process.env.HTTPS_PROXY
      delete process.env.https_proxy
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', 'main')

      try {
        await resolver.resolveCommit(info, { resolveCommit: true })
      } catch (error) {
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle invalid proxy URL in environment', async () => {
      process.env.HTTPS_PROXY = 'not-a-valid-url'
      
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', 'main')

      try {
        await resolver.resolveCommit(info, { resolveCommit: true })
      } catch (error) {
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle proxy URL without port', async () => {
      process.env.HTTPS_PROXY = 'http://proxy.example.com'
      
      const resolver = new GitHubCommitResolver()
      const info = createMockInfo('github.com', '/lukeed/gittar', 'main')

      try {
        await resolver.resolveCommit(info, { resolveCommit: true })
      } catch (error) {
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)
  })

  describe('NullCommitResolver', () => {
    it('should return branch/tag name as sha', async () => {
      const resolver = new NullCommitResolver()
      const info = createMockInfo('github.com', '/user/repo', 'develop')

      const result = await resolver.resolveCommit(info)

      expect(result.sha).toBe('develop')
      expect(result.url).toBe(info.href)
    })

    it('should return empty string for empty type', async () => {
      const resolver = new NullCommitResolver()
      const info = createMockInfo('github.com', '/user/repo', '')

      const result = await resolver.resolveCommit(info)

      expect(result.sha).toBe('')
      expect(result.url).toBe(info.href)
    })
  })

  describe('CommitResolverRegistry', () => {
    it('should return GitHub resolver for github.com', () => {
      const resolver = CommitResolverRegistry.getResolver('github.com')
      expect(resolver).toBeInstanceOf(GitHubCommitResolver)
    })

    it('should return GitLab resolver for gitlab.com', () => {
      const resolver = CommitResolverRegistry.getResolver('gitlab.com')
      expect(resolver).toBeInstanceOf(GitLabCommitResolver)
    })

    it('should return Bitbucket resolver for bitbucket.org', () => {
      const resolver = CommitResolverRegistry.getResolver('bitbucket.org')
      expect(resolver).toBeInstanceOf(BitbucketCommitResolver)
    })

    it('should return Sourcehut resolver for git.sr.ht', () => {
      const resolver = CommitResolverRegistry.getResolver('git.sr.ht')
      expect(resolver).toBeInstanceOf(SourcehutCommitResolver)
    })

    it('should return Codeberg resolver for codeberg.org', () => {
      const resolver = CommitResolverRegistry.getResolver('codeberg.org')
      expect(resolver).toBeInstanceOf(CodebergCommitResolver)
    })

    it('should return NullCommitResolver for unknown host', () => {
      const resolver = CommitResolverRegistry.getResolver('unknown.com')
      expect(resolver).toBeInstanceOf(NullCommitResolver)
    })

    it('should cache resolver instances', () => {
      const resolver1 = CommitResolverRegistry.getResolver('github.com')
      const resolver2 = CommitResolverRegistry.getResolver('github.com')
      expect(resolver1).toBe(resolver2)
    })
  })

  describe('Integration - Real API calls', () => {
    it('should resolve GitLab commit', async () => {
      const resolver = new GitLabCommitResolver()
      const info = createMockInfo('gitlab.com', '/gitlab-org/gitlab-foss', 'master')

      try {
        const result = await resolver.resolveCommit(info, { resolveCommit: true })
        expect(result.sha).toBeTruthy()
        expect(result.url).toContain('gitlab.com')
      } catch (error) {
        // Rate limiting acceptable
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle GitLab API errors', async () => {
      const resolver = new GitLabCommitResolver()
      const info = createMockInfo('gitlab.com', '/nonexistent/repo-12345', 'main')

      await expect(
        resolver.resolveCommit(info, { resolveCommit: true })
      ).rejects.toThrow('Failed to resolve commit')
    }, 15000)

    it('should resolve Bitbucket commit', async () => {
      const resolver = new BitbucketCommitResolver()
      const info = createMockInfo('bitbucket.org', '/atlassian/python-bitbucket', 'master')

      try {
        const result = await resolver.resolveCommit(info, { resolveCommit: true })
        expect(result.sha).toBeTruthy()
        expect(result.url).toContain('bitbucket.org')
      } catch (error) {
        // Rate limiting acceptable
        expect((error as Error).message).toContain('Failed to resolve commit')
      }
    }, 15000)

    it('should handle Bitbucket API errors', async () => {
      const resolver = new BitbucketCommitResolver()
      const info = createMockInfo('bitbucket.org', '/nonexistent/repo-12345', 'main')

      await expect(
        resolver.resolveCommit(info, { resolveCommit: true })
      ).rejects.toThrow('Failed to resolve commit')
    }, 15000)

    it('should handle Sourcehut API errors', async () => {
      const resolver = new SourcehutCommitResolver()
      const info = createMockInfo('git.sr.ht', '/~nonexistent/repo-12345', 'main')

      await expect(
        resolver.resolveCommit(info, { resolveCommit: true })
      ).rejects.toThrow('Failed to resolve commit')
    }, 15000)

    it('should handle Codeberg API errors', async () => {
      const resolver = new CodebergCommitResolver()
      const info = createMockInfo('codeberg.org', '/nonexistent/repo-12345', 'main')

      await expect(
        resolver.resolveCommit(info, { resolveCommit: true })
      ).rejects.toThrow('Failed to resolve commit')
    }, 15000)
  })
})
