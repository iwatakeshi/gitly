import { describe, it, expect } from '@jest/globals'
import {
  GitHubProvider,
  GitLabProvider,
  BitbucketProvider,
  SourcehutProvider,
  CodebergProvider,
  GitProviderRegistry,
} from '../git-providers'
import type URLInfo from '../../interfaces/url'

describe('git-providers', () => {
  const createURLInfo = (hostname: string, path: string, type: string): URLInfo => ({
    protocol: 'https',
    host: hostname,
    hostname,
    hash: '',
    href: `https://${hostname}.com${path}`,
    path,
    repository: path.split('/')[2] || '',
    owner: path.split('/')[1] || '',
    type,
  })

  describe('GitHubProvider', () => {
    it('should generate correct archive URL', () => {
      const provider = new GitHubProvider()
      const info = createURLInfo('github', '/user/repo', 'main')
      
      expect(provider.getArchiveUrl(info)).toBe('https://github.com/user/repo/archive/main.tar.gz')
    })

    it('should match github hostname', () => {
      const provider = new GitHubProvider()
      expect(provider.matches('github')).toBe(true)
      expect(provider.matches('gitlab')).toBe(false)
    })
  })

  describe('GitLabProvider', () => {
    it('should generate correct archive URL', () => {
      const provider = new GitLabProvider()
      const info = createURLInfo('gitlab', '/user/repo', 'main')
      
      expect(provider.getArchiveUrl(info)).toBe('https://gitlab.com/user/repo/-/archive/main/repo-main.tar.gz')
    })
  })

  describe('BitbucketProvider', () => {
    it('should generate correct archive URL', () => {
      const provider = new BitbucketProvider()
      const info = createURLInfo('bitbucket', '/user/repo', 'main')
      
      expect(provider.getArchiveUrl(info)).toBe('https://bitbucket.org/user/repo/get/main.tar.gz')
    })
  })

  describe('SourcehutProvider', () => {
    it('should generate correct archive URL', () => {
      const provider = new SourcehutProvider()
      const info = createURLInfo('sourcehut', '/~user/repo', 'main')
      
      expect(provider.getArchiveUrl(info)).toBe('https://git.sr.ht/~user/repo/archive/main.tar.gz')
    })

    it('should match both sourcehut and sr.ht', () => {
      const provider = new SourcehutProvider()
      expect(provider.matches('sourcehut')).toBe(true)
      expect(provider.matches('sr.ht')).toBe(true)
      expect(provider.matches('github')).toBe(false)
    })
  })

  describe('CodebergProvider', () => {
    it('should generate correct archive URL', () => {
      const provider = new CodebergProvider()
      const info = createURLInfo('codeberg', '/user/repo', 'main')
      
      expect(provider.getArchiveUrl(info)).toBe('https://codeberg.org/user/repo/archive/main.tar.gz')
    })
  })

  describe('GitProviderRegistry', () => {
    it('should return correct provider for hostname', () => {
      expect(GitProviderRegistry.getProvider('github')).toBeInstanceOf(GitHubProvider)
      expect(GitProviderRegistry.getProvider('gitlab')).toBeInstanceOf(GitLabProvider)
      expect(GitProviderRegistry.getProvider('bitbucket')).toBeInstanceOf(BitbucketProvider)
      expect(GitProviderRegistry.getProvider('sourcehut')).toBeInstanceOf(SourcehutProvider)
      expect(GitProviderRegistry.getProvider('codeberg')).toBeInstanceOf(CodebergProvider)
    })

    it('should default to GitHub for unknown provider', () => {
      const provider = GitProviderRegistry.getProvider('unknown')
      expect(provider).toBeInstanceOf(GitHubProvider)
    })

    it('should use custom URL filter when provided', () => {
      const info = createURLInfo('github', '/user/repo', 'main')
      const options = {
        url: {
          filter: () => 'https://custom.url/archive.tar.gz'
        }
      }
      
      const url = GitProviderRegistry.getArchiveUrl(info, options)
      expect(url).toBe('https://custom.url/archive.tar.gz')
    })

    it('should get archive URL from registry', () => {
      const info = createURLInfo('github', '/user/repo', 'v1.0.0')
      const url = GitProviderRegistry.getArchiveUrl(info)
      expect(url).toBe('https://github.com/user/repo/archive/v1.0.0.tar.gz')
    })
  })
})
