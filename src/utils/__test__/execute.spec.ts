import { describe, expect, it } from '@jest/globals'
import execute from '../execute'

describe('utils/execute', () => {
  it('should return result from first successful task', async () => {
    const tasks = [async () => false, async () => 'success', async () => 'should not reach']
    const result = await execute(tasks)
    expect(result).toBe('success')
  })

  it('should return false when no tasks provided', async () => {
    const result = await execute([])
    expect(result).toBe(false)
  })

  it('should return false when all tasks return false', async () => {
    const tasks = [async () => false, async () => false, async () => false]
    const result = await execute(tasks)
    expect(result).toBe(false)
  })

  it('should throw AggregateError when all tasks fail', async () => {
    const error1 = new Error('Task 1 failed')
    const error2 = new Error('Task 2 failed')
    const error3 = new Error('Task 3 failed')

    const tasks = [
      async () => {
        throw error1
      },
      async () => {
        throw error2
      },
      async () => {
        throw error3
      },
    ]

    await expect(execute(tasks)).rejects.toThrow(AggregateError)

    try {
      await execute(tasks)
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      const aggError = error as AggregateError
      expect(aggError.errors).toHaveLength(3)
      expect(aggError.errors[0]).toBe(error1)
      expect(aggError.errors[1]).toBe(error2)
      expect(aggError.errors[2]).toBe(error3)
      expect(aggError.message).toBe('All tasks failed (3 attempts)')
    }
  })

  it('should convert non-Error throws to Error objects', async () => {
    const tasks = [
      async () => {
        throw 'string error'
      },
      async () => {
        throw 404
      },
      async () => {
        throw { code: 'CUSTOM' }
      },
    ]

    try {
      await execute(tasks)
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      const aggError = error as AggregateError
      expect(aggError.errors).toHaveLength(3)
      expect(aggError.errors[0]).toBeInstanceOf(Error)
      expect(aggError.errors[1]).toBeInstanceOf(Error)
      expect(aggError.errors[2]).toBeInstanceOf(Error)
      expect(aggError.errors[0].message).toBe('string error')
    }
  })

  it('should skip failed tasks and continue to next', async () => {
    const tasks = [
      async () => {
        throw new Error('First failed')
      },
      async () => false,
      async () => {
        throw new Error('Third failed')
      },
      async () => 'finally succeeded',
    ]

    const result = await execute(tasks)
    expect(result).toBe('finally succeeded')
  })

  it('should handle mix of errors and false returns', async () => {
    const error1 = new Error('Failed task')
    const error2 = new Error('Another failure')

    const tasks = [
      async () => false,
      async () => {
        throw error1
      },
      async () => false,
      async () => {
        throw error2
      },
    ]

    try {
      await execute(tasks)
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      const aggError = error as AggregateError
      expect(aggError.errors).toHaveLength(2)
      expect(aggError.errors[0]).toBe(error1)
      expect(aggError.errors[1]).toBe(error2)
    }
  })
})
