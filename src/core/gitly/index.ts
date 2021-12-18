import { GITLY_PATH } from '../../utils/constants'

import { $download, GitlyDownloadOptions } from '../download'
import { $extract } from '../extract'
import { pipeAsync, tapAsync } from 'rambdax'
import { ExtractOptions } from 'tar'

export interface GitlyOptions extends GitlyDownloadOptions {
  /**
   * Extraction options for `tar`
   */
  extract?: ExtractOptions
}

export type GitlyResult = [source: string, destination: string]


/**
 * Downloads and extracts the repository.
 * @param repository The repository to download.
 * @returns A promise containing a tuple with the source and destination respectively.
 */
export async function gitly(repository: string): Promise<GitlyResult>;
/**
 * Downloads and extracts the repository.
 * @param repository The repository to download.
 * @param destination The destination path to download the repository.
 * @returns A promise containing a tuple with the source and destination respectively.
 */
export async function gitly(repository: string, destination: string): Promise<GitlyResult>;
/**
 * 
 * @param repository The repository to download.
 * @param options The options for gitly.
 * @returns A promise containing a tuple with the source and destination respectively.
 */
export async function gitly(repository: string, options: GitlyOptions): Promise<GitlyResult>;
/**
 * 
 * @param repository The repository to download.
 * @param destination The destination path to download the repository.
 * @param options The options for gitly.
 * @returns A promise containing a tuple with the source and destination respectively.
 */
export async function gitly(repository: string, destination: string, options: GitlyOptions): Promise<GitlyResult>;

export async function gitly(
  a: string,
  b?: string | GitlyOptions,
  c?: GitlyOptions
): Promise<any> {
  const destination = typeof b === 'string' ? b : GITLY_PATH
  const options = (typeof b === 'object' ? b : c) || {}
  return pipeAsync<GitlyOptions>(
    $download(options),
    tapAsync(
      $extract(destination, { ...options?.extract, throw: options.throw })
    ),
    (source: string) => [source, destination]
  )(a)
}

export default gitly