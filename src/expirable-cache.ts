import { ExpirableMap } from '@blackglory/structures'
import { StringKeyCache } from './string-key-cache'
import { ICache, IMap } from './types'

export class ExpirableCache<T> extends StringKeyCache<T> implements ICache<T> {
  constructor(maxAge: number) {
    super(new ExpirableMapWithFixedMaxAge<string, T>(maxAge))
  }
}

export class ExpirableMapWithFixedMaxAge<K, V> extends ExpirableMap<K, V> implements IMap<K, V> {
  constructor(private maxAge: number) {
    super()
  }

  override set(key: K, value: V) {
    return super.set(key, value, this.maxAge)
  }
}
