import { constants, PathLike, promises as fs } from 'fs'
import { tryCatchAsync } from "rambdax";

export const exists: (path: PathLike) => Promise<boolean> = tryCatchAsync(async (path) => {
  await fs.access(path, constants.F_OK)
  return true
}, async () => false)