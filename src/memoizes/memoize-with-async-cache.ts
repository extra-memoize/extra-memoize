import { IAsyncCache } from '@src/types'
import { isntUndefined } from '@blackglory/prelude'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'

export function memoizeWithAsyncCache<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  }: {
    cache: IAsyncCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string
  }
, fn: (...args: Args) => Result | PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args, name)
    const value = await cache.get(key)
    if (isntUndefined(value)) return value as any as Result

    if (pendings.has(key)) return pendings.get(key)!
    return await refresh.call(this, key, args)
  }

  async function refresh(this: unknown, key: string, args: Args): Promise<Result> {
    const pending = Promise.resolve(fn.apply(this, args))
    pendings.set(key, pending)
    try {
      const value = await pending
      await cache.set(key, value)
      return value
    } finally {
      pendings.delete(key)
    }
  }
}
