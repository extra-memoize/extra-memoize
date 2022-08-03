# extra-memoize
Yet another memoize library.

## Philosophy
Most memoize functions include strategies (such as TTL), which will actually cause poor cache performance, because memoize functions can only use common interfaces to implement related strategies.

`extra-memoize` takes another approach, its memoize function is very light. It delegates the implementation of the strategies to the cache layer and cache wrapper. This allows the cache backend to fully utilize their performance.

## Install
```sh
npm install --save extra-memoize
# or
yarn add extra-memoize
```

## Usage
```ts
import { memoize } from 'extra-memoize'
import { LRUCache } from '@extra-memoize/memory-cache'

const cache = new LRUCache(100)
const memoized = memoize({ cache }, fn)
```

## API
```ts
enum State {
  Miss = 'miss'
, Hit = 'hit'
, StaleWhileRevalidate = 'stale-while-revalidate'
, StaleIfError = 'state-if-error'
}

interface ICache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [State.Hit, T]
}

interface IAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [State.Hit, T]
                    >
}

interface IStaleWhileRevalidateCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [
                    | State.Hit
                    | State.StaleWhileRevalidate
                    , T
                    ]
}

interface IStaleWhileRevalidateAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [
                      | State.Hit
                      | State.StaleWhileRevalidate
                      , T
                      ]
                    >
}

interface IStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [
                    | State.Hit
                    | State.StaleIfError
                    , T
                    ]
}

interface IStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [
                      | State.Hit
                      | State.StaleIfError
                      , T
                      ]
                    >
}

interface IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [
                    | State.Hit
                    | State.StaleWhileRevalidate
                    | State.StaleIfError
                    , T
                    ]
}

interface IStaleWhileRevalidateAndStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [
                      | State.Hit
                      | State.StaleWhileRevalidate
                      | State.StaleIfError
                      , T
                      ]
                    >
}
```

### memoize
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss]

interface IMemoizeOptions<Result, Args extends any[]> {
  cache: ICache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify(args, name)
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number = 0
}

function memoize<Result, Args extends any[]>(
  options: IMemoizeOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => VerboseResult<Result>
function memoize<Result, Args extends any[]>(
  options: IMemoizeOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoize<Result, Args extends any[]>(
  options: Omit<IMemoizeOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoize<Result, Args extends any[]>(
  options: IMemoizeOptions<Result, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result>
```

### memoizeAsync
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss]

interface IMemoizeAsyncOptions<Result, Args extends any[]> {
  cache: ICache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeAsync<Result, Args extends any[]>(
  options: IMemoizeAsyncOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeAsync<Result, Args extends any[]>(
  options: IMemoizeAsyncOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
function memoizeAsync<Result, Args extends any[]>(
  options: Omit<IMemoizeAsyncOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
function memoizeAsync<Result, Args extends any[]>(
  options: IMemoizeAsyncOptions<Result, Args>
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeWithAsyncCache
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss]

interface IMemoizeWithAsyncCacheOptions<Result, Args extends any[]> {
  cache: IAsyncCache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeWithAsyncCache<Result, Args extends any[]>(
  options: IMemoizeWithAsyncCacheOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeWithAsyncCache<Result, Args extends any[]>(
  options: IMemoizeWithAsyncCacheOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeWithAsyncCache<Result, Args extends any[]>(
  options: Omit<IMemoizeWithAsyncCacheOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeWithAsyncCache<Result, Args extends any[]>(
  options: IMemoizeWithAsyncCacheOptions<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeStaleWhileRevalidate
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss | State.StaleWhileRevalidate]

interface IMemoizeStalwWhileRevalidateOptions<Result, Args extends any[]> {
  cache:
  | IStaleWhileRevalidateCache<Result>
  | IStaleWhileRevalidateAsyncCache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: IMemoizeStalwWhileRevalidateOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: IMemoizeStalwWhileRevalidateOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: Omit<IMemoizeStalwWhileRevalidateOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidate<Result, Args extends any[]>(
  options: IMemoizeStalwWhileRevalidateOptions<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeStaleIfError
```ts
function memoizeStaleIfError<Result, Args extends any[]>(
  options: {
    cache: IStaleIfErrorCache<Result>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])

    /**
     * Used to judge whether a function execution is too slow.
     * Only when the excution time of function is
     * greater than or equal to the value (in milliseconds),
     * the return value of the function will be cached.
     */
    executionTimeThreshold?: number
  }
, fn: (...args: Args) => Result
): (...args: Args) => Result
```

### memoizeAsyncStaleIfError
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss | State.StaleIfError]

interface IMemoizeStaleIfErrorOptions<Result, Args extends any[]> {
  cache: IStaleIfErrorCache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeStaleIfError<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => VerboseResult<Result>
function memoizeStaleIfError<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoizeStaleIfError<Result, Args extends any[]>(
  options: Omit<IMemoizeStaleIfErrorOptions<Result, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoizeStaleIfError<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result>
```

### memoizeStaleIfErrorWithAsyncCache
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss | State.StaleIfError]

interface IMemoizeStaleIfErrorWithAsyncCache<Result, Args extends any[]> {
  cache: IStaleIfErrorCache<Result> | IStaleIfErrorAsyncCache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeStaleIfErrorWithAsyncCache<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorWithAsyncCache<Result, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<VerboseResult<Result>>
): (...args: Args) => Promise<Result>
function memoizeStaleIfErrorWithAsyncCache<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorWithAsyncCache<Result, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleIfErrorWithAsyncCache<Result, Args extends any[]>(
  options: Omit<IMemoizeStaleIfErrorWithAsyncCache<Result, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleIfErrorWithAsyncCache<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorWithAsyncCache<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeStaleWhileRevalidateAndStaleIfError
```ts
type VerboseResult<T> = [
  T
, State.Hit | State.Miss | State.StaleWhileRevalidate | State.StaleIfError
]

interface IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args extends any[]> {
  cache:
  | IStaleWhileRevalidateAndStaleIfErrorCache<Result>
  | IStaleWhileRevalidateAndStaleIfErrorAsyncCache<Result>
  name?: string
  verbose?: boolean = false

  // The default is fast-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
         & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
         & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: Omit<
    IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
  , 'verbose'
  >
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidateAndStaleIfError<
  Result
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```
