import {
  IStaleWhileRevalidateAndStaleIfErrorCache
, IStaleWhileRevalidateAndStaleIfErrorAsyncCache
, State
} from '@src/types'
import { pass, Awaitable } from '@blackglory/prelude'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'
import { createReturnValue } from '@memoizes/utils/create-return-value'

interface IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args extends any[]> {
  cache:
  | IStaleWhileRevalidateAndStaleIfErrorCache<Result>
  | IStaleWhileRevalidateAndStaleIfErrorAsyncCache<Result>
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

export function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
         & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<[
  Result
, State.Hit | State.Miss | State.StaleWhileRevalidate | State.StaleIfError
]>
export function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
         & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
export function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: Omit<
    IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
  , 'verbose'
  >
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
export function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<
| Result
| [Result, State.Hit | State.Miss | State.StaleWhileRevalidate | State.StaleIfError]
>
export function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  , executionTimeThreshold = 0
  , verbose = false
  }: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<
| Result
| [Result, State.Hit | State.Miss | State.StaleWhileRevalidate | State.StaleIfError]
> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (this: unknown, ...args: Args): Promise<
  | Result
  | [
      Result
    , State.Hit | State.Miss | State.StaleWhileRevalidate | State.StaleIfError
    ]
  > {
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
      return createReturnValue(value, state, verbose)
    } else if (state === State.StaleIfError) {
      if (pendings.has(key)) {
        try {
          return createReturnValue(await pendings.get(key)!, state, verbose)
        } catch {
          return createReturnValue(value, state, verbose)
        }
      } else {
        try {
          return createReturnValue(
            await refresh.call(this, key, args)
          , state
          , verbose
          )
        } catch {
          return createReturnValue(value, state, verbose)
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
