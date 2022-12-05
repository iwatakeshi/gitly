import { GitProvider } from '../../types/git'
import { GitURL } from '../url/git-url'

export type GitURLResolver = (url: GitURL) => string

/* istanbul ignore next */
const toGitLab: GitURLResolver = ({ repository, branch, pathname }: GitURL) =>
  `https://gitlab.com/${pathname}/-/archive/${branch}/${repository}-${branch}.tar.gz`

/* istanbul ignore next */
const toBitbucket: GitURLResolver = ({ repository, branch }: GitURL) =>
  `https://bitbucket.org/${repository}/get/${branch}.tar.gz`

/* istanbul ignore next */
const toGitHub: GitURLResolver = ({ owner, repository, branch }: GitURL) =>
  `https://github.com/${owner}/${repository}/archive/${branch}.tar.gz`

export function createArchiveURL<P extends string = never>(
  url: GitURL,
  resolvers?: Record<GitProvider<P>, GitURLResolver>
): string {
  const map = {
    bitbucket: toBitbucket,
    github: toGitHub,
    gitlab: toGitLab,
    ...resolvers,
  } as Record<GitProvider<P>, GitURLResolver>

  const resolver = Object.keys(map)
    .map(provider => ({ provider, resolver: map[provider as GitProvider<P>] }))
    .find(item => item.provider === url.provider)

  if (resolver) return resolver.resolver(url)

  return ''
}

export const $createArchiveURL = createArchiveURL
