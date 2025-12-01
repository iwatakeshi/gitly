// Export CLI components for programmatic use
export { type CLICloneOptions, type CLICloneResult, GitlyCLI } from './cli/cli'
export { ConsoleLogger, type ILogger, type LogLevel, NullLogger } from './cli/logger'
// Export new functionality
export { type Action, ActionsProcessor, type CloneAction, type RemoveAction } from './utils/actions'
// Export auth utilities
export { getAuthToken, injectAuthHeaders } from './utils/auth'
export { default as clone } from './utils/clone'
export {
  BitbucketCommitResolver,
  CodebergCommitResolver,
  type CommitInfo,
  CommitResolverRegistry,
  GitHubCommitResolver,
  GitLabCommitResolver,
  type ICommitResolver,
  SourcehutCommitResolver,
} from './utils/commit-resolver'
export { default as download } from './utils/download'
export { default as extract } from './utils/extract'
export {
  ExtractionStrategyFactory,
  FullExtractionStrategy,
  type IExtractionStrategy,
  SubdirectoryExtractionStrategy,
} from './utils/extraction-strategy'
export { GitProviderRegistry, type IGitProvider } from './utils/git-providers'
export { default } from './utils/gitly'
export { default as parse } from './utils/parse'
