import { existsSync } from 'fs'
import { join } from 'path'
import { rm } from 'shelljs'

import download from '../src/download'
import { GitlyDownloadError } from '../src/utils/error'

describe('utils/fetch (no cache)', () => {
  const options = {
    temp: join(__dirname, 'output', 'fetch', '.gitly'),
  }
  beforeEach(async () => {
    rm('-rf', join(__dirname, 'output', 'fetch', '.gitly'))
  })

  afterAll(async () => {
    rm('-rf', join(__dirname, 'output', 'fetch', '.gitly'))
  })

  it('should fetch "lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download('lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "https://github.com/lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('https://github.com/lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })
  it('should fetch "https://github.com/lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download(
      'https://github.com/lukeed/gittar#v0.1.1',
      options
    )
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github.com/lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('github.com/lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github.com/lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download('github.com/lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github:lukeed/gittar"', async () => {
    expect.assertions(2)
    const path = await download('github:lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github:lukeed/gittar#v0.1.1"', async () => {
    expect.assertions(2)
    const path = await download('github:lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it.skip('should fetch "gitlab:Rich-Harris/buble#v0.15.2"', async () => {
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

describe('utils/fetch (cached)', () => {
  const options = {
    temp: join(__dirname, 'output', 'fetch', 'cache'),
    cache: true,
  }
  const isCached = (ms: number) => Date.now() - ms <= 15

  beforeAll(async () => {
    rm('-rf', join(__dirname, 'output', 'fetch', 'cache'))
    // Prefetch
    const path = await download('lukeed/gittar', { temp: options.temp })
    expect(existsSync(path)).toBe(true)
  })

  afterAll(async () => {
    rm('-rf', join(__dirname, 'output', 'fetch', 'cache'))
  })

  it('should return a path to the cached zipped file', async () => {
    const start = Date.now()
    const path = await download('lukeed/gittar', options)
    expect(isCached(start)).toBe(true)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })
})
