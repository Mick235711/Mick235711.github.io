---
title: Coroutine-Based Scope Guards
categories:
- C++
- Library
- Coroutine
---

The Python standard library provides a lot of convenience things, among which one is `contextlib.contextmanager`, a decorator that allows turning any coroutine generator into a resource:
```python
from contextlib import contextmanager

@contextmanager
def open_file(filename, mode="r"):
    fp = open(filename, mode)
    try:
        yield fp
    finally:
        fp.close()

with open_file("test.txt") as fp:
    fp.write("Hello World!")
```
Anything before `yield` will be treated as `__enter__`, and anything after `yield` will be treated as `__exit__`, and with the help of `finally` we implemented an always-called cleanup block regardless of the exit method (normally or by exception).

In C++, we have RAII, which we can use to implement a scope guard:
```cpp
template<typename F>
struct scope_guard
{
    F f;
    scope_guard(F f) :f{f} {}
    ~scope_guard() { f(); }
};

{
    auto fp = fopen("test.txt", "r");
    scope_guard _ = [fp] { fclose(fp); };
    // ... use fp ...
}
```
However, this requires a separation between entry and exit block, which seems less than ideal. In the Python example, the initialization and cleanup phases are nicely grouped together. Let's see if we can do the same thing in C++.

