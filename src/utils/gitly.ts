import GitlyOptions from '../interfaces/options'
import clone from './clone'
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
  let source: string = '';
  switch (options?.backend) {
    case 'git':
      source = await clone(repository, options)
      break;
    default:
      source = await download(repository, options)
      break;
  }

  return [source, await extract(source, destination, options)]
}
