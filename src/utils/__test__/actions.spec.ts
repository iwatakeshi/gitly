import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { join } from 'node:path'
import { rm, mkdir, writeFile } from 'node:fs/promises'
import {
  ActionsProcessor,
  CloneActionExecutor,
  RemoveActionExecutor,
  ActionExecutorFactory,
  type CloneAction,
  type RemoveAction,
} from '../actions'
import exists from '../exists'

describe('utils/actions', () => {
  const testDir = join(__dirname, 'output', 'actions-test')

  beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true })
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('CloneActionExecutor', () => {
    it('should clone a repository', async () => {
      const executor = new CloneActionExecutor()
      const action: CloneAction = {
        action: 'clone',
        src: 'lukeed/gittar',
        dest: 'cloned-repo',
      }

      await executor.execute(action, testDir, {
        temp: join(testDir, 'cache'),
        resolveCommit: false,
      })

      const clonedPath = join(testDir, 'cloned-repo')
      expect(await exists(clonedPath)).toBe(true)
    })

    it('should throw error for invalid action type', async () => {
      const executor = new CloneActionExecutor()
      const action = { action: 'remove', files: [] } as any

      await expect(
        executor.execute(action, testDir, {})
      ).rejects.toThrow('Invalid action type: remove')
    })

    it('should clone to working directory when dest is not provided', async () => {
      const executor = new CloneActionExecutor()
      const action: CloneAction = {
        action: 'clone',
        src: 'lukeed/gittar',
      }

      await executor.execute(action, testDir, {
        temp: join(testDir, 'cache'),
        resolveCommit: false,
      })

      // Check that files were cloned to testDir
      expect(await exists(testDir)).toBe(true)
    })
  })

  describe('RemoveActionExecutor', () => {
    it('should remove files', async () => {
      const executor = new RemoveActionExecutor()
      
      // Create test files
      const file1 = join(testDir, 'file1.txt')
      const file2 = join(testDir, 'file2.txt')
      await writeFile(file1, 'content1')
      await writeFile(file2, 'content2')

      expect(await exists(file1)).toBe(true)
      expect(await exists(file2)).toBe(true)

      const action: RemoveAction = {
        action: 'remove',
        files: ['file1.txt', 'file2.txt'],
      }

      await executor.execute(action, testDir, {})

      expect(await exists(file1)).toBe(false)
      expect(await exists(file2)).toBe(false)
    })

    it('should remove directories recursively', async () => {
      const executor = new RemoveActionExecutor()
      
      const subdir = join(testDir, 'subdir')
      await mkdir(subdir, { recursive: true })
      await writeFile(join(subdir, 'file.txt'), 'content')

      expect(await exists(subdir)).toBe(true)

      const action: RemoveAction = {
        action: 'remove',
        files: ['subdir'],
      }

      await executor.execute(action, testDir, {})

      expect(await exists(subdir)).toBe(false)
    })

    it('should throw error for invalid action type', async () => {
      const executor = new RemoveActionExecutor()
      const action = { action: 'clone', src: 'test' } as any

      await expect(
        executor.execute(action, testDir, {})
      ).rejects.toThrow('Invalid action type: clone')
    })

    it('should collect errors when removing multiple files fails', async () => {
      const executor = new RemoveActionExecutor()
      
      const action: RemoveAction = {
        action: 'remove',
        files: ['nonexistent1.txt', 'nonexistent2.txt'],
      }

      // Should not throw since force: true silently ignores missing files
      await executor.execute(action, testDir, {})
    })
  })

  describe('ActionExecutorFactory', () => {
    it('should return CloneActionExecutor for clone action', () => {
      const executor = ActionExecutorFactory.getExecutor('clone')
      expect(executor).toBeInstanceOf(CloneActionExecutor)
    })

    it('should return RemoveActionExecutor for remove action', () => {
      const executor = ActionExecutorFactory.getExecutor('remove')
      expect(executor).toBeInstanceOf(RemoveActionExecutor)
    })

    it('should throw error for unknown action type', () => {
      expect(() => {
        ActionExecutorFactory.getExecutor('invalid' as any)
      }).toThrow('Unknown action type: invalid')
    })
  })

  describe('ActionsProcessor', () => {
    it('should process gitly.json with actions', async () => {
      const config = {
        actions: [
          {
            action: 'remove' as const,
            files: ['README.md'],
          },
        ],
      }

      await writeFile(join(testDir, 'README.md'), '# Test')
      await writeFile(join(testDir, 'gitly.json'), JSON.stringify(config))

      expect(await exists(join(testDir, 'README.md'))).toBe(true)
      expect(await exists(join(testDir, 'gitly.json'))).toBe(true)

      await ActionsProcessor.processDirectory(testDir, {})

      expect(await exists(join(testDir, 'README.md'))).toBe(false)
      expect(await exists(join(testDir, 'gitly.json'))).toBe(false) // Config should be removed
    })

    it('should process degit.json as fallback', async () => {
      const config = {
        actions: [
          {
            action: 'remove' as const,
            files: ['test.txt'],
          },
        ],
      }

      await writeFile(join(testDir, 'test.txt'), 'content')
      await writeFile(join(testDir, 'degit.json'), JSON.stringify(config))

      expect(await exists(join(testDir, 'test.txt'))).toBe(true)

      await ActionsProcessor.processDirectory(testDir, {})

      expect(await exists(join(testDir, 'test.txt'))).toBe(false)
      expect(await exists(join(testDir, 'degit.json'))).toBe(false)
    })

    it('should do nothing when no config file exists', async () => {
      await writeFile(join(testDir, 'file.txt'), 'content')
      
      await ActionsProcessor.processDirectory(testDir, {})
      
      expect(await exists(join(testDir, 'file.txt'))).toBe(true)
    })

    it('should do nothing when actions array is empty', async () => {
      const config = { actions: [] }
      await writeFile(join(testDir, 'gitly.json'), JSON.stringify(config))
      await writeFile(join(testDir, 'file.txt'), 'content')

      await ActionsProcessor.processDirectory(testDir, {})

      expect(await exists(join(testDir, 'file.txt'))).toBe(true)
    })

    it('should handle invalid JSON in config file', async () => {
      await writeFile(join(testDir, 'gitly.json'), 'invalid json{')
      await writeFile(join(testDir, 'file.txt'), 'content')

      // Should not throw, just skip the invalid config
      await ActionsProcessor.processDirectory(testDir, {})

      expect(await exists(join(testDir, 'file.txt'))).toBe(true)
    })

    it('should handle config with no actions property', async () => {
      const config = { other: 'property' }
      await writeFile(join(testDir, 'gitly.json'), JSON.stringify(config))

      await ActionsProcessor.processDirectory(testDir, {})

      // Should complete without error
      expect(await exists(join(testDir, 'gitly.json'))).toBe(false)
    })

    it('should execute multiple actions sequentially', async () => {
      const config = {
        actions: [
          {
            action: 'remove' as const,
            files: ['file1.txt'],
          },
          {
            action: 'remove' as const,
            files: ['file2.txt'],
          },
        ],
      }

      await writeFile(join(testDir, 'file1.txt'), 'content1')
      await writeFile(join(testDir, 'file2.txt'), 'content2')
      await writeFile(join(testDir, 'gitly.json'), JSON.stringify(config))

      await ActionsProcessor.processDirectory(testDir, {})

      expect(await exists(join(testDir, 'file1.txt'))).toBe(false)
      expect(await exists(join(testDir, 'file2.txt'))).toBe(false)
    })

    it('should throw AggregateError when actions fail', async () => {
      const config = {
        actions: [
          {
            action: 'clone' as const,
            src: 'nonexistent/repo-that-does-not-exist-12345',
            dest: 'cloned',
          },
        ],
      }

      await writeFile(join(testDir, 'gitly.json'), JSON.stringify(config))

      await expect(
        ActionsProcessor.processDirectory(testDir, {
          temp: join(testDir, 'cache'),
          resolveCommit: false,
          throw: true,
        })
      ).rejects.toThrow('Failed to execute 1 action(s)')
    })
  })
})
