import { ExpirableCache } from '@caches/expirable-cache'
import { delay } from 'extra-promise'

test('ExpiralbeCache', async () => {
  const map = new ExpirableCache(200)

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
