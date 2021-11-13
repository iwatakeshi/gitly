import { equals, pipe, split } from 'rambda'
import { takeLastUntil } from '../take-last-until'

describe('takeLastUntil', () => {
  describe('array', () => {
    it('should add elements until the predicate is true', () => {
      expect(
        pipe(
          split('.'),
          takeLastUntil<any>(equals('www'))
        )('x.y.z.www.google.com')
      ).toEqual(['google', 'com'])
    })

    it('should return the identity when the predicate is false for all elements', () => {
      expect(
        pipe(
          split('.'),
          takeLastUntil<any>(equals('a'))
        )('x.y.z.www.google.com')
      ).toEqual(['x', 'y', 'z', 'www', 'google', 'com'])
    })
  })

  describe('string', () => {
    it('should add elements until the predicate is true', () => {
      expect(takeLastUntil(equals(' '))('hello world')).toEqual('world')
    })

    it('should return the identity when the predicate is false for all elements', () => {
      expect(takeLastUntil(equals('x'))('hello world')).toEqual('hello world')
    })
  })
})
