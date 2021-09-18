import { memoizeAsync } from '@src/memoize-async'
import { getErrorPromise } from 'return-style'
import { StringKeyCache } from '@src/string-key-cache'
import { delay } from 'extra-promise'
import '@blackglory/jest-matchers'

describe(`
  memoizeAsync<Result, Args extends any[]>(
    options: IMemoizeAsyncOptions<Result>
  , fn: (...args: Args) => PromiseLike<Result>
  ): (...args: Args) => Promise<Result>
`, () => {
  test('resolved', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      return text
    })
    const map = new Map()
    const cache = new StringKeyCache(map)

    const memoizedFn = memoizeAsync({ cache }, fn)
    const result1 = memoizedFn('hello')
    const result2 = memoizedFn('hello')
    const proResult1 = await result1
    const proResult2 = await result2

    expect(result1).toBePromise()
    expect(proResult1).toBe('hello')
    expect(result2).toBePromise()
    expect(proResult2).toBe('hello')
    expect(result1).toBe(result2)
    expect(fn).toBeCalledTimes(1)
  })

  test('rejected', async () => {
    const fn = jest.fn(async (text: string) => {
      await delay(100)
      throw new Error('error')
    })
    const map = new Map()
    const cache = new StringKeyCache(map)

    const memoizedFn = memoizeAsync({ cache }, fn)
    const result1 = memoizedFn('hello')
    const result2 = memoizedFn('hello')
    const err1 = await getErrorPromise(result1)
    const err2 = await getErrorPromise(result2)

    expect(result1).toBePromise()
    expect(err1).toBeInstanceOf(Error)
    expect(result2).toBePromise()
    expect(err2).toBeInstanceOf(Error)
    expect(err1).toBe(err2)
    expect(fn).toBeCalledTimes(1)
  })
})
