import { promises as dns } from 'node:dns'

const { lookup } = dns
export async function isOffline(): Promise<boolean> {
  try {
    await lookup('google.com')
    return false
  } catch {
    // DNS lookup failed - assume offline
    return true
  }
}
