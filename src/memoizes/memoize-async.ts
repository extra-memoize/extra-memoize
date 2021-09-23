import { ICache } from '@src/types'
import stringify from 'fast-json-stable-stringify'
import { isntUndefined } from '@blackglory/types'

export function memoizeAsync<Result, Args extends any[]>(
  {
    cache
  , createKey = (...args) => stringify(args)
  }: {
    cache: ICache<Result>
    createKey?: (...args: Args) => string
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey.apply(this, args)
    const value = cache.get(key)
    if (isntUndefined(value)) return value

    if (pendings.has(key)) return pendings.get(key)!
    return await refresh.call(this, key, args)
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
