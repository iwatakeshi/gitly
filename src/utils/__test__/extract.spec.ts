import { existsSync } from 'node:fs'
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'

import download from '../download'
import extract from '../extract'

describe('utils/extract', () => {
  const destination = join(__dirname, 'output', 'extract')
  const options = {
    temp: join(__dirname, 'output', 'extract', '.gitcopy'),
    resolveCommit: false, // Disable for predictable test performance
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
    const source = await download('https://github.com/lukeed/gittar#v0.1.1', options)
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

  it('should log error and return empty string on extraction failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const invalidTarball = join(__dirname, 'output', 'invalid.tar.gz')

    // Create an invalid tarball file
    await writeFile(invalidTarball, 'this is not a valid tar.gz file')

    const result = await extract(invalidTarball, destination, options)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to extract archive:', expect.any(Error))
    expect(result).toBe('')

    consoleErrorSpy.mockRestore()
    await rm(invalidTarball, { force: true })
  })
})
