import {
  ICache
, IAsyncCache
, IStaleWhileRevalidateCache
, IStaleWhileRevalidateAsyncCache
, IStaleIfErrorAsyncCache
, IStaleIfErrorCache
, IStaleWhileRevalidateAndStaleIfErrorAsyncCache
, IStaleWhileRevalidateAndStaleIfErrorCache
, State
} from '@src/types'

export class Cache<T> extends Map implements ICache<T> {}

export class AsyncCache<T> implements IAsyncCache<T> {
  private map = new Map()

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  }

  async get(key: string): Promise<T | undefined> {
    return this.map.get(key)
  }

  async delete(key: string): Promise<boolean> {
    return this.map.delete(key)
  }
}

export class SWRCache<T> extends Cache<T> implements IStaleWhileRevalidateCache<T> {
  constructor(private getState: (key: string) => State.StaleWhileRevalidate | State.Hit) {
    super()
  }

  isStaleWhileRevalidate(key: string): boolean {
    return this.getState(key) === State.StaleWhileRevalidate
  }
}

export class SWRAsyncCache<T> extends AsyncCache<T> implements IStaleWhileRevalidateAsyncCache<T> {
  constructor(private getState: (key: string) => State.StaleWhileRevalidate | State.Hit) {
    super()
  }

  async isStaleWhileRevalidate(key: string): Promise<boolean> {
    return this.getState(key) === State.StaleWhileRevalidate
  }
}

export class SIECache<T> implements IStaleIfErrorCache<T> {
  private map = new Map()

  constructor(private getState: (key: string) => State.Hit | State.StaleIfError) {}

  get(key: string): [State.Miss, undefined] | [State.Hit | State.StaleIfError, T] {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getState(key), value]
    } else {
      return [State.Miss, undefined]
    }
  }

  set(key: string, value: T): void {
    this.map.set(key, value)
  }
}

export class SIEAsyncCache<T> implements IStaleIfErrorAsyncCache<T> {
  private map = new Map()

  constructor(private getState: (key: string) => State.Hit | State.StaleIfError) {}

  async get(key: string): Promise<
  | [State.Miss, undefined]
  | [State.Hit
  | State.StaleIfError, T]
  > {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getState(key), value]
    } else {
      return [State.Miss, undefined]
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  } 
}

export class SWRAndSIECache<T> implements IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  private map = new Map()

  constructor(private getCacheState: (key: string) => State.StaleWhileRevalidate | State.StaleIfError | State.Hit) {}

  get(key: string): [State.Miss, undefined] | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T] {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getCacheState(key), value]
    } else {
      return [State.Miss, undefined]
    }
  }

  set(key: string, value: T): void {
    this.map.set(key, value)
  }
}

export class SWRAndSIEAsyncCache<T> implements IStaleWhileRevalidateAndStaleIfErrorAsyncCache<T> {
  private map = new Map()

  constructor(private getCacheState: (key: string) => State.StaleWhileRevalidate | State.StaleIfError | State.Hit) {}

  async get(key: string): Promise<[State.Miss, undefined] | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T]> {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getCacheState(key), value]
    } else {
      return [State.Miss, undefined]
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  }
}
