import { extract } from "../extract"

describe('extract', () => {
  it('should return an empty result when input is invalid', () => {
    expect(extract('')).toMatchObject({
      protocol: '',
      tld: '',
      domain: '',
      subdomain: '',
      path: []
    })

    expect(extract('hello')).toMatchObject({
      protocol: '',
      tld: '',
      domain: '',
      subdomain: '',
      path: []
    })
  })

  it('should parse the url and return the tld and domain', () => {
    expect(extract('google.com')).toMatchObject({
      protocol: 'https',
      tld: 'com',
      domain: 'google',
      subdomain: '',
      path: []
    })
  })

  it('should parse the url and return the tld, domain, and subdomain', () => {
    expect(extract('analytics.google.com')).toMatchObject({
      protocol: 'https',
      tld: 'com',
      domain: 'google',
      subdomain: 'analytics',
      path: []
    })

    expect(extract('https://www.a.b.c.domain.org/a/b/c')).toMatchObject({
      protocol: 'https',
      tld: 'org',
      domain: 'domain',
      subdomain: 'a.b.c',
      path: ['a', 'b', 'c']
    })
  })
})