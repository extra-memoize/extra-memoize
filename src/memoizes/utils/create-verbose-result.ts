export function createVerboseResult<T, U>(value: T, state: U): [T, U] {
  return [value, state]
}
