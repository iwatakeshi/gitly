import { rimraf } from 'rimraf'
import GitlyOptions from '../interfaces/options'
import { getArchivePath } from './archive'
import { GitlyCloneError } from './error'
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
    await removePreviousDownload(path)

    return new Promise<string>((resolve, reject) => {
      const child = spawn('git', ['clone', info.href, path])

      child.on('close', (code) => {
        if (code === 0) {
          removeGitDirectory(path)
            .then(() => resolve(path))
            .catch(() =>
              reject(
                new GitlyCloneError(
                  'Failed to remove the .git directory from the cloned repository'
                )
              )
            )
        } else {
          reject(new GitlyCloneError('Failed to clone the repository'))
        }
      })
    })
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

async function removePreviousDownload(path: string) {
  return await rimraf(path)
}

async function removeGitDirectory(path: string) {
  return rimraf(`${path}/.git`)
}
