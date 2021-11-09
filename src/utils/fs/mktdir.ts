import {join} from "path";
import {mkdirSync, mkdtempSync, promises as fs} from 'fs'
import {tmpdir} from "os";
import {tempdir} from "shelljs";

/**
 * Creates a test directory
 * @param path The path to create the directory
 * @return The full path to the test directory
 *
 * @example
 * ```ts
 * await mktdir('hello')
 *
 * // => C:\Users\user\AppData\Local\Temp\2avQ7n\hello
 * ```
 */
export async function mktdir(...path: string[]): Promise<string | undefined> {
  const tempDir = await fs.mkdtemp(join(tmpdir(), '__TEST__'))
  return await fs.mkdir(join(tempDir, ...path), {recursive: true})
}

export function mktdirSync(...path: string[]) {
  const tempDir = mkdtempSync(join(tempdir(), '__TEST__'))
  return mkdirSync(join(tempDir, ...path), {recursive: true})
}