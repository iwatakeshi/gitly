import { existsSync } from 'fs'
import { rm } from 'shelljs'

import { download, GitlyDownloadOptions } from '../index'
import { mktdirSync } from "../../../utils/fs/mktdir";


describe('download', () => {
  const TEST_DIR_NO_CACHE = mktdirSync('gitly', 'download', 'no_cache')
  const TEST_DIR_CACHE = mktdirSync('gitly', 'download', 'cache')
  describe('no cache', () => {

    const options: GitlyDownloadOptions = {
      cache: {
        directory: TEST_DIR_NO_CACHE,
        disable: true
      },
    }
    beforeEach(async () => {
      rm('-rf', TEST_DIR_NO_CACHE!)
    })

    afterAll(async () => {
      rm('-rf', TEST_DIR_NO_CACHE!)
    })

    it('should download "iwatakeshi/gitly"', async () => {
      expect.assertions(2)
      const path = await download('iwatakeshi/gitly', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "iwatakeshi/gitly#v2.0.0"', async () => {
      expect.assertions(2)
      const path = await download('iwatakeshi/gitly#v2.0.0', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "https://github.com/iwatakeshi/gitly"', async () => {
      expect.assertions(2)
      const path = await download('https://github.com/iwatakeshi/gitly', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })
    it('should download "https://github.com/iwatakeshi/gitly#v2.0.0"', async () => {
      expect.assertions(2)
      const path = await download(
        'https://github.com/iwatakeshi/gitly#v2.0.0',
        options
      )
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "github.com/iwatakeshi/gitly"', async () => {
      expect.assertions(2)
      const path = await download('github.com/iwatakeshi/gitly', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "github.com/iwatakeshi/gitly#v2.0.0"', async () => {
      expect.assertions(2)
      const path = await download('github.com/iwatakeshi/gitly#v2.0.0', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "github:iwatakeshi/gitly"', async () => {
      expect.assertions(2)
      const path = await download('github:iwatakeshi/gitly', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "github:iwatakeshi/gitly#v2.0.0"', async () => {
      expect.assertions(2)
      const path = await download('github:iwatakeshi/gitly#v2.0.0', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should download "gitlab:Rich-Harris/buble#v0.15.2"', async () => {
      expect.assertions(2)
      const path = await download('gitlab:Rich-Harris/buble#v0.15.2', options)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })

    it('should return an empty string when a repo is not found', async () => {
      expect.assertions(1)
      expect(await download('github:doesnotexist123xyz/gitly#v2.0.0')).toEqual(
        ''
      )
    })

    it('should throw an error when a repo is not found (with options', async () => {
      expect.assertions(1)
      await expect(download('github:doesnotexist123xyz/gitly#v2.0.0', {
        throw: true,
      })).rejects.toThrow()
    })
  })

  describe('cached', () => {
    const options = {
      cache: {
        directory: TEST_DIR_CACHE
      },
    }
    const isCached = (ms: number) => Date.now() - ms <= 15

    beforeAll(async () => {
      rm('-rf', TEST_DIR_CACHE!)
      // Prefetch
      const path = await download('iwatakeshi/gitly', {...options, force: true})
      expect(existsSync(path)).toBe(true)
    })

    afterAll(async () => {
      rm('-rf', TEST_DIR_CACHE!)
    })

    it('should return a path to the cached zipped file', async () => {
      const start = Date.now()
      const path = await download('iwatakeshi/gitly', options)
      expect(isCached(start)).toBe(true)
      expect(path).toBeTruthy()
      expect(existsSync(path)).toBe(true)
    })
  })
})
