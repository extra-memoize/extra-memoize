# extra-memoize
Yet another memoize library, but just better.

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
interface IMap<K, V> {
  set(key: K, value: V): void
  has(key: K): boolean
  get(key: K): V | undefined
  clear(): void
}

type ICache<T> = IMap<unknown[], T>
```

### memoize

```ts
interface IMemoizeOptions<Result> {
  cache: ICache<Result | Promise<Result>>

  /**
   * Used to judge whether a function execution is too slow.
   * Only when the excution time of function is
   * greater than or equal to the value (in milliseconds),
   * the return value of the function will be cached.
   */
  executionTimeThreshold?: number = 0
}

function memoize<
  Result
, Args extends any[]
, Func extends (...args: Args) => Result | PromiseLike<Result>
>(options: IMemoizeOptions<Result>, fn: Func): Func
```

### StringKeyCache

```ts
class StringKeyCache<T> implements ICache<T> {
  constructor(map: IMap<string, T>)
}
```

A cache wrapper that uses [fast-json-stable-stringify]
to serialize the parameter list into a string.

```ts
const map = new Map()
const cache = new StringKeyCache(map)
```

[fast-json-stable-stringify]: https://www.npmjs.com/package/fast-json-stable-stringify

### LRUCache

```ts
class LRUCache<T> extends StringKeyCache<T> implements ICache<T> {
  constructor(limit: number)
}
```

The classic LRU cache.

### ExpirableCache

```ts
class ExpirableCache<T> extends StringKeyCache<T> implements ICache<T> {
  constructor(maxAge: number)
}
```

The classisc expirable cache.

### TLRUCache

```ts
class TLRUCache<T> extends StringKeyCache<T> implements ICache<T> {
  constructor(limit: number, maxAge: number)
}
```

The classic TLRU cache.
