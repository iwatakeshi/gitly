import { GitURL, GitURLOptions } from "../git-url";

export const toGitURL = (url: string | URL, options?: GitURLOptions): GitURL =>
  new GitURL(url, undefined, options)