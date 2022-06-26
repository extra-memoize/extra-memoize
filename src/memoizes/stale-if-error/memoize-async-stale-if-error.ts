import { IStaleIfErrorCache, State } from '@src/types'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'

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
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args, name)
    const [state, value] = cache.get(key)
    if (state === State.Hit) {
      return value as Result
    } else if (state === State.StaleIfError) {
      if (pendings.has(key)) {
        try {
          return await pendings.get(key)!
        } catch {
          return value as Result
        }
      } else {
        try {
          return await refresh.call(this, key, args)
        } catch {
          return value as Result
        }
      }
    } else {
      if (pendings.has(key)) return await pendings.get(key)!
      return await refresh.call(this, key, args)
    }
  }

  async function refresh(this: unknown, key: string, args: Args): Promise<Result> {
    const startTime = Date.now()
    const promise = Promise.resolve(fn.apply(this, args))
    pendings.set(key, promise)

    try {
      const result = await promise
      if (isSlowExecution(startTime)) {
        cache.set(key, result)
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
