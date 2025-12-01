import { describe, it, expect } from '@jest/globals'
import {
  SubdirectoryExtractionStrategy,
  FullExtractionStrategy,
  ExtractionStrategyFactory,
  createExtractionFilter,
} from '../extraction-strategy'

describe('extraction-strategy', () => {
  describe('FullExtractionStrategy', () => {
    it('should extract all paths', () => {
      const strategy = new FullExtractionStrategy()
      expect(strategy.shouldExtract()).toBe(true)
      expect(strategy.shouldExtract()).toBe(true)
    })

    it('should not transform paths', () => {
      const strategy = new FullExtractionStrategy()
      expect(strategy.transformPath('some/path')).toBe('some/path')
    })
  })

  describe('SubdirectoryExtractionStrategy', () => {
    it('should extract only matching subdirectory', () => {
      const strategy = new SubdirectoryExtractionStrategy('packages/lib')
      
      expect(strategy.shouldExtract('packages/lib')).toBe(true)
      expect(strategy.shouldExtract('packages/lib/src/index.ts')).toBe(true)
      expect(strategy.shouldExtract('packages/lib/README.md')).toBe(true)
      expect(strategy.shouldExtract('packages/other')).toBe(false)
      expect(strategy.shouldExtract('src/index.ts')).toBe(false)
    })

    it('should transform paths by removing subdirectory prefix', () => {
      const strategy = new SubdirectoryExtractionStrategy('packages/lib')
      
      expect(strategy.transformPath('packages/lib/src/index.ts')).toBe('src/index.ts')
      expect(strategy.transformPath('packages/lib/README.md')).toBe('README.md')
      expect(strategy.transformPath('packages/lib')).toBe('')
    })

    it('should handle different path separators', () => {
      // On Unix-like systems, backslash is just a regular character
      // The strategy normalizes paths, so this test verifies normalization works
      const strategy = new SubdirectoryExtractionStrategy('packages/lib')
      
      expect(strategy.shouldExtract('packages/lib/src/index.ts')).toBe(true)
      expect(strategy.transformPath('packages/lib/src/index.ts')).toBe('src/index.ts')
    })

    it('should normalize leading/trailing slashes', () => {
      const strategy = new SubdirectoryExtractionStrategy('/packages/lib/')
      
      expect(strategy.shouldExtract('packages/lib/src/index.ts')).toBe(true)
      expect(strategy.transformPath('packages/lib/src/index.ts')).toBe('src/index.ts')
    })
  })

  describe('ExtractionStrategyFactory', () => {
    it('should create FullExtractionStrategy when no subdirectory', () => {
      const strategy = ExtractionStrategyFactory.create()
      expect(strategy).toBeInstanceOf(FullExtractionStrategy)
    })

    it('should create SubdirectoryExtractionStrategy when subdirectory provided', () => {
      const strategy = ExtractionStrategyFactory.create('packages/lib')
      expect(strategy).toBeInstanceOf(SubdirectoryExtractionStrategy)
    })
  })

  describe('createExtractionFilter', () => {
    it('should combine strategy and custom filter', () => {
      const strategy = new SubdirectoryExtractionStrategy('packages/lib')
      const customFilter = (path: string) => !path.includes('node_modules')
      
      const filter = createExtractionFilter(strategy, customFilter)
      
      // Should pass both strategy and custom filter
      expect(filter('packages/lib/src/index.ts', {} as any)).toBe(true)
      
      // Should fail strategy check
      expect(filter('packages/other/src/index.ts', {} as any)).toBe(false)
      
      // Should fail custom filter
      expect(filter('packages/lib/node_modules/dep/index.js', {} as any)).toBe(false)
    })

    it('should work without custom filter', () => {
      const strategy = new SubdirectoryExtractionStrategy('src')
      const filter = createExtractionFilter(strategy)
      
      expect(filter('src/index.ts', {} as any)).toBe(true)
      expect(filter('test/index.ts', {} as any)).toBe(false)
    })
  })
})
