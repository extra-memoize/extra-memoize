import { IStaleWhileRevalidateAsyncCache } from '@src/types'
import { isntUndefined } from '@blackglory/prelude'
import { pass } from '@blackglory/prelude'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'

export function memoizeStaleWhileRevalidateWithAsyncCache<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  }: {
    cache: IStaleWhileRevalidateAsyncCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args, name)
    const value = await cache.get(key)
    if (isntUndefined(value)) {
      queueMicrotask(async () => {
        // 注意, 这两个条件的位置不可调换
        if (await cache.isStaleWhileRevalidate(key) && !pendings.has(key)) {
          refresh.call(this, key, args).catch(pass)
        }
      })
      return value as any as Result
    } else {
      if (pendings.has(key)) return await pendings.get(key)!
      return await refresh.call(this, key, args)
    }
  }

  async function refresh(this: unknown, key: string, args: Args): Promise<Result> {
    const promise = Promise.resolve(fn.apply(this, args))
    pendings.set(key, promise)
    try {
      const value = await promise
      await cache.set(key, value)
      return value
    } finally {
      pendings.delete(key)
    }
  }
}
