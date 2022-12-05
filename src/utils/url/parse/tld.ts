import { GitProvider } from '../../../types/git'

export type TLD<T extends string = never> = 'com' | 'org' | T

export function tld<P extends string = never, T extends string = never>(
  provider: GitProvider<P>,
  tld: TLD<T> = 'com'
): TLD<T> {
  const map = {
    bitbucket: 'org',
    github: 'com',
    gitlab: 'com',
  } as Record<GitProvider<P>, TLD<T>>

  return map[provider] || tld
}
