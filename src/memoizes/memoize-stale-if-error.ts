import { IStaleIfErrorCache, State } from '@src/types.js'
import { defaultCreateKey } from '@memoizes/utils/default-create-key.js'
import { createVerboseResult } from '@memoizes/utils/create-verbose-result.js'

type VerboseResult<T> = [T, State.Hit | State.Miss | State.StaleIfError]

export interface IMemoizeStaleIfErrorOptions<CacheValue, Args extends any[]> {
  cache: IStaleIfErrorCache<CacheValue>
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

export function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleIfErrorOptions<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => VerboseResult<Result>
export function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleIfErrorOptions<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
export function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: Omit<IMemoizeStaleIfErrorOptions<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
export function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleIfErrorOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result>
export function memoizeStaleIfError<
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
  }: IMemoizeStaleIfErrorOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result> {
  return function (this: unknown, ...args: Args): Result | VerboseResult<Result> {
    const [value, state] = memoizedFunction.apply(this, args)
    return verbose ? [value, state] : value
  }

  function memoizedFunction(this: unknown, ...args: Args): VerboseResult<Result> {
    const key = createKey(args, name)
    const [state, value] = cache.get(key)
    if (state === State.Hit) {
      return createVerboseResult(value as Result, state)
    } else if (state === State.StaleIfError) {
      try {
        return createVerboseResult(refresh.call(this, key, args), state)
      } catch {
        return createVerboseResult(value as Result, state)
      }
    } else {
      return createVerboseResult(refresh.call(this, key, args), state)
    }
  }

  function refresh(this: unknown, key: string, args: Args): Result {
    const startTime = Date.now()
    const result = fn.apply(this, args)
    if (isSlowExecution(startTime)) {
      cache.set(key, result)
    }

    return result
  }

  function isSlowExecution(startTime: number): boolean {
    return getElapsed() >= executionTimeThreshold

    function getElapsed(): number {
      return Date.now() - startTime
    }
  }
}
