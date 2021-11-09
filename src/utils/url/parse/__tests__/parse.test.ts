import {parse} from "../index";
import {GitMetadata} from "../../../../types/git";

const expected = (url: Partial<GitMetadata> = {}) => ({
  owner: 'iwatakeshi',
  repository: 'gitly',
  branch: 'master',
  provider: 'github',
  ...url
})

describe('parse', () => {
  it('should parse an absolute url (https://github.com/iwatakeshi/gitly)', () => {
    const url = 'https://github.com/iwatakeshi/gitly'
    expect(parse((url)))
      .toMatchObject(expected())
  })

  it('should parse an absolute url (https://www.github.com/iwatakeshi/gitly)', () => {
    const url = 'https://www.github.com/iwatakeshi/gitly'
    expect(parse((url)))
      .toMatchObject(expected())
  })

  it('should parse a simple (protocol-less) url (github.com/iwatakeshi/gitly)', () => {
    const url = 'github.com/iwatakeshi/gitly'
    expect(parse(url))
      .toMatchObject(expected())
  })

  it('should parse a scoped relative url (github:iwatakeshi/gitly)', () => {
    expect(parse('github:iwatakeshi/gitly'))
      .toMatchObject(expected())
  })

  it('should parse a scoped relative url with a version (github:iwatakeshi/gitly#v0.15.2)', () => {
    expect(parse('github:iwatakeshi/gitly#v0.15.2'))
      .toMatchObject(expected({branch: 'v0.15.2'}))
  })

  it('should parse a relative url (github:iwatakeshi/gitly)', () => {
    expect(parse('iwatakeshi/gitly'))
      .toMatchObject(expected())
  })
})