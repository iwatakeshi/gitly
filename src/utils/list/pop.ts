/**
 * An immutable `pop` function that removes the last item of a string or an array
 * @param x The string or array to pop
 */
export const pop = <T = string>(x: (T[] | string)) => x.slice(0, x.length - 1) as (T extends string ? T : T[])