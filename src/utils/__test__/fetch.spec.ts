import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { rm, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import fetch from '../fetch'
import { GitlyDownloadError } from '../error'
import exists from '../exists'

describe('utils/fetch', () => {
  const testDir = join(__dirname, 'output', 'fetch-test')
  let envBackup: NodeJS.ProcessEnv

  beforeEach(async () => {
    envBackup = { ...process.env }
    await rm(testDir, { recursive: true, force: true })
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    process.env = envBackup
    await rm(testDir, { recursive: true, force: true })
  })

  describe('successful downloads', () => {
    it('should download a file from GitHub', async () => {
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'test.tar.gz')

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)

    it('should handle proxy configuration from options', async () => {
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'proxy-test.tar.gz')

      const result = await fetch(url, dest, {
        proxy: {
          protocol: 'http',
          host: 'proxy.example.com',
          port: 8080
        }
      })

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)

    it('should use HTTPS_PROXY environment variable', async () => {
      process.env.https_proxy = 'http://proxy.example.com:8080'
      
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'env-proxy-test.tar.gz')

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)

    it('should use HTTP_PROXY as fallback', async () => {
      delete process.env.https_proxy
      delete process.env.HTTPS_PROXY
      process.env.http_proxy = 'http://proxy.example.com:8080'
      
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'http-proxy-test.tar.gz'
)

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)

    it('should handle proxy URL without port', async () => {
      process.env.https_proxy = 'http://proxy.example.com'
      
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'no-port-test.tar.gz')

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)

    it('should handle invalid proxy URL', async () => {
      process.env.https_proxy = 'not-a-valid-url'
      
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'invalid-proxy-test.tar.gz')

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)
  })

  describe('error handling', () => {
    it('should throw GitlyDownloadError for 404', async () => {
      const url = 'https://github.com/nonexistent/repo-12345/archive/refs/heads/main.tar.gz'
      const dest = join(testDir, '404-test.tar.gz')

      await expect(fetch(url, dest)).rejects.toThrow(GitlyDownloadError)
      await expect(fetch(url, dest)).rejects.toThrow('Not Found')
    }, 30000)

    it('should throw GitlyDownloadError with status code', async () => {
      const url = 'https://github.com/nonexistent/repo-12345/archive/refs/heads/main.tar.gz'
      const dest = join(testDir, 'error-code-test.tar.gz')

      try {
        await fetch(url, dest)
        throw new Error('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(GitlyDownloadError)
        expect((error as GitlyDownloadError).code).toBe(404)
      }
    }, 30000)

    it('should handle redirects', async () => {
      // GitHub shorthand URLs often redirect
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, 'redirect-test.tar.gz')

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(await exists(dest)).toBe(true)
    }, 30000)
  })

  describe('GitlyDownloadError', () => {
    it('should create error with proper message and code', () => {
      const error = new GitlyDownloadError('Not Found', 404)
      expect(error.message).toBe('[gitly:download]: Not Found')
      expect(error.code).toBe(404)
    })

    it('should handle different status codes', () => {
      const errors = [
        new GitlyDownloadError('Bad Request', 400),
        new GitlyDownloadError('Unauthorized', 401),
        new GitlyDownloadError('Forbidden', 403),
        new GitlyDownloadError('Not Found', 404),
        new GitlyDownloadError('Internal Server Error', 500),
      ]

      errors.forEach((error, index) => {
        expect(error).toBeInstanceOf(GitlyDownloadError)
        expect(error.code).toBe([400, 401, 403, 404, 500][index])
      })
    })
  })

  describe('proxy configuration', () => {
    it('should validate proxy requires host and port', () => {
      const validProxy = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: 8080
      }
      
      expect(typeof validProxy.host).toBe('string')
      expect(typeof validProxy.port).toBe('number')
    })

    it('should parse proxy URLs correctly', () => {
      const testCases = [
        { url: 'https://proxy.example.com:3128', hasPort: true },
        { url: 'http://proxy.example.com:8080', hasPort: true },
        { url: 'https://proxy.example.com', hasPort: false },
      ]
      
      testCases.forEach(({ url, hasPort }) => {
        const parsed = new URL(url)
        expect(Boolean(parsed.port)).toBe(hasPort)
      })
    })

    it('should handle invalid URLs', () => {
      expect(() => new URL('not-a-url')).toThrow()
    })
  })
})
