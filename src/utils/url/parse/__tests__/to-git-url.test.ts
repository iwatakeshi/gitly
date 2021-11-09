import {toGitURL} from "../to-git-url";
import {GitURL} from "../../git-url";

describe('to-git-url', () => {
  describe('to-url', () => {
    it('should create an instance of URL from a url', () => {
      const url = toGitURL('https://www.github.com/iwatakeshi/gitly')
      expect(url instanceof GitURL).toEqual(true)
    })

    it('should throw when an invalid url', () => {
      expect(() => toGitURL('')).toThrow()
    })
  })
})