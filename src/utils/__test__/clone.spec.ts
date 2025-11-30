import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import exists from '../exists'
import clone from '../clone'
import { GitlyCloneError } from '../error'

describe('utils/clone', () => {
  const options = {
    temp: join(__dirname, 'output', 'clone'),
    backend: 'git' as 'git' | 'axios',
    throws: true
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
      await expect(
        clone('user/repo--upload-pack=/evil', options)
      ).rejects.toThrow(GitlyCloneError)
    })

    it('should reject directory with --upload-pack in path', async () => {
      const maliciousOptions = {
        ...options,
        temp: join(__dirname, 'output', '--upload-pack', 'clone')
      }
      await expect(
        clone('user/repo', maliciousOptions)
      ).rejects.toThrow(GitlyCloneError)
    })

    it('should reject repository URL containing --upload-pack', async () => {
      await expect(
        clone('https://github.com/user/repo?--upload-pack=/evil', options)
      ).rejects.toThrow(GitlyCloneError)
    })

    it('should reject non-number depth option', async () => {
      const invalidOptions = {
        ...options,
        git: { depth: '1' as unknown as number }
      }
      await expect(
        clone('user/repo', invalidOptions)
      ).rejects.toThrow(GitlyCloneError)
    })

    it('should reject NaN depth option', async () => {
      const invalidOptions = {
        ...options,
        git: { depth: NaN }
      }
      await expect(
        clone('user/repo', invalidOptions)
      ).rejects.toThrow(GitlyCloneError)
    })
  })
})
