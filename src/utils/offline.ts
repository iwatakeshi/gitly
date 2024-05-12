import { promises as dns } from 'node:dns'
const { lookup } = dns
export async function isOffline(): Promise<boolean> {
  try {
    await lookup('google.com')
    return false
    // eslint-disable-next-line no-empty
  } catch (_) {}
  return true
}
