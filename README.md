# gitly

An API to download and/or extract git repositories.

[![Node CI](https://github.com/iwatakeshi/gitly/workflows/Node%20CI/badge.svg)](https://github.com/iwatakeshi/gitly/actions?query=workflow%3A%22Node+CI%22)
[![Version](https://img.shields.io/npm/v/gitly.svg)](https://www.npmjs.com/package/gitly)
[![codecov](https://codecov.io/gh/iwatakeshi/gitly/branch/master/graph/badge.svg)](https://codecov.io/gh/iwatakeshi/gitly)
[![Downloads/week](https://img.shields.io/npm/dw/gitly.svg)](https://www.npmjs.com/package/gitly)
[![License](https://img.shields.io/github/license/iwatakeshi/gitly)](https://github.com/iwatakeshi/gitly/blob/master/LICENSE.md)

This project is the spiritual successor of [gittar](https://github.com/lukeed/gittar) written in TypeScript.

## Usage

**Since v2.0+**

```typescript
import gitly from 'gitly'

console.log(await gitly('iwatakeshi/gitly', '/path/to/extracted/folder/'))
// -> ['~/.gitly/github/iwatakeshi/gitly/master.tar.gz', '/path/to/extracted/folder/']
```

**Since v1.0+**

```typescript
import { download, extract } from 'gitly'

console.log(await download('iwatakeshi/gitly'))
// -> ~/.gitly/github/iwatakeshi/gitly/master.tar.gz

console.log(await download('iwatakeshi/gitly#v1.0.0'))
// -> ~/.gitly/github/iwatakeshi/gitly/v1.0.0.tar.gz

console.log(await download('https://github.com/iwatakeshi/gitly'))
// -> ~/.gitly/github/iwatakeshi/gitly/master.tar.gz

console.log(await download('gitlab:Rich-Harris/buble#v0.15.2'))
// -> ~/.gitly/gitlab/Rich-Harris/buble/v0.15.2.tar.gz

console.log(await download('Rich-Harris/buble', { host: 'gitlab' }))
// -> ~/.gitly/gitlab/Rich-Harris/buble/master.tar.gz

const source = 'path to downloaded zip file (can be obtained by download())'
const destination = '/path/to/foobar'

await extract(source, destination)
// -> /path/to/foobar
```

## Functions

### `gitly`

```ts
type gitly = (
  repository: string,
  destination?: string,
  options?: GitlyOptions
) => Promise<[string, string]>
```

### `download`

```ts
type download = (repository: string, options?: GitlyDownloadOptions) => Promise<string>
```

### `extract`

```ts
type extract = (
  source: string,
  destination: string,
  options?: GitlyExtractOptions
) => Promise<string>
```

## Classes

### `GitURL`

```ts
class GitURL extends URL implements GitMetadata {}
```

## Interfaces


### `GitlyOptions`

```ts
interface GitlyOptions extends GitlyDownloadOptions {
  /**
   * Extraction options for `tar`
   */
  extract?: ExtractOptions
}
```

### `GitlyDownloadOptions`

```ts
interface GitlyDownloadOptions {
  /**
   * Allow gitly to throw on error
   */
  throw?: boolean
  /**
   * A custom function that generates the archive url for gitly to download
   */
  createArchiveURL?: (url: GitURL) => string
  /**
   * Cache options
   */
  cache?: {
   /**
    * Disables gitly's use of cache.
    */
    disable?: boolean
    /**
     * Sets the root cache directory
     */
    directory?: string
  }
  /**
  * A custom function that fetches and downloads the git repository.
  * @deprecated Since `v3.0.0`
  * 
  * Note: Consider using the gitly's utilities or contribute to the project.
  */
  fetch?: (url: GitURL, path: string) => Promise<Readable>
  /**
  * Force gitly to fetch remotely first before accessing the cache
  */
  force?: boolean
}
```

### `GitlyExtractOptions`
```ts
interface GitlyExtractOptions extends ExtractOptions {
  /**
   * Allow gitly to throw on error
   */
  throw?: boolean
}
```

### `GitMetadata`

```ts
/**
 * Defines the metadata for a git repository
 */
interface GitMetadata {
  owner: string
  repository: string
  branch: string
  provider: GitProvider
}
```

### `GitProvider`

```ts
type GitProvider<T = ''> = 'bitbucket' | 'github' | 'gitlab' | T
```
