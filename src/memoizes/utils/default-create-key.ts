import stringify from 'fast-json-stable-stringify'

export function defaultCreateKey<Args extends any[]>(args: Args, name?: string): string {
  return stringify([args, name])
}
