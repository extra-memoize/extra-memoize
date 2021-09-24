import { ExpirableCache } from './expirable-cache'
import { IStaleIfErrorCache, State } from '@src/types'
import { isUndefined } from '@blackglory/types'

interface IRecord<T> {
  updatedAt: number
  value: T
}

export class ExpirableCacheWithStaleIfError<T = any> implements IStaleIfErrorCache<T> {
  private cache: ExpirableCache<IRecord<T>>

  constructor(private timeToLive: number, private staleIfError: number) {
    this.cache = new ExpirableCache(timeToLive + staleIfError)
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value
    , updatedAt: Date.now()
    })
  }

  get(key: string): [State.Miss, undefined] | [State.Hit | State.StaleIfError, T] {
    const record = this.cache.get(key)
    if (isUndefined(record)) return [State.Miss, undefined]

    const elapsed = Date.now() - record.updatedAt
    if (elapsed <= this.timeToLive) {
      return [State.Hit, record.value]
    } else if (elapsed <= this.timeToLive + this.staleIfError) {
      return [State.StaleIfError, record.value]
    } else {
      // just in case
      return [State.Miss, undefined]
    }
  }
}
