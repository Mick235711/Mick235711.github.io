---
title: Range Properties of the Standard Range Adaptors
categories:
- C++
- Library
- Ranges
---

In this post, "range adaptors" refer to both range factories (algorithm that produce range, can only be the starting point of a pipeline, like `views::single`)
and (real) range adaptors (algorithm that takes a range and return an adapted range, like `views::filter`).
In C++20 standard, following the adoption of Ranges TS, the standard adopted 17 range adaptors:
- 5 factories: `empty`, `single`, `iota`, `istream`, `counted`
- 12 (real) adaptors: `all`, `filter`, `transform`, `take`, `take_while`, `drop`, `drop_while`, `join`, `split`, `common`, `reverse`, `elements` (`keys`/`values` are aliases)

Of course, this is only a small subset of what is provided in range-v3 (over 100 adaptors). C++23 greatly expanded range support in multiple ways, including the addition of 14 more adaptors:
- 4 new factories: `zip`, `zip_transform`, `cartesian_product`, `repeat`
- 10 new (real) adaptors: `as_rvalue`, `join_with`, `lazy_split`, `as_const`, `adjacent`, `adjacent_transform` (`pairwise` are aliases), `chunk`, `slide`, `chunk_by`, `stride`

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
- constraint: `T` is an object type.
- reference: `T&`
- common: always
- sized: always (0)
- const-iterable: always
- borrowed: always
- constant: when `T` is `const`-qualified.

### `views::iota(beg[, end])`

### `views::istream<T>(in)`

### `views::counted(it, n)`
