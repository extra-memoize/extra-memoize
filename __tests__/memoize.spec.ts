import { memoize } from '@src/memoize'
import { StringKeyCache } from '@src/string-key-cache'
import { getErrorPromise } from 'return-style'
import '@blackglory/jest-matchers'

describe(`
  memoize<
    Result
  , Args extends unknown[]
  , Func extends (...args: Args) => Result | PromiseLike<Result>
  >(options: IMemoizeOptions<Result>, fn: Func): Func
`, () => {
  test('sync function', () => {
    const fn = jest.fn((hello: string) => 'world')
    const map = new Map()
    const cache = new StringKeyCache(map)

    const memoizedFn = memoize({ cache }, fn)
    const result1 = memoizedFn('hello')
    const result2 = memoizedFn('hello')

    expect(result1).toBe('world')
    expect(result2).toBe('world')
    expect(fn).toBeCalledTimes(1)
  })

  describe('async funtion', () => {
    test('resolved', async () => {
      const fn = jest.fn((hello: string) => Promise.resolve('world'))
      const map = new Map()
      const cache = new StringKeyCache(map)

      const memoizedFn = memoize({ cache }, fn)
      const result1 = memoizedFn('hello')
      const proResult1 = await result1
      const result2 = memoizedFn('hello')
      const proResult2 = await result2

      expect(result1).toBePromise()
      expect(proResult1).toBe('world')
      expect(result2).toBePromise()
      expect(proResult2).toBe('world')
      expect(result1).not.toBe(result2)
      expect(fn).toBeCalledTimes(1)
    })

    test('rejected', async () => {
      const fn = jest.fn((hello: string) => Promise.reject(new Error('error')))
      const map = new Map()
      const cache = new StringKeyCache(map)

      const memoizedFn = memoize({ cache }, fn)
      const result1 = memoizedFn('hello')
      const err1 = await getErrorPromise(result1)
      const result2 = memoizedFn('hello')
      const err2 = await getErrorPromise(result2)

      expect(result1).toBePromise()
      expect(err1).toBeInstanceOf(Error)
      expect(result2).toBePromise()
      expect(err2).toBeInstanceOf(Error)
      expect(err1).not.toBe(err2)
      expect(fn).toBeCalledTimes(2)
    })
  })

  describe('executionTimeThreshold', () => {
    beforeEach(() => {
      jest.useFakeTimers('modern')
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    describe('sync function', () => {
      describe('>= executionTimeThreshold', () => {
        it('cache', () => {
          const fn = jest.fn((hello: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return 'world'
          })
          const map = new Map()
          const cache = new StringKeyCache(map)

          const memoizedFn = memoize({ cache, executionTimeThreshold: 200 }, fn)
          const result1 = memoizedFn('hello')
          const result2 = memoizedFn('hello')

          expect(result1).toBe('world')
          expect(result2).toBe('world')
          expect(fn).toBeCalledTimes(1)
        })
      })

      describe('< executionTimeThreshold', () => {
        it('not cache', () => {
          const fn = jest.fn((hello: string) => {
            return 'world'
          })
          const map = new Map()
          const cache = new StringKeyCache(map)

          const memoizedFn = memoize({ cache, executionTimeThreshold: 200 }, fn)
          const result1 = memoizedFn('hello')
          const result2 = memoizedFn('hello')

          expect(result1).toBe('world')
          expect(result2).toBe('world')
          expect(fn).toBeCalledTimes(2)
        })
      })
    })

    describe('async function', () => {
      describe('>= executionTimeThreshold', () => {
        it('cache', async () => {
          const fn = jest.fn(async (hello: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return 'world'
          })
          const map = new Map()
          const cache = new StringKeyCache(map)

          const memoizedFn = memoize({ cache, executionTimeThreshold: 200 }, fn)
          const result1 = memoizedFn('hello')
          const proResult1 = await result1
          const result2 = memoizedFn('hello')
          const proResult2 = await result2

          expect(result1).toBePromise()
          expect(proResult1).toBe('world')
          expect(result2).toBePromise()
          expect(proResult2).toBe('world')
          expect(result1).not.toBe(result2)
          expect(fn).toBeCalledTimes(1)
        })
      })

      describe('< executionTimeThreshold', () => {
        it('not cache', async () => {
          const fn = jest.fn(async (hello: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return 'world'
          })
          const map = new Map()
          const cache = new StringKeyCache(map)

          const memoizedFn = memoize({ cache, executionTimeThreshold: 200 }, fn)
          const result1 = memoizedFn('hello')
          const proResult1 = await result1
          const result2 = memoizedFn('hello')
          const proResult2 = await result2

          expect(result1).toBePromise()
          expect(proResult1).toBe('world')
          expect(result2).toBePromise()
          expect(proResult2).toBe('world')
          expect(result1).not.toBe(result2)
          expect(fn).toBeCalledTimes(1)
        })
      })
    })
  })
})
