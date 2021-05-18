import { StringKeyCache } from '@src/string-key-cache'
import { IMap } from '@src/types'
import { mocked } from 'ts-jest/utils'

describe('StringKeyCache', () => {
  test('set(key: unknown[], value: T): void', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    cache.set(['hello'], 'world')

    expect(map.set).toBeCalledWith('["hello"]', 'world')
  })

  test('has(key: unknown[]): boolean', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn().mockReturnValue(false)
    , get: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    const result = cache.has(['hello'])

    expect(map.has).toBeCalledWith('["hello"]')
    expect(result).toBe(mocked(map.has).mock.results[0].value)
  })

  test('get(key: unknown[]): T | undefined)', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn().mockReturnValue('world')
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    const result = cache.get(['hello'])

    expect(map.get).toBeCalledWith('["hello"]')
    expect(result).toBe(mocked(map.get).mock.results[0].value)
  })

  test('clear(): void', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    cache.clear()

    expect(map.clear).toBeCalledWith()
  })
})
