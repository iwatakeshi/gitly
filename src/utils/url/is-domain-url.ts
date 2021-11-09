import {isEmpty} from "rambda";

export const DOMAIN_REGEX = /([a-z]+)(\.)([a-z.]+)/
const PROTOCOL = /https?/

export default function isDomainUrl(url: string): boolean {
  return !isEmpty(url) && DOMAIN_REGEX.test(url) && !PROTOCOL.test(url)
}
