import { ArrayLike } from '../../types/array-like'
/**
 * An immutable `pop` function that removes the last item of a string or an array
 * @param x The string or array to pop
 */
export const pop = <T, U extends string | ArrayLike<T>>(x: U) =>
  x.slice(0, x.length - 1)
