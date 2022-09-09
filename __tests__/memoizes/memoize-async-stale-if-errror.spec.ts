import {
  memoizeAsyncStaleIfError
, IMemoizeAsyncStaleIfError
} from '@memoizes/memoize-async-stale-if-error'
import { SIECache, SIEAsyncCache } from '@test/utils'
import { State } from '@src/types'
import { getErrorPromise } from 'return-style'
import { delay } from 'extra-promise'
import { Awaitable } from '@blackglory/prelude'
import '@blackglory/jest-matchers'

describe('memoizeAsyncStaleIfError', () => {
  describe.each([
    ['verbose', memoizeAsyncStaleIfErrorVerbose, toVerboseResult]
  , ['not verbose', memoizeAsyncStaleIfError, toValue]
  ])('%s', (_, memoizeAsyncStaleIfError, createResult) => {
    describe.each([
      ['sync cache', SIECache]
    , ['async cache', SIEAsyncCache]
    ])('%s', (_, Cache) => {
      it('caches the result', async () => {
        const fn = jest.fn(async (text: string) => {
          await delay(100)
          return text
        })
        const cache = new Cache(() => State.Hit)

        const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
        const result1 = memoizedFn('foo')
        const proResult1 = await result1
        const result2 = memoizedFn('foo')
        const proResult2 = await result2

        expect(result1).toBePromise()
        expect(proResult1).toStrictEqual(createResult(['foo', State.Miss]))
        expect(result2).toBePromise()
        expect(proResult2).toStrictEqual(createResult(['foo', State.Hit]))
        expect(fn).toBeCalledTimes(1)
      })

      test('fn throws errors', async () => {
        const fn = jest.fn(async (text: string) => {
          await delay(100)
          throw new Error('error')
        })
        const cache = new Cache(() => State.Hit)

        const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
        const result1 = memoizedFn('foo')
        const err1 = await getErrorPromise(result1)
        const result2 = memoizedFn('foo')
        const err2 = await getErrorPromise(result2)

        expect(result1).toBePromise()
        expect(err1).toBeInstanceOf(Error)
        expect(result2).toBePromise()
        expect(err2).toBeInstanceOf(Error)
        expect(fn).toBeCalledTimes(2)
      })

      describe('stale-if-error', () => {
        test('caches the result', async () => {
          let count = 0
          const fn = jest.fn(async () => {
            await delay(100)
            return ++count
          })
          const cache = new Cache(
            jest.fn()
              .mockReturnValueOnce(State.Hit)
              .mockReturnValueOnce(State.StaleIfError)
              .mockReturnValue(State.Hit)
          )

          const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
          const result1 = memoizedFn() // miss
          const proResult1 = await result1 // 1
          const result2 = memoizedFn() // hit
          const proResult2 = await result2 // 1
          const result3 = memoizedFn() // stale, revalidate, no error
          const proResult3 = await result3 // 2
          const result4 = memoizedFn() // hit
          const proResult4 = await result4 // 2

          expect(result1).toBePromise()
          expect(proResult1).toStrictEqual(createResult([1, State.Miss]))
          expect(result2).toBePromise()
          expect(proResult2).toStrictEqual(createResult([1, State.Hit]))
          expect(result3).toBePromise()
          expect(proResult3).toStrictEqual(createResult([2, State.StaleIfError]))
          expect(result4).toBePromise()
          expect(proResult4).toStrictEqual(createResult([2, State.Hit]))
          expect(fn).toBeCalledTimes(2)
        })

        describe('fn throws errors', () => {
          it('returns stale cache', async () => {
            let count = 0
            const fn = jest.fn()
              .mockImplementationOnce(async () => {
                await delay(100)
                return ++count
              })
              .mockImplementationOnce(async () => {
                await delay(100)
                throw new Error('error')
              })
              .mockImplementation(async () => {
                await delay(100)
                return ++count
              })
            const cache = new Cache(
              jest.fn()
                .mockReturnValueOnce(State.StaleIfError)
                .mockReturnValueOnce(State.StaleIfError)
                .mockReturnValue(State.Hit)
            )

            const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
            const result1 = memoizedFn() // miss
            const proResult1 = await result1 // 1
            const result2 = memoizedFn() // stale, revalidate, error
            const proResult2 = await result2 // 1,
            const result3 = memoizedFn() // stale, revalidate, no error
            const proResult3 = await result3 // 2
            const result4 = memoizedFn() // hit
            const proResult4 = await result4 // 2

            expect(result1).toBePromise()
            expect(proResult1).toStrictEqual(createResult([1, State.Miss]))
            expect(result2).toBePromise()
            expect(proResult2).toStrictEqual(createResult([1, State.StaleIfError]))
            expect(result3).toBePromise()
            expect(proResult3).toStrictEqual(createResult([2, State.StaleIfError]))
            expect(result4).toBePromise()
            expect(proResult4).toStrictEqual(createResult([2, State.Hit]))
            expect(fn).toBeCalledTimes(3)
          })
        })
      })

      describe('concurrent calls', () => {
        test('resolved', async () => {
          const fn = jest.fn(async (text: string) => {
            await delay(100)
            return text
          })
          const cache = new Cache(() => State.Hit)

          const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
          const result1 = memoizedFn('foo')
          const result2 = memoizedFn('foo')
          const proResult1 = await result1
          const proResult2 = await result2

          expect(result1).toBePromise()
          expect(proResult1).toStrictEqual(createResult(['foo', State.Miss]))
          expect(result2).toBePromise()
          expect(proResult2).toStrictEqual(createResult(['foo', State.Reuse]))
          expect(fn).toBeCalledTimes(1)
        })

        test('rejected', async () => {
          const fn = jest.fn(async (text: string) => {
            await delay(100)
            throw new Error('error')
          })
          const cache = new Cache(() => State.Hit)

          const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
          const result1 = memoizedFn('foo')
          const result2 = memoizedFn('foo')
          const err1 = await getErrorPromise(result1)
          const err2 = await getErrorPromise(result2)

          expect(result1).toBePromise()
          expect(err1).toBeInstanceOf(Error)
          expect(result2).toBePromise()
          expect(err2).toBeInstanceOf(Error)
          expect(fn).toBeCalledTimes(1)
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
          it('caches the result', async () => {
            const fn = jest.fn(async (text: string) => {
              jest.setSystemTime(jest.getRealSystemTime() + 200)
              return text
            })
            const cache = new Cache(() => State.Hit)

            const memoizedFn = memoizeAsyncStaleIfError({
              cache
            , executionTimeThreshold: 200
            }, fn)
            const result1 = await memoizedFn('foo')
            const result2 = await memoizedFn('foo')

            expect(result1).toStrictEqual(createResult(['foo', State.Miss]))
            expect(result2).toStrictEqual(createResult(['foo', State.Hit]))
            expect(fn).toBeCalledTimes(1)
          })
        })

        describe('executionTime < executionTimeThreshold', () => {
          it('does not cache the result', async () => {
            const fn = jest.fn(async (text: string) => text)
            const cache = new Cache(() => State.Hit)

            const memoizedFn = memoizeAsyncStaleIfError({
              cache
            , executionTimeThreshold: 200
            }, fn)
            const result1 = await memoizedFn('foo')
            const result2 = await memoizedFn('foo')

            expect(result1).toStrictEqual(createResult(['foo', State.Miss]))
            expect(result2).toStrictEqual(createResult(['foo', State.Miss]))
            expect(fn).toBeCalledTimes(2)
          })
        })
      })
    })
  })
})

function memoizeAsyncStaleIfErrorVerbose<
  CacheValue
, Result extends CacheValue
, Args extends any[]
>(
  options: IMemoizeAsyncStaleIfError<Result, Args>
, fn: (...args: Args) => Awaitable<Result>
): (...args: Args) => Promise<[Result, State]> {
  return memoizeAsyncStaleIfError({ ...options, verbose: true }, fn)
}

function toVerboseResult<T>(
  x: [value: T, state: State]
): [value: T, state: State] {
  return x
}

function toValue<T>([value, _]: [value: T, state: State]): T {
  return value
}
