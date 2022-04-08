# extra-memoize
Yet another memoize library, but just better.

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
import { memoize, LRUCache } from 'extra-memoize'

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
  get(key: string): T | undefined
}

interface IAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<T | undefined>
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
  }
, fn: (...args: Args) => Result | PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

### stale-while-revalidate
```ts
interface IStaleWhileRevalidateCache<T> extends ICache<T> {
  isStaleWhileRevalidate(key: string): boolean
}

interface IStaleWhileRevalidateAsyncCache<T> extends IAsyncCache<T> {
  isStaleWhileRevalidate(key: string): Promise<boolean>
}
```

#### memoizeStaleWhileRevalidate
```ts
function memoizeStaleWhileRevalidate<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleWhileRevalidateCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

#### memoizeStaleWhileRevalidateWithAsyncCache
```ts
function memoizeStaleWhileRevalidateWithAsyncCache<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleWhileRevalidateAsyncCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

### stale-if-error
```ts
interface IStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss, undefined]
                  | [State.Hit | State.StaleIfError, T]
}

interface IStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss, undefined]
                    | [State.Hit | State.StaleIfError, T]
                    >
}
```

#### memoizeStaleIfError
```ts
function memoizeStaleIfError<CacheValue, Resulte extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleIfErrorCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result> {
```

#### memoizeStaleIfErrorWithAsyncCache
```ts
function memoizeStaleIfErrorWithAsyncCache<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleIfErrorAsyncCache<CacheValue>
    name: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

### stale-while-revalidate & stale-if-error
```ts
interface IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss, undefined]
                  | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T]
}

interface IStaleWhileRevalidateAndStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss, undefined]
                    | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T]
                    >
}
```

#### memoizeStaleWhileRevalidateAndStaleIfError
```ts
function memoizeStaleWhileRevalidateAndStaleIfError<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleWhileRevalidateAndStaleIfErrorCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

#### memoizeStaleWhileRevalidateAndStaleIfErrorWithAsyncCache
```ts
function memoizeStaleWhileRevalidateAndStaleIfErrorWithAsyncCache<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: {
    cache: IStaleWhileRevalidateAndStaleIfErrorAsyncCache<CacheValue>
    name?: string
    createKey?: (args: Args, name?: string) => string // The default is fast-json-stable-stringify([args, name])
  }
, fn: (...args: Args) => PromiseLike<Result>
): (...args: Args) => Promise<Result>
```

### Caches
#### LRUCache
```ts
class LRUCache<T> implements ICache<T> {
  constructor(limit: number)

  clear(): void
}
```

The classic LRU cache.

#### ExpirableCache
```ts
class ExpirableCache<T> implements ICache<T> {
  constructor(timeToLive: number /*ms*/)

  clear(): void
}
```

The classisc expirable cache.

##### ExpirableCacheWithStaleWhileRevalidate
```ts
class ExpirableCacheWithStaleWhileRevalidate<T> implements IStaleWhileRevalidateCache<T> {
  constructor(timeToLive: number /*ms*/, staleWhileRevalidate: number /*ms*/)
}
```

##### ExpirableCacheWithStaleIfError
```ts
class ExpirableCacheWithStaleIfError<T> implements IStaleIfErrorCache<T> {
  constructor(timeToLive: number /*ms*/, staleIfError: number /*ms*/)
}
```

##### ExpirableCacheWithStaleWhileRevalidateAndStaleIfError
```ts
class ExpirableCacheWithStaleWhileRevalidateAndStaleIfError<T> implements IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  constructor(
    timeToLive: number /*ms*/
  , staleWhileRevalidate: number /*ms*/
  , staleIfError: number /*ms*/
  )
}
```

#### TLRUCache
```ts
class TLRUCache<T> implements ICache<T> {
  constructor(limit: number, timeToLive: number /*ms*/)

  clear(): void
}
```

The classic TLRU cache.

##### TLRUCacheWithStaleWhileRevalidate
```ts
class TLRUCacheWithStaleWhileRevalidate<T> implements IStaleWhileRevalidateCache<T> {
  constructor(limit: number, timeToLive: number /*ms*/, staleWhileRevalidate: number /*ms*/)
}
```

##### TLRUCacheWithStaleIfError
```ts
class TLRUCacheWithStaleIfError<T> implements IStaleIfErrorCache<T> {
  constructor(limit: number, timeToLive: number /*ms*/, staleIfError: number /*ms*/)
}
```

##### TLRUCacheWithStaleWhileRevalidateAndStaleIfError
```ts
class TLRUCacheWithStaleWhileRevalidateAndStaleIfError<T> implements IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  constructor(
    limit: number
  , timeToLive: number /*ms*/
  , staleWhileRevalidate: number /*ms*/
  , staleIfError: number /*ms*/
  )
}
```
