import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import clone from '../clone'
import { GitlyCloneError } from '../error'
import exists from '../exists'

describe('utils/clone', () => {
  const options = {
    temp: join(__dirname, 'output', 'clone'),
    backend: 'git' as 'git' | 'axios',
    throws: true,
  }
  beforeAll(async () => {
    await rm(join(__dirname, 'output', 'clone'), { recursive: true, force: true })
  })

  afterAll(async () => {
    await rm(join(__dirname, 'output', 'clone'), { recursive: true, force: true })
  })

  it('should clone the repository', async () => {
    const result = await clone('iwatakeshi/gitly', options)
    expect(await exists(result)).toBe(true)
  })

  describe('security: injection prevention', () => {
    it('should reject repository with --upload-pack in URL', async () => {
      await expect(clone('user/repo--upload-pack=/evil', options)).rejects.toThrow(GitlyCloneError)
    })

    it('should reject directory with --upload-pack in path', async () => {
      const maliciousOptions = {
        ...options,
        temp: join(__dirname, 'output', '--upload-pack', 'clone'),
      }
      await expect(clone('user/repo', maliciousOptions)).rejects.toThrow(GitlyCloneError)
    })

    it('should reject repository URL containing --upload-pack', async () => {
      await expect(
        clone('https://github.com/user/repo?--upload-pack=/evil', options),
      ).rejects.toThrow(GitlyCloneError)
    })

    it('should reject non-number depth option', async () => {
      const invalidOptions = {
        ...options,
        git: { depth: '1' as unknown as number },
      }
      await expect(clone('user/repo', invalidOptions)).rejects.toThrow(GitlyCloneError)
    })

    it('should reject NaN depth option', async () => {
      const invalidOptions = {
        ...options,
        git: { depth: NaN },
      }
      await expect(clone('user/repo', invalidOptions)).rejects.toThrow(GitlyCloneError)
    })
  })

  describe('error handling', () => {
    it('should handle execution errors when throw is true', async () => {
      const opts = {
        ...options,
        throw: true,
      }

      // Use an invalid URL that will cause git to fail
      await expect(
        clone('https://invalid-git-url-that-does-not-exist.com/user/repo', opts),
      ).rejects.toThrow()
    }, 30000)

    it('should return empty string when throw is false and execution fails', async () => {
      const opts = {
        ...options,
        throw: false,
        throws: false,
      }

      // Use an invalid URL that will cause git to fail
      const result = await clone('https://invalid-git-url-that-does-not-exist.com/user/repo', opts)
      expect(result).toBe('')
    }, 30000)

    it('should handle force option with failed execution', async () => {
      const opts = {
        ...options,
        force: true,
        throw: false,
        throws: false,
      }

      const result = await clone('https://invalid-git-url-that-does-not-exist.com/user/repo', opts)
      expect(result).toBe('')
    }, 30000)

    it('should return archive path when execute returns boolean true', async () => {
      // When git clone succeeds, execute() returns true (boolean)
      // The clone function should then return the archivePath
      const opts = {
        ...options,
        force: false,
      }

      const result = await clone('lukeed/gittar', opts)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      // Should return the tar.gz archive path
      expect(result).toContain('.tar.gz')
      expect(result).toContain('lukeed')
      expect(result).toContain('gittar')
    }, 30000)
  })
})
