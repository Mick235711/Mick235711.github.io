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

Traditionally, special member functions refer to the functions that will be automatically declared by the compiler for a class, including:
- Default constructors
- Copy constructors
- Move constructors
- Copy assignment operators
- Move assignment operators
- Prospective destructors

*Note*: The reason that all the constructors and operators are in plural form, and destructors is prepended by "prospective", is because of C++20 Concepts. With `requires` clauses, you can have several "prospective" destructors for a class, but only one will be available at any given time to act as the "real" destructor.

These (except the default constructors) are also the functions affected by ["Rule of Five"](https://mick235711.github.io/2024/04/30/operator-overloading-guide/#the-basics-the-rule-of-three-the-rule-of-five-and-the-rule-of-zero), which describes the customs and idioms related to defining those functions for a class (refer to the linked page for more information).

Special Member Functions is a term [defined by the standard](https://eel.is/c++draft/special#1), so the definition of them seems to be crystal clear, right?

Not so fast! What is the *exact signature* required for a constructor to be considered a SMF? (For example, is the [copy-and-swap](https://mick235711.github.io/2024/04/30/operator-overloading-guide/#copy-and-swap-idiom-when-and-how) assignment operator `X& operator=(X)` considered copy assignment or move assignment?) What about default arguments? What about *template*s? Nothing is *that* simple in C++!

Let's look at each special member function in detail.

### Default Constructors and Destructors

This is the easiest case. A constructor is a default constructor if and only if:
- Each parameter that is not a pack have a default argument.

That's it! ([Standard](https://eel.is/c++draft/class.default.ctor#1)) What this means essentially is that as long as the constructor *can* be called with no arguments (`A()`), it is a default constructor.
```cpp
struct A
{
    A(); // default constructor
    A(int x = 2, int y = 3); // also a default constructor
    template<typename T = int> A(T x = 2); // also a default constructor
    template<typename... Ts> A(Ts... args); // also a default constructor
    template<typename... Ts> A(); // also a default constructor

    A(int a, int b = 2); // not a default constructor
    template<typename T> A(); // also not
};
```
(Note that the access specifier, `noexcept`, `explicit`, `requires`, or `constexpr`/`consteval` specifier will not affect whether a constructor is a SMF, same below.)

Of course, the *implicitly generated* default constructor (will be generated if no constructor is declared) always have the form:
```cpp
A() = default;
```
(the `constexpr` and `noexcept`-ness will be deduced by the member/base's default constructors; same below)

A destructor for the class is a member declared with the `~A()` syntax (with optional preceding specifier and `noexcept`/`requires`). It cannot be declared in any other form, so this is the only requirement. If no destructor and move operations is defined for a class, one will be implicitly generated with the form:
```cpp
~A() = default;
```

### Copy/Move Constructors

Copy/Move constructors are called when an object is constructed by copying/moving another object. The standard [specified](https://eel.is/c++draft/class.copy.ctor) that a constructor for class `A` will be identified as a copy/move constructor if and only if:
- It is not a template.
- Its first parameter is `[cv] A&` (for copy) / `[cv] A&&` (for move).
- All non-first parameters have default arguments.

*Note*: `[cv]` refers to any combinations of `const` and `volatile`, same below.

Again, this essentially means that the compiler will treat a constructor as SMF based on its callability with one argument, instead of its declared number of arguments.
```cpp
struct A
{
    A(const A&); // copy constructor
    A(A&); // also (used by auto_ptr<T> to indicate stole semantics)
    A(const volatile A&, int x = 2); // also

    A(A&&); // move constructor
    A(const A&&) // also (although very weird)
    A(volatile A&&, double x = 2.0); // also

    template<typename T = int>
    A(const A&); // not a copy constructor
    A(A&&, int x); // not a move constructor
};
```

If no copy constructor is defined for a class, a copy constructor will be implicitly generated with the form
```cpp
A(const A&) = default; // normal
A(A&) = default; // only if a subobject (member or base) have a copy constructor with argument [volatile] A&
```

If no copy/move operations and destructors are defined for a class, a move constructor will be implicitly generated with the form
```cpp
A(A&&) = default;
```

*Note*: a critical difference here is the criteria of implicit generation. If a move operation is declared, the copy constructor will still be generated; it will just be declared as `= delete`. However, if a copy/move operation or a destructor is declared, the move constructor will not be generated at all, falling silently back to copying.

### Copy/Move Assignment

Note that `operator=` can only be declared as a member function, so we don't need to deal with [operator overload form shenanigans](https://mick235711.github.io/2024/04/30/operator-overloading-guide/#basics-of-operator-overloading) here.

Copy/Move assignment are called when an object is assigned by lvalue/rvalue of the same type. The standard [specified](https://eel.is/c++draft/class.copy.assign) that a declared `operator=` member function for class `A` will be identified as a copy/move assignment if and only if:
- It is not a template.
- Its first **non-object** parameter is `A` or `[cv] A&` (for copy) / `[cv] A&&` (for move).

*Note*: operator overloads, except for `operator()` and `operator[]`, cannot have default arguments, so that item does not apply here.

```cpp
struct A
{
    A& operator=(const A&); // copy assignment
    A& operator=(A&); // also (used by auto_ptr<T> to indicate stole semantics)
    int operator=(const volatile A&) const &; // also

    A& operator=(A&&) &; // move assignment
    double operator=(const A&&) const &&; // also (although very weird)

    template<typename T = int>
    A& operator=(const A&); // not a copy assignment
};
```

*Note*: return types, `const`, `volatile`, and *ref-qualifier*s also does not affect the validity of a copy/move assignment operator.

If no copy assignment operator is defined for a class, a copy assignment operator will be implicitly generated with the form
```cpp
A& operator=(const A&) = default; // normal
A& operator=(A&) = default; // only if a subobject (member or base) have a copy assignment operator with non-object argument [volatile] A&
```

If no copy/move operations and destructors are defined for a class, a move assignment operator will be implicitly generated with the form
```cpp
A& operator=(A&&) = default;
```

## `= default`

Compared to SMFs which was a thing since the inception of C++, `= default` is a relatively "new" (with 14 years of age already!) thing. Essentially, it requests the compiler to "do as if this thing had been implicitly generated". You can explicitly request the default function body by using `= default` *as* the function body:
```cpp
struct A {}; // SMFs implicitly generated
struct B
{
    B() = default; // implemented as-if it is implicitly generated
    B& operator=(B&&) & = default; // implemented as-if it is implicitly generated
};
```
Besides the textual benefit of writing out implicit functions explicitly, `= default` also allows you to make small modifications to the implicit signatures of SMFs, as demonstrated by the use of *ref-qualifier*s above. However, the possible modifications are [restricted](https://eel.is/c++draft/dcl.fct.def.default#2) by the standard explicitly. Only the following difference are permitted for `= default` functions compared to the implicitly generated signatures:
- They may have different `noexcept` specifications.
- For non-constructors, *ref-qualifier*s can be different.
- If the implicit signature have a non-object parameter of type `const A&`, the explicit signature can have a non-object parameter of type `A&`.
- The explicit signature can be written in Deducing This, **provided** that the type of the object parameter (the first one, prepended by `this`) must also be a reference to `A`.

```cpp
struct A
{
    A() noexcept = default; // fine, Rule 1
    A& operator=(const A&) noexcept & = default; // fine, Rule 1 + Rule 2
    A(A&) = default; // fine, Rule 3
    int operator=(const A&) = default; // error, not a permitted difference
    A(int x = 2) = default; // error, not a permitted difference
};
```

In this sense, functions that can be `= default`ed can be said to be a more strictly restricted version of SMF signatures that are valid... or can they?

Actually, these two sets are disjoint! Besides SMFs, there are other functions that can be `= default`ed: comparison operators.

The full story for comparison is too long to be described in this post, but interested readers can consult [here](https://mick235711.github.io/2024/04/30/operator-overloading-guide/#comparison-crash-course-operator-and-operator-and-other-five) for a detailed description. For this post, it is sufficient to note that
- A defaulted `<=>` or `=` (primary comparisons) means memberwise application of the operator.
- A defaulted other operator (secondary comparisons) means rewriting into one of primary comparison operators. For example, `a < b` will default to rewriting into `(a <=> b) < 0`.

The [criteria](https://eel.is/c++draft/class.compare.default) for a defaulted comparison operator, regardless of which operator is being declared, is as follows:
- It is not a template.
- It is either a non-static member function or a friend (non-member) function.
- Must have two (incl. explicit/implicit object parameter) parameters (this is restricted by the operator overload syntax) of the same type. The type must be `A` or `const A&`.
- Must return `bool` if the operator is not `<=>`. If declaring `<=>`, the return type must either be `auto` (exactly), a comparison category type, or a type that is convertible from all the `<=>` result of subobjects.

```cpp
struct A
{
    int x;
    bool operator==(const A&) const = default; // fine, const A& + const A&
    bool operator<(const A&) = default; // error, first argument (implicit) is A&
    friend bool operator>(A, A) = default; // fine

    auto operator<=>(const A&) const = default; // fine
    friend std::any operator<=>(A, A) = default; // fine
    int operator<=>(const A&) const = default; // error, return type of x <=> x not convertible to int
};
```

*Note*: the fact that operators other than `<=>` cannot use `auto` in lieu of `bool` or `auto&` in lieu of `A&` is inconsistent, and there is [a proposal](https://wg21.link/P2952) to fix that.

# Deducing This

Now onto the main part of this post: what does all of this have to do with Deducing This? Of course, since it is a new (or dare I say *better*?) way of writing member functions, we should use it to write *special* member functions!

## What Does The Standard Say?

Surprisingly little at first! The author of DT seems to not consider the interaction with SMFs and comparison functions at all in the initial proposal, and thus the C++23 standard initially does not have any regulations regarding whether SMFs and comparison operators's validity when written in DT form.

This omission was later identified, and resolved by the adoption of [CWG 2586](https://wg21.link/CWG2586). Two key modification are made as a result of this issue:
- The last rule regarding Deducing This is added to the `= default` criteria above; and
- The "two parameters" in the comparison operator rule is clarified to mean two parameters **including the explicit/implicit object parameter**. In other words, `bool operator==(const C&) const` and `bool operator==(this const C&, const C&)` both have two parameters of type `const C&`.

However, *standard* is just a document, what does the *implementation*s say about the matter?

## Implementation Divergence
