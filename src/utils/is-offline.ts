import { promises as dns } from 'dns'
export default async function isOffline(): Promise<boolean> {
  try {
    await dns.lookup('google.com')
    return false
    // eslint-disable-next-line no-empty
  } catch (_) {}
  return true
}
