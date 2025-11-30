import exists from '../exists'
import clone from '../clone'
import shelljs from 'shelljs'
import { join } from 'node:path'

const { rm } = shelljs

describe('utils/clone', () => {
  const options = {
    temp: join(__dirname, 'output', 'clone'),
    backend: 'git' as 'git' | 'axios',
    throws: true
  }
  beforeAll(() => {
    rm('-rf', join(__dirname, 'output', 'clone'))
  })

  afterAll(() => {
    rm('-rf', join(__dirname, 'output', 'clone'))
  })
  it('should clone the repository', async () => {
    const result = await clone('iwatakeshi/gitly', options)
    expect(await exists(result)).toBe(true)
  })
})
