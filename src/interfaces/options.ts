import URLInfo from './url'

export default interface GitCopyOptions {
  cache?: boolean
  force?: boolean
  temp?: string
  host?: string
  filter?(info: URLInfo): string
}
