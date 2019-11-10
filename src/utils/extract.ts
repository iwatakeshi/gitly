import { promises as fs } from 'fs'
import { resolve } from 'path'

import GitCopyOptions from '../interfaces/options'

import exists from './exists'
import { extract } from './tar'

const { mkdir } = fs

/**
 * Extract a zipped file to the specified destination
 * @param source The source zipped file
 * @param destination The path to extract the zipped file
 * @param options
 *
 */
export default async (source: string, destination: string, options: GitCopyOptions = {}) => {
  destination = resolve(destination)
  if (await exists(source, options)) {
    try {
      await mkdir(destination, { recursive: true })
      await extract({ ...{ strip: 1 }, ...options as any, ...{ file: source, cwd: destination } })
      return destination
    } catch (_) { }
  }
  return ''
}
