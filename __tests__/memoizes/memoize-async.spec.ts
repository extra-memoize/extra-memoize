import { memoizeAsync } from '@memoizes/memoize-async'
import { getErrorPromise } from 'return-style'
import { delay } from 'extra-promise'
import { Cache } from '@test/utils'
import '@blackglory/jest-matchers'

describe(`
  memoizeAsync<CacheValue, Result extends CacheValue, Args extends any[]>(
    options: {
      cache: ICache<CacheValue>
      createKey?: (args: Args) => string
    }
  , fn: (...args: Args) => PromiseLike<Result>
  ): (...args: Args) => Promise<Result>
`, () => {
  it('caches the result', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      return text
    })
    const cache = new Cache()

    const memoizedFn = memoizeAsync({ cache }, fn)
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
    const cache = new Cache()

    const memoizedFn = memoizeAsync({ cache }, fn)
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

  describe('concurrent calls', () => {
    test('resolved', async () => {
      const fn = jest.fn(async (text: string) => {
        await delay(100)
        return text
      })
      const cache = new Cache()

      const memoizedFn = memoizeAsync({ cache }, fn)
      const result1 = memoizedFn('foo')
      const result2 = memoizedFn('foo')
      const proResult1 = await result1
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
      const cache = new Cache()

      const memoizedFn = memoizeAsync({ cache }, fn)
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
