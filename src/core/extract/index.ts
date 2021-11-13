import tar, { ExtractOptions } from 'tar'

export interface GitlyExtractOptions extends ExtractOptions {
  /**
   * Allow gitly to throw on error
   */
  throw?: boolean
}

/**
 * Extract a zipped file to the specified destination
 * @param source The source zipped file
 * @param destination The path to extract the zipped file
 * @param options The tar options
 */
export async function extract(
  source: string,
  destination: string,
  options?: GitlyExtractOptions
): Promise<string> {
  try {
    await tar.extract({ strip: 1, ...options, file: source, cwd: destination })
    return destination
  } catch (e) {
    if (options?.throw) throw e
    return ''
  }
}

/**
 * Extract a zipped file to the specified destination
 * @param destination The path to extract the zipped file.
 * @param options The tar options
 * @returns A curried version of `extract()`
 * @example
 * ```ts
 * // ...
 *  const destination = await (source |> $extract('path/to/extract'))
 * // ...
 * ```
 */
export const $extract =
  /*  istanbul ignore next */

  (destination: string, options?: GitlyExtractOptions) => async (
    source: string
  ) => extract(source, destination, options)
