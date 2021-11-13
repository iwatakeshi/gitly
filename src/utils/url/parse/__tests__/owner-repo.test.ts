import { ownerRepo } from '../owner-repo'

describe('owner-repo', () => {
  it('should return the owner and repository name from a given path (i.e. owner/.../repo)', () => {
    expect(ownerRepo('owner/some/path/to/repo')).toEqual(['owner', 'repo'])
  })

  it('should return empty strings when an invalid path is entered', () => {
    expect(ownerRepo('blah')).toEqual(['', ''])
  })
})
