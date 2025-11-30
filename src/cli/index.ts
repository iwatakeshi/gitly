#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { GitlyCLI } from './cli'
import { ConsoleLogger } from './logger'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Read version from package.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
)
const version = packageJson.version

const help = `
gitly ${version}

USAGE:
  gitly <source> [destination] [options]

ARGUMENTS:
  <source>       Repository to clone (user/repo, github:user/repo#tag, gitlab:user/repo)
  [destination]  Target directory (default: current directory)

OPTIONS:
  --force, -f        Force fresh download, ignore cache
  --cache, -c        Use cache only (offline mode)
  --verbose, -v      Show detailed progress
  --quiet, -q        Suppress output
  --mode <mode>      Backend mode: 'tar' (default) or 'git'
  --depth <n>        Git clone depth (default: 1, only for --mode=git)
  --subdirectory <path>  Extract only a subdirectory
  --help, -h         Show this help
  --version          Show version

EXAMPLES:
  gitly user/repo
  gitly user/repo my-project
  gitly user/repo#v1.0.0 --force
  gitly gitlab:user/repo --mode=git --depth=5
  gitly user/monorepo/packages/lib --subdirectory packages/lib

ENVIRONMENT:
  HTTPS_PROXY / HTTP_PROXY  Proxy configuration
  GITLY_CACHE               Cache directory (default: ~/.gitly)
`

async function main(): Promise<void> {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options: {
        force: { type: 'boolean', short: 'f' },
        cache: { type: 'boolean', short: 'c' },
        verbose: { type: 'boolean', short: 'v' },
        quiet: { type: 'boolean', short: 'q' },
        mode: { type: 'string', default: 'tar' },
        depth: { type: 'string' },
        subdirectory: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean' },
      },
      allowPositionals: true,
    })

    if (values.help) {
      console.log(help)
      process.exit(0)
    }

    if (values.version) {
      console.log(version)
      process.exit(0)
    }

    const [source, destination] = positionals

    if (!source) {
      console.error('Error: <source> argument is required\n')
      console.log(help)
      process.exit(1)
    }

    const logger = new ConsoleLogger(
      values.verbose ? 'verbose' : values.quiet ? 'silent' : 'normal'
    )

    const cli = new GitlyCLI(logger)

    const result = await cli.clone({
      source,
      destination: destination ?? process.cwd(),
      force: values.force ?? false,
      cache: values.cache ?? false,
      mode: values.mode === 'git' ? 'git' : 'axios',
      depth: values.depth ? parseInt(values.depth, 10) : undefined,
      subdirectory: values.subdirectory,
    })

    logger.success(`✓ Cloned to ${result.destination}`)
    process.exit(0)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error: ${message}`)
    process.exit(1)
  }
}

main()
