export const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
export default function isAbsoluteUrl(url: string): boolean {
  return Boolean(url) && ABSOLUTE_URL.test(url);
}