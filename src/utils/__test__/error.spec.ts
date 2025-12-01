import { describe, expect, it } from '@jest/globals'
import {
  GitlyDownloadError,
  GitlyErrorType,
  GitlyExtractError,
  GitlyFetchError,
  GitlyUnknownError,
} from '../error'

describe('utils/error', () => {
  describe('GitlyFetchError', () => {
    it('should return an instance', () => {
      const error = new GitlyFetchError('message')
      expect(error.message).toBe('[gitly:fetch]: message')
      expect(error.code).toBe(-1)
      expect(error.type).toBe(GitlyErrorType.Fetch)
    })
  })

  describe('GitlyExtractError', () => {
    it('should return an instance', () => {
      const error = new GitlyExtractError('message')
      expect(error.message).toBe('[gitly:extract]: message')
      expect(error.code).toBe(-1)
      expect(error.type).toBe(GitlyErrorType.Extract)
    })
  })

  describe('GitlyDownloadError', () => {
    it('should return an instance', () => {
      const error = new GitlyDownloadError('message', 402)
      expect(error.message).toBe('[gitly:download]: message')
      expect(error.code).toBe(402)
      expect(error.type).toBe(GitlyErrorType.Download)
    })
  })

  describe('GitlyUnknownError', () => {
    it('should return an instance', () => {
      const error = new GitlyUnknownError('message', 402)
      expect(error.message).toBe('[gitly:unknown]: message')
      expect(error.code).toBe(402)
      expect(error.type).toBe(GitlyErrorType.Unknown)
    })
  })
})
