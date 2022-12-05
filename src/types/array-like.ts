export type ArrayLike<T> = {
  readonly length: number
  readonly [n: number]: T
  slice(start?: number, end?: number): ArrayLike<T>
}
