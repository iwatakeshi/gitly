import { describe, it, expect } from '@jest/globals'
import parse from '../parse'
import { getArchiveUrl } from '../archive'
import { getArchivePath } from '../archive'
const isWin32 = process.platform === 'win32'

describe('utils/archive', () => {
  describe('getUrl()', () => {
    it('should return a github url to the zipped file', () => {
      expect(getArchiveUrl(parse('iwatakeshi/test'))).toEqual(
        'https://github.com/iwatakeshi/test/archive/master.tar.gz'
      )
    })

    it('should return a bitbucket url to the zipped file', () => {
      expect(getArchiveUrl(parse('bitbucket:iwatakeshi/test'))).toEqual(
        'https://bitbucket.org/iwatakeshi/test/get/master.tar.gz'
      )
    })

    it('should return a gitlab url to the zipped file', () => {
      expect(getArchiveUrl(parse('gitlab:iwatakeshi/test'))).toEqual(
        'https://gitlab.com/iwatakeshi/test/-/archive/master/test-master.tar.gz'
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
        })
      ).toEqual(
        'https://domain.com/iwatakeshi/test/repo/archive.tar.gz?ref=master'
      )
    })
  })

  describe('getArchivePath()', () => {
    it('should return a path to the zipped file', () => {
      expect(getArchivePath(parse('iwatakeshi/test'))).toEqual(
        isWin32
          ? expect.stringMatching(
              /\.gitly\\github\\iwatakeshi\\test\\master\.tar\.gz/
            )
          : expect.stringMatching(
              /\.gitly\/github\/iwatakeshi\/test\/master\.tar\.gz/
            )
      )
    })
  })
})
