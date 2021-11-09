import {GitURL} from "../git-url";

describe('GitURL', () => {
  it('should create an instance of GitURL', () => {
    const url = new GitURL('https://www.github.com/iwatakeshi/gitly')
    expect(url instanceof GitURL).toEqual(true)
  })

  it('should throw when url is invalid', () => {
    expect(() => new GitURL('google.com')).toThrow()
  })

  it('should parse a url', () => {
    expect(new GitURL('https://www.github.com/iwatakeshi/gitly')).toMatchObject({
      host: 'www.github.com',
      pathname: '/iwatakeshi/gitly',
      owner: 'iwatakeshi',
      repository: 'gitly',
      branch: 'master',
      provider: 'github'
    })
  })

  it('should parse an anchor within a url', () => {
    expect(new GitURL('https://www.github.com/iwatakeshi/gitly#v1.0.0'))
      .toMatchObject({
        host: 'www.github.com',
        pathname: '/iwatakeshi/gitly',
        owner: 'iwatakeshi',
        repository: 'gitly',
        branch: 'v1.0.0',
        provider: 'github'
      })
  })

  it('should override the repository\'s metadata', () => {
    expect(new GitURL('https://www.github.com/iwatakeshi/gitly', undefined, {
      branch: 'v2.0.0'
    })).toMatchObject({
      host: 'www.github.com',
      pathname: '/iwatakeshi/gitly',
      owner: 'iwatakeshi',
      branch: 'v2.0.0'
    })
  })


})