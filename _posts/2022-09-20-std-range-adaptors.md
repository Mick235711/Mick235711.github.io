---
title: Range Properties of the Standard Range Adaptors
categories:
- C++
- Library
- Ranges
---

## Contents

* TOC
{:toc}

In this post, "range adaptors" refer to both range factories (algorithm that produce range, can only be the starting point of a pipeline, like `views::single`)
and (real) range adaptors (algorithm that takes a range and return an adapted range, like `views::filter`).
In C++20 standard, following the adoption of Ranges TS, the standard adopted 18 range adaptors:
- 5 factories: `empty`, `single`, `iota`, `istream`, `counted`
- 13 (real) adaptors: `all`, `filter`, `transform`, `take`, `take_while`, `drop`, `drop_while`, `join`, `lazy_split`, `split`, `common`, `reverse`, `elements` (`keys`/`values` are aliases)

Of course, this is only a small subset of what is provided in range-v3 (over 100 adaptors). C++23 greatly expanded range support in multiple ways, including the addition of 13 more adaptors:
- 4 new factories: `zip`, `zip_transform`, `cartesian_product`, `repeat`
- 9 new (real) adaptors: `as_rvalue`, `join_with`, `as_const`, `adjacent`, `adjacent_transform` (`pairwise` are aliases), `chunk`, `slide`, `chunk_by`, `stride`

and C++26 is expected to provide even more (`enumerate` and `concat` being the most expected ones).

