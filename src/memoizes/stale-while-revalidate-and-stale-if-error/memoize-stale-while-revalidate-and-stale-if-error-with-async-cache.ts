import { IStaleWhileRevalidateAndStaleIfErrorAsyncCache, State } from '@src/types'
import stringify from 'fast-json-stable-stringify'
import { pass } from '@blackglory/prelude'

export function memoizeStaleWhileRevalidateAndStaleIfErrorWithAsyncCache<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  {
    cache
  , createKey: createKey = stringify
  }: {
    cache: IStaleWhileRevalidateAndStaleIfErrorAsyncCache<CacheValue>
    createKey?: (args: Args) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args)
    const [state, value] = await cache.get(key)
    if (state === State.Hit) {
      return value! as any as Result
    } else if (state === State.StaleWhileRevalidate) {
      queueMicrotask(async () => {
        if (!pendings.has(key)) {
          refresh.call(this, key, args).catch(pass)
        }
      })
      return value! as any as Result
    } else if (state === State.StaleIfError) {
      if (pendings.has(key)) {
        try {
          return await pendings.get(key)!
        } catch {
          return value! as any as Result
        }
      } else {
        try {
          return await refresh.call(this, key, args)
        } catch {
          return value! as any as Result
        }
      }
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
