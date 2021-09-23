export enum State {
  Miss = 'miss'
, Hit = 'hit'
, StaleWhileRevalidate = 'stale-while-revalidate'
, StaleIfError = 'state-if-error'
}

export interface ICache<T> {
  set(key: string, value: T): void
  get(key: string): T | undefined
}

export interface IAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<T | undefined>
}

export interface IStaleWhileRevalidateCache<T> extends ICache<T> {
  isStaleWhileRevalidate(key: string): boolean
}

export interface IStaleWhileRevalidateAsyncCache<T> extends IAsyncCache<T> {
  isStaleWhileRevalidate(key: string): Promise<boolean>
}

export interface IStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss, undefined]
                  | [State.Hit | State.StaleIfError, T]
}

export interface IStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss, undefined]
                    | [State.Hit | State.StaleIfError, T]
                    >
}

export interface IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss, undefined]
                  | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T]
}

export interface IStaleWhileRevalidateAndStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss, undefined]
                    | [State.Hit | State.StaleWhileRevalidate | State.StaleIfError, T]
                    >
}
