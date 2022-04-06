import { IStaleWhileRevalidateCache } from '@src/types'
import stringify from 'fast-json-stable-stringify'
import { isntUndefined } from '@blackglory/prelude'
import { pass } from '@blackglory/prelude'

export function memoizeStaleWhileRevalidate<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  {
    cache
  , createKey = stringify
  }: {
    cache: IStaleWhileRevalidateCache<CacheValue>
    createKey?: (args: Args) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args)
    const value = cache.get(key)
    if (isntUndefined(value)) {
      queueMicrotask(async () => {
        if (cache.isStaleWhileRevalidate(key) && !pendings.has(key)) {
          refresh.call(this, key, args).catch(pass)
        }
      })
      return value as any as Result
    } else {
      if (pendings.has(key)) return pendings.get(key)!
      return await refresh.call(this, key, args)
    }
  }

  async function refresh(this: unknown, key: string, args: Args): Promise<Result> {
    const promise = Promise.resolve(fn.apply(this, args))
    pendings.set(key, promise)
    try {
      const value = await promise
      cache.set(key, value)
      return value
    } finally {
      pendings.delete(key)
    }
  }
}
