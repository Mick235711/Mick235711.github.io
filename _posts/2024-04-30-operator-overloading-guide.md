---
title: "The Definitive Guide to Operator Overloading in C++"
categories:
- C++
- Language
- Operator Overloading
---

Operator overloading has always been one of the most integral parts that makes C++, well, *C++*. From the nearly-regular overload of `operator=` for copy and move assignments to the IOStream’s (mis)use of `operator<<` and `>>` for I/O, which every C++ programmer learns on the first day of the class, no one can deny that without operator overloading, many common idioms and syntaxes we are already accustomed to will no longer be possible.

Yet the topic of operator overloading has always been a complex one, with intricacies that are not easy to understand and explore, and confusion and arguments on the best way to overload operators have prevailed ever since C++98. Furthermore, to make matters worse, each edition of C++ tweaked more and more operators to make them more friendly and also added more and more novel operators that we can overload:
- C++11 introduced the overloadable `operator ""udl` (User-Defined Literals, we will treat it as an operator in this article since its function name contains `operator`) and also introduced `explicit` conversion operators to obsolete the Safe Bool Idiom.
- C++20 introduced `operator<=>` (the spaceship) to obsolete five of the six comparison operators while also introducing the confusingly complex `operator co_await` that we can also overload.
- C++23 introduced a `static` version of `operator()` and `operator[]` and made the latter N-arg overloadable, changing decades of customs and perceptions of those operators.

What are the most canonical forms of overloading each operator? What are the usual idioms and protocols you must follow? Most importantly, what idiom prevailed in the C++23-era world, and what idiom had been made obsolete? Even with several [excellent guides](https://stackoverflow.com/questions/4421706/what-are-the-basic-rules-and-idioms-for-operator-overloading) written on the topics, they are either too old or don’t cover every operator’s intricacies. This guide is meant to answer all of those questions once and for all.

All of the contents will be based on the finalized C++23 standard.

## Contents
* TOC
{:toc}

## Basic Idioms
### Deducing This: A Retrospective and A Mistake Unfixed

### Hidden Friends and the Barton-Nackman Trick

### [You Must Type It Three Times](https://www.youtube.com/watch?v=I3T4lePH-yA): SFINAE Woes

## Basic Terminology and Classification
### Transversing the Operator Zoo

### Member or Non-Member or Hidden Friend? A Difficult Choice

### The Good, The Arithmetic, The Pointer, The Bad, and The Irrelevant

## The Good Four
### Simple Assignment: `operator=`
#### The Basics: The Rule of Three, The Rule of Five, and The Rule of Zero

#### Copy-and-Swap Idiom: When and How

#### More Idioms
##### Copy-and-Move Idiom

##### Implementing Constructors by Assignment

##### A Nightmare Operator: Deal with `optional<T&>`

#### Templated `operator=`

### `swap`: An Operator Disguised
#### The Basics: Importance of A `noexcept swap`

#### ADL `swap` and `ranges::swap`: Incomplete Solution

#### Member or Non-Member or Hidden Friend? A War Story

### Comparison Crash Course: `operator<=>` and `operator==` (and other five)
#### The Basics: Primary and Secondary Comparison

#### Comparison Result Types and Functions

#### Rewritten Candidates and Reverse Rewrite

#### The Default Situation and The Great Separation

#### Spaceship Idioms: Ignoring, Reversing

## Arithmetic Operators
### Compound Assignment: `operator@=`

### Simple Arithmetic: `b+ b- b* / %`
#### The Basics

#### By-Value or Symmetry: Pick Your Poison

### Bitwise Arithmetic: `| b& ~ >> <<`

### Increment/Decrement: A Dilemma
#### Prefix: `operator++()` and `operator--()`

#### Postfix: `operator++(int)` and `operator--(int)`

### The Weirdo: Unary `operator+()` and `operator-()`

### Conversion Operators: The Good, The Bad, and The Irrelevant
#### The One Good Conversion: `explicit operator bool()`

#### Other Niche Cases

#### An Irrelevant `!`

## Input/Output Operator
### `operator>>` as Stream Extractor
#### The Basics

#### Dealing with Failure

### `operator<<` as Stream Inserter
#### The Basics

#### Formatting Nightmare

### Migrate to `std::formatter<T>`

## Simulating a Pointer
### One-and-a-Fake Unary: `operator*()` and `operator->()`
#### The Basics: Core Pointer

#### Shallow or Deep `const`?

#### The Unorthodox Arrow

### The Forgotten Sister: `operator->*`

### A Changed Friend: `operator[]`
#### The Basics: `const`-Coercing Subscript and Deducing This

#### Deploying an Multidimensional `operator[]`

## Functors: Overloading `operator()`
### `static`, `const`, Lambda, `mutable`, Oh My!

### Stateful and Pure Functors with Standard Algorithms

### Perfect-Forwarding Functors: `= delete` and Deducing This

## Coroutine Internals: Overloading `operator co_await`
### Understanding Awaiter and Awaitable

### Decoding a Coroutine

### Implementing `std::lazy<T>`

## The Bad Four
### Defending Against the Dark Unary `operator&`

### `&&` and `||`: Before and After C++17

### Overloading `new` and `delete`: Explained
#### Why, When, and How

#### Global or Class-Scope?

#### Placement `new` and `nothrow new`

#### New Handler and the Memory Loop

#### Placement `delete`: The Weirdest Operator in the Standard

#### Overloading `new[]` and `delete[]`

### A Wild Comma Ride

## User-Defined Literal: Hidden Pearl of C++
### The Basics: UDL Classification and Overloading

### Integral UDL

### Floating-Point UDL

### Character UDL

### String UDL

### Templated UDL and the `constexpr std::string` Dilemma

## Operator Overloading in the STL: A Glimpse
### The Great Comparison Revolution

### `u*`: Nullable, Pointer or Optional?

### Deprecating and Decreasing `operator->`

### Postfix `++ --` in C++20: A Rebellion

### `operator+` For `std::string`: A Mistake? Nightmare with `string_view`?

### Standard Functors: Mistakes We Cannot Fix
#### Three Generations of `std::less`

#### Three Generations of `std::function`

#### The Power of The `std::bind` Family

### A Survey of Bad Operators
#### Implicit Comparisons

#### `operator&&` and `operator||`

### UDL in the STL

## The Future of Operator Overloading
### `operator?:`: A Cure for SIMD?

### The Great Search For Dot

### Overloadable `operator^`: Customising Reflection

### A Pipeline-Rewrite Operator

