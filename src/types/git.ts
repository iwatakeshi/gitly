export type GitProvider<T extends string = never> =
  | 'bitbucket'
  | 'github'
  | 'gitlab'
  | T

/**
 * Defines the metadata for a git repository
 */
export interface GitMetadata {
  owner: string
  repository: string
  branch: string
  provider: GitProvider
}
