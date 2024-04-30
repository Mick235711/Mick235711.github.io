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

Of course, this is only a small subset of what is provided in range-v3 (over 100 adaptors). C++23 greatly expanded range support in multiple ways, including the addition of 14 more adaptors:
- 4 new factories: `zip`, `zip_transform`, `cartesian_product`, `repeat`
- 10 new (real) adaptors: `as_rvalue`, `join_with`, `as_const`, `enumerate`, `adjacent`, `adjacent_transform` (`pairwise` are aliases), `chunk`, `slide`, `chunk_by`, `stride`

and C++26 is expected to provide even more (`concat` and `maybe` being the most expected ones).

Each adaptor has its own use case, feature, and limitations. Especially, each adaptors has its own accepted range properties, and the output range's properties also differ.
These properties limitations are often not documented, in standard or elsewhere, making determine those properties a pain.
Therefore, this post serves as an expansion upon [the excellent post by Barry Revzin](https://brevzin.github.io/c++/2021/02/28/ranges-reference/), adding more range adaptors and
adding more properties so that the reference is more complete.

This post still follows the same convention set in the above linked post (`W w` meaning type and value, `[T]` means range with refernece type `T`, `(A, B)` means `tuple<A, B>`, `A -> B` means function taking `A` and returning `B`),
and the properties surveyed are the original ones (reference, category, common, sized, const-iterable, borrowed) plus an additional one:
constant (also, value type is included for convenience). A range being a constant range simply means that its iterator are constant iterator, i.e. we cannot modify its elements using its iterators,
so `const vector<int>` is a constant range but `vector<int>` is not. Notice that all of those 7 categories can be detected by concepts:
- reference: `ranges::range_reference_t<R>`
- value type: `ranges::range_value_t<R>`
- category: `ranges::input_range<R>` to `ranges::contiguous_range<R>`
- common: `ranges::common_range<R>`
- sized: `ranges::sized_range<R>`
- const-iterable: `ranges::range<const R>`
- borrowed: `ranges::borrowed_range<R>`
- constant: `ranges::constant_range<R>` (C++23)

Note also that value type and reference type are two entirely different beast. Reference type is the type returned by `operator*`,
and also the type that you interact with more commonly (ranges in this post is referred to as `[T]`, where `T` is its reference type),
basically you can think reference type as the element type (it is not necessarily a language reference). Value type is often a cvr-unqualified type
that serves as "value of the same type of the element", which is commonly just reference type minus cvref qualifiers, but not necessarily (value type and reference type can be completely unrelated, as long as
they have a common reference).

All of the original descriptions and properties are copied here, credit belongs to the original author.

# C++20 Range Adaptors
## Factories
### `views::empty<T>: [T&]`
Produces an empty range of type `T`.
- constraint: `T` is an object type
- reference: `T&`
- value type: `T`
- category: contiguous
- common: always
- sized: always (0)
- const-iterable: always
- borrowed: always
- constant: when `T` is `const`-qualified

### `views::single(t: T) -> [T&]`
Produce a range that only contains a single value: `t`.
- constraint: `T` is an object type
- reference: `T&`
- value type: `T`
- category: contiguous
- common: always
- sized: always (1)
- const-iterable: always
- borrowed: never
- constant: never (`single_view<T>` is only instantiated with decayed type)

### `views::iota(beg: B[, end: E]) -> [B]`
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
- value type: `B`
- category:
  - if `B` is advanceable (`beg += n`, `beg -= n`, `beg + n`, `n + beg`, `beg - n`, `beg - beg` are all valid, and `B` is totally ordered), random access.
  - otherwise, if `B` is decrementable (support pre/postfix `--`), then bidirectional
  - otherwise, if `B` is `incrementable` (regular and `beg++` returns `B`), then forward
  - otherwise, input.
- common: when `B` and `E` are the same type
- sized: the range is not infinity (there is a bound provided) and either:
  - the range is common and random access, or
  - both `B` and `E` are integer-like types, or
  - `E` is a sized sentinel for `B`.
- const-iterable: always
- borrowed: always (iterator owns the current value)
- constant: when `B` is a non-class type (like `int`)

### `views::istream<T>(in: In) -> [T&]`
Produce a range of `T` such that elements are read by `in >> t` (read one element per increment).
- constraint: `T` is movable and default initializable, and `In` is derived from `basic_istream`
- reference: `T&`
- value type: `T`
- category: input
- common: never (iterator are move-only, so not a C++17 input iterator anyway)
- sized: never
- const-iterable: never
- borrowed: never
- constant: never (`T` must be movable so it must not be `const`-qualified)

### `views::counted(it: It, n: N) -> [*It]`
This is not a real range adaptor (there is no `counted_view`). Instead, it is an adaptor that adapt the range represented as `[it, it + n)` (begin + count)
as the standard iterator-sentinel model. It adapts by construct a `std::span` or `ranges::subrange`.
- constraint: `n >= 0` and `N` must be convertible to the difference type of `It`.
- reference: same as `It`'s reference type
- value type: same as `It`'s value type
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
- value type: same as `r`'s value type
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
- value type: `remove_cvref_t<U>`
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
- constraint: `n >= 0` and `N` is convertible to `r`'s difference type
- reference: `T`
- value type: same as `r`'s value type
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
- value type: same as `r`'s value type
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
- constraint: `n >= 0` and `N` is convertible to `r`'s difference type
- reference: `T`
- value type: same as `r`'s value type
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
- value type: same as `r`'s value type
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
- constraint: `r` and `R`'s reference type (`[T]`) are both input ranges
- reference: `T`
- value type: same as `[T]`'s value type (the value type of inner range)
- category:
  - If `r` is a range of glvalue ranges, then at most bidirectional based on inner range's category
  - Otherwise (range of prvalue ranges), input
- common: when both `r` and inner range are forward and common, and `r` is a range of glvalue ranges
- sized: never
- const-iterable: when `r` is const-iterable and is a range of glvalue ranges
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
- reference: `[T]` (`lazy_split_view::value_type`, a range with reference type `T`)
- value type: outer range same as reference, inner range same as `r`'s value type
- category: both outer range and inner range is at most forward based on `R`'s category (for a stronger inner range, see `views::split`)
- common: outer range when `r` is forward and common, inner range never
- sized: (both outer and inner range) never
- const-iterable: outer range when `r` is const-iterable and both `R` and `const R` are forward ranges; inner range always
- borrowed: (both outer and inner range) never
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
- value type: same as reference type (inner range's value type same as `r`'s)
- category: outer range forward, inner range same as `r` (preserve contiguous)
- common: outer range when `r` is common, inner range always
- sized: outer range never, inner range when `r`'s sentinel is a sized sentinel (common case is when `r` is random access)
- const-iterable: outer range never, inner range when `r` is const-iterable
- borrowed: outer range never, inner range always
- constant: outer range never, inner range when `r` is constant

### `views::common(r: [T]) -> [T]`
Produce a range with same element as in `r`, but ensure that the result is a common range.
(Basically exists as a compatibility layer so that pre-C++20 iterator-pair algorithms can use C++20 ranges)
- constraint: either `r` is common, or iterators of `R` must be copyable
- reference: `T`
- value type: same as `r`'s value type
- category: if `r` is common or both random access and sized, then same as `r` (preserve contiguous); otherwise at most forward
- common: always (this is the point of this adaptor)
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
- reference: `T`
- value type: same as `r`'s value type
- category: at most random access
- common: always
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable and `const R` is common
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::elements<I: size_t>(r: [(T1, T2, ..., TN)]) -> [TI]`
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
- value type: `remove_cvref_t<reference>`
- category: at most random access
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant (?)

## Other Standard Views
(`std::initializer_list<T>` is technically a view, but it does not model `ranges::view`.)

### `std::basic_string_view<charT[, traits[, Alloc]]>: [charT&]`
A lightweight view of a constant contiguous sequence of `charT`s (i.e. a string). Can view `const charT*`, `std::basic_string`, and many more.
- constraint: `charT` must be char-like (non-array trivial standard-layout type), and `traits` must be a character trait
- reference: `charT&`
- value type: `charT`
- category: contiguous
- common: always
- sized: always
- const-iterable: always
- borrowed: always
- constant: always

### `std::span<T[, extent: size_t]>: [T&]`
A lightweight view of a contiguous sequence of `T`s). Can view `T*`, so a replacement of traditional `T*` + length idiom.
A `span<T>` is by default with dynamic extent, and `span<T, extent>` is a view of fixed size.
- constraint: `T` must be a complete object type that is not abstract.
- reference: `T&`
- value type: `remove_cvref_t<T>`
- category: contiguous
- common: always
- sized: always
- const-iterable: always
- borrowed: always
- constant: when `T` is `const`-qualified

# C++23 Range Adaptors
These are the range adaptors available in C++23 DIS.

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
- reference: `tuple<T1, T2, ...>` (note that `TI` is the reference type)
- value type: `tuple<range_value_t<R1>, ...>` (**not** the reference type minus reference)
- category: the weakest category in all of `r1`, `r2`, ..., and also at most random access
- common: when either of following is true:
  - there is only one range (`zip(r)`) and this range is common, or
  - the `zip_view` is not bidirectional (i.e. at most forward), and all of `r1`, `r2`, ... are common, or
  - all of `r1`, `r2`, ... are both random access and sized
- sized: when all of `r1`, `r2`, ... are sized
- const-iterable: when all of `r1`, `r2`, ... are const-iterable
- borrowed: when all of `r1`, `r2`, ... are borrowed
- constant: when all of `r1`, `r2`, ... are constant

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
- value type: `remove_cvref_t<U>`
- category: if `f(e1, e2, ...)` does not return a lvalue reference, input; otherwise the weakest category in all of `r1`, `r2`, ..., and also at most random access
- common: when `zip(r1, r2, ...)` is common
- sized: when all of `r1`, `r2`, ... are sized
- const-iterable: when all of `r1`, `r2`, ... are const-iterable and `f` is const-invocable
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
- reference: `tuple<T1, T2, ...>` (note that `TI` is the reference type)
- value type: `tuple<range_value_t<R1>, ...>` (**not** the reference type minus reference)
- category:
  - if the first range `r1` is random access, and all other ranges are both random access and sized, then random access
  - otherwise, if the first range `r1` is bidirectional, and all other ranges are either both bidirectional and common, or both random access and sized, then bidirectional
  - otherwise, if the first range `r1` is forward, then forward
  - otherwise, input
- common: when `r1` is common, or is both sized and random access
- sized: when all of `r1`, `r2`, ... are sized
- const-iterable: when all of `r1`, `r2`, ... are const-iterable
- borrowed: never
- constant: when all of `r1`, `r2`, ... are constant

### `views::repeat(t: T[, n: N]) -> [const T&]`
Produce a range that repeats the same value `t` either infinitely (when there is only one argument), or for `n` times.
```python
>>> repeat(2)
[2, 2, 2, ...]
>>> repeat(2, 5)
[2, 2, 2, 2, 2]
```
- constraint: `T` is move constructible and is an object type; `N` (if provided) is a semiregular integer-like type
- reference: `const T&`
- value type: `T`
- category: random access
- common: when the resulting range is not infinite (i.e. when `n` is provided)
- sized: when the resulting range is not infinite (i.e. when `n` is provided)
- const-iterable: always
- borrowed: never
- constant: always

## Real Adaptors
### `views::as_rvalue(r: [T]) -> [T&&]`
Produce a range with same element as in `r`, but ensure that the result is a range of rvalue reference.
(Basically, did a `std::move` on each element so that you can then move every element from the view into some container or things like that)
- constraint: `r` is an input range
- reference: `range_rvalue_reference_t<R>` (which normally is the result type of `std::move(*r.begin())` so basically `T&&`, but you can customize it by `ranges::iter_move`)
- value type: same as `r`'s value type
- category: at most random access (the original intent is that `as_rvalue_view` should be input-only, but later [P2520R0](https://wg21.link/P2520R0) changed `as_rvalue_view` to now be up to random access)
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::join_with(r: [[T]], p: U | [U]) -> [common_reference_t<T, U>]`
Join together a range of several range-of-`T`s into a single range-of-`T`, with `p` inserted between each parts. This is the reverse of `views::split`.
```python
>>> join_with([[1, 2], [3], [4, 5, 6]], 3)
[1, 2, 3, 3, 3, 4, 5, 6]
>>> join_with([[1, 2], [3], [4, 5, 6]], [3, 4])
[1, 2, 3, 4, 3, 3, 4, 4, 5, 6]
```
- constraint: `r` and `R`'s reference type (`[T]`) are both input ranges, `p` is either a forward range or convertible to the value type of `R`.
(inner range and `p`'s value and reference type must also have common reference)
- reference: `common_reference_t<T, U>`
- value type: the `common_type_t` of inner range and `p`'s value type
- category:
  - If `r` is a range of prvalue ranges, then input
  - Otherwise (`r` is a range of glvalue ranges), and if `r` is bidirectional, and inner range and `p` are both bidirectional and common, then bidirectional
  - Otherwise, if `r` and inner range are both forward, then forward
  - Otherwise, input
- common: when both `r` and inner range are forward and common, and `r` is a range of glvalue ranges
- sized: never
- const-iterable: when both `r` and `p` are const-iterable and `r` is a range of glvalue ranges
- borrowed: never
- constant: when inner range and `p` are both constant

### `views::as_const(r: [T]) -> [T]`
Produce a range with same element as in `r`, but ensure that the result's element cannot be modified (i.e. a constant range).
(Basically, did a `std::as_const` on each element so that you cannot modify them, albeit with a much more complicated algorithm that avoid wrapping if at all possible by delegate to `std::as_const`)
- constraint: `r` is an input range
- reference: `range_const_reference_t<R>` (assuming `r`'s value type is just `remove_cvref_t` of its reference, then for a range of `T&`, just `const T&`; for a range of `T&&`, just `const T&&`; for a range of prvalue `T`, just `T`)
- value type: same as `r`'s value type
- category: same as `r`'s category (preserve contiguous)
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: always

### `views::enumerate(r: [T]) -> [(N, T)]`
Produce a range such that each of the original elements of `r` is accompanied by its index in `r`.
```python
>>> enumerate([1, 3, 6])
[(0, 1), (1, 3), (2, 6)]
```
(Notice that the index type `N` is `range_difference_t<R>`)
- constraint: `r` is an input range, and `T` is move constructible.
- reference: `tuple<N, T>`
- value type: `tuple<N, range_value_t<R>>` (**not** the reference type minus reference)
- category: at most random access
- common: when `r` is common and sized
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

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
- reference: `tuple<T, T, ...>` (repeat `N` times, note that `T` is the reference type of `r`)
- value type: `tuple<range_value_t<R>, ...>` (repeat `N` times, **not** the reference type minus reference)
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
- value type: `remove_cvref_t<U>`
- category: if `f(e1, e2, ...)` does not return a lvalue reference, then input; otherwise at most random access
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable and `f` is const-invocable
- borrowed: never
- constant: when the result of `f(e1, e2, ...)` is a non-class or `std::tuple` (pr)value, or when it returns a constant reference

### `views::chunk(r: [T], n: N) -> [[T]]`
Produce a new range-of-range that is the result of dividing `r` into non-overlapping `n`-sized chunks (except that last chunk can be smaller than `n`).
```python
>>> chunk([1, 2, 3, 4, 5], 2)
[[1, 2], [3, 4], [5]]
>>> chunk([1, 2, 3, 4], 8)
[[1, 2, 3, 4]]
```
- constraint: `n > 0` and `N` is convertible to `r`'s difference type
- reference: `[T]` (if `r` is forward, then actually the reference type is `ranges::subrange<iterator_t<R>>`)
- value type: same as reference type (inner range's value type same as `r`'s)
- category: outer range at most random access, inner range same as `r` (preserve contiguous)
- common: outer range when `r` is common and either both sized and bidirectional, or forward and not bidirectional; inner range when `r` is common
- sized: outer range when `r` is sized, inner range when `r`'s sentinel is a sized sentinel (common case is when `r` is random access)
- const-iterable: (both outer and inner range) when `r` is const-iterable and forward
- borrowed: outer range when `r` is borrowed and forward, inner range when `r` is forward
- constant: outer range never, inner range when `r` is constant

### `views::slide(r: [T], n: N) -> [[T]]`
Produce a new range-of-range that is the result of dividing `r` into overlapping `n`-sized chunks (basically, the `m`-th range is a view into the `m`-th through `m+n-1`-th elements of `r`).
This is similar to `views::adjacent<n>` with the difference being that `adjacent` require a compile-time size and produce range-of-tuples, while `views::slide` require a runtime size
and provide range-of-ranges.
```python
>>> slide([1, 2, 3, 4, 5], 2)
[[1, 2], [2, 3], [3, 4], [4, 5]]
>>> slide([1, 2, 3, 4], 8)
[]
```
- constraint: `r` is a forward range, `n > 0`, and `N` is convertible to `r`'s difference type
- reference: `[T]` (specifically, the reference type is precisely the result type of `views::counted(r.begin(), n)`, which is a span (when `r` is contiguous) or a `ranges::subrange` otherwise)
- value type: same as reference type (inner range's value type same as `r`'s)
- category: outer range at most random access, inner range same as `r` (preserve contiguous)
- common: outer range when `r` is common or is both random access and sized, inner range when `r` is random access
- sized: outer range when `r` is sized, inner range always
- const-iterable: outer range when `r` is const-iterable and random access and sized, inner range always
- borrowed: outer range when `r` is borrowed, inner range always
- constant: outer range never, inner range when `r` is constant

### `views::chunk_by(r: [T], f: (T, T) -> bool) -> [[T]]`
Produce a new range-of-range such that `f` is invoked on consecutive elements, and a new group is started when `f` returns `false`.
```python
>>> chunk_by([1, 2, 2, 3, 1, 2, 0, 4, 5, 2], (a, b) => a <= b)
[[1, 2, 2, 3], [1, 2], [0, 4, 5], [2]]
>>> chunk_by([1, 2, 2, 3, 1, 2, 0, 4, 5, 2], (a, b) => a >= b)
[[1], [2, 2], [3, 1], [2, 0], [4], [5, 2]]
```
- constraint: `r` is a forward range, and `f` is invocable on any combination of `T` and `r`'s value type (and return a contextually-convertible-to-`bool`)
- reference: `[T]` (specifically, the reference type is precisely `ranges::subrange<iterator_t<R>>`)
- value type: same as reference type (inner range's value type same as `r`'s)
- category: outer range at most bidirectional, inner range same as `r` (preserve contiguous)
- common: outer range when `r` is common, inner range always
- sized: outer range never, inner range when `r`'s sentinel is a sized sentinel (common case is when `r` is random access)
- const-iterable: outer range never, inner range when `r` is const-iterable
- borrowed: outer range never, inner range always
- constant: outer range never, inner range when `r` is constant

### `views::stride(r: [T], n: N) -> [T]`
Produce a new range consists of an evenly-spaced subset of `r` (with space fixed at `n`).
```python
>>> stride([1, 2, 3, 4], 2)
[1, 3]
>>> stride([1, 2, 3, 4, 5, 6, 7], 3)
[1, 4, 7]
```
- constraint: `n > 0` and `N` is convertible to `r`'s difference type
- reference: `T`
- value type: same as `r`'s value type
- category: at most random access
- common: when `r` is common and either sized or non-bidirectional
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

## Other Standard Views
### `std::generator<T[, U[, Alloc]]> : [U ? T : T&&]`
Produce a view of all the things you have `co_yield`ed in a coroutine.
```cpp
std::generator<int> ints(int start = 0) {
    while (true) co_yield start++;
}

void f() {
    std::println("{}", ints(3) | views::take(3)); // [3, 4, 5]
}
```
- constraint: if `U` is present, it is a cv-unqualified object type and `T` is either a true reference or copy constructible
- reference: if `U` is present, `T`; otherwise `T&&`
- value type: if `U` is present, `U`; otherwise `remove_cvref_t<T>`
- category: input
- common: never
- sized: never
- const-iterable: never
- borrowed: never
- constant: when `T` is a const reference

# C++26 Range Adaptors
## Factories
### `views::concat(r1: [T1], r2: [T2], ...) -> [common_reference_t<T1, T2, ...>]`
(Current design as of [P2542R8](https://wg21.link/P2542R8), already adopted for C++26.)

Produce a new range that is `r1`, `r2`, ... concated head-to-tail together; i.e. a range that starts at the first element of the first range, ends at the last element of the last range, with all
range elements sequenced in between respectively in the order of arguments.
```python
>>> concat([1, 2, 3], [4, 5, 6])
[1, 2, 3, 4, 5, 6]
>>> concat([1, 2], [3, 4], [1.0, 2.0])
[1.0, 2.0, 3.0, 4.0, 1.0, 2.0]
# concat() is ill-formed
```
- constraint: all of `T1`, `T2`, ... have a `common_reference_t`, each of which is converted to that common reference type, and all of `r1`, `r2`, ...'s value type have a `common_type_t`
- reference: `common_reference_t<T1, T2, ...>`
- value type: `common_type_t<range_value_t<R1>, ...>` (**not** the reference type minus reference)
- category:
  - if all of `r1`, `r2`, ... are random access, and all but the last range are common, then random access
  - otherwise, if all of `r1`, `r2`, ... are bidirectional, and all but the last range are common, then bidirectional
  - otherwise, if all of `r1`, `r2`, ... are forward, then forward
  - otherwise, input
- common: when the last range `rn` is common
- sized: when all of `r1`, `r2`, ... are sized
- const-iterable: when all of `r1`, `r2`, ... are const-iterable
- borrowed: never (can be made conditionally borrowed, but the space cost is too high)
- constant: when all of `r1`, `r2`, ... are constant

### `views::nullable(n: Nullable<T>) -> [T&]`

(Current design as of [P1255R12](https://wg21.link/P1255R12).)

Produce a new range of 0 or 1 element based on a nullable object.
```cpp
int* p = new int(3);
nullable(p) // [3]
int* q = nullptr;
nullable(q) // []
```

- constraint: `N` is copyable, an object type, derefencible, and contextually convertible to `bool`. (Or a `reference_wrapper` of such a type)
- reference: `T&` (the iterator type is actually `T*`)
- value type: `T`
- category: contiguous
- common: always
- sized: always
- const-iterable: always
- borrowed: when `N` is a pointer, a `reference_wrapper` or a reference
- constant: when `T` is `const`-qualified

### `views::upto(n: N) -> [N]`

(Current design as of [P3060R1](https://wg21.link/P3060R1).)

A convenient alias/alternative for `views::iota(0uz, ranges::size(r))`. Basically, produce a range of `0`, `1`, ..., `n - 1`.
```python
>>> upto(5)
[0, 1, 2, 3, 4]
```

- constraint: `N` must be an integral type
- reference: `N` (prvalue range!)
- value type: `N`
- category: random access
- common: always
- sized: always
- const-iterable: always
- borrowed: always (iterator owns the current value)
- constant: always

## Real Adaptors
### `views::to_input(r: [T]) -> [T]`

(Current design as of [P3137R0](https://wg21.link/P3137R0).)

Downgrade any range to an input, non-common range.

Useful to avoid expensive operations that many range algorithm/adaptor perform to preserve higher properties. For example:
- `views::join`'s iterator comparison need to do two base iterator comparisons (one for outer and one for inner) for common range, but only one is needed for non-common range.
- `views::chunk` have more expensive algorithm when passed with a forward range: iterating through chunk border will incur a whole pass of all the elements for forward ranges.

(Note that `views::to_input` will produce `r`'s type whenever possible)

- constraint: `r` is an input range
- reference: `T`
- value type: same as `r`'s value type
- category: input (this is the point of this adaptor)
- common: never
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::cache_latest(r: [T]) -> [T]`

(Current design as of [P3138R0](https://wg21.link/P3138R0).)

Cache the last element of any range to avoid extra work.
For example: `r | views::transform(f) | views::filter(g)` will call `f` twice for every element of `r` when iterating, because `filter` dereferences twice on each iteration. If you add `views::cache_latest` between the two adaptor, `f` will only be called once per element.

- constraint: `r` is an input range
- reference: `T&` (force lvalue reference here)
- value type: same as `r`'s value type
- category: input
- common; never
- sized: when `r` is sized
- const-iterable: never
- borrowed: never
- constant: when `r` is constant

### `views::transform_join(r: [T], f: T -> [U]) -> [U]`

(Current design as of [P3211R0](https://wg21.link/P3211R0).)

Transform the input sequence to a range-of-range, and then join all the ranges. Commonly called FlatMap in other languages. Following [P2328](https://wg21.link/P2328), this adaptor can be implemented directly as `views::join(views::transform(r, f))`, therefore `views::transform_join` is just an alias for that.
```python
>>> transform_join([0, 1, 2], x => [x, x, x])
[0, 0, 0, 1, 1, 1, 2, 2, 2]
```
- constraint: `r` and `[U]` are both input ranges, `F` is move-constructible, an object type, and is invocable by `T`
- reference: `U`
- value type: same as `[U]`'s value type (the value type of invocation result)
- category:
  - If `[U]` is a glvalue range, then at most bidirectional based on `[U]`'s category
  - Ohterwise (range of prvalue ranges), input
- common: when both `r` and `[U]` are forward and common, and `[U]` is a glvalue range
- sized: never
- const-iterable: when `r` is const-iterable and `f` is const-invocable, and `[U]` is a glvalue range
- borrowed: never
- constant: when `[U]` is constant

### `views::slice(r: [T], m: N, n: N) -> [T]`

(Current design as of [P3216R0](https://wg21.link/P3216R0).)

Produce a new range consists of the `m`-th to `n`-th (as usual, left inclusive, right exclusive) elements of `r`. If `r` has less than `n` elements, contains all the elements after the `m`-th. If `r` has less than `m` elements, produce an empty range.
```python
>>> slice([1, 2, 3, 4, 5], 1, 3)
[2, 3]
>>> slice([1, 2, 3, 4, 5], 1, 10)
[2, 3, 4, 5]
>>> slice([1, 2, 3, 4, 5], 10, 12)
[]
```
Note that `views::slice` will produce `r`'s type whenever possible (for example, `empty_view` passed in will return an `empty_view`). This is due to the fact that `views::slice(r, m, n)` is just an alias for `views::take(views::drop(r, m), n - m)`.
- constraint: `n >= m && m >= 0` and `N` is convertible to `r`'s difference type
- reference: `T`
- value type: same as `r`'s value type
- category: same as `r` (preserve contiguous)
- common: when `r` is sized and random access
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::take_exactly(r: [T], n: N) -> [T]`

(Current design as of [P3230R0](https://wg21.link/P3230R0).)

A variation of `views::take` that assumes there are at least `n` elements in `r`.
In other words, more efficient in common cases but is UB if you try to take more than length elements.
```python
>>> take_exactly([1, 2, 3, 4], 2)
[1, 2]
```
Note that `views::take_exactly` will produce `r`'s type whenever possible (for example, `empty_view` passed in will return an `empty_view`). Also note that `views::take_exactly` may downgrade infinite ranges to finite ones (`views::iota(0) | views::take_exactly(5)` is just `views::iota(0, 5)`, while `views::take` cannot preserve type when `iota_view` is not sized).
- constraint: `n >= 0 && n <= ranges::distance(r)` and `N` is convertible to `r`'s difference type
- reference: `T`
- value type: same as `r`'s value type
- category: same as `r` (preserve contiguous)
- common: when `r` is random access
- sized: always (`n`)
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::drop_exactly(r: [T], n: N) -> [T]`

(Current design as of [P3230R0](https://wg21.link/P3230R0).)

A variation of `views::drop` that assumes there are at least `n` elements in `r`.
In other words, more efficient in common cases but is UB if you try to drop more than length elements.
```python
>>> drop_exactly([1, 2, 3, 4], 2)
[3, 4]
```
Note that `views::drop_exactly` will produce `r`'s type whenever possible (for example, `empty_view` passed in will return an `empty_view`). Also note that `views::drop_exactly` may process infinite ranges better (`views::iota(0) | views::drop_exactly(5)` is just `views::iota(5)`, while `views::drop` cannot preserve type when `iota_view` is not sized).
- constraint: `n >= 0 && n <= ranges::distance(r)` and `N` is convertible to `r`'s difference type
- reference: `T`
- value type: same as `r`'s value type
- category: same as `r` (preserve contiguous)
- common: when `r` is common
- sized: when `r` is sized
- const-iterable: when `r` is const-iterable
- borrowed: when `r` is borrowed
- constant: when `r` is constant

### `views::delimit(r: [T] | It, p: U) -> [T]`


(Current design as of [P3220R0](https://wg21.link/P3220R0).)

Produce a new range that includes all the element of `r` until `p` (inclusive). Similar to `views::take_while` but using a value instead of a predicate for ending detection. Very useful in cases like importing NTBS ranges with `views::delimit(str, '\0')`.
```python
>>> delimit([1, 2, 3, 4, 5], 3)
[1, 2, 3]
>>> delimit([1, 2, 3, 4, 5], 6)
[1, 2, 3, 4, 5]
```
- constraint: `r` is an input range, and `U` is an object type and move constructible and `t == u` is well-formed for both `T` and `r`'s value type. If `r` does not model `range` (i.e. `It`), then it must be an input iterator.
- reference: `T`
- value type: same as `r`'s value type
- category: same as `r` (preserve contiguous)
- common: never (`begin()` must return an iterator-to-`r`, so `end()` cannot reuse that iterator type)
- sized: never
- const-iterable: when `r` is const-iterable and `U` is equality comparable with the reference and lvalue of value type of `as_const(r)`
- borrowed: never
- constant: when `r` is constant

