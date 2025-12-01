import { describe, expect, it } from '@jest/globals'
import type URLInfo from '../../interfaces/url'
import parse from '../parse'

describe('utils/parse', () => {
  it('should parse "owner/repo"', () => {
    expect(parse('owner/repo')).toStrictEqual({
      protocol: 'https',
      host: 'github.com',
      hostname: 'github',
      hash: '',
      href: 'https://github.com/owner/repo',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'master',
    } as URLInfo)
  })

  it('should parse "owner/repo#v1.0.0"', () => {
    expect(parse('owner/repo#v1.0.0')).toStrictEqual({
      protocol: 'https',
      host: 'github.com',
      hostname: 'github',
      hash: '#v1.0.0',
      href: 'https://github.com/owner/repo#v1.0.0',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'v1.0.0',
    } as URLInfo)
  })

  it('should parse "https://host.com/owner/repo"', () => {
    expect(parse('https://host.com/owner/repo')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '',
      href: 'https://host.com/owner/repo',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'master',
    } as URLInfo)
  })

  it('should parse "host.com/owner/repo"', () => {
    expect(parse('host.com/owner/repo')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '',
      href: 'https://host.com/owner/repo',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'master',
    } as URLInfo)
  })

  it('should parse "host.com/owner/repo.git"', () => {
    expect(parse('host.com/owner/repo.git')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '',
      href: 'https://host.com/owner/repo',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'master',
    } as URLInfo)
  })

  it('should parse "host.com/owner/repo.git#tag"', () => {
    expect(parse('host.com/owner/repo.git#tag')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '#tag',
      href: 'https://host.com/owner/repo#tag',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'tag',
    } as URLInfo)
  })

  it('should parse "host.com/owner/repo#tag"', () => {
    expect(parse('host.com/owner/repo#tag')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '#tag',
      href: 'https://host.com/owner/repo#tag',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'tag',
    } as URLInfo)
  })

  it('should parse "host:owner/repo"', () => {
    expect(parse('host:owner/repo')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '',
      href: 'https://host.com/owner/repo',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'master',
    } as URLInfo)
  })
  it('should parse "host:owner/repo#tag"', () => {
    expect(parse('host:owner/repo#tag')).toStrictEqual({
      protocol: 'https',
      host: 'host.com',
      hostname: 'host',
      hash: '#tag',
      href: 'https://host.com/owner/repo#tag',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'tag',
    } as URLInfo)
  })

  it('should parse "owner/repo#tag" with a different host', () => {
    expect(
      parse('owner/repo#tag', {
        host: 'blah.dev',
      }),
    ).toStrictEqual({
      protocol: 'https',
      host: 'blah.dev',
      hostname: 'blah',
      hash: '#tag',
      href: 'https://blah.dev/owner/repo#tag',
      path: '/owner/repo',
      repository: 'repo',
      owner: 'owner',
      type: 'tag',
    } as URLInfo)
  })

  describe('security: DOS prevention', () => {
    it('should reject URL with excessive zeros (ReDoS protection)', () => {
      const maliciousUrl = '0'.repeat(30) + '/repo'
      expect(() => parse(maliciousUrl)).toThrow('Invalid argument')
    })

    it('should reject host option with excessive zeros', () => {
      const maliciousHost = '0'.repeat(30)
      expect(() => parse('owner/repo', { host: maliciousHost })).toThrow('Invalid argument')
    })

    it('should allow URL with acceptable number of zeros', () => {
      const validUrl = 'owner/rep0'
      expect(() => parse(validUrl)).not.toThrow()
    })

    it('should allow host with acceptable number of zeros', () => {
      expect(() => parse('owner/repo', { host: 'host0' })).not.toThrow()
    })

    it('should reject URL with exactly 26 zeros', () => {
      const url = '0'.repeat(26) + 'owner/repo'
      expect(() => parse(url)).toThrow('Invalid argument')
    })

    it('should allow URL with exactly 25 zeros', () => {
      const url = '0'.repeat(25) + 'owner/repo'
      expect(() => parse(url)).not.toThrow()
    })
  })
})
