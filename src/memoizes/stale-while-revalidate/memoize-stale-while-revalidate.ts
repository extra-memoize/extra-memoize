import { IStaleWhileRevalidateCache } from '@src/types'
import stringify from 'fast-json-stable-stringify'
import { isntUndefined } from '@blackglory/types'
import { go } from '@blackglory/go'

export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  {
    cache
  , createKey = (...args) => stringify(args)
  }: {
    cache: IStaleWhileRevalidateCache<Result>
    createKey?: (...args: Args) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey.apply(this, args)
    const value = cache.get(key)
    if (isntUndefined(value)) {
      go(async () => {
        if (cache.isStaleWhileRevalidate(key) && !pendings.has(key)) {
          refresh.call(this, key, args).catch(() => {})
        }
      })
      return value
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
