import { FileStat } from 'tar'

import URLInfo from './url'

export default interface GitCopyOptions {
  cache?: boolean
  force?: boolean
  temp?: string
  host?: string
  url?: {
    filter?(info: URLInfo): string
  }
  extract?: {
    filter?(path: string, stat: FileStat): boolean
  }
}
