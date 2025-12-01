import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from '@jest/globals'

import download from '../download'
import { GitlyDownloadError } from '../error'

describe('utils/download (no cache)', () => {
  const options = {
    temp: join(__dirname, 'output', 'download'),
    resolveCommit: false, // Disable commit resolution for faster, predictable tests
  }

  beforeAll(async () => {
    await rm(join(__dirname, 'output', 'download'), { recursive: true, force: true })
  })

  beforeEach(async () => {
    await rm(join(__dirname, 'output', 'download'), { recursive: true, force: true })
  })

  afterAll(async () => {
    await rm(join(__dirname, 'output', 'download'), { recursive: true, force: true })
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
    const path = await download('https://github.com/lukeed/gittar#v0.1.1', options)
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
    expect(
      await download('github:doesnotexist123xyz/gittar#v0.1.1', {
        resolveCommit: false,
      }),
    ).toEqual('')
  })

  it('should throw an error when a repo is not found (with options', async () => {
    expect.assertions(2)
    try {
      await download('github:doesnotexist123xyz/gittar#v0.1.1', {
        throw: true,
        resolveCommit: false,
      })
    } catch (error) {
      // Now throws AggregateError containing GitlyDownloadError(s)
      expect(error).toBeInstanceOf(AggregateError)
      const aggError = error as AggregateError
      expect(aggError.errors.some((e) => e instanceof GitlyDownloadError)).toBe(true)
    }
  })
})

describe('utils/download (cached)', () => {
  const options = {
    temp: join(__dirname, 'output', 'download', 'cache'),
    cache: true,
    resolveCommit: false, // Disable commit resolution for predictable cache paths
  }
  const isCached = (ms: number) => Date.now() - ms <= 15

  beforeAll(async () => {
    await rm(join(__dirname, 'output', 'download', 'cache'), { recursive: true, force: true })
    // Predownload
    const path = await download('lukeed/gittar', { temp: options.temp, resolveCommit: false })
    expect(existsSync(path)).toBe(true)
  })

  afterAll(async () => {
    await rm(join(__dirname, 'output', 'download', 'cache'), { recursive: true, force: true })
  })

  it('should return a path to the cached zipped file', async () => {
    const start = Date.now()
    const path = await download('lukeed/gittar', options)
    expect(isCached(start)).toBe(true)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })
})
