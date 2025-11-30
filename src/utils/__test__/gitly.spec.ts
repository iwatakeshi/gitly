import { join } from 'node:path'
import gitly from '../gitly'
import exists from '../exists'
import shelljs from 'shelljs'

const { rm } = shelljs

describe('gitly', () => {
  const destination = join(__dirname, 'output', 'gitly')
  const options = {
    temp: join(__dirname, 'output', 'gitly'),
  }

  beforeEach(() => {
    rm('-rf', join(__dirname, 'output', 'gitly'))
  })
  afterEach(() => {
    rm('-rf', destination)
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
