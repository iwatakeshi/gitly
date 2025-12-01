import { promises as dns } from 'node:dns'
import { describe, expect, it, jest } from '@jest/globals'
import { isOffline } from '../offline'

// Mock the DNS module
jest.mock('node:dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}))

const mockLookup = dns.lookup as jest.MockedFunction<typeof dns.lookup>

describe('utils/offline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return false when online (DNS lookup succeeds)', async () => {
    mockLookup.mockResolvedValueOnce({ address: '8.8.8.8', family: 4 } as any)

    const result = await isOffline()

    expect(result).toBe(false)
    expect(mockLookup).toHaveBeenCalledWith('google.com')
  })

  it('should return true when offline (DNS lookup fails)', async () => {
    mockLookup.mockRejectedValueOnce(new Error('ENOTFOUND'))

    const result = await isOffline()

    expect(result).toBe(true)
    expect(mockLookup).toHaveBeenCalledWith('google.com')
  })

  it('should return true when DNS lookup throws network error', async () => {
    mockLookup.mockRejectedValueOnce(new Error('Network unreachable'))

    const result = await isOffline()

    expect(result).toBe(true)
    expect(mockLookup).toHaveBeenCalledWith('google.com')
  })
})
