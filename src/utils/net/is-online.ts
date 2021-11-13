/* istanbul ignore file */

import { promises as dns } from 'dns'
import { tryCatchAsync } from 'rambdax'

/**
 * Determines whether the current environment is online or offline
 */
const isOnline = tryCatchAsync(
  async () => {
    await dns.lookup('google.com')
    return true
  },
  /* istanbul ignore next */
  async () => false
) as () => Promise<boolean>

export default isOnline
