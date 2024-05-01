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

## Basic Terminology
### Basics of Operator Overloading
So, what is operator overloading? As its name suggests, operator overloading basically gives you a way of customizing the behavior of operators. However, it should be made clear that this is not a way to *change* the meaning of operators like `1 + 2`, but to *give* meaning to the otherwise-meaningless expression like `p1 + p2`, where `p1` and `p2` are objects of your custom class `Point`. Since the compiler doesn’t know how to add two `Point` objects, it simply refuses to compile unless you tell the compiler what to do by overloading the `+` operator on `Point`s.

So, how do you tell the compiler? For any operator you want to overload, say `+`, there are two different syntaxes to overload the operator: member and non-member.
```cpp
struct Point
{
    Point operator+(const Point& rhs) const { /* ... */ } // Member
    Point func(const Point& rhs) const;
};
Point operator+(const Point& lhs, const Point& rhs) { /* ... */ } // Non-member
```
After specifying **one** of those two forms, the compiler will then treat `p1 + p2` as a pure syntactic sugar: If a member `operator+` is found, `p1 + p2` is rewritten into `p1.operator+(p2)` and executed, and you can access `p1` as `this`, `p2` as `rhs` in the function body. If a non-member is found, then `p1 + p2` is rewritten into `operator+(p1, p2)`, and you can access `p1` and `p2` as `lhs` and `rhs`, respectively.

One subtle thing to notice here is that `operator+` is (in some sense) not a magic name. It is literally just a function name, appearing where typically function names are found. In fact, you can even call it like a regular function, so `p1.operator+(p2)` is actually valid C++ code. Therefore, defining an operator overload is literally just defining a member or non-member function, and the only magic is the sugar of rewriting `p1 + p2` into a function call form.

Since `operator+`, like `func`, is a normal function, all the usual privileges and restrictions of member and non-member functions apply. For example, you can add `const`, `volatile`, `&`, or any other valid qualifiers on regular member functions to the `operator` functions. You can make them `templates`, add `requires`, etc. Also, you can overload `operator+`, and the compiler will make an overload resolution as usual when dealing with `p1 + p2`.

Of course, some requirements do exist on `operator` functions, so they are not precisely equivalent to ordinary functions. These requirements are:
- Each operator has its arity and membership requirements, so a binary operator like `/` can only be a function with two arguments. Writing `operator/(int, int, int)` is a hard error.
- If implemented as a non-member, at least one argument must be of (possibly reference to) a type that is dependent on at least one user-defined type. This effectively means that you cannot simply change what `1 + 2` means by overloading `operator+(int, int)`; you can only overload operators for non-builtin types.
- Operator functions may not have default arguments, except for `operator()` and `operator[]`. (Also, all operators except those two are either unary or binary, so they must have one or two arguments.)
- If implemented as a member, operator functions may not be `static`, again, except for `operator()` and `operator[]`.

However, except for those minor requirements, they behave entirely like normal functions. Especially notice that there are absolutely no requirements on what the return type and argument types must be (except for `operator->`, but that will be covered in its own section later), so you can definitely write an `operator+` that takes two `BigInts` and returns a `std::string`. Also, no requirements are put on the implementation of operator functions, so it is also possible to write an `operator+` on your `BigInt` class such that `a + b` actually does subtraction.

However, one thing needs to be especially remembered when doing operator overloading:
> **Just because you can do something doesn’t mean you should!**

