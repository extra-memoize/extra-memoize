# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.8.0](https://github.com/extra-memoize/extra-memoize/compare/v0.7.0...v0.8.0) (2022-08-04)


### ⚠ BREAKING CHANGES

* Merge `memoizeStaleIfErrorWithAsyncCache` into `memoizeAsyncStaleIfError`
* Merge `memoizeWithAsyncCache` into `memoizeAsync`
* Changed generic types of functions

### Features

* add State.Reuse ([6d8042f](https://github.com/extra-memoize/extra-memoize/commit/6d8042f0d929e464fa701903180a6ae69d0a6dff))
* add verbose option ([a3a975d](https://github.com/extra-memoize/extra-memoize/commit/a3a975d85875fe3b7a4df4e3653d5420303d55a5))


### Bug Fixes

* verbose ([11c24c9](https://github.com/extra-memoize/extra-memoize/commit/11c24c9adbee85cd83932cc99085e2fa3c5830dc))
* verbose ([281b0ef](https://github.com/extra-memoize/extra-memoize/commit/281b0effd548524a48fe5585af43b4ff3d91add7))


* merge `memoizeStaleIfErrorWithAsyncCache` into `memoizeAsyncStaleIfError` ([d790a5e](https://github.com/extra-memoize/extra-memoize/commit/d790a5e868cac6cb75d2b5c9222d0e527ef01761))
* merge `memoizeWithAsyncCache` into `memoizeAsync` ([3c00de9](https://github.com/extra-memoize/extra-memoize/commit/3c00de920d187e712fa2178b4ae3c2853c0006e7))
* remove CacheValue ([f5a5988](https://github.com/extra-memoize/extra-memoize/commit/f5a598888852ee2e09c8baea21286e2725bf7684))

## [0.7.0](https://github.com/extra-memoize/extra-memoize/compare/v0.6.0...v0.7.0) (2022-06-26)


### ⚠ BREAKING CHANGES

* rewrite

### Features

* rewrite ([5d0f39a](https://github.com/extra-memoize/extra-memoize/commit/5d0f39a68c91e841f8d86c675b7f262a276e6a64))

## [0.6.0](https://github.com/extra-memoize/extra-memoize/compare/v0.5.0...v0.6.0) (2022-05-10)


### ⚠ BREAKING CHANGES

* ICache, IAsyncCache, IStaleWhileRevalidateCache,
         IStaleWhileRevalidateAsyncCache changed.

* reduce cognitive cost, make the interface more uniform ([7834643](https://github.com/extra-memoize/extra-memoize/commit/783464365899ea2fe8091daf959dfca588f45757))

## [0.5.0](https://github.com/extra-memoize/extra-memoize/compare/v0.4.9...v0.5.0) (2022-04-08)


### ⚠ BREAKING CHANGES

* remove caches
* rewrite default createKey algorithm

### Features

* rewrite default createKey algorithm ([8989378](https://github.com/extra-memoize/extra-memoize/commit/898937892906e06bf0fa62348fe6a0dba90dd2f7))


* remove caches ([8c1f161](https://github.com/extra-memoize/extra-memoize/commit/8c1f161b231033918a8f24a71ddc68dd21261083))

### [0.4.9](https://github.com/extra-memoize/extra-memoize/compare/v0.4.8...v0.4.9) (2022-04-07)


### Features

* add the name parameter ([03eafd5](https://github.com/extra-memoize/extra-memoize/commit/03eafd508f83a4f492f0204c8a85323cfcb5cbb0))

### [0.4.8](https://github.com/extra-memoize/extra-memoize/compare/v0.4.7...v0.4.8) (2022-04-06)

### [0.4.7](https://github.com/BlackGlory/extra-memoize/compare/v0.4.6...v0.4.7) (2022-03-23)

### [0.4.6](https://github.com/BlackGlory/extra-memoize/compare/v0.4.5...v0.4.6) (2022-01-06)

### [0.4.5](https://github.com/BlackGlory/extra-memoize/compare/v0.4.4...v0.4.5) (2021-12-20)

### [0.4.4](https://github.com/BlackGlory/extra-memoize/compare/v0.4.3...v0.4.4) (2021-12-04)

### [0.4.3](https://github.com/BlackGlory/extra-memoize/compare/v0.4.2...v0.4.3) (2021-10-14)

### [0.4.2](https://github.com/BlackGlory/extra-memoize/compare/v0.4.1...v0.4.2) (2021-09-24)

### [0.4.1](https://github.com/BlackGlory/extra-memoize/compare/v0.4.0...v0.4.1) (2021-09-24)

## [0.4.0](https://github.com/BlackGlory/extra-memoize/compare/v0.3.3...v0.4.0) (2021-09-24)


### ⚠ BREAKING CHANGES

* The signature of `createKey` was changed

### Features

* add more caches ([1e5fafd](https://github.com/BlackGlory/extra-memoize/commit/1e5fafd69011b073bf9eb1dff1ca1d4ca2c07020))


### Bug Fixes

* createKey ([5a6e23e](https://github.com/BlackGlory/extra-memoize/commit/5a6e23e77315ac8e28d212b2e3069eab49658c92))

### [0.3.3](https://github.com/BlackGlory/extra-memoize/compare/v0.3.2...v0.3.3) (2021-09-23)


### Features

* add `clear()` methods to caches ([604e734](https://github.com/BlackGlory/extra-memoize/commit/604e734a96d3d9e7e1a2a36189920905c4ce5cc8))

### [0.3.2](https://github.com/BlackGlory/extra-memoize/compare/v0.3.1...v0.3.2) (2021-09-23)

### [0.3.1](https://github.com/BlackGlory/extra-memoize/compare/v0.3.0...v0.3.1) (2021-09-23)


### Bug Fixes

* dependencies ([e18aafb](https://github.com/BlackGlory/extra-memoize/commit/e18aafb7d949a255ca3b62c95dbabce4ade17a0b))

## [0.3.0](https://github.com/BlackGlory/extra-memoize/compare/v0.2.0...v0.3.0) (2021-09-23)


### ⚠ BREAKING CHANGES

* rewrite

### Features

* rewrite ([a5ee975](https://github.com/BlackGlory/extra-memoize/commit/a5ee97540e6f4fa7e0bafdff2afcf0f0c5feba50))

## [0.2.0](https://github.com/BlackGlory/extra-memoize/compare/v0.1.2...v0.2.0) (2021-09-18)


### ⚠ BREAKING CHANGES

* rewrite memoize, IMap

### Features

* rewrite memoize, IMap ([edd445d](https://github.com/BlackGlory/extra-memoize/commit/edd445dfd79e516b05139fab08dbb3cc5d8eddc1))

### [0.1.2](https://github.com/BlackGlory/extra-memoize/compare/v0.1.1...v0.1.2) (2021-09-16)


### Features

* add ExpirableCache ([cd4d839](https://github.com/BlackGlory/extra-memoize/commit/cd4d839e2fe97ac793f9255ee88b4ecf2c371a82))
* add TLRUCache ([b7c2a71](https://github.com/BlackGlory/extra-memoize/commit/b7c2a7151ad4565a6d1a460fe7ca94c14a7e2b93))

### [0.1.1](https://github.com/BlackGlory/extra-memoize/compare/v0.1.0...v0.1.1) (2021-07-13)

## 0.1.0 (2021-05-18)


### Features

* init ([04f1ed0](https://github.com/BlackGlory/extra-memoize/commit/04f1ed0e85362f57d19a53be1092c9cf130d8557))
