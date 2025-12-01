export { default } from './utils/gitly'
export { default as download } from './utils/download'
export { default as extract } from './utils/extract'
export { default as parse } from './utils/parse'
export { default as clone } from './utils/clone'

// Export auth utilities
export { getAuthToken, injectAuthHeaders } from './utils/auth'

// Export new functionality
export { ActionsProcessor, type Action, type CloneAction, type RemoveAction } from './utils/actions'
export { GitProviderRegistry, type IGitProvider } from './utils/git-providers'
export { 
  ExtractionStrategyFactory,
  type IExtractionStrategy,
  SubdirectoryExtractionStrategy,
  FullExtractionStrategy
} from './utils/extraction-strategy'
export {
  CommitResolverRegistry,
  type ICommitResolver,
  type CommitInfo,
  GitHubCommitResolver,
  GitLabCommitResolver,
  BitbucketCommitResolver,
  SourcehutCommitResolver,
  CodebergCommitResolver
} from './utils/commit-resolver'

// Export CLI components for programmatic use
export { GitlyCLI, type CLICloneOptions, type CLICloneResult } from './cli/cli'
export { ConsoleLogger, NullLogger, type ILogger, type LogLevel } from './cli/logger'

