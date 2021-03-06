import { memoize } from '@memoizes/memoize'
import { Cache } from '@test/utils'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('memoize', () => {
  it('caches the result', () => {
    const fn = jest.fn((text: string) => text)
    const cache = new Cache()

    const memoizedFn = memoize({ cache }, fn)
    const result1 = memoizedFn('foo')
    const result2 = memoizedFn('foo')

    expect(result1).toBe('foo')
    expect(result2).toBe('foo')
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
        const cache = new Cache()

        const memoizedFn = memoize({
          cache
        , executionTimeThreshold: 200
        }, fn)
        const result1 = memoizedFn('foo')
        const result2 = memoizedFn('foo')

        expect(result1).toBe('foo')
        expect(result2).toBe('foo')
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

        expect(result1).toBe('foo')
        expect(result2).toBe('foo')
        expect(fn).toBeCalledTimes(2)
      })
    })
  })
})
