import GitlyOptions from './types/options'
import { GITLY_PATH } from './constants'

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
  destination: string = GITLY_PATH,
  options: GitlyOptions = {}
): Promise<[string, string]> {
  const source = await download(repository, options)
  return [source, await extract(source, destination, options)]
}
