import { isReadableStream } from "../../stream/is-stream";
import { fetch } from "../fetch";

describe('fetch', () => {
  it('should fetch and return a readable stream', async () => {
    expect(
      isReadableStream(
        await fetch('https://github.com/iwatakeshi/gitly/archive/master.tar.gz')
      )
    ).toBe(true)
  });
})