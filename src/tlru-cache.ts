import { TLRUMap } from '@blackglory/structures'
import { StringKeyCache } from './string-key-cache'
import { ICache, IMap } from './types'

export class TLRUCache<T> extends StringKeyCache<T> implements ICache<T> {
  constructor(limit: number, maxAge: number) {
    super(new TLRUMapWithFixedMaxAge<string, T>(limit, maxAge))
  }
}

export class TLRUMapWithFixedMaxAge<K, V> extends TLRUMap<K, V> implements IMap<K, V> {
  constructor(limit: number, private maxAge: number) {
    super(limit)
  }

  override set(key: K, value: V) {
    return super.set(key, value, this.maxAge)
  }
}
