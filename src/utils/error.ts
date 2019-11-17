export enum GitlyErrorType {
  Fetch = 'fetch',
  Extract = 'extract',
  Download = 'download',
  Unknown = 'unknown'
}

export default abstract class GitlyAbstractError extends Error {
  static type: GitlyErrorType
  type: GitlyErrorType
  rawMessage: string
  constructor(readonly message: string, readonly code: number = -1) {
    super(message)
    this.rawMessage = message
    const type = this.type = this.ctor.type
    this.message = `[${type ? `gitly:${type}` : 'gitly'}]: ${message}`
    Object.setPrototypeOf(this, new.target.prototype)
  }

  get ctor(): typeof GitlyAbstractError {
    return (this.constructor) as typeof GitlyAbstractError
  }
}

export const GitlyUknownError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Unknown
}

export const GitlyFetchError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Fetch
}

export const GitlyExtractError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Extract
}

export const GitlyDownloadError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Download
}
