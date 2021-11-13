import { GITLY_PATH } from '../../utils/constants'

import { $download, GitlyDownloadOptions } from '../download'
import { $extract } from '../extract'
import { pipeAsync, tapAsync } from "rambdax";
import { ExtractOptions } from "tar";

export interface GitlyOptions extends GitlyDownloadOptions {
  extract?: ExtractOptions
}

/**
 * Downloads and extracts the repository
 * @param repository The repository to download
 * @param destination The destination to index.ts
 * @param options The options for gitly
 * @returns A tuple with the source and destination respectively
 */
export default async function gitly(
  repository: string,
  destination: string = GITLY_PATH,
  options: GitlyOptions = {}
): Promise<[string, string]> {
  return pipeAsync<[string, string]>(
    $download(options),
    tapAsync($extract(destination, {...options?.extract, throw: options.throw})),
    (source: string) => [source, destination]
  )(repository)
}
