import { exists } from "../exists";
import { tmpdir } from 'os'
import { join } from "path";

describe('exists', () => {
  it('should return true when a temp directory exists', async () => {
    expect(await exists(tmpdir())).toBe(true)
  })

  it('should return false when a local directory isn\'t present', async () => {
    expect(await exists(join(__dirname, Math.random().toString()))).toBe(false)
  })
})