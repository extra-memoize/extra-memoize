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

export class Cache<T> implements ICache<T> {
  private map = new Map()

  set(key: string, value: T): void {
    this.map.set(key, value)
  }

  get(key: string): [State.Miss] | [State.Hit, T] {
    if (this.map.has(key)) {
      return [State.Hit, this.map.get(key)]
    } else {
      return [State.Miss]
    }
  }
}

export class AsyncCache<T> implements IAsyncCache<T> {
  private map = new Map()

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  }

  async get(key: string): Promise<[State.Miss] | [State.Hit, T]> {
    if (this.map.has(key)) {
      return [State.Hit, this.map.get(key)]
    } else {
      return [State.Miss]
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.map.delete(key)
  }
}

export class SWRCache<T> implements IStaleWhileRevalidateCache<T> {
  private map = new Map()

  constructor(private getState: (key: string) => State.StaleWhileRevalidate | State.Hit) {}

  set(key: string, value: T): void {
    this.map.set(key, value)
  }

  get(key: string): [State.Miss] | [State.Hit | State.StaleWhileRevalidate, T] {
    if (this.map.has(key)) {
      return [this.getState(key), this.map.get(key)]
    } else {
      return [State.Miss]
    }
  }

  delete(key: string): boolean {
    return this.map.delete(key)
  }
}

export class SWRAsyncCache<T> implements IStaleWhileRevalidateAsyncCache<T> {
  private map = new Map()

  constructor(private getState: (key: string) => State.StaleWhileRevalidate | State.Hit) {}

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  }

  async get(key: string): Promise<[State.Miss] | [State.Hit | State.StaleWhileRevalidate, T]> {
    if (this.map.has(key)) {
      return [this.getState(key), this.map.get(key)]
    } else {
      return [State.Miss]
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.map.delete(key)
  }
}

export class SIECache<T> implements IStaleIfErrorCache<T> {
  private map = new Map()

  constructor(private getState: (key: string) => State.Hit | State.StaleIfError) {}

  get(key: string): [State.Miss] | [State.Hit | State.StaleIfError, T] {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getState(key), value]
    } else {
      return [State.Miss]
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
  | [State.Miss]
  | [State.Hit | State.StaleIfError, T]
  > {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getState(key), value]
    } else {
      return [State.Miss]
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  } 
}

export class SWRAndSIECache<T> implements IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  private map = new Map()

  constructor(private getCacheState: (key: string) => State.StaleWhileRevalidate | State.StaleIfError | State.Hit) {}

  get(key: string): [State.Miss] | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T] {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getCacheState(key), value]
    } else {
      return [State.Miss]
    }
  }

  set(key: string, value: T): void {
    this.map.set(key, value)
  }
}

export class SWRAndSIEAsyncCache<T> implements IStaleWhileRevalidateAndStaleIfErrorAsyncCache<T> {
  private map = new Map()

  constructor(private getCacheState: (key: string) => State.StaleWhileRevalidate | State.StaleIfError | State.Hit) {}

  async get(key: string): Promise<[State.Miss] | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T]> {
    if (this.map.has(key)) {
      const value = this.map.get(key)!
      return [this.getCacheState(key), value]
    } else {
      return [State.Miss]
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.map.set(key, value)
  }
}
