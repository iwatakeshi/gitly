# gitly

An API to download and/or extract git repositories.

[![Node CI](https://github.com/iwatakeshi/gitly/workflows/Node%20CI/badge.svg)](https://github.com/iwatakeshi/gitly/actions?query=workflow%3A%22Node+CI%22)
[![Version](https://img.shields.io/npm/v/gitly.svg)](https://www.npmjs.com/package/gitly)
![Codecov](https://img.shields.io/codecov/c/github/iwatakeshi/gitly)
[![Downloads/week](https://img.shields.io/npm/dw/gitly.svg)](https://www.npmjs.com/package/gitly)
[![License](https://img.shields.io/github/license/iwatakeshi/gitly)](https://github.com/iwatakeshi/gitly/blob/master/LICENSE.md)



This project is the spiritual successor of [gittar](https://github.com/lukeed/gittar) written in TypeScript.

## Usage

```typescript
import { fetch, extract } = from 'gitly'

console.log(await fetch('iwatakeshi/gitly'))
// -> ~/.gitly/github/iwatakeshi/gitly/master.tar.gz

console.log(await fetch('iwatakeshi/gitly#v1.0.0'))
// -> ~/.gitly/github/iwatakeshi/gitly/v1.0.0.tar.gz

console.log(await fetch('https://github.com/iwatakeshi/gitly'))
// -> ~/.gitly/github/iwatakeshi/gitly/master.tar.gz

console.log(await fetch('gitlab:Rich-Harris/buble#v0.15.2'))
// -> ~/.gitly/gitlab/Rich-Harris/buble/v0.15.2.tar.gz

console.log(await fetch('Rich-Harris/buble', { host: 'gitlab' }))
// -> ~/.gitly/gitlab/Rich-Harris/buble/master.tar.gz

const source = '...local file or repo pattern to the local file...'
const dest = '/path/to/foobar'

await extract(source, destination)
// -> /path/to/foobar
```

## Options

```typescript
interface GitlyOptions {
  /**
   * Use cache only (default: undefined)
   */
  cache?: boolean
  /**
   * Use both cache and local (default: undefined)
   */
  force?: boolean
  /**
   * Throw an error when fetching (default: undefined)
   */
  throw?: boolean
  /**
   * Set cache directory (default: '~/.gitly')
   */
  temp?: string
  /**
   * Set the host name (default: undefined)
   */
  host?: string
  url?: {
    /**
     * Extend the url filtering method
     * @param info The URLInfo object
     */
    filter?(info: URLInfo): string
  }
  extract?: {
    /**
     * Extend the extract filtering method for the 'tar' library
     */
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
