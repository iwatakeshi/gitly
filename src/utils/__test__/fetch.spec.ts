import { existsSync, promises as fs } from 'fs'
import { join } from 'path'
const { rmdir } = fs

import fetch from '../fetch'

describe('utils/fetch', () => {
  const options = {
    temp: join(__dirname, 'output', 'fetch', '.gitcopy')
  }
  beforeEach(async () => {
    await rmdir(join(__dirname, 'output', 'fetch', '.gitcopy'), { recursive: true })
  })

  afterAll(async () => {
    await rmdir(join(__dirname, 'output', 'fetch', '.gitcopy'), { recursive: true })
  })

  it('should fetch "lukeed/gittar"', async () => {
    const path = await fetch('lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "lukeed/gittar#v0.1.1"', async () => {
    const path = await fetch('lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "https://github.com/lukeed/gittar"', async () => {
    const path = await fetch('https://github.com/lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })
  it('should fetch "https://github.com/lukeed/gittar#v0.1.1"', async () => {
    const path = await fetch('https://github.com/lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github.com/lukeed/gittar"', async () => {
    const path = await fetch('github.com/lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github.com/lukeed/gittar#v0.1.1"', async () => {
    const path = await fetch('github.com/lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github:lukeed/gittar"', async () => {
    const path = await fetch('github:lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "github:lukeed/gittar#v0.1.1"', async () => {
    const path = await fetch('github:lukeed/gittar#v0.1.1', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should fetch "gitlab:Rich-Harris/buble#v0.15.2"', async () => {
    const path = await fetch('gitlab:Rich-Harris/buble#v0.15.2', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should error and return an empty string when a repo is not found', async () => {
    await expect(fetch('github:deekul:gittar#v0.1.1')).resolves.toEqual('').catch(error => expect(error).toEqual({
      status: 404,
      message: 'Not Found'
    }))
  })
})

describe('utils/fetch (cache)', () => {
  const options = {
    temp: join(__dirname, 'output', 'fetch', 'cache'),
    cache: true
  }
  const isCached = (ms: number) => Date.now() - ms <= 15

  beforeAll(async () => {
    await rmdir(join(__dirname, 'output', 'fetch', 'cache'), { recursive: true })
    // Prefetch
    const path = await fetch('lukeed/gittar', { temp: options.temp })
    expect(existsSync(path)).toBe(true)
  })

  afterAll(async () => {
    await rmdir(join(__dirname, 'output', 'fetch', 'cache'), { recursive: true })
  })

  it('should return a path to the cached zipped file', async () => {
    const start = Date.now()
    const path = await fetch('lukeed/gittar', options)
    expect(isCached(start)).toBe(true)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)

  })
})
