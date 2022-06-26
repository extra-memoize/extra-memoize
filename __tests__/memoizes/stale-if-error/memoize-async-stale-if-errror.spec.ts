import { memoizeAsyncStaleIfError } from '@memoizes/stale-if-error/memoize-async-stale-if-error'
import { SIECache } from '@test/utils'
import { State } from '@src/types'
import { getErrorPromise } from 'return-style'
import { delay } from 'extra-promise'
import '@blackglory/jest-matchers'

describe('memoizeAsyncStaleIfError', () => {
  it('caches the result', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      return text
    })
    const cache = new SIECache(() => State.Hit)

    const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
    const result1 = memoizedFn('foo')
    const proResult1 = await result1
    const result2 = memoizedFn('foo')
    const proResult2 = await result2

    expect(result1).toBePromise()
    expect(proResult1).toBe('foo')
    expect(result2).toBePromise()
    expect(proResult2).toBe('foo')
    expect(fn).toBeCalledTimes(1)
  })

  test('fn throws errors', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      throw new Error('error')
    })
    const cache = new SIECache(() => State.Hit)

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
      const cache = new SIECache(
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
      expect(proResult1).toBe(1)
      expect(result2).toBePromise()
      expect(proResult2).toBe(1)
      expect(result3).toBePromise()
      expect(proResult3).toBe(2)
      expect(result4).toBePromise()
      expect(proResult4).toBe(2)
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
        const cache = new SIECache(
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
        expect(proResult1).toBe(1)
        expect(result2).toBePromise()
        expect(proResult2).toBe(1)
        expect(result3).toBePromise()
        expect(proResult3).toBe(2)
        expect(result4).toBePromise()
        expect(proResult4).toBe(2)
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
      const cache = new SIECache(() => State.Hit)

      const memoizedFn = memoizeAsyncStaleIfError({ cache }, fn)
      const result1 = memoizedFn('foo')
      const proResult1 = await result1
      const result2 = memoizedFn('foo')
      const proResult2 = await result2

      expect(result1).toBePromise()
      expect(proResult1).toBe('foo')
      expect(result2).toBePromise()
      expect(proResult2).toBe('foo')
      expect(fn).toBeCalledTimes(1)
    })

    test('rejected', async () => {
      const fn = jest.fn(async (text: string) => {
        await delay(100)
        throw new Error('error')
      })
      const cache = new SIECache(() => State.Hit)

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
        const cache = new SIECache(() => State.Hit)

        const memoizedFn = memoizeAsyncStaleIfError({
          cache
        , executionTimeThreshold: 200
        }, fn)
        const result1 = await memoizedFn('foo')
        const result2 = await memoizedFn('foo')

        expect(result1).toBe('foo')
        expect(result2).toBe('foo')
        expect(fn).toBeCalledTimes(1)
      })
    })

    describe('executionTime < executionTimeThreshold', () => {
      it('does not cache the result', async () => {
        const fn = jest.fn(async (text: string) => text)
        const cache = new SIECache(() => State.Hit)

        const memoizedFn = memoizeAsyncStaleIfError({
          cache
        , executionTimeThreshold: 200
        }, fn)
        const result1 = await memoizedFn('foo')
        const result2 = await memoizedFn('foo')

        expect(result1).toBe('foo')
        expect(result2).toBe('foo')
        expect(fn).toBeCalledTimes(2)
      })
    })
  })
})
