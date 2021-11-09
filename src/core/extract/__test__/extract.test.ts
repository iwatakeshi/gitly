import {mktdirSync} from "../../../utils/fs/mktdir";
import {dirname, join} from "path";
import {download} from "../../download";
import {extract} from "../index";
import {ls} from "shelljs";

const TEST_DIR = mktdirSync('gitly', 'extract')
describe('extract', () => {

  it('should extract the cached repository', async () => {
    const path = await download('iwatakeshi/gitly', {cache: {directory: TEST_DIR}})
    await extract(path, dirname(path))
    expect(ls(dirname(path)).length).toBeGreaterThan(1)
  })

  it('should return an empty string on non-existent repository', async () => {
    expect(await extract(join(__dirname, 'master.tar.gz'), TEST_DIR!)).toEqual('')
  })

  it('should throw when the throw option is enabled on an non-existent repository', async () => {
    await expect(extract(join(__dirname, 'master.tar.gz'), TEST_DIR!, {throw: true})).rejects.toThrow()
  })
})