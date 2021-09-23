import { TLRUMap } from '@blackglory/structures'
import { ICache } from '@src/types'

export class TLRUCache<T> extends TLRUMap<string, T> implements ICache<T> {
  constructor(limit: number, private maxAge: number) {
    super(limit)
  }

  override set(key: string, value: T) {
    return super.set(key, value, this.maxAge)
  }
}
