import {and, complement, curry, flip, match, pipe, test} from "rambda";
import {toGitURL} from "./to-git-url";
import isDomainUrl, {DOMAIN_REGEX} from "../is-domain-url";
import {tld} from "./tld";
import isAbsoluteUrl from "../is-absolute-url";
import {GitMetadata, GitProvider} from "../../../types/git";
import {GitURL} from "../git-url";

export type GitlyParseOptions = Pick<GitMetadata, 'branch' | 'provider'>

/**
 * Parses a url and returns the metadata
 *
 * @example
 * ```markdown
 * 1. owner/repo
 * 2. owner/repo#tag
 * 3. https://host.com/owner/repo
 * 4. host.com/owner/repo
 * 5. host.com/owner/repo#tag
 * 6. host:owner/repo
 * 7. host:owner/repo#tag
 * ```
 */
export function
parse(
  url: string,
  options: GitlyParseOptions = {
    branch: 'master',
    provider: 'github'
  }
): Partial<GitURL> {

  // NOTE: This regex urls can match protocols (i.e http):
  const SCOPED_OR_RELATIVE_REGEX_URL = /(([^\/]+):)?([^\/]+)\/(.+)+/
  const PROTOCOL_REGEX = /https?/
  // Determine the type of url entered
  // Possible types:
  // - relative url (i.e. owner/repo, owner/repo#develop)
  // - scoped url (i.e. host:owner/repo, host:owner/repo#develop)
  // - absolute url (i.e. https://www.github.com/owner/repo, etc)
  // - simple url (i.e. github.com/owner/repo, etc)


  const isScopedOrRelativeURL = and(
    and(
      test(SCOPED_OR_RELATIVE_REGEX_URL),
      complement(test(PROTOCOL_REGEX))
    ),
    complement(test(DOMAIN_REGEX))
  )

  const upgrade = (url: string) => `https://${url}`

  // Is the URL scoped or relative?
  if (isScopedOrRelativeURL(url)) {
    const [, , host, owner, pathname] = match(SCOPED_OR_RELATIVE_REGEX_URL, url)
    const _provider: GitProvider = (host as GitProvider) ?? options.provider
    const _url = `${_provider}.${tld(_provider)}/${owner}/${pathname}`
    return pipe(upgrade, x => toGitURL(x))(_url)
  }

  if (isDomainUrl(url)) {
    return pipe(upgrade, x => toGitURL(x))(url)
  }

  if (isAbsoluteUrl(url)) {
    return toGitURL(url)
  }

  return {} as any
}

export const $parse = curry(flip(parse)) as
  (options?: GitlyParseOptions) =>
    (url: string) => GitURL