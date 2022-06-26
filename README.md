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
export function memoize<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: ICache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify(args, name)

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

### memoizeAsync
```ts
function memoizeAsync<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: ICache<CacheValue>
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
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

### memoizeWithAsyncCache
```ts
function memoizeWithAsyncCache<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IAsyncCache<CacheValue>
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
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
```

### memoizeStaleWhileRevalidate
```ts
function memoizeStaleWhileRevalidate<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache:
    | IStaleWhileRevalidateCache<CacheValue>
    | IStaleWhileRevalidateAsyncCache<CacheValue>
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
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
```

### memoizeStaleIfError
```ts
function memoizeStaleIfError<CacheValue, Resulte extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleIfErrorCache<CacheValue>
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
function memoizeAsyncStaleIfError<CacheValue, Resulte extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleIfErrorCache<CacheValue>
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
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

### memoizeStaleIfErrorWithAsyncCache
```ts
function memoizeStaleIfErrorWithAsyncCache<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleIfErrorAsyncCache<CacheValue>
    name: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])

    /**
     * Used to judge whether a function execution is too slow.
     * Only when the excution time of function is
     * greater than or equal to the value (in milliseconds),
     * the return value of the function will be cached.
     */
    executionTimeThreshold?: number
  }
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
```

### memoizeStaleWhileRevalidateAndStaleIfError
```ts
function memoizeStaleWhileRevalidateAndStaleIfError<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache:
    | IStaleWhileRevalidateAndStaleIfErrorCache<CacheValue>
    | IStaleWhileRevalidateAndStaleIfErrorAsyncCache<CacheValue>
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
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<Result>
```
