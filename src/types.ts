export enum State {
  Miss = 'miss'
, Hit = 'hit'
, Reuse = 'reuse'
, StaleWhileRevalidate = 'stale-while-revalidate'
, StaleIfError = 'state-if-error'
}

export interface ICache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [State.Hit, T]
}

export interface IAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [State.Hit, T]
                    >
}

export interface IStaleWhileRevalidateCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [
                    | State.Hit
                    | State.StaleWhileRevalidate
                    , T
                    ]
}

export interface IStaleWhileRevalidateAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [
                      | State.Hit
                      | State.StaleWhileRevalidate
                      , T
                      ]
                    >
}

export interface IStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [
                    | State.Hit
                    | State.StaleIfError
                    , T
                    ]
}

export interface IStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [
                      | State.Hit
                      | State.StaleIfError
                      , T
                      ]
                    >
}

export interface IStaleWhileRevalidateAndStaleIfErrorCache<T> {
  set(key: string, value: T): void
  get(key: string): [State.Miss]
                  | [
                    | State.Hit
                    | State.StaleWhileRevalidate
                    | State.StaleIfError
                    , T
                    ]
}

export interface IStaleWhileRevalidateAndStaleIfErrorAsyncCache<T> {
  set(key: string, value: T): Promise<void>
  get(key: string): Promise<
                    | [State.Miss]
                    | [
                      | State.Hit
                      | State.StaleWhileRevalidate
                      | State.StaleIfError
                      , T
                      ]
                    >
}
