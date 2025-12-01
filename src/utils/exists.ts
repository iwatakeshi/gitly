import { constants, promises as fs } from 'node:fs'
import { isAbsolute } from 'node:path'

import type GitlyOptions from '../interfaces/options'
import { getArchivePath } from './archive'
import parse from './parse'

export default async function exists(path: string, options: GitlyOptions = {}): Promise<boolean> {
  let _path = path
  if (!isAbsolute(path)) {
    _path = await getArchivePath(parse(path), options)
  }
  try {
    await fs.access(_path, constants.F_OK)
    return true
  } catch {
    // File doesn't exist or is not accessible
    return false
  }
}
