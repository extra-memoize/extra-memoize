export interface IMap<K, V> {
  set(key: K, value: V): void
  has(key: K): boolean
  get(key: K): V | undefined
  clear(): void
}

export type ICache<T> = IMap<unknown[], T>
