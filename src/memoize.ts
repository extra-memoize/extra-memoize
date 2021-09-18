import { ICache } from './types'

export interface IMemoizeOptions<Result> {
  cache: ICache<Result>

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

export function memoize<Result, Args extends any[]>(
  {
    cache
  , executionTimeThreshold = 0
  }: IMemoizeOptions<Result>
, fn: (...args: Args) => Result
): (...args: Args) => Result {
  return function (this: unknown, ...args: Args): Result {
    if (cache.has(args)) return cache.get(args)!

    const startTime = Date.now()
    const result = fn.apply(this, args)
    if (isSlowExecution()) {
      cache.set(args, result)
    }

    return result

    function isSlowExecution(): boolean {
      return getElapsed() >= executionTimeThreshold
    }

    function getElapsed(): number {
      return Date.now() - startTime
    }
  }
}
