import GitlyOptions from '../interfaces/options'
import gitClone from './backend.git'

import download from './download'
import extract from './extract'

/**
 * Downloads and extracts the repository
 * @param repository The repository to download
 * @param destination The destination to extract
 * @returns A tuple with the source and destination respectively
 */
export default async function gitly(
  repository: string,
  destination: string,
  options: GitlyOptions
): Promise<[string, string]> {
  if (options?.backend === 'git') {
    return await gitClone(repository, destination, options)
  }
  const source = await download(repository, options)
  return [source, await extract(source, destination, options)]
}
