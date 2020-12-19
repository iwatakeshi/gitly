import { promises as fs } from 'fs'
import { resolve } from 'path'

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
export default async (
  source: string,
  destination: string,
  options: GitlyOptions = {}
): Promise<string> => {
  destination = resolve(destination)
  if (await exists(source, options)) {
    try {
      const filter =
        options.extract && options.extract.filter
          ? options.extract.filter
          : () => true
      await mkdir(destination, { recursive: true })
      await extract({ strip: 1, filter, file: source, cwd: destination })
      return destination
      // eslint-disable-next-line no-empty
    } catch (_) {}
  }
  return ''
}
