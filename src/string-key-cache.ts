import stringify from 'fast-json-stable-stringify'
import { IMap, ICache } from './types'

export class StringKeyCache<T> implements ICache<T> {
  constructor(private map: IMap<string, T>) {}

  set(key: unknown[], value: T): void {
    this.map.set(stringify(key), value)
  }

  has(key: unknown[]): boolean {
    return this.map.has(stringify(key))
  }

  get(key: unknown[]): T | undefined {
    return this.map.get(stringify(key))
  }

  delete(key: unknown[]): boolean {
    return this.map.delete(stringify(key))
  }

  clear(): void {
    this.map.clear()
  }
}
