import { ExpirableMap } from '@blackglory/structures'
import { ICache } from '@src/types'

export class ExpirableCache<T> implements ICache<T> {
  private map: ExpirableMap<string, T>

  constructor(private maxAge: number) {
    this.map = new ExpirableMap()
  }

  get(key: string): T | undefined {
    return this.map.get(key)
  }

  set(key: string, value: T): void {
    this.map.set(key, value, this.maxAge)
  }

  clear(): void {
    this.map.clear()
  }
}
