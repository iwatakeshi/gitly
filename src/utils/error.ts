export enum GitlyErrorType {
  Fetch = 'fetch',
  Clone = 'clone',
  Extract = 'extract',
  Download = 'download',
  Unknown = 'unknown',
}

export default abstract class GitlyAbstractError extends Error {
  static type: GitlyErrorType
  type: GitlyErrorType
  rawMessage: string
  constructor(
    readonly message: string,
    readonly code: number = -1
  ) {
    super(message)
    this.rawMessage = message
    const type = this.ctor.type
    this.type = type
    this.message = `[${type ? `gitly:${type}` : 'gitly'}]: ${message}`
    Object.setPrototypeOf(this, new.target.prototype)
  }

  get ctor(): typeof GitlyAbstractError {
    return this.constructor as typeof GitlyAbstractError
  }
}

/** Base error class for unknown gitly errors */
export const GitlyUnknownError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Unknown
}

/** Error class for fetch operation failures */
export const GitlyFetchError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Fetch
}

/** Error class for extraction operation failures */
export const GitlyExtractError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Extract
}

/** Error class for download operation failures */
export const GitlyDownloadError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Download
}

/** Error class for clone operation failures */
export const GitlyCloneError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Clone
}
