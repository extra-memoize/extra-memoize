import { StringKeyCache } from '@src/string-key-cache'
import { IMap } from '@src/types'
import { mocked } from 'ts-jest/utils'

describe('StringKeyCache', () => {
  test('set(key: unknown[], value: T): void', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn()
    , delete: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    cache.set(['key'], 'value')

    expect(map.set).toBeCalledWith('["key"]', 'value')
  })

  test('has(key: unknown[]): boolean', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn().mockReturnValue(false)
    , get: jest.fn()
    , delete: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    const result = cache.has(['key'])

    expect(map.has).toBeCalledWith('["key"]')
    expect(result).toBe(mocked(map.has).mock.results[0].value)
  })

  test('get(key: unknown[]): T | undefined)', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn().mockReturnValue('value')
    , delete: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    const result = cache.get(['key'])

    expect(map.get).toBeCalledWith('["key"]')
    expect(result).toBe(mocked(map.get).mock.results[0].value)
  })

  test('delete(key: unknown[]): boolean', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn().mockReturnValue('key')
    , delete: jest.fn().mockReturnValue(true)
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    const result = cache.delete(['key'])

    expect(map.delete).toBeCalledWith('["key"]')
    expect(result).toBe(mocked(map.delete).mock.results[0].value)
  })

  test('clear(): void', () => {
    const map: IMap<string, unknown> = {
      set: jest.fn()
    , has: jest.fn()
    , get: jest.fn()
    , delete: jest.fn()
    , clear: jest.fn()
    }
    const cache = new StringKeyCache(map)

    cache.clear()

    expect(map.clear).toBeCalledWith()
  })
})
