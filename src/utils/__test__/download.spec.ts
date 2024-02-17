import { existsSync } from 'fs'
import { join } from 'path'
import { rm } from 'shelljs'

import download from '../download'
import { GitlyDownloadError } from '../error'

describe('utils/download (no cache)', () => {
  const options = {
    temp: join(__dirname, 'output', 'download'),
  }
  beforeEach(async () => {
    rm('-rf', join(__dirname, 'output', 'download'))
  })

  afterAll(async () => {
    rm('-rf', join(__dirname, 'output', 'download'))
  })

  it('should download "lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should download "lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download('lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should download "https://github.com/lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('https://github.com/lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })
  it('should download "https://github.com/lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download(
      'https://github.com/lukeed/gittar#v0.1.1',
      options
    )
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should download "github.com/lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('github.com/lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should download "github.com/lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download('github.com/lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should download "github:lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('github:lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should download "github:lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download('github:lukeed/gittar#v0.1.1', options)
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
    expect(await download('github:doesnotexist123xyz/gittar#v0.1.1')).toEqual(
      ''
    )
  })

  it('should throw an error when a repo is not found (with options', async () => {
    expect.assertions(1)
    try {
      await download('github:doesnotexist123xyz/gittar#v0.1.1', {
        throw: true,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(GitlyDownloadError)
    }
  })
})

describe('utils/download (cached)', () => {
  const options = {
    temp: join(__dirname, 'output', 'download', 'cache'),
    cache: true,
  }
  const isCached = (ms: number) => Date.now() - ms <= 15

  beforeAll(async () => {
    rm('-rf', join(__dirname, 'output', 'download', 'cache'))
    // Predownload
    const path = await download('lukeed/gittar', { temp: options.temp })
    expect(existsSync(path)).toBe(true)
  })

  afterAll(async () => {
    rm('-rf', join(__dirname, 'output', 'download', 'cache'))
  })

  it('should return a path to the cached zipped file', async () => {
    const start = Date.now()
    const path = await download('lukeed/gittar', options)
    expect(isCached(start)).toBe(true)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })
})
