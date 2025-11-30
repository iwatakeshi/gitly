import type GitlyOptions from '../interfaces/options'
import clone from './clone'
import download from './download'
import extract from './extract'
import { ActionsProcessor } from './actions'

/**
 * Downloads and extracts the repository with optional actions processing
 * @param repository The repository to download
 * @param destination The destination to extract
 * @param options Options including backend, caching, and actions processing
 * @returns A tuple with the source and destination respectively
 * @note Automatically processes gitly.json/degit.json actions if present
 */
export default async function gitly(
  repository: string,
  destination: string,
  options: GitlyOptions
): Promise<[string, string]> {
  let source = ''
  switch (options?.backend) {
    case 'git':
      source = await clone(repository, options)
      break
    default:
      source = await download(repository, options)
      break
  }

  const dest = await extract(source, destination, options)
  
  // Process actions (gitly.json / degit.json) if present
  await ActionsProcessor.processDirectory(dest, options)
  
  return [source, dest]
}
