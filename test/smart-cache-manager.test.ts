import ICacheClientTestes, {
  testsForSet,
  testsForGet,
  testsForDelByKey,
  testsForDelByKeys,
  testsForDelByPattern,
  testsForDelByPatterns,
  testsForClear,
  testsForKeys,
} from './cache-client.test'

import RedisCacheClient from '@i1k/redis-cache-client'
import MemoryCacheClient from '@i1k/memory-cache-client'
import CacheManager from '../src'

jest.mock('ioredis', () => require('ioredis-mock'))

describe('as cache client', () => {
  const cacheManagerAsCacheClient = new CacheManager({
    client: new MemoryCacheClient({ max: 10 }),
  })

  ICacheClientTestes(cacheManagerAsCacheClient)
})

describe('as cache client with key', () => {
  const cacheManagerSingleStore = new CacheManager({
    client: new MemoryCacheClient({ max: 10 }),
    key: key => (key.includes('main') ? key : null),
  })

  const value = 'bar'

  afterEach(async () => {
    await cacheManagerSingleStore.clear()
  })

  describe('set()', () => {
    test(`key does not include 'main'`, async () => {
      await cacheManagerSingleStore.set('foo', value)
      expect(await cacheManagerSingleStore.get('foo')).toBeNull()
    })

    test(`key includes 'main'`, async () => {
      await cacheManagerSingleStore.set('main', value)
      expect(await cacheManagerSingleStore.get('main')).toEqual(value)
    })
  })
})

describe('as cache manager', () => {
  const cacheManagerMultiStore = new CacheManager([
    {
      client: new MemoryCacheClient({ max: 10 }),
      key: key => (key.includes('main') ? key : null),
    },
    {
      client: new RedisCacheClient(),
    },
  ])

  afterEach(async () => {
    await cacheManagerMultiStore.clear()
  })

  describe('set()', () => {
    testsForSet(cacheManagerMultiStore)
  })

  describe('get()', () => {
    testsForGet(cacheManagerMultiStore)
  })

  describe('del(key)', () => {
    // prettier-ignore
    testsForDelByKey(
      cacheManagerMultiStore,
      'main',
      ['RedisCacheClient: main', 'MemoryCacheClient: main']
    )

    describe('when key is ignored by MemoryCacheClient', () => {
      testsForDelByKey(cacheManagerMultiStore, 'foo', ['RedisCacheClient: foo'])
    })
  })

  describe('del(keys)', () => {
    testsForDelByKeys(
      cacheManagerMultiStore,
      ['main/1', 'main/2', 'main/3', 'foo/1', 'foo/2'],
      [
        'MemoryCacheClient: main/1',
        'MemoryCacheClient: main/2',
        'MemoryCacheClient: main/3',
        'RedisCacheClient: main/1',
        'RedisCacheClient: main/2',
        'RedisCacheClient: main/3',
        'RedisCacheClient: foo/1',
        'RedisCacheClient: foo/2',
      ]
    )
  })

  describe('del(pattern)', () => {
    // prettier-ignore
    testsForDelByPattern(
      cacheManagerMultiStore,
      ['main/1', 'main/2', 'main/3', 'foo/1', 'foo/2'],
      'foo/*',
      ['RedisCacheClient: foo/1', 'RedisCacheClient: foo/2']
    )
  })

  describe('del(patterns)', () => {
    testsForDelByPatterns(
      cacheManagerMultiStore,
      ['main', 'main/1', 'main/2', 'foo/1', 'foo/2'],
      ['main/*', 'foo/*'],
      [
        'MemoryCacheClient: main/1',
        'MemoryCacheClient: main/2',
        'RedisCacheClient: main/1',
        'RedisCacheClient: main/2',
        'RedisCacheClient: foo/1',
        'RedisCacheClient: foo/2',
      ]
    )
  })

  describe('clear()', () => {
    testsForClear(
      cacheManagerMultiStore,
      ['main/1', 'main/2', 'main/3', 'foo/1', 'foo/2'],
      [
        'MemoryCacheClient: main/1',
        'MemoryCacheClient: main/2',
        'MemoryCacheClient: main/3',
        'RedisCacheClient: main/1',
        'RedisCacheClient: main/2',
        'RedisCacheClient: main/3',
        'RedisCacheClient: foo/1',
        'RedisCacheClient: foo/2',
      ]
    )
  })

  // only as an example, because the del method uses the keys method every time
  describe('keys()', () => {
    testsForKeys(
      cacheManagerMultiStore,
      ['main/1', 'main/2', 'main/3', 'foo/1', 'foo/2'],
      [
        'MemoryCacheClient: main/1',
        'MemoryCacheClient: main/2',
        'MemoryCacheClient: main/3',
        'RedisCacheClient: main/1',
        'RedisCacheClient: main/2',
        'RedisCacheClient: main/3',
        'RedisCacheClient: foo/1',
        'RedisCacheClient: foo/2',
      ]
    )
  })
})
