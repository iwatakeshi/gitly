import os = require('os')
import { join } from 'path'
import tar = require('tar')

import GitCopyOptions from '../interfaces/options'
import URLInfo from '../interfaces/url'

export function getUrl(info: URLInfo, options: GitCopyOptions = {}) {
  const { path: repo, type } = info

  if (options.url && options.url.filter) {
    return options.url.filter(info)
  }

  switch (info.hostname) {
    case 'bitbucket':
      return `https://bitbucket.org${repo}/get/${type}.tar.gz`
    case 'gitlab':
      return `https://gitlab.com${repo}/repository/archive.tar.gz?ref=${type}`
    default:
      return `https://github.com${repo}/archive/${type}.tar.gz`
  }
}

export function getFile(info: URLInfo, options: GitCopyOptions = {}) {
  const { path, type, hostname: site } = info
  return join(options.temp || join(os.homedir(), '.gitcopy'), site, path, `${type}.tar.gz`)
}

export const extract = tar.extract
