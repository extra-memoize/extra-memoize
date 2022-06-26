import { IStaleIfErrorCache, State } from '@src/types'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'

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
  }: {
    cache: IStaleIfErrorCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string

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
    const key = createKey(args, name)
    const [state, value] = cache.get(key)
    if (state === State.Hit) {
      return value as Result
    } else if (state === State.StaleIfError) {
      try {
        return refresh.call(this, key, args)
      } catch {
        return value as Result
      }
    } else {
      return refresh.call(this, key, args)
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
