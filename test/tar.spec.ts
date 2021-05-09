import parse from '../src/utils/parse'
import { createArchiveUrl } from '../src/utils/git'

describe('utils/tar', () => {
  describe('createArchiveUrl()', () => {
    it('should return a github url to the zipped file', () => {
      expect(createArchiveUrl(parse('iwatakeshi/test'))).toEqual(
        'https://github.com/iwatakeshi/test/archive/master.tar.gz'
      )
    })

    it('should return a bitbucket url to the zipped file', () => {
      expect(createArchiveUrl(parse('bitbucket:iwatakeshi/test'))).toEqual(
        'https://bitbucket.org/iwatakeshi/test/get/master.tar.gz'
      )
    })

    it('should return a gitlab url to the zipped file', () => {
      expect(createArchiveUrl(parse('gitlab:iwatakeshi/test'))).toEqual(
        'https://gitlab.com/iwatakeshi/test/-/archive/master/test-master.tar.gz'
      )
    })

    it('should return a custom url to the zipped file', () => {
      expect(
        createArchiveUrl(parse('iwatakeshi/test'), {
          url: {
            filter(info) {
              return `https://domain.com${info.path}/repo/archive.tar.gz?ref=${info.branch}`
            },
          },
        })
      ).toEqual(
        'https://domain.com/iwatakeshi/test/repo/archive.tar.gz?ref=master'
      )
    })
  })
})
