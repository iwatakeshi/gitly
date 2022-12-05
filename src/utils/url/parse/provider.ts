import { GitProvider } from '../../../types/git'
import { extract } from './extract'
export function provider<T extends string = never>(input: string) {
  return extract(input).domain as GitProvider<T>
}