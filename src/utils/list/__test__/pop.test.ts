import { pop } from "../pop";

describe('pop', () => {
  describe('array', () => {
    it('should pop an array', function () {
      const array = [1, 2, 3, 4]
      expect(pop(array)).toEqual([1, 2, 3])
      expect(array).toEqual([1, 2, 3, 4])
    });
  })

  describe('string', () => {
    it('should pop a string', function () {
      const string = 'cool'
      expect(pop(string)).toEqual('coo')
      expect(string).toEqual('cool')
    });
  })
})