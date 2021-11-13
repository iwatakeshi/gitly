export type GitProvider<T = ''> = 'bitbucket' | 'github' | 'gitlab' | T

/**
 * Defines the metadata for a git repository
 */
export interface GitMetadata {
  owner: string
  repository: string
  branch: string
  provider: GitProvider
}
