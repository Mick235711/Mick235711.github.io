---
title: Fun With Deducing This, SMFs and <code>= delete</code>
categories:
- C++
- Language
- Operator Overloading
- Implementation Divergence
---

[Deducing This](https://wg21.link/P0847) is a new way of writing C++ member functions, which was introduced in C++23. This feature allows you to explicitly write the normally-implicit object argument (aka `this`) in the argument list, just like Python's `self` argument:
```cpp
struct S
{
    int value;
    void fun(int r) { value = r; } // normal member
    void fun2(this const S& self, int r) { self.value = r; } // deducing this
};

S s;
s.fun(4);
s.fun2(5); // usage is the same
```
As you can see, the syntax for DT is to prepend `this` on the first argument, which will be treated as the object argument that appears before `.` or `->`. This is essentially a weakened form of Uniform Function-Call Syntax (UFCS), since DT essentially allows specifically-marked static non-member functions (as implemented behind the scenes) to be called with the member syntax.

However, this post's purpose is not to explore the detail of Deducing This. Instead, it tries to answer a seemingly obvious question: can we write special member functions (SMFs) with Deducing This? If so, can they be `= default`ed? This simple question have surprisingly non-trivial answers and incites several compiler bugs and inconsistent behavior across the board!

# Terminology

Before we explore the interaction between Deducing This and SMFs, we must first clarify an often misunderstood term: what counts as special member functions?

## Special Member Functions

## `= default`
