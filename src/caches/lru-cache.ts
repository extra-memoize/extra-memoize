import { LRUMap } from '@blackglory/structures'
import { ICache } from '@src/types'

export class LRUCache<T = any> implements ICache<T> {
  private map: LRUMap<string, T> 

  constructor(limit: number) {
    this.map = new LRUMap(limit)
  }

  set(key: string, value: T): void {
    this.map.set(key, value)
  }

  get(key: string): T | undefined {
    return this.map.get(key)
  }

  clear(): void {
    this.map.clear()
  }
}
