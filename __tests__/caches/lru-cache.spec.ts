import { LRUCache } from '@caches/lru-cache'

test('LRUCache', () => {
  const cache = new LRUCache(2)

  cache.set('#1', 1) // cold [1] hot
  cache.set('#2', 2) // cold [1, 2] hot
  cache.get('#1') // cold [2, 1] hot
  cache.set('#3', 3) // cold [1, 3] hot

  expect(cache.get('#1')).toBe(1)
  expect(cache.get('#2')).toBeUndefined()
  expect(cache.get('#3')).toBe(3)
})
