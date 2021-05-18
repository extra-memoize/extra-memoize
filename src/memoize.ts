import { isPromiseLike } from 'extra-promise'
import { go } from '@blackglory/go'
import { ICache } from './types'

export interface IMemoizeOptions<Result> {
  cache: ICache<Result | Promise<Result>>

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

export function memoize<
  Result
, Args extends any[]
, Func extends (...args: Args) => Result | PromiseLike<Result>
>(
  { cache, executionTimeThreshold = 0 }: IMemoizeOptions<Result>
, fn: Func
): Func {
  return function (this: unknown, ...args: any): Result | Promise<Result> {
    if (cache.has(args)) return cache.get(args) as Result | Promise<Result>

    const startTime = Date.now()
    const result = fn.apply(this, args)

    if (isPromiseLike(result)) {
      return go(async () => {
        const proResult = await result
        if (isSlowExecution()) {
          cache.set(args, Promise.resolve(proResult))
        }
        return proResult
      })
    } else {
      if (isSlowExecution()) {
        cache.set(args, result)
      }
      return result
    }

    function isSlowExecution(): boolean {
      return getElapsed() >= executionTimeThreshold
    }

    function getElapsed(): number {
      return Date.now() - startTime
    }
  } as Func
}
