import {
  memoizeStaleIfError
, IMemoizeStaleIfErrorOptions
} from '@memoizes/memoize-stale-if-error'
import { SIECache } from '@test/utils'
import { State } from '@src/types'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('memoizeStaleIfError', () => {
  describe.each([
    ['verbose', memoizeStaleIfErrorVerbose, toVerboseResult]
  , ['not verbose', memoizeStaleIfError, toValue]
  ])('%s', (_, memoizeStaleIfError, createResult) => {
    it('caches the result', () => {
      const fn = jest.fn((text: string) => text)
      const cache = new SIECache(() => State.Hit)

      const memoizedFn = memoizeStaleIfError({ cache }, fn)
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
      const cache = new SIECache(() => State.Hit)

      const memoizedFn = memoizeStaleIfError({ cache }, fn)
      const err1 = getError(() => memoizedFn('foo'))
      const err2 = getError(() => memoizedFn('foo'))

      expect(err1).toBeInstanceOf(Error)
      expect(err2).toBeInstanceOf(Error)
      expect(fn).toBeCalledTimes(2)
    })

    describe('stale-if-error', () => {
      test('caches the result', () => {
        let count = 0
        const fn = jest.fn(() => ++count)
        const cache = new SIECache(
          jest.fn()
            .mockReturnValueOnce(State.Hit)
            .mockReturnValueOnce(State.StaleIfError)
            .mockReturnValue(State.Hit)
        )

        const memoizedFn = memoizeStaleIfError({ cache }, fn)
        const result1 = memoizedFn() // miss, 1
        const result2 = memoizedFn() // hit, 1
        const result3 = memoizedFn() // stale, revalidate, no error, 2
        const result4 = memoizedFn() // hit, 2

        expect(result1).toStrictEqual(createResult([1, State.Miss]))
        expect(result2).toStrictEqual(createResult([1, State.Hit]))
        expect(result3).toStrictEqual(createResult([2, State.StaleIfError]))
        expect(result4).toStrictEqual(createResult([2, State.Hit]))
        expect(fn).toBeCalledTimes(2)
      })

      describe('fn throws errors', () => {
        it('returns stale cache', () => {
          let count = 0
          const fn = jest.fn()
            .mockImplementationOnce(() => ++count)
            .mockImplementationOnce(() => {
              throw new Error('error')
            })
            .mockImplementation(() => ++count)
          const cache = new SIECache(
            jest.fn()
              .mockReturnValueOnce(State.StaleIfError)
              .mockReturnValueOnce(State.StaleIfError)
              .mockReturnValue(State.Hit)
          )

          const memoizedFn = memoizeStaleIfError({ cache }, fn)
          const result1 = memoizedFn() // miss, 1
          const result2 = memoizedFn() // stale, revalidate, error, 1
          const result3 = memoizedFn() // stale, revalidate, no error, 2
          const result4 = memoizedFn() // hit, 2

          expect(result1).toStrictEqual(createResult([1, State.Miss]))
          expect(result2).toStrictEqual(createResult([1, State.StaleIfError]))
          expect(result3).toStrictEqual(createResult([2, State.StaleIfError]))
          expect(result4).toStrictEqual(createResult([2, State.Hit]))
          expect(fn).toBeCalledTimes(3)
        })
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

      describe('executionTime >= executionTimeThreshold', () => {
        it('caches the result', () => {
          const fn = jest.fn((text: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return text
          })
          const cache = new SIECache(() => State.Hit)

          const memoizedFn = memoizeStaleIfError({
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
          const cache = new SIECache(() => State.Hit)

          const memoizedFn = memoizeStaleIfError({
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

function memoizeStaleIfErrorVerbose<Result, Args extends any[]>(
  options: IMemoizeStaleIfErrorOptions<Result, Args>
, fn: (...args: Args) => Result
): (...args: Args) => [Result, State] {
  return memoizeStaleIfError({ ...options, verbose: true }, fn)
}

function toVerboseResult<T>(
  x: [value: T, state: State]
): [value: T, state: State] {
  return x
}

function toValue<T>([value, _]: [value: T, state: State]): T {
  return value
}
