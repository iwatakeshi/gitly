import { cond, equals, T } from 'rambda'
import { GitProvider } from '../../types/git'
import { GitURL } from '../url/git-url'

const isProvider = (provider: GitProvider) => (url: GitURL) =>
  equals(url.provider, provider)

/* istanbul ignore next */
const toGitLab = ({repository, branch, pathname}: GitURL) =>
  `https://gitlab.com/${pathname}/-/archive/${branch}/${repository}-${branch}.tar.gz`

/* istanbul ignore next */
const toBitbucket = ({repository, branch}: GitURL) =>
  `https://bitbucket.org/${repository}/get/${branch}.tar.gz`

/* istanbul ignore next */
const toGitHub = ({owner, repository, branch}: GitURL) =>
  `https://github.com/${owner}/${repository}/archive/${branch}.tar.gz`

export const createArchiveURL: (url: GitURL) => string = cond<GitURL, string>([
  [isProvider('gitlab'), toGitLab],
  [isProvider('bitbucket'), toBitbucket],
  [T, toGitHub],
])

export const $createArchiveURL = createArchiveURL
