import {
  IStaleWhileRevalidateAsyncCache
, IStaleWhileRevalidateCache
, State
} from '@src/types'
import { pass, Awaitable } from '@blackglory/prelude'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'

export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  , executionTimeThreshold = 0
  }: {
    cache:
    | IStaleWhileRevalidateCache<Result>
    | IStaleWhileRevalidateAsyncCache<Result>
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
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<Result> {
    const key = createKey(args, name)
    const [state, value] = await cache.get(key)
    if (state === State.Hit) {
      return value
    } else if (state === State.StaleWhileRevalidate) {
      queueMicrotask(async () => {
        if (!pendings.has(key)) {
          refresh.call(this, key, args).catch(pass)
        }
      })
      return value
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
