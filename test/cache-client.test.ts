import { ICacheClient } from '../src'

type Callback = () => Promise<void>

const ICacheClientTestes = (client: ICacheClient, cb?: Callback) => {
  describe('ICacheClient', () => {
    let key: string
    let value: string
    let fakeKey: string

    let keys: string[]
    let fakeKeys: string[]

    let pattern: string
    let fakePattern: string
    let filteredKeys: string[]

    let patterns: string[]
    let fakePatterns: string[]

    beforeAll(() => {
      key = 'foo'
      fakeKey = 'fake'
      value = 'bar'

      keys = ['foo/1', 'foo/2', 'foo/3', 'bar/1', 'bar/2']
      fakeKeys = ['fake', 'key']

      pattern = 'foo/*'
      fakePattern = 'fake/*'
      filteredKeys = keys.filter(key => (key.startsWith('foo/') ? key : null))

      patterns = ['foo/*', 'bar/*']
      fakePatterns = ['fake/*', 'key/*']
    })

    afterEach(async () => {
      await client.clear()
    })

    afterAll(async () => {
      if (cb) {
        await cb()
      }
    })

    describe('set()', () => {
      test('key, value', async () => {
        await client.set(key, value)
        expect(await client.get(key)).toEqual(value)
      })

      test('key, value => OK', async () => {
        expect(await client.set(key, value)).toBe('OK')
      })
    })

    describe('get()', () => {
      test('key => value, when key exists', async () => {
        await client.set(key, value)
        expect(await client.get(key)).toEqual(value)
      })

      test('key => null, when key does not exist', async () => {
        expect(await client.get(fakeKey)).toBeNull()
      })
    })

    describe('del()', () => {
      test('key', async () => {
        await client.set(key, value)
        await client.del(key)
        expect(await client.get(key)).toBeNull()
      })

      test('key => array of deleted key, when key exists', async () => {
        await client.set(key, value)
        expect(await client.del(key)).toEqual([key])
      })

      test('key => empty array, when key does not exist', async () => {
        expect(await client.del(fakeKey)).toHaveLength(0)
      })

      beforeEach(async () => {
        await Promise.all(keys.map(async key => await client.set(key, value)))
      })

      test('keys', async () => {
        await client.del(keys)
        await Promise.all(keys.map(async key => expect(await client.get(key)).toBeNull()))
      })

      test('keys => array of deleted keys, when keys exist', async () => {
        expect(await client.del(keys)).toEqual(keys)
      })

      test('keys => empty array, when keys do not exist', async () => {
        expect(await client.del(fakeKeys)).toHaveLength(0)
      })

      test('glob pattern', async () => {
        await client.del(pattern)
        await Promise.all(filteredKeys.map(async key => expect(await client.get(key)).toBeNull()))
      })

      test('glob pattern => array of deleted keys, when keys match', async () => {
        const deletedKeys = await client.del(pattern)
        expect(deletedKeys.sort()).toEqual(filteredKeys.sort())
      })

      test('glob pattern => empty array, when keys do not match', async () => {
        expect(await client.del(fakePattern)).toHaveLength(0)
      })

      test('glob patterns', async () => {
        await client.del(patterns)
        await Promise.all(keys.map(async key => expect(await client.get(key)).toBeNull()))
      })

      test('glob patterns => array of deleted keys, when keys match', async () => {
        const deletedKeys = await client.del(patterns)
        expect(deletedKeys.sort()).toEqual(keys.sort())
      })

      test('glob patterns => empty array, when keys do not match', async () => {
        expect(await client.del(fakePatterns)).toHaveLength(0)
      })
    })

    beforeEach(async () => {
      await Promise.all(keys.map(async key => await client.set(key, value)))
    })

    describe('clear()', () => {
      test('=> array of deleted keys, when keys exist', async () => {
        const deletedKeys = await client.clear()
        expect(deletedKeys.sort()).toEqual(keys.sort())
      })
    })

    // only as an example, because the del method uses the keys method every time
    describe('keys()', () => {
      test('glob pattern => array of matched keys', async () => {
        await Promise.all(keys.map(async key => await client.set(key, value)))
        const deletedKeys = await client.clear()
        expect(deletedKeys.sort()).toEqual(keys.sort())
      })
    })
  })
}

export default ICacheClientTestes
