import GitlyOptions from '../interfaces/options'
import { getArchivePath } from './archive'
import { GitlyCloneError } from './error'
import execute from './execute'
import exists from './exists'
import { isOffline } from './offline'
import parse from './parse'
import spawn from 'cross-spawn'
import { promises as fs } from 'fs'

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
    await removePreviousClone(path)

    return new Promise<string>((resolve, reject) => {
      // https://codeql.github.com/codeql-query-help/javascript/js-second-order-command-line-injection/
      if (info.href.includes('upload-pack') || path.includes('upload-pack')) {
        reject(
          new GitlyCloneError(
            'The phrase "upload-pack" is not allowed in the repository or destination when using the git backend'
          )
        )
        return
      }

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

async function removePreviousClone(path: string) {
  return await fs.rm(path, { recursive: true, force: true })
}

async function removeGitDirectory(path: string) {
  return await fs.rm(`${path}/.git`, { recursive: true, force: true })
}
