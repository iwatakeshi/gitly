/**
 * Logger abstraction following Interface Segregation Principle
 */
export interface ILogger {
  info(message: string): void
  verbose(message: string): void
  success(message: string): void
  error(message: string): void
  warn(message: string): void
}

/**
 * Log level for filtering output
 */
export type LogLevel = 'silent' | 'normal' | 'verbose'

/**
 * Console logger implementation with configurable verbosity
 * Follows Strategy pattern for different log levels
 */
export class ConsoleLogger implements ILogger {
  constructor(private readonly level: LogLevel = 'normal') {}

  info(message: string): void {
    if (this.level !== 'silent') {
      console.log(message)
    }
  }

  verbose(message: string): void {
    if (this.level === 'verbose') {
      console.log(`[verbose] ${message}`)
    }
  }

  success(message: string): void {
    if (this.level !== 'silent') {
      console.log(message)
    }
  }

  error(message: string): void {
    if (this.level !== 'silent') {
      console.error(`[error] ${message}`)
    }
  }

  warn(message: string): void {
    if (this.level !== 'silent') {
      console.warn(`[warn] ${message}`)
    }
  }
}

/**
 * Null logger for testing or when output should be suppressed
 * Follows Null Object pattern
 */
export class NullLogger implements ILogger {
  info(): void {}
  verbose(): void {}
  success(): void {}
  error(): void {}
  warn(): void {}
}
