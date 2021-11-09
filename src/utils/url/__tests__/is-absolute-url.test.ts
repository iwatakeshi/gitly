import isAbsoluteUrl from "../is-absolute-url";

describe('isAbsoluteURL', () => {
  it('should return true when a url is https://github.com', () => {
    expect(isAbsoluteUrl('https://github.com')).toEqual(true)
  })

  it('should return false when a url is google.com', () => {
    expect(isAbsoluteUrl('google.com')).toEqual(false)
  })

  it('should return false when a url is /hello/world', () => {
    expect(isAbsoluteUrl('/hello/world')).toEqual(false)
  })

  it('should return false when a url is empty', () => {
    expect(isAbsoluteUrl('')).toEqual(false)
  })

  it('should return false when a url is undefined', () => {
    expect(isAbsoluteUrl(undefined as any)).toEqual(false)
  })
})