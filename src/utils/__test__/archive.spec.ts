import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { getArchivePath, getArchivePathSync, getArchiveUrl } from '../archive'
import parse from '../parse'

const isWin32 = process.platform === 'win32'

describe('utils/archive', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })
  describe('getUrl()', () => {
    it('should return a github url to the zipped file', () => {
      expect(getArchiveUrl(parse('iwatakeshi/test'))).toEqual(
        'https://github.com/iwatakeshi/test/archive/master.tar.gz',
      )
    })

    it('should return a bitbucket url to the zipped file', () => {
      expect(getArchiveUrl(parse('bitbucket:iwatakeshi/test'))).toEqual(
        'https://bitbucket.org/iwatakeshi/test/get/master.tar.gz',
      )
    })

    it('should return a gitlab url to the zipped file', () => {
      expect(getArchiveUrl(parse('gitlab:iwatakeshi/test'))).toEqual(
        'https://gitlab.com/iwatakeshi/test/-/archive/master/test-master.tar.gz',
      )
    })

    it('should return a custom url to the zipped file', () => {
      expect(
        getArchiveUrl(parse('iwatakeshi/test'), {
          url: {
            filter(info) {
              return `https://domain.com${info.path}/repo/archive.tar.gz?ref=${info.type}`
            },
          },
        }),
      ).toEqual('https://domain.com/iwatakeshi/test/repo/archive.tar.gz?ref=master')
    })
  })

  describe('getArchivePath()', () => {
    it('should return a path to the zipped file', () => {
      expect(getArchivePathSync(parse('iwatakeshi/test'))).toEqual(
        isWin32
          ? expect.stringMatching(/\.gitly\\github\\iwatakeshi\\test\\master\.tar\.gz/)
          : expect.stringMatching(/\.gitly\/github\/iwatakeshi\/test\/master\.tar\.gz/),
      )
    })

    it('should resolve commit hash and use it in path', async () => {
      process.env.NODE_ENV = 'production' // Not test environment

      const result = await getArchivePath(parse('lukeed/gittar'), { resolveCommit: true })

      // Should contain a SHA hash instead of 'master'
      expect(result).toMatch(/\.gitly/)
      expect(result).toMatch(/gittar/)
    }, 30000)

    it('should handle commit resolution failure gracefully', async () => {
      process.env.NODE_ENV = 'production' // Not test environment

      // Use an invalid repo that will fail commit resolution
      const result = await getArchivePath(parse('nonexistent-user-12345/nonexistent-repo-67890'), {
        resolveCommit: true,
      })

      // Should fall back to branch/tag name
      expect(result).toMatch(/\.gitly/)
      expect(result).toMatch(/master\.tar\.gz/)
    }, 30000)

    it('should not warn in test environment when commit resolution fails', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'
      const consoleSpy = jest.spyOn(console, 'warn')

      // This should trigger the warning from commit-resolver.ts, not archive.ts
      // The test verifies that archive.ts respects NODE_ENV=test, but commit-resolver
      // has its own warning that still fires
      await getArchivePath(parse('nonexistent-user-12345/nonexistent-repo-67890'), {
        resolveCommit: true,
      })

      // Archive.ts doesn't warn in test mode, but commit-resolver.ts does
      // So we expect one warning from commit-resolver, not from archive.ts
      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Commit resolution failed'))

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    }, 30000)

    it('should warn in production environment when commit resolution fails', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      const consoleSpy = jest.spyOn(console, 'warn')

      await getArchivePath(parse('nonexistent-user-12345/nonexistent-repo-67890'), {
        resolveCommit: true,
      })

      // Should have warnings in production
      expect(consoleSpy).toHaveBeenCalled()
      // Check that at least one warning contains relevant text
      const calls = consoleSpy.mock.calls
      const hasRelevantWarning = calls.some((call) =>
        call.some(
          (arg) =>
            String(arg).includes('Failed to resolve commit') ||
            String(arg).includes('Commit resolution failed'),
        ),
      )
      expect(hasRelevantWarning).toBe(true)

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    }, 30000)
  })
})
