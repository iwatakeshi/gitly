import { equals, filter, head, pipe, split } from "rambda";
import { pop } from "../../list/pop";
import { takeLastUntil } from "../../list/take-last-until";
import { GitProvider } from "../../../types/git";

export const provider = pipe(
  split('.'),
  //@ts-ignore
  filter(x => x !== '.'),
  // tap(console.log as any),
  //@ts-ignore
  takeLastUntil(equals('www')),
  // filter((x: string) => !x.includes('www')),
  // tap(console.log as any),
  pop,
  //@ts-ignore
  head,
  //@ts-ignore
) as (url: string) => GitProvider | undefined
