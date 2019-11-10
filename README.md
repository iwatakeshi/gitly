# gitly

An API to download and/or extract git repositories.

This project is the spiritual successor of [gittar](https://github.com/iwatakeshi/gittar) written in TypeScript.

## Usage

```typescript
import { fetch, extract } = from 'gitly'

consle.log(await fetch('iwatakeshi/gitly'))
//=> ~/.gitly/github/iwatakeshi/gitly/master.tar.gz

consle.log(await fetch('iwatakeshi/gitly#v1.0.0'))
//=> ~/.gitly/github/iwatakeshi/gitly/v1.0.0.tar.gz

consle.log(await fetch('https://github.com/iwatakeshi/gitly'))
//=> ~/.gitly/github/iwatakeshi/gitly/master.tar.gz

consle.log(await fetch('gitlab:Rich-Harris/buble#v0.15.2'))
//=> ~/.gitly/gitlab/Rich-Harris/buble/v0.15.2.tar.gz

consle.log(await fetch('Rich-Harris/buble', { host: 'gitlab' }))
//=> ~/.gitly/gitlab/Rich-Harris/buble/master.tar.gz

const source = '...local file or repo pattern to the local file...'
const dest = '/path/to/foobar'

await extract(source, destination)
```

## Options

```typescript
interface GitlyOptions {
  // Use cache only
  cache?: boolean
  // Use both cache and local
  force?: boolean
  // Set cache directory
  temp?: string
  // Set the host name
  host?: string
  url?: {
    // Extend the url filtering method
    filter?(info: URLInfo): string
  }
  extract?: {
    // Extend the extract filtering method
    filter?(path: string, stat: FileStat): boolean
  }
}
```

## Interfaces

```typescript
interface URLInfo {
  protocol: string
  host: string
  hostname: string
  hash: string
  href: string
  path: string
  repository: string
  owner: string
  type: string
}
```
