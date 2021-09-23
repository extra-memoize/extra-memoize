import { ExpirableMap } from '@blackglory/structures'
import { ICache } from '@src/types'

export class ExpirableCache<T> extends ExpirableMap<string, T> implements ICache<T> {
  constructor(private maxAge: number) {
    super()
  }

  override set(key: string, value: T) {
    return super.set(key, value, this.maxAge)
  }
}
