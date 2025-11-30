import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import gitly from '../gitly'
import exists from '../exists'

describe('gitly', () => {
  const destination = join(__dirname, 'output', 'gitly')
  const options = {
    temp: join(__dirname, 'output', 'gitly'),
  }

  beforeEach(async () => {
    await rm(join(__dirname, 'output', 'gitly'), { recursive: true, force: true })
  })
  afterEach(async () => {
    await rm(destination, { recursive: true, force: true })
  })

  it('should clone the repository using axios', async () => {
    const result = await gitly('lukeed/gittar', destination, options)
    expect(await exists(result[0])).toBe(true)
    expect(await exists(result[1])).toBe(true)
  })

  it('should clone the repository using git', async () => {
    const result = await gitly('lukeed/gittar', destination, {
      ...options,
      backend: 'git',
    })
    expect(await exists(result[0])).toBe(true)
    expect(await exists(result[1])).toBe(true)
  })
})
