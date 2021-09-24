import { ExpirableCache } from './expirable-cache'
import { IStaleWhileRevalidateCache } from '@src/types'
import { isUndefined } from '@blackglory/types'

interface IRecord<T> {
  updatedAt: number
  value: T
}

export class ExpirableCacheWithStaleWhileRevalidate<T = any> implements IStaleWhileRevalidateCache<T> {
  private cache: ExpirableCache<IRecord<T>>

  constructor(private timeToLive: number, private staleWhileRevalidate: number) {
    this.cache = new ExpirableCache(timeToLive + staleWhileRevalidate)
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value
    , updatedAt: Date.now()
    })
  }

  get(key: string): T | undefined {
    return this.cache.get(key)?.value
  }

  isStaleWhileRevalidate(key: string): boolean {
    const record = this.cache.get(key)
    if (isUndefined(record)) return false

    return Date.now() - record.updatedAt > this.timeToLive
        && Date.now() - record.updatedAt <= this.timeToLive + this.staleWhileRevalidate
  }
}
