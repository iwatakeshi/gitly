import exists from '../exists';
import clone from '../clone'
import { rm } from 'shelljs'
import { join } from 'path';


describe('utils/clone', () => {
  const destination = join(__dirname, 'output', 'clone', 'example')
  const options = {
    temp: join(__dirname, 'output', 'clone', '.gitcopy'),
  }

  beforeEach(async () => {
    rm('-rf', join(__dirname, 'output', 'clone', '.gitcopy'))
  })
  afterEach(async () => {
    rm('-rf', destination)
  })

  afterAll(async () => {
    rm('-rf', join(__dirname, 'output', 'clone', '.gitcopy'))
  })
  it('should clone the repository', async () => {
    const result = await clone('lukeed/gittar', options)
    expect(await exists(result)).toBe(true)
  })
})