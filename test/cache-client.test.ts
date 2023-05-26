import { ICacheClient } from '../src'

const testsForSet = (client: ICacheClient) => {
  const key = 'foo'
  const value = 'bar'

  test('key, value', async () => {
    await client.set(key, value)
    expect(await client.get(key)).toEqual(value)
  })

  test('key, value => OK', async () => {
    expect(await client.set(key, value)).toBe('OK')
  })
}

const testsForGet = (client: ICacheClient) => {
  const key = 'foo'
  const value = 'bar'

  test('key => value, when key exists', async () => {
    await client.set(key, value)
    expect(await client.get(key)).toEqual(value)
  })

  test('key => null, when key does not exist', async () => {
    expect(await client.get('fakeKey')).toBeNull()
  })
}

const testsForDelByKey = (client: ICacheClient, key = 'foo', expectedDeletedKeys = [key]) => {
  const value = 'bar'

  test('key', async () => {
    await client.set(key, value)
    await client.del(key)
    expect(await client.get(key)).toBeNull()
  })

  test('key => array of deleted key, when key exists', async () => {
    await client.set(key, value)
    const deletedKeys = await client.del(key)
    expect(deletedKeys.sort()).toEqual(expectedDeletedKeys.sort())
  })

  test('key => empty array, when key does not exist', async () => {
    expect(await client.del('fakeKey')).toHaveLength(0)
  })
}

const testsForDelByKeys = (
  client: ICacheClient,
  keys = ['foo/1', 'foo/2', 'foo/3', 'bar/1', 'bar/2'],
  expectedDeletedKeys = [...keys]
) => {
  const value = 'bar'

  beforeEach(async () => {
    await Promise.all(keys.map(async key => await client.set(key, value)))
  })

  test('keys', async () => {
    await client.del(keys)
    await Promise.all(keys.map(async key => expect(await client.get(key)).toBeNull()))
  })

  test('keys => array of deleted keys, when keys exist', async () => {
    const deletedKeys = await client.del(keys)
    expect(deletedKeys.sort()).toEqual(expectedDeletedKeys.sort())
  })

  test('keys => empty array, when keys do not exist', async () => {
    expect(await client.del(['fake', 'key'])).toHaveLength(0)
  })
}

const testsForDelByPattern = (
  client: ICacheClient,
  keys = ['foo/1', 'foo/2', 'foo/3', 'bar/1', 'bar/2'],
  pattern = 'foo/*',
  expectedDeletedKeys = ['foo/1', 'foo/2', 'foo/3']
) => {
  const value = 'bar'

  beforeEach(async () => {
    await Promise.all(keys.map(async key => await client.set(key, value)))
  })

  test('glob pattern', async () => {
    await client.del(pattern)
    await Promise.all(expectedDeletedKeys.map(async key => expect(await client.get(key)).toBeNull()))
  })

  test('glob pattern => array of deleted keys, when keys match', async () => {
    const deletedKeys = await client.del(pattern)
    expect(deletedKeys.sort()).toEqual(expectedDeletedKeys.sort())
  })

  test('glob pattern => empty array, when keys do not match', async () => {
    expect(await client.del('fake/*')).toHaveLength(0)
  })
}

const testsForDelByPatterns = (
  client: ICacheClient,
  keys = ['foo/1', 'foo/2', 'foo/3', 'bar', 'bar/2'],
  patterns = ['foo/*', 'bar/*'],
  expectedDeletedKeys = ['foo/1', 'foo/2', 'foo/3', 'bar/2']
) => {
  const value = 'bar'

  beforeEach(async () => {
    await Promise.all(keys.map(async key => await client.set(key, value)))
  })

  test('glob patterns', async () => {
    await client.del(patterns)
    await Promise.all(expectedDeletedKeys.map(async key => expect(await client.get(key)).toBeNull()))
  })

  test('glob patterns => array of deleted keys, when keys match', async () => {
    const deletedKeys = await client.del(patterns)
    expect(deletedKeys.sort()).toEqual(expectedDeletedKeys.sort())
  })

  test('glob patterns => empty array, when keys do not match', async () => {
    expect(await client.del(['fake/*', 'key/*'])).toHaveLength(0)
  })
}

const testsForClear = (
  client: ICacheClient,
  keys = ['foo/1', 'foo/2', 'foo/3', 'bar/1', 'bar/2'],
  expectedDeletedKeys = [...keys]
) => {
  const value = 'bar'

  test('=> array of deleted keys, when keys exist', async () => {
    await Promise.all(keys.map(async key => await client.set(key, value)))

    const deletedKeys = await client.clear()
    expect(deletedKeys.sort()).toEqual(expectedDeletedKeys.sort())
  })
}

// only as an example, because the del method uses the keys method every time
const testsForKeys = (
  client: ICacheClient,
  keys = ['foo/1', 'foo/2', 'foo/3', 'bar/1', 'bar/2'],
  expectedKeys = [...keys]
) => {
  const value = 'bar'

  test('glob pattern => array of matched keys', async () => {
    await Promise.all(keys.map(async key => await client.set(key, value)))
    const deletedKeys = await client.clear()
    expect(deletedKeys.sort()).toEqual(expectedKeys.sort())
  })
}

const ICacheClientTestes = (client: ICacheClient) => {
  describe('ICacheClient', () => {
    afterEach(async () => {
      await client.clear()
    })

    describe('set()', () => {
      testsForSet(client)
    })

    describe('get()', () => {
      testsForGet(client)
    })

    describe('del(key)', () => {
      testsForDelByKey(client)
    })

    describe('del(keys)', () => {
      testsForDelByKeys(client)
    })

    describe('del(pattern)', () => {
      testsForDelByPattern(client)
    })

    describe('del(patterns)', () => {
      testsForDelByPatterns(client)
    })

    describe('clear()', () => {
      testsForClear(client)
    })

    describe('keys()', () => {
      testsForKeys(client)
    })
  })
}

export default ICacheClientTestes
export {
  testsForSet,
  testsForGet,
  testsForDelByKey,
  testsForDelByKeys,
  testsForDelByPattern,
  testsForDelByPatterns,
  testsForClear,
  testsForKeys,
}
