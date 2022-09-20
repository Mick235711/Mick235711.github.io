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

