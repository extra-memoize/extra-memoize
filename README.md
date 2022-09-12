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
, Reuse = 'reuse'
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

interface IMemoizeOptions<CacheValue, Args extends any[]> {
  cache: ICache<CacheValue>
  name?: string
  verbose?: boolean = false

  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number = 0
}

function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => VerboseResult<Result>
function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: Omit<IMemoizeOptions<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result>
```

### memoizeAsync
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss | State.Reuse]

interface IMemoizeAsyncOptions<CacheValue, Args extends any[]> {
  cache: ICache<CacheValue> | IAsyncCache<CacheValue>
  name?: string
  verbose?: boolean = false

  // The default is extra-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeAsync<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeAsyncOptions<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeAsync<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeAsyncOptions<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeAsync<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: Omit<IMemoizeAsyncOptions<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeAsync<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeAsyncOptions<CacheValue, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeStaleWhileRevalidate
```ts
type VerboseResult<T> = [
  T
, State.Hit | State.Miss | State.Reuse | State.StaleWhileRevalidate
]

interface IMemoizeStalwWhileRevalidateOptions<
  CacheValue
, Args extends any[]
> {
  cache:
  | IStaleWhileRevalidateCache<CacheValue>
  | IStaleWhileRevalidateAsyncCache<CacheValue>
  name?: string
  verbose?: boolean = false

  // The default is extra-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeStaleWhileRevalidate<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStalwWhileRevalidateOptions<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeStaleWhileRevalidate<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStalwWhileRevalidateOptions<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidate<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: Omit<IMemoizeStalwWhileRevalidateOptions<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidate<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStalwWhileRevalidateOptions<CacheValue, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeStaleIfError
```ts
type VerboseResult<T> = [T, State.Hit | State.Miss | State.StaleIfError]

interface IMemoizeStaleIfErrorOptions<CacheValue, Args extends any[]> {
  cache: IStaleIfErrorCache<CacheValue>
  name?: string
  verbose?: boolean = false

  // The default is extra-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleIfErrorOptions<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Result
): (...args: Args) => VerboseResult<Result>
function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleIfErrorOptions<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: Omit<IMemoizeStaleIfErrorOptions<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Result
): (...args: Args) => Result
function memoizeStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleIfErrorOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => Result | VerboseResult<Result>
```

### memoizeAsyncStaleIfError
```ts
type VerboseResult<T> = [
  T
, | State.Hit
  | State.Miss
  | State.Reuse
  | State.StaleIfError
]

interface IMemoizeStaleIfErrorOptions<CacheValue, Args extends any[]> {
  cache: IStaleIfErrorCache<CacheValue> | IStaleifErrorAsyncCache<CacheValue>
  name?: string
  verbose?: boolean = false

  // The default is extra-json-stable-stringify([args, name])
  createKey?: (args: Args, name?: string) => string

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number
}

function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<CacheValue, Args> & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<CacheValue, Args> & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: Omit<IMemoizeAsyncStaleIfError<CacheValue, Args>, 'verbose'>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeAsyncStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<CacheValue, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```

### memoizeStaleWhileRevalidateAndStaleIfError
```ts
type VerboseResult<T> = [
  T
, | State.Hit
  | State.Miss
  | State.Reuse
  | State.StaleWhileRevalidate
  | State.StaleIfError
]

interface IMemoizeStaleWhileRevalidateAndStaleIfError<
  CacheValue
, Args extends any[]
> {
  cache:
  | IStaleWhileRevalidateAndStaleIfErrorCache<CacheValue>
  | IStaleWhileRevalidateAndStaleIfErrorAsyncCache<CacheValue>
  name?: string
  verbose?: boolean = false

  // The default is extra-json-stable-stringify([args, name])
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
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<CacheValue, Args>
         & { verbose: true }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<VerboseResult<Result>>
function memoizeStaleWhileRevalidateAndStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<CacheValue, Args>
         & { verbose: false }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidateAndStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: Omit<
    IMemoizeStaleWhileRevalidateAndStaleIfError<CacheValue, Args>
  , 'verbose'
  >
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
function memoizeStaleWhileRevalidateAndStaleIfError<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeStaleWhileRevalidateAndStaleIfError<CacheValue, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result | VerboseResult<Result>>
```
