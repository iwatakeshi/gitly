import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import type URLInfo from '../../interfaces/url'
import { getAuthToken, injectAuthHeaders } from '../auth'

describe('utils/auth', () => {
  let envBackup: NodeJS.ProcessEnv

  beforeEach(() => {
    envBackup = { ...process.env }
  })

  afterEach(() => {
    process.env = envBackup
  })

  describe('getAuthToken', () => {
    it('should return token from options when provided', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'github.com',
        hostname: 'github.com',
        hash: '',
        href: 'https://github.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info, { token: 'test-token' })
      expect(result).toBe('test-token')
    })

    it('should use GITHUB_TOKEN for github.com', () => {
      process.env.GITHUB_TOKEN = 'ghp_test'
      const info: URLInfo = {
        protocol: 'https',
        host: 'github.com',
        hostname: 'github.com',
        hash: '',
        href: 'https://github.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info)
      expect(result).toBe('ghp_test')
    })

    it('should use GITLAB_TOKEN for gitlab.com', () => {
      process.env.GITLAB_TOKEN = 'glpat-test'
      const info: URLInfo = {
        protocol: 'https',
        host: 'gitlab.com',
        hostname: 'gitlab.com',
        hash: '',
        href: 'https://gitlab.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info)
      expect(result).toBe('glpat-test')
    })

    it('should use BITBUCKET_TOKEN for bitbucket.org', () => {
      process.env.BITBUCKET_TOKEN = 'bb-test'
      const info: URLInfo = {
        protocol: 'https',
        host: 'bitbucket.org',
        hostname: 'bitbucket.org',
        hash: '',
        href: 'https://bitbucket.org/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info)
      expect(result).toBe('bb-test')
    })

    it('should fallback to GIT_TOKEN for github', () => {
      process.env.GIT_TOKEN = 'generic-token'
      const info: URLInfo = {
        protocol: 'https',
        host: 'github.com',
        hostname: 'github.com',
        hash: '',
        href: 'https://github.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info)
      expect(result).toBe('generic-token')
    })

    it('should work with gitea hosts', () => {
      process.env.GITHUB_TOKEN = 'gitea-token'
      const info: URLInfo = {
        protocol: 'https',
        host: 'gitea.example.com',
        hostname: 'gitea.example.com',
        hash: '',
        href: 'https://gitea.example.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info)
      expect(result).toBe('gitea-token')
    })

    it('should work with codeberg', () => {
      process.env.GITHUB_TOKEN = 'codeberg-token'
      const info: URLInfo = {
        protocol: 'https',
        host: 'codeberg.org',
        hostname: 'codeberg.org',
        hash: '',
        href: 'https://codeberg.org/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = getAuthToken(info)
      expect(result).toBe('codeberg-token')
    })
  })

  describe('injectAuthHeaders', () => {
    it('should return undefined headers when no token', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'github.com',
        hostname: 'github.com',
        hash: '',
        href: 'https://github.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = injectAuthHeaders(info)
      expect(result).toBeUndefined()
    })

    it('should inject Bearer token for GitHub', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'github.com',
        hostname: 'github.com',
        hash: '',
        href: 'https://github.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = injectAuthHeaders(info, { token: 'ghp_test' })
      expect(result).toEqual({
        Authorization: 'Bearer ghp_test',
      })
    })

    it('should inject both PRIVATE-TOKEN and Bearer for GitLab', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'gitlab.com',
        hostname: 'gitlab.com',
        hash: '',
        href: 'https://gitlab.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = injectAuthHeaders(info, { token: 'glpat-test' })
      expect(result).toEqual({
        'PRIVATE-TOKEN': 'glpat-test',
        Authorization: 'Bearer glpat-test',
      })
    })

    it('should inject Basic auth for Bitbucket with username:password', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'bitbucket.org',
        hostname: 'bitbucket.org',
        hash: '',
        href: 'https://bitbucket.org/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const token = 'username:password'
      const encoded = Buffer.from(token).toString('base64')
      const result = injectAuthHeaders(info, { token })
      expect(result).toEqual({
        Authorization: `Basic ${encoded}`,
      })
    })

    it('should inject Bearer token for Bitbucket without colon', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'bitbucket.org',
        hostname: 'bitbucket.org',
        hash: '',
        href: 'https://bitbucket.org/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = injectAuthHeaders(info, { token: 'bb-token' })
      expect(result).toEqual({
        Authorization: 'Bearer bb-token',
      })
    })

    it('should preserve existing headers', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'github.com',
        hostname: 'github.com',
        hash: '',
        href: 'https://github.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = injectAuthHeaders(info, {
        token: 'test',
        headers: { 'Custom-Header': 'value' },
      })
      expect(result).toEqual({
        'Custom-Header': 'value',
        Authorization: 'Bearer test',
      })
    })

    it('should inject Bearer token for unknown hosts', () => {
      const info: URLInfo = {
        protocol: 'https',
        host: 'custom-git.com',
        hostname: 'custom-git.com',
        hash: '',
        href: 'https://custom-git.com/user/repo',
        path: '/user/repo',
        repository: 'repo',
        owner: 'user',
        type: 'main',
      }

      const result = injectAuthHeaders(info, { token: 'custom-token' })
      expect(result).toEqual({
        Authorization: 'Bearer custom-token',
      })
    })
  })
})
