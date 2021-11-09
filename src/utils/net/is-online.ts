import {promises as dns} from 'dns'
import {tryCatchAsync} from "rambdax";

const isOnline = tryCatchAsync(async () => {
  await dns.lookup('google.com')
  return true
}, async () => false) as () => Promise<boolean>;

export default isOnline
