import { memoizeStaleWhileRevalidate } from '@memoizes/memoize-stale-while-revalidate'
import { SWRCache, SWRAsyncCache } from '@test/utils'
import { getErrorPromise } from 'return-style'
import { State } from '@src/types'
import { delay } from 'extra-promise'
import '@blackglory/jest-matchers'

describe('memoizeStaleWhileRevalidate', () => {
  describe.each([
    ['sync cache', SWRCache]
  , ['async cache', SWRAsyncCache]
  ])('%s', (_, Cache) => {
    it('caches the result', async () => {
      const fn = jest.fn(async (text: string) => {
        await delay(100)
        return text
      })
      const cache = new Cache(() => State.Hit)

      const memoizedFn = memoizeStaleWhileRevalidate({ cache, verbose: true }, fn)
      const result1 = memoizedFn('foo')
      const proResult1 = await result1
      const result2 = memoizedFn('foo')
      const proResult2 = await result2

      expect(result1).toBePromise()
      expect(proResult1).toStrictEqual(['foo', State.Miss])
      expect(result2).toBePromise()
      expect(proResult2).toStrictEqual(['foo', State.Hit])
      expect(fn).toBeCalledTimes(1)
    })

    test('fn throws errors', async () => {
      const fn = jest.fn(async (text: string) => {
        await delay(100)
        throw new Error('error')
      })
      const cache = new Cache(() => State.Hit)

      const memoizedFn = memoizeStaleWhileRevalidate({ cache, verbose: true }, fn)
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

    describe('stale-while-revalidate', () => {
      describe('caches the result', () => {
        it('returns stale cache then revalidate in background', async () => {
          let count = 0
          const fn = jest.fn(async () => {
            await delay(100)
            return ++count
          })
          const cache = new Cache(
            jest.fn()
              .mockReturnValueOnce(State.StaleWhileRevalidate)
              .mockReturnValueOnce(State.StaleWhileRevalidate)
              .mockReturnValue(State.Hit)
          )

          const memoizedFn = memoizeStaleWhileRevalidate({ cache, verbose: true }, fn)
          const result1 = memoizedFn() // miss
          const proResult1 = await result1 // 1
          const result2 = memoizedFn() // stale
          const proResult2 = await result2 // 1, revalidate in background
          const result3 = memoizedFn() // stale
          const proResult3 = await result3 // 1, revalidating
          await delay(100)
          const result4 = memoizedFn() // hit
          const proResult4 = await result4 // 2
          await delay(100)
          const result5 = memoizedFn() // hit
          const proResult5 = await result5 // 2

          expect(result1).toBePromise()
          expect(proResult1).toStrictEqual([1, State.Miss])
          expect(result2).toBePromise()
          expect(proResult2).toStrictEqual([1, State.StaleWhileRevalidate])
          expect(result3).toBePromise()
          expect(proResult3).toStrictEqual([1, State.StaleWhileRevalidate])
          expect(result4).toBePromise()
          expect(proResult4).toStrictEqual([2, State.Hit])
          expect(result5).toBePromise()
          expect(proResult5).toStrictEqual([2, State.Hit])
          expect(fn).toBeCalledTimes(2)
        })
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
              .mockReturnValueOnce(State.StaleWhileRevalidate)
              .mockReturnValueOnce(State.StaleWhileRevalidate)
              .mockReturnValueOnce(State.StaleWhileRevalidate)
              .mockReturnValue(State.Hit)
          )

          const memoizedFn = memoizeStaleWhileRevalidate({ cache, verbose: true }, fn)
          const result1 = memoizedFn() // miss
          const proResult1 = await result1 // 1
          const result2 = memoizedFn() // stale
          const proResult2 = await result2 // 1, revalidate in background
          const result3 = memoizedFn() // stale
          const proResult3 = await result3 // 1, revalidating
          await delay(150) // fn throws error
          const result4 = memoizedFn() // stale, revalidate in background
          const proResult4 = await result4 // 1
          await delay(150)
          const result5 = memoizedFn() // hit
          const proResult5 = await result5 // 2

          expect(result1).toBePromise()
          expect(proResult1).toStrictEqual([1, State.Miss])
          expect(result2).toBePromise()
          expect(proResult2).toStrictEqual([1, State.StaleWhileRevalidate])
          expect(result3).toBePromise()
          expect(proResult3).toStrictEqual([1, State.StaleWhileRevalidate])
          expect(result4).toBePromise()
          expect(proResult4).toStrictEqual([1, State.StaleWhileRevalidate])
          expect(result5).toBePromise()
          expect(proResult5).toStrictEqual([2, State.Hit])
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

        const memoizedFn = memoizeStaleWhileRevalidate({ cache, verbose: true }, fn)
        const result1 = memoizedFn('foo')
        const result2 = memoizedFn('foo')
        const proResult1 = await result1
        const proResult2 = await result2

        expect(result1).toBePromise()
        expect(proResult1).toStrictEqual(['foo', State.Miss])
        expect(result2).toBePromise()
        expect(proResult2).toStrictEqual(['foo', State.Reuse])
        expect(fn).toBeCalledTimes(1)
      })

      test('rejected', async () => {
        const fn = jest.fn(async (text: string) => {
          await delay(100)
          throw new Error('error')
        })
        const cache = new Cache(() => State.Hit)

        const memoizedFn = memoizeStaleWhileRevalidate({ cache, verbose: true }, fn)
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
          const fn = jest.fn((text: string) => {
            jest.setSystemTime(jest.getRealSystemTime() + 200)
            return text
          })
          const cache = new Cache(() => State.Hit)

          const memoizedFn = memoizeStaleWhileRevalidate({
            cache
          , executionTimeThreshold: 200
          , verbose: true
          }, fn)
          const result1 = await memoizedFn('foo')
          const result2 = await memoizedFn('foo')

          expect(result1).toStrictEqual(['foo', State.Miss])
          expect(result2).toStrictEqual(['foo', State.Hit])
          expect(fn).toBeCalledTimes(1)
        })
      })

      describe('executionTime < executionTimeThreshold', () => {
        it('does not cache the result', async () => {
          const fn = jest.fn((text: string) => text)
          const cache = new Cache(() => State.Hit)

          const memoizedFn = memoizeStaleWhileRevalidate({
            cache
          , executionTimeThreshold: 200
          , verbose: true
          }, fn)
          const result1 = await memoizedFn('foo')
          const result2 = await memoizedFn('foo')

          expect(result1).toStrictEqual(['foo', State.Miss])
          expect(result2).toStrictEqual(['foo', State.Miss])
          expect(fn).toBeCalledTimes(2)
        })
      })
    })
  })
})
