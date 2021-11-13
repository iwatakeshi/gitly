import {branch} from "./parse/branch";
import {ownerRepo} from "./parse/owner-repo";
import {provider} from "./parse/provider";
import {GitMetadata} from "../../types/git";

/**
 * Options for `GitURL`
 */
export interface GitURLOptions {
  /**
   * The repository's branch
   */
  branch?: string
}

export class GitURL extends URL implements GitMetadata {
  constructor(url: string | URL, base?: string | URL, private readonly options?: GitURLOptions) {
    super(url, base);
  }

  get owner() {
    const [owner] = ownerRepo(this.pathname)
    return owner
  }

  get repository() {
    const [, repository] = ownerRepo(this.pathname)
    return repository
  }

  get branch() {
    return this?.options?.branch || branch(this.hash) || 'master'
  }

  get provider() {
    return provider(this.host) || 'github'
  }
}