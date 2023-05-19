# @i1k/smart-cache-manager

[![npm version](https://img.shields.io/npm/v/@i1k/smart-cache-manager/latest.svg)](https://www.npmjs.com/package/@i1k/smart-cache-manager)

Smart cache manager for caching clients such as:

- [@i1k/redis-cache-client](https://github.com/ivan1kazantsev/redis-cache-client#readme)
- [@i1k/memory-cache-client](https://github.com/ivan1kazantsev/memory-cache-client#readme)
- another client with [the same interface](#api-reference)

Provides features:

- supports one or more cache clients (multi-store);
- interface for building/ignoring keys.

## Installation

```bash
# using pnpm
pnpm i @i1k/smart-cache-manager

# using npm
npm i @i1k/smart-cache-manager
```

Additionally, you need to install or implement clients with [the same interface](#api-reference).

```bash
# using pnpm
pnpm i @i1k/redis-cache-client @i1k/memory-cache-client

# using npm
npm i @i1k/redis-cache-client @i1k/memory-cache-client
```

## Usage

Each cache client must be wrapped in an object defined according to the following type:

```typescript
type Manager = {
  client: ICacheClient
  key?: (key: string) => string | null
}
```

If you provide the key function,
every call to the `set` or `get` method will pass the key through this function for handling.

For example, if you want to cache only the keys that include the word 'main' in memory,
you can provide a function like the one shown below:

```typescript
// clients implement the ICacheClient interface
import RedisCacheClient from '@i1k/redis-cache-client'
import MemoryCacheClient from '@i1k/memory-cache-client'

import CacheManager from '@i1k/smart-cache-manager'

const cacheManager = new CacheManager([
  {
    client: new MemoryCacheClient({ max: 100 }),
    key: key => (key.includes('main') ? key : null),
  },
  {
    client: new RedisCacheClient(),
  },
])

cacheManager.set('key', 'value')
```

## API Reference

```typescript
interface ICacheClient {
  set: (key: string, value: string) => Promise<'OK'>
  get: (key: string) => Promise<string | null>
  del: (key: StringOrGlobPattern | StringOrGlobPattern[]) => Promise<string[]>
  clear: () => Promise<string[]>
  keys: (pattern: StringOrGlobPattern | StringOrGlobPattern[]) => Promise<string[]>
}
```

Remember that every call to the `set` or `get` method will pass the key through this function for handling.

### set

To set a key-value pair in all stores.

```typescript
cacheManager.set('foo', 'bar')
// => Promise<'OK'>

cacheManager.set('foo/main', 'bar')
// => Promise<'OK'>
```

### get

To get a value by key (uses promise race).

```typescript
cacheManager.get('foo')
// => Promise<'bar'>

cacheManager.get('bar')
// => Promise<null>
```

### del

To delete a key-value pair in all stores by a specific key or a glob pattern.

```typescript
cacheManager.del('foo')
// => Promise<['RedisCacheClient: foo']>

cacheManager.del('foo*')
// => Promise<['RedisCacheClient: foo', 'RedisCacheClient: foo/main', 'MemoryCacheClient: foo/main']>

cacheManager.del(['foo', 'foo/*'])
// => Promise<['RedisCacheClient: foo', 'RedisCacheClient: foo/main', 'MemoryCacheClient: foo/main']>
```

### clear

To clear all stores.

```typescript
cacheManager.clear()
// => Promise<['RedisCacheClient: foo', 'RedisCacheClient: foo/main', 'MemoryCacheClient: foo/main']>
```

### keys

To get keys from all stores by a specific key or a glob pattern.

```typescript
cacheManager.keys('foo')
// => Promise<['RedisCacheClient: foo']>

cacheManager.keys('foo*')
// => Promise<['RedisCacheClient: foo', 'RedisCacheClient: foo/main', 'MemoryCacheClient: foo/main']>

cacheManager.keys(['foo', 'foo/*'])
// => Promise<['RedisCacheClient: foo', 'RedisCacheClient: foo/main', 'MemoryCacheClient: foo/main']>
```

## License

[MIT](./LICENSE)
