// type Iterable<T = any> = (T extends string ? string : T[])

import {Predicate} from "rambda";

export function takeLastUntil(fn: Predicate<string>): (iterable: string) => string;
export function takeLastUntil<T>(fn: Predicate<T>): (iterable: T[]) => T[]
export function takeLastUntil(fn: any) {
  return (iterable: any) => {
    let temp = []
    for (let i = iterable.length - 1; i >= 0; i--) {
      // If haven't found the element
      // then add it to the list
      if (fn(iterable[i])) break;
      // Keep adding the elements
      temp.push(iterable[i])
    }
    return typeof iterable === 'string' ? temp?.reverse().join('') : temp.reverse()
  }
}