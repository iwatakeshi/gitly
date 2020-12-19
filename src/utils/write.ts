import { WriteStream } from 'fs'
import { createWriteStream, promises as fs } from 'fs'
import { dirname, normalize } from 'path'

const { mkdir } = fs
/**
 * Create a folder and return a writable stream.
 * @param path The path to write a file
 */
export default async function write(path: string): Promise<WriteStream> {
  path = normalize(path)
  await mkdir(dirname(path), { recursive: true })
  return createWriteStream(path)
}
