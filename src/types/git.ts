export type GitProvider<T = ''> = |
  'bitbucket' |
  'github' |
  'gitlab' |
  T

export interface GitMetadata {
  owner: string
  repository: string
  branch: string
  provider: GitProvider
}