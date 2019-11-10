import { promises as dns } from 'dns'
const { lookup } = dns
export async function isOffline(): Promise<boolean> {
  try {
    await lookup('google.com')
    return false
  } catch (_) { }
  return true
}
