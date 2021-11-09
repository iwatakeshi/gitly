import {complement, equals, filter, head, isEmpty, last, pipe, split} from "rambda";

/**
 * Returns the owner and repository from a given path of a url
 * @example
 * `/iwatakeshi/.../.../gitly` -> `['iwatakeshi', 'gitly']
 * @param pathname
 */
export const ownerRepo = (pathname: string): [owner: string, repository: string] => {
  const paths = pipe(
    split('/'),
    filter(complement(equals('/'))),
    filter(complement(isEmpty)),
  )(pathname)
  const owner = head(paths) ?? ''
  const repository = last(paths) ?? ''
  return [owner, repository]
}