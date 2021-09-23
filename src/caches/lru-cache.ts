import { LRUMap } from '@blackglory/structures'
import { ICache } from '@src/types'

export class LRUCache<T> extends LRUMap<string, T> implements ICache<T> {}
