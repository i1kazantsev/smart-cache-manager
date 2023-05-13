type StringOrGlobPattern = string

interface ICacheClient {
  set: (key: string, value: string) => Promise<'OK'>
  get: (key: string) => Promise<string | null>
  del: (key: StringOrGlobPattern | StringOrGlobPattern[]) => Promise<string[]>
  clear: () => Promise<string[]>
  keys: (pattern: StringOrGlobPattern | StringOrGlobPattern[]) => Promise<string[]>
}

type Manager = {
  client: ICacheClient
  key?: (key: string) => string | null
}

type ClientWithKey = {
  client: ICacheClient
  key: string
}

class CacheManager implements ICacheClient {
  private readonly _manager: Manager | Manager[]

  constructor(manager: Manager | Manager[]) {
    this._manager = manager
  }

  public async set(key: string, value: string): Promise<'OK'> {
    const clientsWithKeys: ClientWithKey[] = this.keyHandler(key)

    if (!clientsWithKeys.length) {
      return 'OK'
    }

    if (clientsWithKeys.length === 1) {
      const { client, key } = clientsWithKeys[0]
      return await client.set(key, value)
    } else {
      return await Promise.all(
        clientsWithKeys.map(clientWithKey => {
          const { client, key } = clientWithKey
          client.set(key, value)
        })
      ).then(() => 'OK')
    }
  }

  public async get(key: string): Promise<string | null> {
    const clientsWithKeys: ClientWithKey[] = this.keyHandler(key)

    if (!clientsWithKeys.length) {
      return null
    }

    if (clientsWithKeys.length === 1) {
      const { client, key } = clientsWithKeys[0]
      return await client.get(key)
    } else {
      return await Promise.race(
        clientsWithKeys.map(clientWithKey => {
          const { client, key } = clientWithKey
          return client.get(key)
        })
      )
    }
  }

  public async del(key: StringOrGlobPattern | StringOrGlobPattern[]): Promise<string[]> {
    if (Array.isArray(this._manager)) {
      return await Promise.all(
        this._manager.map(manager =>
          manager.client.del(key).then(keys => keys.map(key => `${manager.client.constructor.name}: ${key}`))
        )
      ).then((keys: string[][]): string[] => keys.flat())
    } else {
      return this._manager.client.del(key)
    }
  }

  public async clear(): Promise<string[]> {
    if (Array.isArray(this._manager)) {
      return await Promise.all(
        this._manager.map(manager =>
          manager.client.clear().then(keys => keys.map(key => `${manager.client.constructor.name}: ${key}`))
        )
      ).then((keys: string[][]): string[] => keys.flat())
    } else {
      return this._manager.client.clear()
    }
  }

  public async keys(pattern: string | string[]): Promise<string[]> {
    if (Array.isArray(this._manager)) {
      return await Promise.all(
        this._manager.map(manager =>
          manager.client.keys(pattern).then(keys => keys.map(key => `${manager.client.constructor.name}: ${key}`))
        )
      ).then((keys: string[][]): string[] => keys.flat())
    } else {
      return this._manager.client.keys(pattern)
    }
  }

  private keyHandler(key: string): ClientWithKey[] {
    if (Array.isArray(this._manager)) {
      // prettier-ignore
      return this._manager
        .map(manager => {
          return {
            client: manager.client,
            key: typeof manager.key === 'function' ? manager.key(key) : key,
          }
        })
        .filter((clientWithKey: {
          client: ICacheClient;
          key: string | null
        }): clientWithKey is ClientWithKey => !!clientWithKey.key)
    } else if (typeof this._manager.key === 'function') {
      const generatedKey = this._manager.key(key)
      return generatedKey ? [{ client: this._manager.client, key: generatedKey }] : []
    } else {
      return [{ client: this._manager.client, key }]
    }
  }
}

export { ICacheClient, StringOrGlobPattern }
export default CacheManager
