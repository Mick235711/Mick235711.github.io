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

# Recursive Awaitable
The `get()`/`operator*` is still a pain to write; can we do better with `co_await`ing the `context`?

On face value, it may seem impossible, since we essentially need to *reverse* what `co_await` usually do. Usually, we use `co_await` to *await* the finish of some async operations in the *inner* function; but here, we want to execute the inner function first, and then await for the *outer* function to finish, and finally run the rest of the inner function. It is like doing a `co_await` from the inner function to the outside.

Fortunately, C++20 Coroutines provides enough customization point to implement this reverse behavior. However, it is just factually impossible to execute the cleanup code at the end of the current block, as there is nothing to RAII on (the result of `co_await` expression will be the resource itself for convenience). Thus, we need to execute the cleanup code (rest of the inner function) at the final suspension point of the outer function.

Let's start by writing an awaiter:
```cpp
awaiter context::operator co_await(this context&& self) noexcept
{
    self.resume_ = false;
    return awaiter{self.coroutine_};
}

template<class Resource>
class context<Resource>::awaiter
{
public:
    friend class context;

    static bool await_ready() noexcept { return true; }
    static void await_suspend(std::coroutine_handle<>) noexcept {}
    const Resource& await_resume(this awaiter& self) noexcept
    {
        return *self.coroutine_.promise().value_;
    }

private:
    std::coroutine_handle<promise_type> coroutine_ = nullptr;

    explicit awaiter(std::coroutine_handle<promise_type> coro)
        : coroutine_{coro}
    {}
};
```
Nothing fancy here, just a normal awaiter storing the inner coroutine handle, and `await_resume()` returns the stored value inside the inner coroutine handle's promise type. This value will then be used as the result of the `co_await` expression, eliminating the need for `operator*`/`get()`. We don't need to do anything during suspension, so just let `await_ready()` return `true` to skip the suspension phase is ideal.

To use `co_await`, we still need an outer task type, which need to coordinate with the awaiter to store the inner coroutine handle:
```cpp
class context_task
{
public:
    class promise_type
    {
    private:
        struct final_awaiter
        {
            static bool await_ready() noexcept { return false; }
            template <class Promise>
            static std::coroutine_handle<> await_suspend(std::coroutine_handle<Promise> coro) noexcept
            {
                // Symmetric transfer into the stored inner coroutine
                auto cont = coro.promise().continuation_;
                if (cont) return cont;
                return std::noop_coroutine();
            }
            static void await_resume() noexcept {}
        };

    public:
        context_task get_return_object(this promise_type& self) noexcept
        {
            return context_task{std::coroutine_handle<promise_type>::from_promise(self)};
        }
        static std::suspend_never initial_suspend() noexcept { return {}; }
        static final_awaiter final_suspend() noexcept { return {}; }
        static void return_void() noexcept {}
        static void unhandled_exception() { throw; }

        template<typename Resource>
        context<Resource>&& await_transform(this promise_type& self, context<Resource>&& ctx) noexcept
        {
            self.continuation_ = ctx.coroutine_;
            return std::move(ctx);
        }

    private:
        std::coroutine_handle<> continuation_ = nullptr;
    };

    context_task(const context_task&) = delete;
    context_task(context_task&& other) noexcept
        : coroutine_{std::exchange(other.coroutine_, {})}
    {}
    context_task& operator=(this context_task& self, context_task other) noexcept
    {
        std::ranges::swap(self.coroutine_, other.coroutine_);
        return self;
    }

    ~context_task()
    {
        if (coroutine_) coroutine_.destroy();
    }

private:
    std::coroutine_handle<promise_type> coroutine_ = nullptr;

    explicit context_task(std::coroutine_handle<promise_type> coro)
        : coroutine_{coro}
    {}
};
```
Several things are notable for this outer task type. Apart from the normal move operation, destructor, and coroutine handle business that we see in every coroutine types, we also wrote a custom `final_awaiter` to execute cleanup at the final suspension point, whose `await_suspend` method will utilize [symmetric transfer](https://lewissbaker.github.io/2020/05/11/understanding_symmetric_transfer) to cheaply transfer to the inner coroutine to execute the cleanup code. This inner coroutine's handle is stored during the `await_transform` call inside the `operator co_await` machinery.

With this new task type, we can use the context manager without needing to `get()` anything:
```cpp
my::context_task use2()
{
    std::println("Entering block 2");
    {
        auto fp = co_await open_file("/tmp/test.txt");
        std::println("Get file fd: {}", fileno(fp));
    }
    std::println("Exiting block 2");
}

/*
Output:
Entering block 2
Opened file: /tmp/test.txt
Get file fd: 3
Exiting block 2
Closed file: /tmp/test.txt
*/
```
Here, `fp` is already our stored resource type, neat! (Notice that the file is only closed after `use2()` finishes, not at the end of the `fp` scope; but this is acceptable for most usages.)

# Error Handling
Of course, the above bare bones implementation ignores a lot of errors that might occur:
- What will happen if the initialization code throws an exception or `co_return`s early?
- What will happen if the cleanup code throws an exception?
- What will happen if the code `co_yield`s zero times or more than one times?

### Premature Return
Our current code does not handle premature return at all; calling `co_return` without doing any yielding will instantly crash the code.

### Exception Handling
When exception occurs in the initialization part, it is fine; `throw;` inside the `uncaught_exception()` function will propagate that exception to the caller, who can handle it normally. The interesting case is when the cleanup portion throws an exception:
- For the normal RAII case, exception is throw in `context`'s destructor (because that's where the inner coroutine is resumed), which will normally results in `std::terminate`. To fix this you need to add `noexcept(false)` to the destructor, and then you can handle the exception as if it is thrown at the end of the resource block.
- For the recursive await case, you can just handle the exception as if it is thrown at the closing brace of the outer function. This does mean that you need to handle it at the caller of the outer function.

### Multiple Yields
Our current code also does not handle multiple `co_yield`s; everything after the second `co_yield` will be ignored as the coroutine handle will be destroyed after the second suspension (which is treated as final suspension, regardless of whether it really is final suspension).

# Performance
Well, there is no escape. This is C++, we care about performance. (If you don't, shouldn't you be down the road where there is a language that have this functionality built-in?)

