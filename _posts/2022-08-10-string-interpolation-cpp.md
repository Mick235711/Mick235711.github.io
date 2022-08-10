---
title: "String Interpolation For C++: Going Down The Rabbit Hole"
categories:
- C++
- Language
- Mass Survey
feature_image: "/upload/iceberg.jpg"
---

Recently, EWG reviewed [P1819R0 Interpolated String Literal](https://wg21.link/P1819R0), igniting
a new round of discussion on the possibility of adding string interpolation into C++. The review results
were quite split, and a lot of contentious issues were polled with no consensus in either direction.
Therefore, I want to write a post about all the subtle issues in the idea, and conduct a survey on
how existing languages handle the issue, to try to converge on an agreed way for C++ to go forward.
This is not a proposal, on its own, but may form as a base reading material for future revisions of
P1819 or other proposals.

## Motivation
### What is string interpolation?
The term "string interpolation", at least in this post, refers solely to the feature that allow
you to put placeholders inside a string literals, which are replaced with values when evaluating.
For example, in Python:
```python
apple = 4
print(f"I have {apple} apples.")  # Output: I have 4 apples.
```
Note that in some setting, string interpolation can have an extended meaning in which feature
like string concatenation (possibly with `1 + " apple"`-like autoboxing) and formatting
(`std::format` and `str.format`) being included; in this post I want to restrain the term
to the most strict meaning.

### Why?
Every EWG and LEWG direction poll are worded very interestingly:
> Given our time is limited, and our resources are scarce, EWG encourages further work in the direction of PXXXX?

Intentionally, WG21 groups are using these kind of wording to encourage turning down new proposals, as we must be
very caution to add new feature into the already-complex-enough-language-mess that is C++.
