import tar, {ExtractOptions} from 'tar'

export type GitlyExtractOptions = ExtractOptions & {
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
  options?: GitlyExtractOptions,
): Promise<string> {
  try {
    await tar.extract({strip: 1, ...options, file: source, cwd: destination})
    return destination
  } catch (e: any) {
    if (options?.throw) throw e
    return ''
  }
}

export const $extract = (destination: string, options?: GitlyExtractOptions) =>
  async (source: string) => await extract(source, destination, options)