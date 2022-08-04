import {
  IStaleWhileRevalidateAsyncCache
, IStaleWhileRevalidateCache
, State
} from '@src/types'
import { pass, Awaitable } from '@blackglory/prelude'
import { defaultCreateKey } from '@memoizes/utils/default-create-key'
import { createVerboseResult } from '@memoizes/utils/create-verbose-result'

type VerboseResult<T> = [
  T
, State.Hit | State.Miss | State.Reuse | State.StaleWhileRevalidate
]

export interface IMemoizeStalwWhileRevalidateOptions<Result, Args extends any[]> {
  cache:
  | IStaleWhileRevalidateCache<Result>
  | IStaleWhileRevalidateAsyncCache<Result>
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

export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: IMemoizeStalwWhileRevalidateOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: IMemoizeStalwWhileRevalidateOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: Omit<IMemoizeStalwWhileRevalidateOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: IMemoizeStalwWhileRevalidateOptions<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
export function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  {
    cache
  , name
  , createKey = defaultCreateKey
  , executionTimeThreshold = 0
  , verbose = false
  }: IMemoizeStalwWhileRevalidateOptions<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>> {
  const pendings = new Map<string, Promise<Result>>()

  return async function (
    this: unknown
  , ...args: Args
  ): Promise<Result | VerboseResult<Result>> {
    const [value, state] = await memoizedFunction.apply(this, args)
    return verbose ? [value, state] : value
  }

  async function memoizedFunction(
    this: unknown
  , ...args: Args
  ): Promise<VerboseResult<Result>> {
    const key = createKey(args, name)
    const [state, value] = await cache.get(key)
    if (state === State.Hit) {
      return createVerboseResult(value, state)
    } else if (state === State.StaleWhileRevalidate) {
      queueMicrotask(async () => {
        if (!pendings.has(key)) {
          refresh.call(this, key, args).catch(pass)
        }
      })
      return createVerboseResult(value, state)
    } else {
      if (pendings.has(key)) {
        return createVerboseResult(await pendings.get(key)!, State.Reuse)
      }
      return createVerboseResult(await refresh.call(this, key, args), state)
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
