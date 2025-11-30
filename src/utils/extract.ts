import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'

import type GitlyOptions from '../interfaces/options'

import exists from './exists'
import { extract } from './archive'
import {
  ExtractionStrategyFactory,
  createExtractionFilter,
} from './extraction-strategy'

const { mkdir } = fs

/**
 * Extract a tar.gz archive to the specified destination
 * @param source The source tar.gz file path
 * @param destination The directory path to extract the archive to
 * @param options Options including extraction filters and subdirectory selection
 * @returns Promise resolving to destination path, or empty string on failure
 * @note Creates destination directory if it doesn't exist
 * @note Strips top-level directory from archive by default
 * @note Supports extracting only a specific subdirectory
 * @example
 * ```typescript
 * const dest = await extract('/tmp/repo.tar.gz', '/path/to/extract')
 * 
 * // With custom filter
 * await extract(source, dest, {
 *   extract: {
 *     filter: (path) => !path.includes('node_modules')
 *   }
 * })
 * 
 * // Extract only a subdirectory
 * await extract(source, dest, {
 *   subdirectory: 'packages/lib'
 * })
 * ```
 */
export default async function extractArchive(
  source: string,
  destination: string,
  options: GitlyOptions = {}
): Promise<string> {
  const _destination = resolve(destination)
  if (await exists(source, options)) {
    try {
      // Create extraction strategy based on subdirectory option
      const strategy = ExtractionStrategyFactory.create(options.subdirectory)
      
      // Combine strategy with custom filter if provided
      const filter = createExtractionFilter(
        strategy,
        options.extract?.filter
      )
      
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
