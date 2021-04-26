import { join } from 'path'

import GitlyOptions from '../types/options'
import URLInfo from '../types/url'
import { GITLY_PATH } from '../constants'

export function createArchiveUrl(
  info: URLInfo,
  options: GitlyOptions = {}
): string {
  const { path: repo, branch } = info

  if (options.url && options.url.filter) {
    return options.url.filter(info)
  }

  switch (info.hostname) {
    case 'bitbucket':
      return `https://bitbucket.org${repo}/get/${branch}.tar.gz`
    case 'gitlab':
      return `https://gitlab.com${repo}/repository/archive.tar.gz?ref=${branch}`
    default:
      return `https://github.com${repo}/archive/${branch}.tar.gz`
  }
}

export function createArchiveFilePath(
  info: URLInfo,
  options: GitlyOptions = {}
): string {
  const { path, branch, hostname: site } = info
  return join(options.temp || GITLY_PATH, site, path, `${branch}.tar.gz`)
}
