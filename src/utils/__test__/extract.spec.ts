import { existsSync, promises as fs } from 'fs'
import { join } from 'path'

import extract from '../extract'
import fetch from '../fetch'

const { rmdir } = fs

describe('utils/extract', () => {
  const destination = join(__dirname, 'output', 'extract', 'example')
  const options = {
    temp: join(__dirname, 'output', 'extract', '.gitcopy')
  }
  beforeEach(async () => {
    await rmdir(join(__dirname, 'output', 'extract', '.gitcopy'), { recursive: true })
  })
  afterEach(async () => {
    await rmdir(destination, { recursive: true })
  })

  afterAll(async () => {
    await rmdir(join(__dirname, 'output', 'extract', '.gitcopy'), { recursive: true })
  })

  it('should extract "lukeed/gittar"', async () => {
    // tslint:disable-next-line: no-floating-promises
    const path = await fetch('lukeed/gittar', options)
    expect(path).toBeTruthy()
    expect(existsSync(path)).toBe(true)
  })

  it('should extract "lukeed/gittar#v0.1.1"', async () => {
    // tslint:disable-next-line: no-floating-promises
    const source = await fetch('lukeed/gittar#v0.1.1', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "https://github.com/lukeed/gittar"', async () => {
    const source = await fetch('https://github.com/lukeed/gittar', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "https://github.com/lukeed/gittar#v0.1.1"', async () => {
    const source = await fetch('https://github.com/lukeed/gittar#v0.1.1', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github.com/lukeed/gittar"', async () => {
    const source = await fetch('github.com/lukeed/gittar', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github.com/lukeed/gittar#v0.1.1"', async () => {
    const source = await fetch('github.com/lukeed/gittar#v0.1.1', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github:lukeed/gittar"', async () => {
    const source = await fetch('github:lukeed/gittar', options)
    const path = await extract(source, destination, options)
    expect(existsSync(source)).toBe(true)
    expect(source).toBeTruthy()
    expect(existsSync(path)).toBe(true)
    expect(path).toBeTruthy()
  })

  it('should extract "github:lukeed/gittar#v0.1.1"', async () => {
    const source = await fetch('github:lukeed/gittar#v0.1.1', options)
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
