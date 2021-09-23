import { IStaleWhileRevalidateAsyncCache } from '@src/types'
import { isntUndefined } from '@blackglory/types'
import stringify from 'fast-json-stable-stringify'

export function memoizeStaleWhileRevalidateWithAsyncCache<Result, Args extends any[]>(
  {
    cache
  , createKey = (...args) => stringify(args)
  }: {
    cache: IStaleWhileRevalidateAsyncCache<Result>
    createKey?: (...args: Args) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey.apply(this, args)
    const value = await cache.get(key)
    if (isntUndefined(value)) {
      queueMicrotask(async () => {
        // 注意, 这两个条件的位置不可调换
        if (await cache.isStaleWhileRevalidate(key) && !pendings.has(key)) {
          refresh.call(this, key, args).catch(() => {})
        }
      })
      return value
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