Each adaptor has its own use case, feature, and limitations. Especially, each adaptors has its own accepted range properties, and the output range's properties also differ.
These properties limitations are often not documented, in standard or elsewhere, making determine those properties a pain.
Therefore, this post serves as an expansion upon [the excellent post by Barry Revzin](https://brevzin.github.io/c++/2021/02/28/ranges-reference/), adding more range adaptors and
adding more properties so that the reference is more complete.

This post still follows the same convention set in the above linked post (`W w` meaning type and value, `[T]` means range with refernece type `T`, `A -> B` means function taking `A` and returning `B`),
and the properties surveyed are the original ones (reference, category, common, sized, const-iterable, borrowed) plus an additional one:
constant. A range being a constant range simply means that its iterator are constant iterator, i.e. we cannot modify its elements using its iterators,
so `const vector<int>` is a constant range but `vector<int>` is not. Notice that all of those 7 categories can be detected by concepts:
- reference: `ranges::range_reference_t<R>`
- category: `ranges::input_range<R>` to `ranges::contiguous_range<R>`
- common: `ranges::common_range<R>`
- sized: `ranges::sized_range<R>`
- const-iterable: `ranges::range<const R>`
- borrowed: `ranges::borrowed_range<R>`
- constant: `ranges::constant_range<R>` (C++23)

All of the original descriptions and properties are copied here, credit belongs to the original author.

# C++20 Range Adaptors
## Factories
### `views::empty<T>`
Produces an empty range of type `T`.
- constraint: `T` is an object type
- reference: `T&`
- category: contiguous
- common: always
- sized: always (0)
- const-iterable: always
- borrowed: always
- constant: when `T` is `const`-qualified

### `views::single(t: T)`
Produce a range that only contains a single value: `t`.
- constraint: `T` is an object type
- reference: `T&`
- category: contiguous
- common: always
- sized: always (1)
- const-iterable: always
- borrowed: never
- constant: never (`single_view<T>` is only instantiated with decayed type)

### `views::iota(beg: B[, end: E])`
Produce a range that start at `beg`, and incrementing forever (when there is only one argument) or until `beg == end` (exclude `end` as usual).
```python
>>> iota(0)
[0, 1, 2, ...]
>>> iota(0, 5)
[0, 1, 2, 3, 4]
>>> iota(beg, end)
[beg, beg + 1, beg + 2, ..., end - 1]
```
(Note that `B` and `E` can be any type, not just integral)

- constraint: `B` is copyable and `weakly_incrementable` (support pre/postfix `++` and have difference type) and `E` is `semiregular` (copyable and default initializable).
Also, `beg == end`, `beg != end` (and reverse) are valid.
- reference: `B` (prvalue range!)
- category:
  - if `B` is advanceable (`beg += n`, `beg -= n`, `beg + n`, `n + beg`, `beg - n`, `beg - beg` are all valid, and `B` is totally ordered), random access.
  - otherwise, if `B` is decrementable (support pre/postfix `--`), bidirectional
  - otherwise, if `B` is `incrementable` (regular and `beg++` returns `B`), then forward
  - otherwise, input.
- common: when `B` and `E` are the same type
- sized: the range is not infinity (there is a bound provided) and either:
  - the range is common and random access, or
  - both `B` and `E` are integer-like types, or
  - `E` is a sized sentinel for `B`.
- const-iterable: always
- borrowed: always (iterator owns the current value)
- constant: always

### `views::istream<T>(in: In)`
Produce a range of `T` such that elements are read by `in >> t` (read one element per increment).
- constraint: `T` is movable and default initializable, and `In` is derived from `basic_istream`
- reference: `T&`
- category: input
- common: never (iterator are move-only, so not a C++17 input iterator anyway)
- sized: never
- const-iterable: never
- borrowed: never
- constant: never (`T` must be movable so it must not be `const`-qualified)

### `views::counted(it: It, n: N)`
This is not a real range adaptor (there is no `counted_view`). Instead, it is an adaptor that adapt the range represented as `[it, it + n)` (begin + count)
as the standard iterator-sentinel model. It adapts by construct a `std::span` or `ranges::subrange`.
- constraint: `n >= 0` and `N` must be convertible to the difference type of `It`.
- reference: same as `It`'s reference type
- category: same as `It`'s category (preserve contiguous)
- common: if `It` is at least random access
- sized: always
- const-iterable: always
- borrowed: always (`counted_iterator` owns the iterator and the count)
- constant: when `It` is a constant iterator

## Real Adaptors
### `views::all(r: [T]) -> [T]`
Still, `views::all` is a semi-range adaptor; there is no `all_view`. Essentially, `views::all(r)` is a view of all the elements in `r`,
which it done wrapping by either return `auto(r)` directly (if `r` is already a view), wrap in `ref_view` (if `r` is a lvalue),
or wrap in `owning_view` otherwise. Therefore, all of `views::all(r)`'s range properties are exactly identical to that of `r`'s.

### `views::filter(r: [T], f: T -> bool) -> [T]`
Produce a new range that only preserve elements of `r` that let `f(e)` evaluate to `true`.
```python
>>> filter([1, 2, 3, 4], e => e % 2 == 0)
[2, 4]
```
- constraint: `F` is copy-constructible, an object type, and is invocable by `T` and `value_type&`, and return a value that is contextually convertible to `bool`
- reference: `T`
- category: at most bidirectional
- common: when `r` is common
- sized: never
- const-iterable: never
- borrowed: never
- constant: when `r` is constant

### `views::transform(r: [T], f: T -> U) -> [U]`
Return a new range such that each element is `f(e)` (where `e` is each element in `r`). Commonly called `map` in other languages.
```python
>>> transform(["aa", "bb", "cc", "dd"], e => e[0])
['a', 'b', 'c', 'd']
```
- constraint: `F` is move-constructible, an object type, and is invocable by `T`
- reference: `U`
- category: at most random access
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable and `f` is const-invocable
- borrowed: never
- constant: when `U` is a value of non-class type (like prvalue range of `int`) or a const reference (l/rvalue both applies)

### `views::take(r: [T], n: N) -> [T]`
Produce a new range consists of the first `n` elements of `r`. If `r` has less than `n` elements, contains all of `r`'s elements.
```python
>>> take([1, 2, 3, 4], 2)
[1, 2]
>>> take([1, 2, 3, 4], 8)
[1, 2, 3, 4]
```
Note that `views::take` will produce `r`'s type whenever possible (for example, `empty_view` passed in will return an `empty_view`).
- constraint: `N` is convertible to `r`'s difference type
- reference: `T`
- category: same as `r` (preserve contiguous)
- common: when `r` is sized and random access
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::take_while(r: [T], f: T -> bool) -> [T]`
Produce a new range that includes all the element of `r` that makes `f(e)` evaluates to `true` until it first evaluates to `false`.
(i.e. filter but stop when first `false`)
```python
>>> take_while([1, 2, 3, 1, 2, 3], e => e < 3)
[1, 2]
```
- constraint: `F` is an object type and is const-invocable by `T` and `value_type&`, and return a value that is contextually convertible to `bool`
- reference: `T`
- category: same as `r` (preserve contiguous)
- common: never (`begin()` must return an iterator-to-`r`, so `end()` cannot reuse that iterator type)
- sized: never
- const-iterable: when `r` is const-iterable and `f` is const-invocable by the reference and lvalue of value type of `as_const(r)`
- borrowed: never
- constant: when `r` is constant

### `views::drop(r: [T], n: N) -> [T]`
Produce a new range consists of the all but the first `n` elements of `r`. If `r` has less than `n` elements, produce an empty range.
```python
>>> drop([1, 2, 3, 4], 2)
[3, 4]
>>> drop([1, 2, 3, 4], 8)
[]
```
Note that `views::drop` will produce `r`'s type whenever possible (for example, `empty_view` passed in will return an `empty_view`).
- constraint: `N` is convertible to `r`'s difference type
- reference: `T`
- category: same as `r` (preserve contiguous)
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::drop_while(r: [T], f: T -> bool) -> [T]`
Produce a new range that excludes the element of `r` until the first element that makes `f(e)` evaluates to `false`.
(i.e. drop but stop when first `false`)
```python
>>> drop_while([1, 2, 3, 1, 2, 3], e => e < 3)
[3, 1, 2, 3]
```
- constraint: `F` is an object type and is const-invocable by `T` and `value_type&`, and return a value that is contextually convertible to `bool`
- reference: `T`
- category: same as `r` (preserve contiguous)
- common: when `r` is common
- sized: when `R`'s sentinel is a sized sentinel for `R`'s iterator (note that in common case this requires common & random access range, but not necessarily; the requirement is `s - i` and `i - s` are valid and return the difference type)
- const-iterable: never
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::join(r: [[T]]) -> [T]`
Join together a range of several range-of-`T`s into a single range-of-`T`. Commonly called `flatten` in other languages.
```python
>>> join([[1, 2], [3], [4, 5, 6]])
[1, 2, 3, 4, 5, 6]
```
- constraint: `R` and `R`'s reference type (`[T]`) are both input ranges
- reference: `T`
- category:
  - If `r` is a range of glvalue ranges, then at most bidirectional based on inner range's category
  - Otherwise (range of prvalue ranges), input
- common: when both `R` and inner range is forward and common, and `r` is a range of glvalue ranges
- sized: never
- const-iterable: when `r` is const-iterable and `const R` have a reference type of real reference (not a prvalue/proxy range)
- borrowed: never
- constant: when inner range is constant

### `views::lazy_split(r: [T], p: T | [T]) -> [[T]]`
(The fixed version after C++20 DR [P2210R2](https://wg21.link/P2210R2))
Produce a range that splits a range of `T` into a range of several range-of-`T`s based on delimeter (which can be a single element or a continuous subrange).
```python
>>> lazy_split("a bc def", ' ')
["a", "bc", "def"]
>>> lazy_split("a||b|c||d", "||")
["a", "b|c", "d"]
>>> lazy_split("abcd", "")  # when size = 0, just split at every element
["a", "b", "c", "d"]
```
Note that `lazy_split` is maximally lazy, it will never touch any element until you increment to the element (i.e. will not compute any "next pattern position"),
and thus support input ranges. However, the tradeoff is that the resulting inner range can only be at most forward, as you don't really know you are at the end until you increment here.
- constraint: `p` is either a forward range or convertible to the value type of `R`. Also, when `r` is only an input range, `p` must be a sized range with size 0 or 1 (nothing or a single element).
(The reference type and lvalues of values of `P` and `R` also must be inter-comparable)
- reference: `[T]` (a range of the reference type `T`)
- category: both outer range and inner range is at most forward based on `R`'s category (for a stronger inner range, see `views::split`)
- common: outer range when `r` is forward and common, inner range never
- sized: never (both outer and inner range)
- const-iterable: outer range when `r` is const-iterable and both `R` and `const R` are forward ranges; inner range always
- borrowed: never (both outer and inner range)
- constant: outer range never, inner range when `r` is constant

### `views::split(r: [T], p: T | [T]) -> [[T]]`
(The fixed version after C++20 DR [P2210R2](https://wg21.link/P2210R2))
Produce a range that splits a range of `T` into a range of several range-of-`T`s based on delimeter (which can be a single element or a continuous subrange).
```python
>>> split("a bc def", ' ')
["a", "bc", "def"]
>>> split("a||b|c||d", "||")
["a", "b|c", "d"]
>>> split("abcd", "")  # when size = 0, just split at every element
["a", "b", "c", "d"]
```
`split` is still lazy, but it eagerly computes the start of next subrange when iterating, thus does not support input range but allow subrange to be at most contiguous.
(Since input range is rare and most string algorithm require more than forward range, this should be used in most times)
- constraint: `r` must be a forward range (for splitting input range, use `lazy_split`), `p` is either a forward range or convertible to the value type of `R`.
(The reference type and lvalues of values of `P` and `R` also must be inter-comparable)
- reference: `[T]` (specifically, the reference type is precisely `ranges::subrange<iterator_t<R>>`)
- category: outer range forward, inner range same as `r` (preserve contiguous)
- common: outer range when `r` is common, inner range always
- sized: outer range never, inner range when `r` is random access
- const-iterable: outer range never, inner range when `r` is const-iterable
- borrowed: never (both outer and inner range)
- constant: outer range never, inner range when `r` is constant

### `views::common(r: [T]) -> [T]`
Produce a range with same element as in `r`, but ensure that the result is a common range.
(Basically exists as a compatibility layer so that pre-C++20 iterator-pair algorithms can use C++20 ranges)
- constraint: iterators of `R` must be copyable
- category: if `r` is common or both random access and sized, then same as `r` (preserve contiguous); otherwise at most forward
- common: always
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::reverse(r: [T]) -> [T]`
Produce a range that contains the reverse of the elements in `r`.
```python
>>> reverse([1, 2, 3])
[3, 2, 1]
```
Note that the reverse of `reverse_view` is simply the base range itself, and `subrange` passed-in will return `subrange` too.
- constraint: `r` is at least bidirectional
- category: at most random access
- common: always
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable and `const R` is common
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::elements<N: size_t>(r: [(T1, T2, ..., TN)]) -> [TI]`
Produce a range consists of the `I`-th element of each element (which are tuples).
`views::keys` is equivalent to `views::element<0>`, and `views::values` is equivalent to `views::element<1>`.
```python
>>> r = [("A", 1), ("B", 2)]
>>> elements<1>(r)  # or values(r)
[1, 2]
>>> keys(r)  # or elements<0>(r)
["A", "B"]
```
- constraint: `r`'s reference type `T = (T1, T2, ..., TN)` (minus reference) and value type are [tuple-like](https://wg21.link/P2165) types with size larger than `I`,
and either `T` is a true reference (not prvalue/proxy range), or the `I`-th type in the tuple is move constructible.
- reference: `TI` (the return type of `std::get<I>(e)` where `e` is an element of `r`), with `R`'s cvref qualifier copied onto
- category: at most random access
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant (?)

## Other Standard Views
(`std::initializer_list<T>` is technically a view, but it does not model `ranges::view`.)

### `std::basic_string_view<charT, traits>`
A lightweight view of a constant contiguous sequence of `charT`s (i.e. a string). Can view `const charT*`, `std::basic_string`, and many more.
- constraint: `charT` must be char-like (non-array trivial standard-layout type), and `traits` must be a character trait
- reference: `charT&`
- category: contiguous
- common: always
- sized: always
- const-iterable: always
- borrowed: always
- constant: always

### `std::span<T[, extent: size_t]>`
A lightweight view of a contiguous sequence of `T`s). Can view `T*`, so a replacement of traditional `T*` + length idiom.
A `span<T>` is by default with dynamic extent, and `span<T, extent>` is a view of fixed size.
- constraint: `T` must be a complete object type that is not abstract.
- reference: `T&`
- category: contiguous
- common: always
- sized: always
- const-iterable: always
- borrowed: always
- constant: when `T` is `const`-qualified

# C++23 Range Adaptors
These are the range adaptors available in C++23 CD. As C++23 is already in feature-freeze mode, it is highly likely
that this will be the set of range adaptors we actually get in C++23.

## Factories
### `views::zip(r1: [T1], r2: [T2], ...) -> [(T1, T2, ...)]`
Produce a new range that is `r1`, `r2`, ... zipped together; i.e. a range of tuple of each corresponding elements in each of the argument ranges.
```python
>>> zip([1, 2, 3], [4, 5, 6])
[(1, 4), (2, 5), (3, 6)]
>>> zip([1, 2], ["A", "B"], [1.0, 2.0])
[(1, "A", 1.0), (2, "B", 2.0)]
>>> zip()
[]  # empty view with type tuple<>
```
- constraint: all the ranges are input
- reference: `tuple<T1, T2, ...>` (note that `TI` is the reference type, and also note that the value type of `zip_view` is `tuple<range_value_t<R1>, ...>` so it is **not** the reference type minus reference)
- category: the weakest category in all of `r1, r2, ...`, and also at most random access
- common: when either of following is true:
  - there is only one range (`zip(r)`) and this range is common, or
  - the `zip_view` is not bidirectional (i.e. at most forward), and all of `r1, r2, ...` are common, or
  - all of `r1, r2, ...` are both random access and sized
- sized: when all of `r1, r2, ...` are sized
- const-iterable: when all of `r1, r2, ...` are const-iterable
- borrowed: when all of `r1, r2, ...` are borrowed
- constant: when all of `r1, r2, ...` are constant

### `views::zip_transform(f: (T1, T2, ...) -> U, r1: [T1], r2: [T2], ...) -> [U]`
Produce a new range in which each element is `f(e1, e2, ...)` where `e1`, `e2` is the corresponding element of `r1`, `r2`, ... respectfully.
```python
>>> zip_transform(f, [1, 2, 3], [4, 5, 6])
[f(1, 4), f(2, 5), f(3, 6)]
>>> zip_transform((a, b, c) => to_string(a) + b + to_string(c), [1, 2], ["A", "B"], [1.0, 2.0])
["1A1.0", "2B2.0"]
>>> zip_transform(f)
[]  # empty view with the type of result of f()
```
- constraint: `F` is move constructible and is an object type, is invocable by `T1, T2, ...`, and all the ranges are input
- reference: `U`
- category: if `f(e1, e2, ...)` does not return a lvalue reference, input; otherwise the weakest category in all of `r1, r2, ...`, and also at most random access
- common: when `zip(r1, r2, ...)` is common
- sized: when all of `r1, r2, ...` are sized
- const-iterable: when all of `r1, r2, ...` are const-iterable and `f` is const-invocable
- borrowed: never
- constant: when the result of `f(e1, e2, ...)` is a non-class or `std::tuple` (pr)value, or when it returns a constant reference

### `views::cartesian_product(r1: [T1], r2: [T2], ...) -> [(T1, T2, ...)]`
Produce a new range that is `r1`, `r2`, ... cartesian producted together; i.e. a range of tuple of every possible pair of elements in each of the argument ranges.
```python
>>> cartesian_product([1, 2, 3], [4, 5, 6])
[(1, 4), (1, 5), (1, 6), (2, 4), (2, 5), (2, 6), (3, 4), (3, 5), (3, 6)]
>>> cartesian_product([1, 2], ["A", "B"], [1.0, 2.0])
[(1, "A", 1.0), (1, "A", 2.0), (1, "B", 1.0), (1, "B", 2.0),
 (2, "A", 1.0), (2, "A", 2.0), (2, "B", 1.0), (2, "B", 2.0)]
>>> cartesian_product()
[()]  # views::single(std::tuple<>{})
```
- constraint: all of `r2, r3, ...` (all ranges except the first one) are forward
- reference: `tuple<T1, T2, ...>` (note that `TI` is the reference type, and also note that the value type of `zip_view` is `tuple<range_value_t<R1>, ...>` so it is **not** the reference type minus reference)
- category:
  - if the first range `r1` is random access, and all other ranges are both random access and sized, then random access
  - otherwise, if the first range `r1` is bidirectional, and all other ranges are either both bidirectional and common, or both random access and sized, then bidirectional
  - otherwise, if the first range `r1` is forward, then forward
  - otherwise, input
- common: when `r1` is common, or is both sized and random access
- sized: when all of `r1, r2, ...` are sized
- const-iterable: when all of `r1, r2, ...` are const-iterable
- borrowed: never
- constant: when all of `r1, r2, ...` are constant

### `views::repeat(t: T[, n: N]) -> [T]`
Produce a range that repeats the same value `t` either infinitely (when there is only one argument), or for `n` times.
```python
>>> repeat(2)
[2, 2, 2, ...]
>>> repeat(2, 5)
[2, 2, 2, 2, 2]
```
- constraint: `T` is move constructible and is an object type; `N` (if provided) is a semiregular integer-like type
- reference: `const T&`
- category: random access
- common: when the resulting range is not infinite (i.e. when `n` is provided)
- sized: when the resulting range is not infinite (i.e. when `n` is provided)
- const-iterable: always
- borrowed: never
- constant: always

## Real Adaptors
### `as_rvalue`
### `join_with`
### `as_const`
### `views::adjacent<N: size_t>(r: [T]) -> [(T, T, ...)]`
Produce a new range where each elements is a tuple of the next consecutive `N` elements. `pairwise` is an alias for `adjacent<2>`.
If `r` has less than `N` elements, the resulting range is empty.
```python
>>> adjacent<4>([1, 2, 3, 4, 5, 6])
[(1, 2, 3, 4), (2, 3, 4, 5), (3, 4, 5, 6)]
>>> pairwise(["A", "B", "C"])  # or adjacent<2>
[("A", "B"), ("B", "C")]
>>> adjacent<7>([1, 2, 3])
[]  # empty view with type tuple<int&, int&, ...> (repeat 7 times)
>>> adjacent<0>([1, 2, 3, 4, 5, 6])
[]  # empty view with type tuple<>
```
- constraint: `r` is a forward range and `N > 0`
- reference: `tuple<T, T, ...>` (repeat `N` times, note that `T` is the reference type of `r`, and value_type is `range_value_t<R>` repeat `N` times)
- category: at most random access
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::adjacent_transform<N: size_t>(f: (T, T, ...) -> U, r: [T]) -> [U]`
Produce a new range where each elements is the result of `f(e1, e2, ...)`, where `e1, e2, ...` are the next consecutive `N` elements. `pairwise_transform` is an alias for `adjacent_transform<2>`.
If `r` has less than `N` elements, the resulting range is empty.
```python
>>> adjacent_transform<4>(f, [1, 2, 3, 4, 5, 6])
[f(1, 2, 3, 4), f(2, 3, 4, 5), f(3, 4, 5, 6)]
>>> adjacent_transform<4>((a, b, c, d) => a + b + c + d, [1, 2, 3, 4, 5, 6])
[10, 14, 18]
>>> pairwise_transform((a, b) => a + b, ["A", "B", "C"])  # or adjacent_transform<2>
["AB", "BC"]
>>> adjacent_transform<0>(f, [1, 2, 3, 4, 5, 6])
[]  # empty view with type of the result of f()
```
- constraint: `r` is a forward range, `N > 0`, `F` is move constructible and is an object type, and invocable by `T, T, ...` (repeat `N` times)
- reference: `U`
- category: if `f(e1, e2, ...)` does not return a lvalue reference, then input; otherwise at most random access
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable and `f` is const-invocable
- borrowed: never
- constant: when the result of `f(e1, e2, ...)` is a non-class or `std::tuple` (pr)value, or when it returns a constant reference

### `chunk`
### `slide`
### `chunk_by`
### `stride`

# C++26 Range Adaptors
## Factories
### `concat`

## Real Adaptors
### `enumerate`

