import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { rm } from 'node:fs/promises'

import download from '../download'
import extract from '../extract'

describe('utils/extract', () => {
  const destination = join(__dirname, 'output', 'extract')
  const options = {
    temp: join(__dirname, 'output', 'extract', '.gitcopy'),
  }

  beforeEach(async () => {
    await rm(join(__dirname, 'output', 'extract', '.gitcopy'), { recursive: true, force: true })
  })
  afterEach(async () => {
    await rm(destination, { recursive: true, force: true })
  })

  afterAll(async () => {
    await rm(join(__dirname, 'output', 'extract'), { recursive: true, force: true })
  })

  it('should extract "lukeed/gittar"', async () => {
    // tslint:disable-next-line: no-floating-promises
    const path = await download('lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should extract "lukeed/gittar#v0.1.1"', async () => {
    // tslint:disable-next-line: no-floating-promises
    const source = await download('lukeed/gittar#v0.1.1', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "https://github.com/lukeed/gittar"', async () => {
    const source = await download('https://github.com/lukeed/gittar', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "https://github.com/lukeed/gittar#v0.1.1"', async () => {
    const source = await download(
      'https://github.com/lukeed/gittar#v0.1.1',
      options
    )
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github.com/lukeed/gittar"', async () => {
    const source = await download('github.com/lukeed/gittar', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github.com/lukeed/gittar#v0.1.1"', async () => {
    const source = await download('github.com/lukeed/gittar#v0.1.1', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github:lukeed/gittar"', async () => {
    const source = await download('github:lukeed/gittar', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github:lukeed/gittar#v0.1.1"', async () => {
    const source = await download('github:lukeed/gittar#v0.1.1', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should error and return an empty string when extraction fails', async () => {
    const path = await extract(join(__dirname, 'dummy'), destination, options)
    expect(existsSync(path)).toBe(false)
    expect(path).toBeFalsy()
  })
})
