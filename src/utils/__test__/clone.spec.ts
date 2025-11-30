import { describe, it, expect, beforeAll } from '@jest/globals'
import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import exists from '../exists'
import clone from '../clone'

describe('utils/clone', () => {
  const options = {
    temp: join(__dirname, 'output', 'clone'),
    backend: 'git' as 'git' | 'axios',
    throws: true
  }
  beforeAll(async () => {
    await rm(join(__dirname, 'output', 'clone'), { recursive: true, force: true })
  })

  afterAll(async () => {
    await rm(join(__dirname, 'output', 'clone'), { recursive: true, force: true })
  })
  it('should clone the repository', async () => {
    const result = await clone('iwatakeshi/gitly', options)
    expect(await exists(result)).toBe(true)
  })
})
