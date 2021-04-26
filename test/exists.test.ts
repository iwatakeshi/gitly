import { join } from 'path'

import exists from '../src/utils/exists'

describe('utils/exists', () => {
  const options = {
    temp: join(__dirname, 'fixtures'),
  }
  it('should return true when a path exists', async () => {
    const result = await exists(join(__dirname, 'fixtures', 'test.txt'))
    expect(result).toBe(true)
  })

  it('should return false when a path does not exist', async () => {
    const result = await exists(join(__dirname, 'fixtures', 'dummy'))
    expect(result).toBe(false)
  })

  it('should return true when a non absolute path exists', async () => {
    const result = await exists('iwatakeshi/test', options)
    expect(result).toBe(true)
  })

  it('should return false when a non absolute path does not exists', async () => {
    const result = await exists('iwatakeshi/myrepo', options)
    expect(result).toBe(false)
  })
})
