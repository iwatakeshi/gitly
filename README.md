# gitly

> Modern, fast, and secure git repository scaffolding tool with CLI and programmatic API

[![Node CI](https://github.com/iwatakeshi/gitly/workflows/Node%20CI/badge.svg)](https://github.com/iwatakeshi/gitly/actions?query=workflow%3A%22Node+CI%22)
[![Version](https://img.shields.io/npm/v/gitly.svg)](https://www.npmjs.com/package/gitly)
[![codecov](https://codecov.io/gh/iwatakeshi/gitly/branch/master/graph/badge.svg)](https://codecov.io/gh/iwatakeshi/gitly)
[![Downloads/week](https://img.shields.io/npm/dw/gitly.svg)](https://www.npmjs.com/package/gitly)
[![License](https://img.shields.io/github/license/iwatakeshi/gitly)](https://github.com/iwatakeshi/gitly/blob/master/LICENSE.md)

The spiritual successor of [gittar](https://github.com/lukeed/gittar) and modern alternative to [degit](https://github.com/Rich-Harris/degit) written in TypeScript with enterprise-grade architecture.

## ✨ Features

- 🚀 **CLI Tool** - Simple command-line interface for scaffolding projects
- 📦 **Subdirectory Support** - Extract only specific directories from monorepos
- 🔄 **Actions System** - Composable post-clone operations (degit.json compatible)
- 🌐 **Multi-Provider** - GitHub, GitLab, Bitbucket, Sourcehut, Codeberg support
- 🔐 **Token Auth** - Private repository support with personal access tokens
- 🔑 **Commit-Hash Caching** - Accurate caching using commit SHAs instead of branch names
- 💾 **Smart Caching** - Offline-first with intelligent cache management
- 🔒 **Security** - Input validation, injection prevention, DOS protection
- 📡 **Event-Driven** - Progress tracking with event emitters
- 🏗️ **Enterprise Architecture** - Strategy, Factory, and Dependency Injection patterns
- ✅ **Well-Tested** - 99 tests with 74%+ coverage
- 🎯 **TypeScript Native** - Full type safety and modern ES2021 features

## 📦 Installation

```bash
# As a CLI tool
npm install -g gitly

# As a library
npm install gitly
```

## 🚀 CLI Usage

```bash
# Clone a repository
gitly user/repo

# Clone to a specific directory
gitly user/repo my-project

# Clone a specific tag/branch
gitly user/repo#v1.0.0

# Extract only a subdirectory
gitly user/monorepo/packages/lib my-lib

# Force fresh download (ignore cache)
gitly user/repo --force

# Use cache only (offline mode)
gitly user/repo --cache

# Private repository with token
gitly user/private-repo --token ghp_xxxxxxxxxxxx

# Use git backend (for private repos with SSH)
gitly user/repo --mode=git --depth=5

# Verbose output
gitly user/repo --verbose
```

### CLI Options

```
USAGE:
  gitly <source> [destination] [options]

OPTIONS:
  --force, -f        Force fresh download, ignore cache
  --cache, -c        Use cache only (offline mode)
  --verbose, -v      Show detailed progress
  --quiet, -q        Suppress output
  --mode <mode>      Backend mode: 'tar' (default) or 'git'
  --depth <n>        Git clone depth (default: 1, only for --mode=git)
  --subdirectory <path>  Extract only a subdirectory
  --token <token>    Auth token for private repos (or set GITHUB_TOKEN/GITLAB_TOKEN)
  --help, -h         Show help
  --version          Show version

ENVIRONMENT VARIABLES:
  GITHUB_TOKEN       GitHub/Gitea/Codeberg personal access token
  GITLAB_TOKEN       GitLab personal/project access token
  BITBUCKET_TOKEN    Bitbucket app password
  GIT_TOKEN          Generic auth token (fallback)
  GITLY_CACHE        Cache directory (default: ~/.gitly)
  HTTPS_PROXY        HTTPS proxy URL
  HTTP_PROXY         HTTP proxy URL
```

## 💻 Programmatic API

### Basic Usage

```typescript
import gitly, { download, extract } from 'gitly'

// Download and extract in one step
const [archivePath, destination] = await gitly(
  'user/repo',
  '/path/to/project'
)

// Or use individual functions
const archive = await download('user/repo')
const dest = await extract(archive, '/path/to/project')
```

### Subdirectory Extraction

Extract only a specific subdirectory from a repository:

```typescript
import gitly from 'gitly'

// Extract only packages/lib from a monorepo
await gitly('user/monorepo', '/path/to/lib', {
  subdirectory: 'packages/lib'
})
```

### Actions System (degit.json compatible)

Create composable templates with `gitly.json` or `degit.json`:

```json
{
  "actions": [
    {
      "action": "clone",
      "src": "user/another-repo",
      "dest": "vendor/lib"
    },
    {
      "action": "remove",
      "files": ["LICENSE", ".github"]
    }
  ]
}
```

Actions are automatically executed after extraction and can be nested.

### Multi-Provider Support

```typescript
// GitHub (default)
await gitly('user/repo', '/dest')

// GitLab
await gitly('gitlab:user/repo', '/dest')

// Bitbucket
await gitly('bitbucket:user/repo', '/dest')

// Sourcehut
await gitly('sourcehut:~user/repo', '/dest')
// or
await gitly('https://git.sr.ht/~user/repo', '/dest')

// Codeberg
await gitly('codeberg:user/repo', '/dest')
// or
await gitly('https://codeberg.org/user/repo', '/dest')
```

### Event-Driven Progress Tracking

```typescript
import { GitlyCLI, ConsoleLogger } from 'gitly'

const logger = new ConsoleLogger('verbose')
const cli = new GitlyCLI(logger)

cli.on('download:start', (source) => {
  console.log(`Downloading ${source}...`)
})

cli.on('download:complete', (path) => {
  console.log(`Downloaded to ${path}`)
})

cli.on('extract:complete', (dest) => {
  console.log(`Extracted to ${dest}`)
})

await cli.clone({
  source: 'user/repo',
  destination: '/path/to/dest'
})
```

### Private Repositories

```typescript
// Using token authentication (recommended)
await gitly('user/private-repo', '/dest', {
  token: 'ghp_xxxxxxxxxxxx'  // GitHub personal access token
})

// Or via environment variables
process.env.GITHUB_TOKEN = 'ghp_xxxxxxxxxxxx'
await gitly('user/private-repo', '/dest')

// GitLab private repository
process.env.GITLAB_TOKEN = 'glpat-xxxxxxxxxxxx'
await gitly('gitlab:user/private-repo', '/dest')

// Using git backend (requires local git with SSH access)
await gitly('user/private-repo', '/dest', {
  backend: 'git',
  git: { depth: 1 }
})
```

### Proxy Support

```typescript
// Via options
await gitly('user/repo', '/dest', {
  proxy: {
    protocol: 'http',
    host: 'proxy.company.com',
    port: 8080
  }
})

// Via environment variables
process.env.HTTPS_PROXY = 'http://proxy.company.com:8080'
await gitly('user/repo', '/dest')
```

### Custom Extraction Filters

```typescript
await gitly('user/repo', '/dest', {
  extract: {
    filter: (path) => {
      // Exclude node_modules and tests
      return !path.includes('node_modules') && !path.includes('__tests__')
    }
  }
})
```

## 🏗️ Architecture

Gitly uses enterprise-level design patterns:

- **Strategy Pattern** - Pluggable extraction and provider strategies
- **Factory Pattern** - Git provider and action executor factories
- **Dependency Injection** - Logger abstraction with ILogger interface
- **Command Pattern** - Action execution system
- **Facade Pattern** - Simple API over complex subsystems
- **Registry Pattern** - Extensible git provider registry
- **Event-Driven** - Progress tracking and observability

## 📚 API Reference

### `gitly(source, destination, options?)`

Download and extract a repository.

**Parameters:**
- `source` (string) - Repository identifier
- `destination` (string) - Target directory
- `options` (GitlyOptions) - Configuration options

**Returns:** `Promise<[string, string]>` - [archivePath, destination]

### `download(repository, options?)`

Download repository archive.

**Returns:** `Promise<string>` - Path to downloaded archive

### `extract(source, destination, options?)`

Extract archive to destination.

**Returns:** `Promise<string>` - Destination path

### `clone(repository, options?)`

Clone using git backend.

**Returns:** `Promise<string>` - Path to archive

### `parse(url, options?)`

Parse repository URL.

**Returns:** `URLInfo` - Parsed URL information

## 🔧 Options

```typescript
interface GitlyOptions {
  /** Use cache only (offline mode) */
  cache?: boolean
  
  /** Force fresh download */
  force?: boolean
  
  /** Throw errors instead of returning empty string */
  throw?: boolean
  
  /** Cache directory (default: ~/.gitly) */
  temp?: string
  
  /** Git host (github, gitlab, bitbucket, etc.) */
  host?: string
  
  /** Extract only a subdirectory */
  subdirectory?: string
  
  /** Custom URL filter */
  url?: {
    filter?(info: URLInfo): string
  }
  
  /** Custom extraction filter */
  extract?: {
    filter?(path: string, stat: Stats | ReadEntry): boolean
  }
  
  /** HTTP headers */
  headers?: RawAxiosRequestHeaders | AxiosHeaders
  
  /** Proxy configuration */
  proxy?: AxiosProxyConfig
  
  /** Backend: 'axios' (default) or 'git' */
  backend?: 'axios' | 'git'
  
  /** Git options */
  git?: {
    depth?: number
  }
}
```

## 🆚 Comparison

| Feature | gitly | degit | gittar |
|---------|-------|-------|--------|
| CLI | ✅ | ✅ | ❌ |
| TypeScript | ✅ | ❌ | ❌ |
| Subdirectories | ✅ | ✅ | ❌ |
| Actions System | ✅ | ✅ | ❌ |
| Event Emitters | ✅ | ✅ | ❌ |
| Multi-Provider | ✅ (5) | ✅ (4) | ✅ (3) |
| Token Auth | ✅ | ❌ | ❌ |
| Commit-Hash Caching | ✅ | ❌ | ❌ |
| Private Repos | ✅ | ✅ (git only) | ❌ |
| Offline Mode | ✅ | ✅ | ❌ |
| Modern Architecture | ✅ | ❌ | ❌ |
| Active Maintenance | ✅ | ❌ | ❌ |
| Test Coverage | 74% | Unknown | ~70% |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📄 License

[MIT](LICENSE.md) © [Takeshi Iwana](https://github.com/iwatakeshi)

## 🙏 Acknowledgments

- [gittar](https://github.com/lukeed/gittar) by Luke Edwards
- [degit](https://github.com/Rich-Harris/degit) by Rich Harris
- Inspired by the need for modern, maintainable scaffolding tools
