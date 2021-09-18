import { ICache } from './types'

export interface IMemoizeAsyncOptions<Result> {
  cache: ICache<Promise<Result>>
}

export function memoizeAsync<Result, Args extends any[]>(
  { cache }: IMemoizeAsyncOptions<Result>
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  return function (this: unknown, ...args: Args): Promise<Result> {
    if (cache.has(args)) return cache.get(args)!

    const result = Promise.resolve(fn.apply(this, args))
    cache.set(args, result)
    result.catch(() => cache.delete(args))

    return result
  }
}
