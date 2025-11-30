import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'

import type GitlyOptions from '../interfaces/options'

import exists from './exists'
import { extract } from './archive'

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
  const _destination = resolve(destination)
  if (await exists(source, options)) {
    try {
      const filter = options.extract?.filter
        ? options.extract.filter
        : () => true
      await mkdir(destination, { recursive: true })
      await extract({ strip: 1, filter, file: source, cwd: _destination })
      return _destination
    } catch (error) {
      // Extraction failed - log error and return empty string
      console.error('Failed to extract archive:', error)
      return ''
    }
  }
  return ''
}
