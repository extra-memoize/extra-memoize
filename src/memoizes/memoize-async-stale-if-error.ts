import { IStaleIfErrorCache, IStaleIfErrorAsyncCache, State } from '@src/types.js'
import { defaultCreateKey } from '@memoizes/utils/default-create-key.js'
import { createVerboseResult } from '@memoizes/utils/create-verbose-result.js'
import { Awaitable } from '@blackglory/prelude'

type VerboseResult<T> = [
  T
, | State.Hit
  | State.Miss
  | State.Reuse
  | State.StaleIfError
]

export interface IMemoizeAsyncStaleIfError<CacheValue, Args extends any[]> {
  cache: IStaleIfErrorCache<CacheValue> | IStaleIfErrorAsyncCache<CacheValue>
  name?: string
  createKey?: (args: Args, name?: string) => string
  verbose?: boolean

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

export function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
export function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
export function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: Omit<IMemoizeAsyncStaleIfError<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
export function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<CacheValue, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
export function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  , executionTimeThreshold = 0
  , verbose = false
  }: IMemoizeAsyncStaleIfError<CacheValue, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (
    this: unknown
  , ...args: Args
  ): Promise<Result | VerboseResult<Result>> {
    const [value, state] = await memoizedFunction.apply(this, args)
    return verbose ? [value, state] : value
  }

  async function memoizedFunction(
    this: unknown
  , ...args: Args
  ): Promise<VerboseResult<Result>> {
    const key = createKey(args, name)
    const [state, value] = await cache.get(key)
    if (state === State.Hit) {
      return createVerboseResult(value as Result, state)
    } else if (state === State.StaleIfError) {
      if (pendings.has(key)) {
        try {
          return createVerboseResult(await pendings.get(key)!, State.Reuse)
        } catch {
          return createVerboseResult(value as Result, state)
        }
      } else {
        try {
          return createVerboseResult(await refresh.call(this, key, args), state)
        } catch {
          return createVerboseResult(value as Result, state)
        }
      }
    } else {
      if (pendings.has(key)) {
        return createVerboseResult(await pendings.get(key)!, State.Reuse)
      } else {
        return createVerboseResult(await refresh.call(this, key, args), state)
      }
    }
  }

  async function refresh(this: unknown, key: string, args: Args): Promise<Result> {
    const startTime = Date.now()
    const promise = Promise.resolve(fn.apply(this, args))
    pendings.set(key, promise)

    try {
      const result = await promise
      if (isSlowExecution(startTime)) {
        await cache.set(key, result)
      }

      return result
    } finally {
      pendings.delete(key)
    }
  }

  function isSlowExecution(startTime: number): boolean {
    return getElapsed() >= executionTimeThreshold

    function getElapsed(): number {
      return Date.now() - startTime
    }
  }
}
