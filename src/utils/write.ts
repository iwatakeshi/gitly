import { createWriteStream, promises as fs } from 'fs'
import { dirname, normalize } from 'path'

const { mkdir } = fs
/**
 * Create a folder and return a writable stream.
 * @param path The path to write a file
 */
export default async (path: string) => {
  path = normalize(path)
  await mkdir(dirname(path), { recursive: true })
  return createWriteStream(path)
}
