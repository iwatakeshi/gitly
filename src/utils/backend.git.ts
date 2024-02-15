import GitlyOptions from '../interfaces/options'
import parse from './parse'
import spawn from 'cross-spawn'

/**
 * Uses local git installation to clone a repository to the destination.
 */
export default async function gitClone(
  repository: string,
  destination: string,
  options: GitlyOptions = {}
): Promise<[string, string]> {
  const info = parse(repository, options)
  spawn.sync('git', ['clone', info.href, destination])
  return [info.href, destination]
}
