import { ICache } from '@src/types'
import stringify from 'fast-json-stable-stringify'
import { isntUndefined } from '@blackglory/types'

export function memoize<Result, Args extends any[]>(
  {
    cache
  , executionTimeThreshold = 0
  , createKey = (...args) => stringify(args)
  }: {
    cache: ICache<Result>
    createKey?: (...args: Args) => string

    /**
     * Used to judge whether a function execution is too slow.
     * Only when the excution time of function is
     * greater than or equal to the value (in milliseconds),
     * the return value of the function will be cached.
     */
    executionTimeThreshold?: number
  }
, fn: (...args: Args) => Result
): (...args: Args) => Result {
  return function (this: unknown, ...args: Args): Result {
    const key = createKey.apply(this, args)
    const value = cache.get(key)
    if (isntUndefined(value)) return value

    const startTime = Date.now()
    const result = fn.apply(this, args)
    if (isSlowExecution()) {
      cache.set(key, result)
    }

    return result

    function isSlowExecution(): boolean {
      return getElapsed() >= executionTimeThreshold

      function getElapsed(): number {
        return Date.now() - startTime
      }
    }
  }
}
