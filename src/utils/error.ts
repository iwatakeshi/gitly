export enum GitlyErrorType {
  Fetch = 'fetch',
  Extract = 'extract',
  Download = 'download'
}

export default abstract class GitlyError extends Error {
  static type: GitlyErrorType
  type: GitlyErrorType
  constructor(readonly message: string, readonly code: number = -1) {
    super(message)
    const type = this.type = this.ctor.type
    this.message = `[${type ? `gitly:${type}` : 'gitly'}]: ${message}`
  }

  get ctor(): typeof GitlyError {
    return (this.constructor) as typeof GitlyError
  }
}

export const GitlyFetchError = class extends GitlyError {
  static type = GitlyErrorType.Fetch
}

export const GitlyExtractError = class extends GitlyError {
  static type = GitlyErrorType.Extract
}

export const GitlyDownloadError = class extends GitlyError {
  static type = GitlyErrorType.Download
}