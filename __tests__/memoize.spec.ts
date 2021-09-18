import { memoize } from '@src/memoize'
import { StringKeyCache } from '@src/string-key-cache'
import '@blackglory/jest-matchers'

describe(`
  memoize<Result, Args extends any[]>(
    options: IMemoizeOptions<Result>
  , fn: (...args: Args) => Result
  ): (...args: Args) => Result
`, () => {
  test('cache', () => {
    const fn = jest.fn((text: string) => text)
    const map = new Map()
    const cache = new StringKeyCache(map)

    const memoizedFn = memoize({ cache }, fn)
    const result1 = memoizedFn('hello')
    const result2 = memoizedFn('hello')

    expect(result1).toBe('hello')
    expect(result2).toBe('hello')
    expect(fn).toBeCalledTimes(1)
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
          const fn = jest.fn((text: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return text
          })
          const map = new Map()
          const cache = new StringKeyCache(map)

          const memoizedFn = memoize({
            cache
          , executionTimeThreshold: 200
          }, fn)
          const result1 = memoizedFn('hello')
          const result2 = memoizedFn('hello')

          expect(result1).toBe('hello')
          expect(result2).toBe('hello')
          expect(fn).toBeCalledTimes(1)
        })
      })

      describe('< executionTimeThreshold', () => {
        it('not cache', () => {
          const fn = jest.fn((text: string) => text)
          const map = new Map()
          const cache = new StringKeyCache(map)

          const memoizedFn = memoize({
            cache
          , executionTimeThreshold: 200
          }, fn)
          const result1 = memoizedFn('hello')
          const result2 = memoizedFn('hello')

          expect(result1).toBe('hello')
          expect(result2).toBe('hello')
          expect(fn).toBeCalledTimes(2)
        })
      })
    })
  })
})
