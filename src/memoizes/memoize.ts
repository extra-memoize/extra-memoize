import { ICache, State } from '@src/types.js'
import { defaultCreateKey } from '@memoizes/utils/default-create-key.js'
import { createVerboseResult } from '@memoizes/utils/create-verbose-result.js'

type VerboseResult<T> = [T, State.Hit | State.Miss]

export interface IMemoizeOptions<
  CacheValue
, Args extends any[]
> {
  cache: ICache<CacheValue>
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

export function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => VerboseResult<Result>
export function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
export function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: Omit<IMemoizeOptions<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
export function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result>
export function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  , executionTimeThreshold = 0
  , verbose = false
  }: IMemoizeOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result> {
  return function (this: unknown, ...args: Args): Result | VerboseResult<Result> {
    const [value, state] = memoizedFunction.apply(this, args)
    return verbose ? [value, state] : value
  }
  
  function memoizedFunction(
    this: unknown
  , ...args: Args
  ): VerboseResult<Result> {
    const key = createKey(args, name)
    const [state, value] = cache.get(key)
    if (state === State.Hit) {
      return createVerboseResult(value as Result, state)
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
