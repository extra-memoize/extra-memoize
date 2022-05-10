import { memoizeStaleWhileRevalidate } from '@memoizes/stale-while-revalidate/memoize-stale-while-revalidate'
import { SWRCache } from '@test/utils'
import { getErrorPromise } from 'return-style'
import { State } from '@src/types'
import { delay } from 'extra-promise'
import '@blackglory/jest-matchers'

describe('memoizeStaleWhileRevalidate', () => {
  it('caches the result', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      return text
    })
    const cache = new SWRCache<any>(() => State.Hit)

    const memoizedFn = memoizeStaleWhileRevalidate({ cache }, fn)
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

  test('fn throw errors', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      throw new Error('error')
    })
    const cache = new SWRCache(() => State.Hit)

    const memoizedFn = memoizeStaleWhileRevalidate({ cache }, fn)
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
      it('return stale cache then revalidate in background', async () => {
        let count = 0
        const fn = jest.fn(async () => {
          await delay(100)
          return ++count
        })
        const cache = new SWRCache(
          jest.fn()
            .mockReturnValueOnce(State.StaleWhileRevalidate)
            .mockReturnValue(State.Hit)
        )

        const memoizedFn = memoizeStaleWhileRevalidate({ cache }, fn)
        const result1 = memoizedFn() // miss
        const proResult1 = await result1 // 1
        const result2 = memoizedFn() // stale
        const proResult2 = await result2 // 1, revalidate in background
        const result3 = memoizedFn() // stale
        const proResult3 = await result3 // 1, revalidating
        await delay(150)
        const result4 = memoizedFn() // hit
        const proResult4 = await result4 // 2
        await delay(150)
        const result5 = memoizedFn() // hit
        const proResult5 = await result5 // 2

        expect(result1).toBePromise()
        expect(proResult1).toBe(1)
        expect(result2).toBePromise()
        expect(proResult2).toBe(1)
        expect(result3).toBePromise()
        expect(proResult3).toBe(1)
        expect(result4).toBePromise()
        expect(proResult4).toBe(2)
        expect(result5).toBePromise()
        expect(proResult5).toBe(2)
        expect(fn).toBeCalledTimes(2)
      })
    })

    describe('fn throw errors', () => {
      it('return stale cache', async () => {
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
        const cache = new SWRCache(
          jest.fn()
            .mockReturnValueOnce(State.StaleWhileRevalidate)
            .mockReturnValueOnce(State.StaleWhileRevalidate)
            .mockReturnValueOnce(State.StaleWhileRevalidate)
            .mockReturnValue(State.Hit)
        )

        const memoizedFn = memoizeStaleWhileRevalidate({ cache }, fn)
        const result1 = memoizedFn() // miss
        const proResult1 = await result1 // 1
        const result2 = memoizedFn() // stale
        const proResult2 = await result2 // 1, revalidate in background
        const result3 = memoizedFn() // stale
        const proResult3 = await result3 // 1, revalidating
        await delay(100) // fn throws error
        const result4 = memoizedFn() // stale, revalidate in background
        const proResult4 = await result4 // 1
        await delay(100)
        const result5 = memoizedFn() // hit
        const proResult5 = await result5 // 2

        expect(result1).toBePromise()
        expect(proResult1).toBe(1)
        expect(result2).toBePromise()
        expect(proResult2).toBe(1)
        expect(result3).toBePromise()
        expect(proResult3).toBe(1)
        expect(result4).toBePromise()
        expect(proResult4).toBe(1)
        expect(result5).toBePromise()
        expect(proResult5).toBe(2)
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
      const cache = new SWRCache(() => State.Hit)

      const memoizedFn = memoizeStaleWhileRevalidate({ cache }, fn)
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
      const cache = new SWRCache(() => State.Hit)

      const memoizedFn = memoizeStaleWhileRevalidate({ cache }, fn)
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
})
