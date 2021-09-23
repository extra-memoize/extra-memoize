import { TLRUCache } from '@caches/tlru-cache'
import { delay } from 'extra-promise'

describe('TLRUCache', () => {
  test('maxAge', async () => {
    const map = new TLRUCache(999, 200)

    map.set('#1',1) // #1 0
    await delay(100) // #1 100
    expect(map.get('#1')).toBe(1)

    map.set('#2',2) // #1 100, #2 0
    expect(map.get('#1')).toBe(1)
    expect(map.get('#2')).toBe(2)

    await delay(101) // #1 201, #2 101
    expect(map.get('#1')).toBeUndefined()
    expect(map.get('#2')).toBe(2)
  })

  test('limit', () => {
    const cache = new TLRUCache(2, 999)

    cache.set('#1', 1) // cold [1] hot
    cache.set('#2', 2) // cold [1, 2] hot
    cache.get('#1') // cold [2, 1] hot
    cache.set('#3', 3) // cold [1, 3] hot

    expect(cache.get('#1')).toBe(1)
    expect(cache.get('#2')).toBeUndefined()
    expect(cache.get('#3')).toBe(3)
  })
})
