import type GitlyOptions from '../interfaces/options'
import gitly from '../utils/gitly'
import { EventEmitter } from 'node:events'
import type { ILogger } from './logger'

/**
 * CLI configuration for cloning repositories
 */
export interface CLICloneOptions {
  source: string
  destination: string
  force?: boolean
  cache?: boolean
  mode?: 'axios' | 'git'
  depth?: number
  subdirectory?: string
  temp?: string
}

/**
 * Result of a successful clone operation
 */
export interface CLICloneResult {
  source: string
  destination: string
  cached: boolean
}

/**
 * Main CLI class with event-driven architecture
 * Follows Command pattern and Dependency Injection
 */
export class GitlyCLI extends EventEmitter {
  constructor(private readonly logger: ILogger) {
    super()
    this.setupEventListeners()
  }

  /**
   * Setup event listeners for progress tracking
   */
  private setupEventListeners(): void {
    this.on('download:start', (source: string) => {
      this.logger.info(`Downloading ${source}...`)
    })

    this.on('download:complete', (path: string) => {
      this.logger.verbose(`Downloaded to ${path}`)
    })

    this.on('extract:start', (source: string) => {
      this.logger.info(`Extracting ${source}...`)
    })

    this.on('extract:complete', (destination: string) => {
      this.logger.verbose(`Extracted to ${destination}`)
    })

    this.on('cache:hit', (path: string) => {
      this.logger.verbose(`Cache hit: ${path}`)
    })

    this.on('cache:miss', () => {
      this.logger.verbose('Cache miss, downloading fresh copy')
    })
  }

  /**
   * Clone a repository with full event tracking
   */
  async clone(options: CLICloneOptions): Promise<CLICloneResult> {
    this.logger.verbose(`Cloning ${options.source}`)

    const gitlyOptions: GitlyOptions = {
      force: options.force,
      cache: options.cache,
      backend: options.mode,
      temp: options.temp ?? process.env.GITLY_CACHE,
      git: options.depth ? { depth: options.depth } : undefined,
      throw: true,
    }

    this.emit('download:start', options.source)
    const [archivePath, destination] = await gitly(
      options.source,
      options.destination,
      gitlyOptions
    )
    this.emit('download:complete', archivePath)
    this.emit('extract:complete', destination)

    return {
      source: archivePath,
      destination,
      cached: !options.force,
    }
  }
}
