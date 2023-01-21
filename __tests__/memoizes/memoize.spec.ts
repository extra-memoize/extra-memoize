import { memoize, IMemoizeOptions } from '@memoizes/memoize'
import { Cache } from '@test/utils'
import { getError } from 'return-style'
import { State } from '@src/types'

describe('memoize', () => {
  describe.each([
    ['verbose', memoizeVerbose, toVerboseResult]
  , ['not verbose', memoize, toValue]
  ])('%s', (_, memoize, createResult) => {
    it('caches the result', () => {
      const fn = jest.fn((text: string) => text)
      const cache = new Cache()

      const memoizedFn = memoize({ cache }, fn)
      const result1 = memoizedFn('foo')
      const result2 = memoizedFn('foo')

      expect(result1).toStrictEqual(createResult(['foo', State.Miss]))
      expect(result2).toStrictEqual(createResult(['foo', State.Hit]))
      expect(fn).toBeCalledTimes(1)
    })

    test('fn throws errors', () => {
      const fn = jest.fn((text: string) => {
        throw new Error('error')
      })
      const cache = new Cache()

      const memoizedFn = memoize({ cache }, fn)
      const result1 = getError(() => memoizedFn('foo'))
      const result2 = getError(() => memoizedFn('foo'))

      expect(result1).toBeInstanceOf(Error)
      expect(result2).toBeInstanceOf(Error)
      expect(fn).toBeCalledTimes(2)
    })

    describe('executionTimeThreshold', () => {
      beforeEach(() => {
        jest.useFakeTimers()
      })

      afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
      })

      describe('executionTime >= executionTimeThreshold', () => {
        it('caches the result', () => {
          const fn = jest.fn((text: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return text
          })
          const cache = new Cache()

          const memoizedFn = memoize({
            cache
          , executionTimeThreshold: 200
          }, fn)
          const result1 = memoizedFn('foo')
          const result2 = memoizedFn('foo')

          expect(result1).toStrictEqual(createResult(['foo', State.Miss]))
          expect(result2).toStrictEqual(createResult(['foo', State.Hit]))
          expect(fn).toBeCalledTimes(1)
        })
      })

      describe('executionTime < executionTimeThreshold', () => {
        it('does not cache the result', () => {
          const fn = jest.fn((text: string) => text)
          const cache = new Cache()

          const memoizedFn = memoize({
            cache
          , executionTimeThreshold: 200
          }, fn)
          const result1 = memoizedFn('foo')
          const result2 = memoizedFn('foo')

          expect(result1).toStrictEqual(createResult(['foo', State.Miss]))
          expect(result2).toStrictEqual(createResult(['foo', State.Miss]))
          expect(fn).toBeCalledTimes(2)
        })
      })
    })
  })
})

function memoizeVerbose<CacheValue, Result extends CacheValue, Args extends any[]>(
  options: IMemoizeOptions<CacheValue, Args>
, fn: (...args: Args) => Result
): (...args: Args) => [Result, State] {
  return memoize({ ...options, verbose: true }, fn)
}

function toVerboseResult<T>(
  x: [value: T, state: State]
): [value: T, state: State] {
  return x
}

function toValue<T>([value, _]: [value: T, state: State]): T {
  return value
}
