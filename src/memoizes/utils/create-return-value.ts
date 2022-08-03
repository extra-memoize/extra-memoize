export function createReturnValue<T, U>(
  value: T
, state: U
, verbose: boolean
): T | [T, U] {
  if (verbose) {
    return [value, state]
  } else {
    return value
  }
}
