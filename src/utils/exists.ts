import { constants, promises as fs } from 'fs'
import { isAbsolute } from 'path'

import GitlyOptions from '../interfaces/options'

import parse from './parse'
import { getFile } from './tar'

export default async function exists(
  path: string,
  options: GitlyOptions = {}
): Promise<boolean> {
  if (!isAbsolute(path)) {
    path = getFile(parse(path), options)
  }
  try {
    await fs.access(path, constants.F_OK)
    return true
    // eslint-disable-next-line no-empty
  } catch (_) {}
  return false
}
