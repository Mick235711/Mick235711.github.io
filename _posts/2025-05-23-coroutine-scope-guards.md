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

# Bare Bones

Let's have an awaitable type that implements the Coroutine framework:
```cpp
template<class Resource>
class context
{
public:
    class promise_type;

    context(const context&) = delete;
    context(context&& other) noexcept
        : coroutine_{std::exchange(other.coroutine_, {})}
    {}
    context& operator=(this context& self, context other) noexcept
    {
        std::ranges::swap(self.coroutine_, other.coroutine_);
        return self;
    }

    ~context()
    {
        if (coroutine_ && !coroutine_.done()) coroutine_.resume();
    }

private:
    std::coroutine_handle<promise_type> coroutine_ = nullptr;

    explicit context(std::coroutine_handle<promise_type> coro)
        : coroutine_{coro}
    {}
};
```
Normal stuff, a move-only type that holds a coroutine handle to the promise type. One thing to note here is that the destructor need to resume the coroutine, since we want the cleanup code to run on destruction of the `context` object.

Now entering the promise type, which contains a pointer to the managed resource, and embedding a noop final awaiter:
```cpp
template<class Resource>
class context<Resource>::promise_type
{
public:
    friend class context;

    context get_return_object(this promise_type& self) noexcept
    {
        return context{std::coroutine_handle<promise_type>::from_promise(self)};
    }

    static std::suspend_never initial_suspend() noexcept { return {}; }
    static std::suspend_never final_suspend() noexcept { return {}; }

    std::suspend_always yield_value(this promise_type& self, const Resource& val) noexcept
    {
        self.value_ = std::addressof(val);
        return {};
    }

    void await_transform() = delete;

    static void return_void() noexcept {}
    static void unhandled_exception() { throw; }

private:
    const Resource* value_ = nullptr;
};
```
Notice that `initial_suspend` returns `suspend_never`, since we want the initialization code to run immediately after the construction of the `context` object. Finally, some convenience method that access the stored value from the context:
```cpp
const Resource& operator*(this const context& self)
{
    return *self.coroutine_.promise().value_;
}
const Resource& get(this const context& self) { return *self; }
const Resource* operator->(this const context& self) { return &*self; }
```
With that, we have a working context manager:
```cpp
// NOTE: pass-by-value to avoid coroutine dangling the reference
context<FILE*> open_file(std::string file_name)
{
    auto fp = fopen(file_name.c_str(), "r");
    std::println("Opened file: {}", file_name);
    co_yield fp;
    fclose(fp);
    std::println("Closed file: {}", file_name);
}

void use()
{
    std::println("Entering block");
    {
        auto context = open_file("/tmp/test.txt");
        auto fp = *context;
        std::println("Get file fd: {}", fileno(fp));
    }
    std::println("Exiting block");
}
```
Calling `use()` outputs:
```
Entering block
Opened file: /tmp/test.txt
Get file fd: 3
Closed file: /tmp/test.txt
Exiting block
```
Great! We now have a way to bundle the initialization and cleanup code neatly in a function together.

# Error Handling
Of course, the above bare bones implementation ignores a lot of errors that might occur:
- What will happen if the initialization code throws an exception or `co_return`s early?
- What will happen if the cleanup code throws an exception?
- What will happen if the code `co_yield`s zero times or more than one times?

# Recursive Awaitable
The `get()`/`operator*` is still a pain to write; can we do better with `co_await`ing the `context`?

