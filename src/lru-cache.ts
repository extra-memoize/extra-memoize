import { LRUMap } from '@blackglory/structures'
import { StringKeyCache } from './string-key-cache'
import { ICache } from './types'

export class LRUCache<T> extends StringKeyCache<T> implements ICache<T> {
  constructor(limit: number) {
    super(new LRUMap<string, T>(limit))
  }
}
