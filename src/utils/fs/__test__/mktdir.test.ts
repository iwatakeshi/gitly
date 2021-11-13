import { mktdir } from "../mktdir";
import { exists } from "../exists";
import { rm } from "shelljs";
import { tmpdir } from "os";

describe('mktdir', () => {
  afterAll(() => {
    rm('-rf', `${tmpdir()}/__TEST__*`)
  })
  it('should should create a test directory', async () => {
    const testDir = await mktdir('hello')
    expect(await exists(testDir!)).toBe(true)
  });
})