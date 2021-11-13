import { complement, equals, filter, head, isEmpty, last, pipe, split, test, } from 'rambda'

/* Credits: https://stackoverflow.com/a/52428350/1251031 */
const PATHNAME_REGEX =
  /^(?:(?:\w{3,5}:)?\/\/[^\/]+)?(?:\/|^)((?:[^#\.\/:?\n\r]+\/?)+(?=\?|#|$|\.|\/))/

/**
 * Returns the owner and repository from a given path of a url
 * @example
 * `/iwatakeshi/.../.../gitly` -> `['iwatakeshi', 'gitly']
 * @param pathname
 */
export const ownerRepo = (
  pathname: string
): [owner: string, repository: string] => {
  if (!test(PATHNAME_REGEX, pathname) || !pathname.includes('/'))
    return ['', '']

  const paths = pipe(
    split('/'),
    filter(complement(equals('/'))),
    filter(complement(isEmpty))
  )(pathname)
  /* istanbul ignore next */
  const owner = head(paths) ?? ''
  /* istanbul ignore next */
  const repository = last(paths) ?? ''
  return [owner, repository]
}
