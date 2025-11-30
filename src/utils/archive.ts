import os from 'node:os'
import { join } from 'node:path'
import * as tar from 'tar'

import type GitlyOptions from '../interfaces/options'
import type URLInfo from '../interfaces/url'
import { GitProviderRegistry } from './git-providers'

export function getArchiveUrl(
  info: URLInfo,
  options: GitlyOptions = {}
): string {
  return GitProviderRegistry.getArchiveUrl(info, options)
}

export function getArchivePath(
  info: URLInfo,
  options: GitlyOptions = {}
): string {
  const { path, type, hostname: site } = info

  return join(
    options.temp || join(os.homedir(), '.gitly'),
    site,
    path,
    `${type}.tar.gz`
  )
}

export const extract = tar.extract
