import isOnline from "../is-online";

describe('isOnline', () =>{
  it('should determine whether the current environment is online', async () =>{
    expect(await isOnline()).toEqual(true)
  })
})