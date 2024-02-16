import GitlyOptions from '../interfaces/options'
import { getArchivePath } from './archive'
import execute from './execute'
import exists from './exists'
import { isOffline } from './offline'
import parse from './parse'
import spawn from 'cross-spawn'

/**
 * Uses local git installation to clone a repository to the destination.
 */
export default async function clone(
  repository: string,
  options: GitlyOptions = {}
): Promise<string> {
  const info = parse(repository, options)
  const path = getArchivePath(info, options)

  let order: (() => Promise<boolean | string>)[] = []

  const local = async () => exists(path)
  const remote = async () => {
    const result = spawn.sync('git', ['clone', info.href, path])
    return result.status === 0
  }


  if ((await isOffline()) || options.cache) {
    order = [local]
  } else if (options.force || ['master', 'main'].includes(info.type)) {
    order = [remote, local]
  }

  try {
    const result = await execute(order)
    if (typeof result === 'boolean') {
      return path
    }
    return result
  } catch (error) {
    if (options.throw) {
      throw error
    }
  }
  return ''
}
