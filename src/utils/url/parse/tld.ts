import {always, cond, equals, T} from "rambda";
import {GitProvider} from "../../../types/git";

type TLD = 'com' | 'org'

export const tld = cond<GitProvider, TLD>([
  [equals<GitProvider>('bitbucket'), always('org')],
  [T, always('com')]
]) as (provider: GitProvider) => TLD