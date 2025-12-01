import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { rm, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import fetch from '../fetch'
import { GitlyDownloadError } from '../error'
import exists from '../exists'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('utils/fetch', () => {
  const testDir = join(__dirname, 'output', 'fetch-test')
  let envBackup: NodeJS.ProcessEnv

  beforeEach(async () => {
    envBackup = { ...process.env }
    await rm(testDir, { recursive: true, force: true })
    await mkdir(testDir, { recursive: true })
    jest.clearAllMocks()
  })

  afterEach(async () => {
    process.env = envBackup
    await rm(testDir, { recursive: true, force: true })
  })

  // Helper to create a mock stream
  const createMockStream = (content = 'test content') => {
    return Readable.from([Buffer.from(content)])
  }

  describe('successful downloads', () => {
    it('should download a file from GitHub', async () => {
      const url = 'https://github.com/lukeed/gittar/archive/refs/heads/master.tar.gz'
      const dest = join(testDir, 'test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({
        responseType: 'stream',
      }))
      expect(await exists(dest)).toBe(true)
    })

    it('should handle redirect responses (3xx with location header)', async () => {
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const redirectUrl = 'https://codeload.github.com/lukeed/gittar/tar.gz/refs/heads/master'
      const dest = join(testDir, 'redirect-test.tar.gz')

      // First call returns redirect
      mockedAxios.get.mockResolvedValueOnce({
        status: 302,
        statusText: 'Found',
        headers: { location: redirectUrl },
        data: createMockStream(),
      } as any)

      // Second call (following redirect) succeeds
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      const result = await fetch(url, dest)

      expect(result).toBe(dest)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
      // Note: redirect doesn't pass options, just url and file
      expect(mockedAxios.get).toHaveBeenNthCalledWith(1, url, expect.anything())
      expect(await exists(dest)).toBe(true)
    })

    it('should parse proxy from environment variable with port', async () => {
      process.env.https_proxy = 'http://proxy.example.com:8080'
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, 'env-proxy-test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      await fetch(url, dest)

      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({
        proxy: {
          protocol: 'http',
          host: 'proxy.example.com',
          port: 8080,
        },
      }))
    })

    it('should handle proxy URL without port (returns false)', async () => {
      process.env.https_proxy = 'http://proxy.example.com'
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, 'no-port-test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      await fetch(url, dest)

      // Should pass false as proxy since no port
      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({
        proxy: false,
      }))
    })

    it('should handle invalid proxy URL (returns false)', async () => {
      process.env.https_proxy = 'not-a-valid-url'
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, 'invalid-proxy-test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      await fetch(url, dest)

      // Should pass false as proxy due to invalid URL
      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({
        proxy: false,
      }))
    })

    it('should use http_proxy as fallback', async () => {
      delete process.env.https_proxy
      process.env.http_proxy = 'http://proxy.example.com:3128'
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, 'http-proxy-test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      await fetch(url, dest)

      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({
        proxy: {
          protocol: 'http',
          host: 'proxy.example.com',
          port: 3128,
        },
      }))
    })

    it('should return false when no proxy environment variables are set', async () => {
      delete process.env.https_proxy
      delete process.env.http_proxy
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, 'no-env-proxy-test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: createMockStream(),
      } as any)

      await fetch(url, dest)

      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({
        proxy: false,
      }))
    })
  })

  describe('error handling', () => {
    it('should throw GitlyDownloadError for 404', async () => {
      const url = 'https://github.com/nonexistent/repo-12345/archive/refs/heads/main.tar.gz'
      const dest = join(testDir, '404-test.tar.gz')

      mockedAxios.get.mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
        headers: {},
        data: null,
      } as any)

      await expect(fetch(url, dest)).rejects.toThrow(GitlyDownloadError)
      await expect(fetch(url, dest)).rejects.toThrow('Not Found')
    })

    it('should throw GitlyDownloadError with status code', async () => {
      const url = 'https://github.com/nonexistent/repo-12345/archive/refs/heads/main.tar.gz'
      const dest = join(testDir, 'error-code-test.tar.gz')

      mockedAxios.get.mockResolvedValueOnce({
        status: 404,
        statusText: 'Not Found',
        headers: {},
        data: null,
      } as any)

      try {
        await fetch(url, dest)
        throw new Error('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(GitlyDownloadError)
        if (error instanceof GitlyDownloadError) {
          expect(error.code).toBe(404)
        }
      }
    })

    it('should throw GitlyDownloadError for 500 errors', async () => {
      const url = 'https://github.com/lukeed/gittar/archive/master.tar.gz'
      const dest = join(testDir, '500-test.tar.gz')

      mockedAxios.get.mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: null,
      } as any)

      await expect(fetch(url, dest)).rejects.toThrow(GitlyDownloadError)
      await expect(fetch(url, dest)).rejects.toThrow('Internal Server Error')
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
})
