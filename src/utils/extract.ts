import { promises as fs } from 'fs'
import { resolve } from 'path'
import { FileStat } from 'tar'

import GitlyOptions from '../interfaces/options'

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
export default async (source: string, destination: string, options: GitlyOptions = {}) => {
  destination = resolve(destination)
  if (await exists(source, options)) {
    try {
      let filter = (options.extract && options.extract.filter) ? options.extract.filter :
        (_path: string, _stat: FileStat) => true
      await mkdir(destination, { recursive: true })
      await extract({ strip: 1, filter, file: source, cwd: destination })
      return destination
    } catch (_) { }
  }
  return ''
}
