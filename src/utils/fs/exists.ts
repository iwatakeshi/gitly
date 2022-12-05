/* istanbul ignore file */

import { constants, PathLike, promises as fs } from 'fs'

/**
 * Determines whether a path exists
 * @param path The path to check
 */
export const exists: (path: PathLike) => Promise<boolean> = async (path) => {
  try {
    await fs.access(path, constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}