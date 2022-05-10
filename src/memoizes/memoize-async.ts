import { ICache, State } from '@src/types'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'

export function memoizeAsync<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  }: {
    cache: ICache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args, name)
    const [state, value] = cache.get(key)
    if (state === State.Hit) {
      return value as Result
    } else {
      if (pendings.has(key)) return pendings.get(key)!
      return await refresh.call(this, key, args)
    }
  }

  async function refresh(this: unknown, key: string, args: Args): Promise<Result> {
    const pending = Promise.resolve(fn.apply(this, args))
    pendings.set(key, pending)
    try {
      const value = await pending
      cache.set(key, value)
      return value
    } finally {
      pendings.delete(key)
    }
  }
}
