import { IStaleIfErrorCache, State } from '@src/types'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'
import { createReturnValue } from '@memoizes/utils/create-return-value'

interface IMemoizeStaleIfErrorOptions<Result, Args extends any[]> {
  cache: IStaleIfErrorCache<Result>
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

export function memoizeStaleIfError<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => [Result, State.Hit | State.Miss | State.StaleIfError]
export function memoizeStaleIfError<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
export function memoizeStaleIfError<Result, Args extends any[]>(
  options: Omit<IMemoizeStaleIfErrorOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
export function memoizeStaleIfError<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | [Result, State.Hit | State.Miss | State.StaleIfError]
export function memoizeStaleIfError<Result, Args extends any[]>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  , executionTimeThreshold = 0
  , verbose = false
  }: IMemoizeStaleIfErrorOptions<Result, Args>
, fn: (...args: Args) => Result
): (...args: Args) =>
| Result
| [Result, State.Hit | State.Miss | State.StaleIfError] {
  return function (
    this: unknown
  , ...args: Args
  ): Result | [Result, State.Hit | State.Miss | State.StaleIfError] {
    const key = createKey(args, name)
    const [state, value] = cache.get(key)
    if (state === State.Hit) {
      return createReturnValue(value, state, verbose)
    } else if (state === State.StaleIfError) {
      try {
        return createReturnValue(refresh.call(this, key, args), state, verbose)
      } catch {
        return createReturnValue(value, state, verbose)
      }
    } else {
      return createReturnValue(refresh.call(this, key, args), state, verbose)
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
