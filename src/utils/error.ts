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
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    const type = (this.type = this.ctor.type)
    this.message = `[${type ? `gitly:${type}` : 'gitly'}]: ${message}`
    Object.setPrototypeOf(this, new.target.prototype)
  }

  get ctor(): typeof GitlyAbstractError {
    return this.constructor as typeof GitlyAbstractError
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export const GitlyUnknownError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Unknown
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export const GitlyFetchError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Fetch
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export const GitlyExtractError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Extract
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export const GitlyDownloadError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Download
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export const GitlyCloneError = class extends GitlyAbstractError {
  static type = GitlyErrorType.Clone
}
