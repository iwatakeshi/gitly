import { constants, promises as fs } from 'fs'
import { isAbsolute } from 'path'

import GitCopyOptions from '../interfaces/options'

import parse from './parse'
import { getFile } from './tar'

export default async (path: string, options: GitCopyOptions = {}) => {
  if (!isAbsolute(path)) {
    path = getFile(parse(path), options)
  }
  try {
    await fs.access(path, constants.F_OK)
    return true
  } catch (_) { }
  return false
}
