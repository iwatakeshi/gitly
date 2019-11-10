import parse from '../parse'
import { getUrl } from '../tar'

describe('utils/tar', () => {
  describe('getUrl()', () => {
    it('should return a github url to the zipped file', () => {
      expect(getUrl(parse('iwatakeshi/test')))
        .toEqual('https://github.com/iwatakeshi/test/archive/master.tar.gz')
    })

    it('should return a bitbucket url to the zipped file', () => {
      expect(getUrl(parse('bitbucket:iwatakeshi/test')))
        .toEqual('https://bitbucket.org/iwatakeshi/test/get/master.tar.gz')
    })

    it('should return a gitlab url to the zipped file', () => {
      expect(getUrl(parse('gitlab:iwatakeshi/test')))
        .toEqual('https://gitlab.com/iwatakeshi/test/repository/archive.tar.gz?ref=master')
    })

    it('should return a custom url to the zipped file', () => {
      expect(getUrl(parse('iwatakeshi/test'), {
        filter(info) {
          return `https://domain.com${info.path}/repo/archive.tar.gz?ref=${info.type}`
        }
      }))
        .toEqual('https://domain.com/iwatakeshi/test/repo/archive.tar.gz?ref=master')
    })
  })
})