In general, you **really** shouldn’t write surprise operators like that. Each operator has its own established meaning and relationships, and you should **really** respect them. `a + b` should do what addition usually does for that class. In this sense, `std::string::operator+` is actually a misuse since there is not really an established meaning of what adding two strings should do in a mathematical sense (the current semantics, concatenation, is not even communicative!). While you may argue that `+` for string means concatenation is so widespread and so universally adopted that it can be carved out as an exception, just as in Java, where no general operator overloading is allowed, but `String` still has `+`. (Even though I would argue that, again, it is better provided as an ordinary function that [can have richer meaning, like slicing the second string](https://en.cppreference.com/w/cpp/string/basic_string/append), and [there exist popular languages that chose not to abuse +](https://reference.wolfram.com/language/ref/StringJoin.html).)

However, even if you made that argument, another classical misuse of operator overloading in the STL cannot be explained away: IOStream’s use of `<<` and `>>` for input and output. There, the grounds are much weaker: there is no precedent, and other languages haven’t adopted these operators (even C++ itself had been moving away from `<<` and `>>` by encouraging the use of `std::print` family), and the original meaning of those operators (bitwise shift) has absolutely nothing to do with I/O. In retrospect, the decision to overload `<<` and `>>` for IOStreams is probably just meant to be a demonstration of the power of operator overloading, just like `vector<bool>`, deployed as an experiment. Well, we can only accept that STL can and has made many mistakes, many of them more severe than this, and move on with life.

In conclusion, with the freedom of operator overloading, you can really do extraordinary things, like C++20 Ranges’ use of `|`, and DSLs like [Boost::Spirit](http://boost-spirit.com/home/). However, before wielding that power, be cautious and always follow those [established guidelines](https://stackoverflow.com/a/4421708/6593187):
1. **Don’t do it.** In 95% of the cases, you don’t need operator overloading and just want to show off. In the vast majority of cases, introducing a named regular function can express the meaning more clearly, give you more power (such as the possibility of having more arguments), and bring less confusion. So, unless you have **very clear and robust motivation**, refrain from overloading any operators.
2. **Whenever the meaning of an operator is not obviously clear and undisputed, it should not be overloaded.** For example, what should `+` between `vector`s mean? You may be tempted to say concatenation, with the precedence of `string`, but there is certainly no strong motivation or clear, established meaning on that operator (for example, it can also mean element-wise addition, just like what `valarray` and `numpy.array` does). Therefore, you shouldn’t overload it, even though it might be tempting. Instead, provide a named function, just like [what STL eventually does](https://en.cppreference.com/w/cpp/container/vector/append_range).
3. **Always stick to the operator’s well-known semantics.** This is an extension of 2, but it’s so important that it merits mentioning again. Don’t use “surprise operators” that make `a + b` do subtraction; you will only confuse your users.
4. **Always provide all out of a set of related operations.** This is a more subtle one, but nonetheless, it is still essential to follow. If the user can do `a < b`, they will expect that they can do `a > b`. Even though the compiler does not forbid you to write a class that only supports `<`, you should always provide the full set, **and make sure their behavior is consistent** (i.e., `a < b` whenever `b > a`).

> **Just because you can do something doesn’t mean you should!**

### Transversing the Operator Zoo

Now that you know the basic syntax and guidelines of operator overloading, a natural question to ask is what operator we can overload. The first clarification here needed is that in C++, unlike some other languages, you cannot create new operators, so you cannot just write `operator**` and expect the compiler to suddenly start accepting `a ** b`. (Though, if you try really hard, you can make it work since `a ** b` is parsed as `a * (*b)`. But again, you really shouldn’t rely on those kind of tricks. How hard is providing a `pow()`?)

That leaves the already-usable operators. A thing to mention here is that not all operators in the core language consist only of punctuations; examples are `sizeof` and `typeid`, which are technically unary operators since they can apply to objects. However, all of those “text” operators cannot be overloaded, so we will not consider them operators in this guide. However, there is one notable exception: `swap`. Even though `swap` is not even a keyword and doesn’t really have any meaning in the core language, it is used and relied on so heavily in the standard library that I will make an exception and consider it as an overloadable binary “operator” in this guide. We will see the reason for this declaration more clearly in its section.

Now that is resolved, among the remaining (“real”) operators, there are only four that cannot be overloaded: `.` (object member access), `.*` (object member access through pointers), `::` (namespace access), and `?:` (ternary/condition operator). Of those four “home-restricted”, their reasons are a little different. You obviously cannot overload `::` due to the inability to pass a namespace name to a function, but there are not really any technical reasons for `?:` not to be overloadable. Bjarne himself admitted that the only reason `?:` is not overloadable is that it is the only ternary operator in the standard, and he does not want to cave an exception for the allowance of a three-parameter `operator?:` when all other operators are restricted to take one or two arguments (except `()`, and later `[]`, but they are unique in more than this respect, as seen above). Recently, there have been [some attempts](https://wg21.link/P0917R3) to persuade WG21 (the ISO C++ standards committee) to allow `operator?:` in the context of natural SIMD conditionals that may benefit significantly from this operator.

As for `.` and `.*`, the story is much more interesting and revealing. The urge to overload `operator.`, the dot operator, to finally allow for a perfect wrapper class that can forward every method to an inner object (perhaps a perfect strong type alias or a locking guard that provides a lock for each method invocation), had been overwhelming in the last 20 years, and [multiple](https://wg21.link/N1671) [proposals](https://wg21.link/P0700R0) [had](https://wg21.link/P0252R2) been put forward to allow exactly that. However, this “smart reference” (*a la* smart pointers) operator had been one of the most contentious topics in WG21 history due to issues like the clashing between the wrapper class’s own member function and `operator.`, and whether `a + b` should invoke `operator.` on `a` if it is translated to `a.operator+(b)`, and so on. In the end, the topic has been left unresolved on the platform for a few years now (the most recent attempt seems to be in 2016).

Committee shenanigans aside, except those four operators, C++ has allowed nearly every existing operator to be overloaded, including some surprising ones like `->` (pointer member access), `->*` (pointer member access through pointer), and `,` (yes, you can overload comma!). Still, remember the motto!
> **Just because you can do something doesn’t mean you should!**

In total, C++ allows a staggering 39 different punctuation tokens to be overloaded, combined with non-punctuation overloadable, including `operator T` (converting operator), `operator ""s` (user-defined literal), `operator co_await`, four allocating operators, and `swap` (the only one in the list not using the `operator` keyword), there are a total of 47 overloadable operators defined in the standard. (Now you know why this guide is so long, huh?) Grouping by their arity, we can classify them as three different kinds, which dictates their overloading syntax in terms of number of arguments allowed:
- Unary operators: `+`, `-`, `*`, `&`, `~` (bitwise not), `!`, `++`, `--`, `->`, `co_await`, `operator T`, `operator ""s`, `new`, `new[]`, `delete`, `delete[]`
- Binary operators: `+`, `-`, `*`, `/`, `%`, `^` (bitwise xor), `&`, `|`, `&&`, `||`, `<<`, `>>`, `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `^=`, `&=`, `|=`, `<<=`, `>>=`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `<=>`, `,`, `->*`, `swap`
- N-ary operators: `()` and `[]` (again special, these can take any number of arguments, including zero)

Take focus on the fact that some tokens appear in multiple listings! In some cases, the two forms are linked; for example, unary `-` is expected to do negation, so basically, `-x` is equivalent to `0 - x`, which uses binary `-`. In other cases, the two forms are completely unrelated, such as unary `*` means pointer dereferencing, and binary `*` indicates multiplication. In the rest of the guide, to distinguish two forms, I will use `u+` `u-` `u*` `u&` to refer to their unary forms, while `b+` `b-` `b*` `b&` will refer to their binary forms.

Another subtlety is that two operators are secretly expanding inside the unary operator’s category! `++` and `--` have two forms: prefix and postfix (all other unary operators are only prefixes). This means that you can make `++a` and `a++` do entirely different things! (Once again, you really shouldn’t; these are expected to be equivalent except for their return value. **Remember the motto.**) In the rest of the guide, if I want to distinguish them clearly, I will use `++p` and `--p` to refer to their prefix forms and `p++` and `p--` to refer to their postfix forms. As for how do you distinguish them in code when both are unary? Read their section to find out!

(Finally, alert readers may point out that `->` should be a binary operator since it is used like `ptr->member()`. This is not a mistake; welcome to the weird world of Arrow! Read its section to find out why it is a unary operator and a bizarre one at that.)

## Basic Idioms
### Deducing This: A Retrospective and A Mistake Unfixed

### Hidden Friends and the Barton-Nackman Trick

### [You Must Type It Three Times](https://www.youtube.com/watch?v=I3T4lePH-yA): SFINAE Woes

## Choices and Classification

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

## The Bad Nine
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

### Conversion Operators: The Good, The Bad, and The Irrelevant
#### The One Good Conversion: `explicit operator bool()`

#### Other Niche Cases

#### An Irrelevant `!`

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

