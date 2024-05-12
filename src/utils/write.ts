import type { WriteStream } from 'node:fs'
import { createWriteStream, promises as fs } from 'node:fs'
import { dirname, normalize } from 'node:path'

const { mkdir } = fs
/**
 * Create a folder and return a writable stream.
 * @param path The path to write a file
 */
export default async function write(path: string): Promise<WriteStream> {
  const _path = normalize(path)
  await mkdir(dirname(_path), { recursive: true })
  return createWriteStream(_path)
}
