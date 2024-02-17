import { join } from 'path'
import gitly from '../gitly'
import exists from '../exists'
import { rm } from 'shelljs'
describe('gitly', () => {
  const destination = join(__dirname, 'output', 'gitly')
  const options = {
    temp: join(__dirname, 'output', 'gitly'),
  }

  beforeEach(async () => {
    rm('-rf', join(__dirname, 'output', 'gitly'))
  })
  afterEach(async () => {
    rm('-rf', destination)
  })

  it('should clone the repository using axios', async () => {
    const result = await gitly('lukeed/gittar', destination, options)
    expect(await exists(result[0])).toBeDefined()
    expect(await exists(result[1])).toBeDefined()
  })

  it('should clone the repository using git', async () => {
    const result = await gitly('lukeed/gittar', destination, {
      ...options,
      backend: 'git',
    })
    expect(await exists(result[0])).toBeDefined()
    expect(await exists(result[1])).toBeDefined()
  })
})
