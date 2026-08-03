---
title: "The Definitive Guide to Operator Overloading in C++"
published: 2024-04-30
description: A detailed guide to C++ operator overloading, its design choices, and pitfalls.
tags: [Language, "Operator Overloading"]
category: C++
---

Operator overloading has always been one of the most integral parts that makes C++, well, *C++*. From the nearly-regular overload of `operator=` for copy and move assignments to the IOStream’s (mis)use of `operator<<` and `>>` for I/O, which every C++ programmer learns on the first day of the class, no one can deny that without operator overloading, many common idioms and syntaxes we are already accustomed to will no longer be possible.

Yet the topic of operator overloading has always been a complex one, with intricacies that are not easy to understand and explore, and confusion and arguments on the best way to overload operators have prevailed ever since C++98. Furthermore, to make matters worse, each edition of C++ tweaked more and more operators to make them more friendly and also added more and more novel operators that we can overload:
- C++11 introduced the overloadable `operator ""udl` (User-Defined Literals, we will treat it as an operator in this article since its function name contains `operator`) and also introduced `explicit` conversion operators to obsolete the Safe Bool Idiom.
- C++20 introduced `operator<=>` (the spaceship) to obsolete five of the six comparison operators while also introducing the confusingly complex `operator co_await` that we can also overload.
- C++23 introduced a `static` version of `operator()` and `operator[]` and made the latter N-arg overloadable, changing decades of customs and perceptions of those operators.

What are the most canonical forms of overloading each operator? What are the usual idioms and protocols you must follow? Most importantly, what idiom prevailed in the C++23-era world, and what idiom had been made obsolete? Even with several [excellent guides](https://stackoverflow.com/questions/4421706/what-are-the-basic-rules-and-idioms-for-operator-overloading) written on the topics, they are either too old or don’t cover every operator’s intricacies. This guide is meant to answer all of those questions once and for all.

All of the contents will be based on the finalized C++23 standard.

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

Now that is resolved, among the remaining (“real”) operators, there are only four that cannot be overloaded: `.` (object member access), `.*` (object member access through pointers), `::` (namespace access), and `?:` (ternary/condition operator). Of those four “home-restricted”, their reasons are a little different. You obviously cannot overload `::` due to the inability to pass a namespace name to a function, but there are not really any technical reasons for `?:` not to be overloadable. The committee [admitted](https://isocpp.org/wiki/faq/operator-overloading#overload-dot) that the only reason `?:` is not overloadable is that it is the only ternary operator in the standard, and he does not want to cave an exception for the allowance of a three-parameter `operator?:` when all other operators are restricted to take one or two arguments (except `()`, and later `[]`, but they are unique in more than this respect, as seen above). Recently, there have been [some attempts](https://wg21.link/P0917R3) to persuade WG21 (the ISO C++ standards committee) to allow `operator?:` in the context of natural SIMD conditionals that may benefit significantly from this operator.

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
Before we embark on the journey to survey every single operator’s canonical forms and rules, we need to know about some general idioms that apply to nearly every operator overloading function.

### Deducing This: A Retrospective and A Mistake Unfixed
For example, how exactly do you write a member operator function?

This may sound trivially nonsense, but it’s not. In C++23, a new way to write member functions, [Deducing This](https://wg21.link/P0847), is introduced into the standard. Specifically, this feature allows you to explicitly write the normally-implicit object argument (aka `this`) in the argument list, just like Python’s `self` argument. The syntax is to prepend `this` on the first argument:
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
Some non-obvious details regarding those kinds of “deducing this” member functions need to be resolved. First of all, implicit and explicit access to `this` is disabled in those functions; you cannot just write `value` or write `this->value` and expect it to work. Instead, you need to access the members via `self` (notice that this name is just an argument name and can be anything, not just `self`). Secondly, I actually sorta lied when saying Deducing This is a new way of writing member functions. The best way to understand this is to again think DT as a syntactic sugar for an equivalent function by deleting `this` and prepending `static`:
```cpp
struct S
{
    void fun(this const S& self, int r);
    // equivalent to:
    static void fun(const S& self, int r);
};
```
Then, the compiler simply transforms `s.fun(5)` to a call of `S::fun(s, 5)` whenever the overload resolution selects a DT function. This makes sense since we don’t have a `this` pointer inside the function, making it ABI equivalent to a static function with better performance.

Now, what are the benefits of using DT, you may ask? At first glance, this new form just adds more keystrokes and reduces the convenience of implicit `this`. However, there are three main advantages of using DT.

First of all, since DT members are just equivalent to a static member function, there is no rule whatsoever as to what the first argument’s type must be. For normal member functions, the implicit object argument’s type can be `S&`, `S&&`, `const S&`, or `const S&&` depending on the cv- and ref-qualifier at the end of the declaration, but it must be a reference. There is no such requirement on DT member functions:
```cpp
struct S
{
    void fun(); // implicit object argument is S& (sorta, see below)
    void fun2() const; // implicit object argument is const S&

    void fun3(this S&); // equivalent (sorta, see below) to fun
    void fun4(this const S&); // equivalent to fun2

    void fun5(this S); // pass by value! impossible to write for normal members
};
```
Passing the implicit object by value has many benefits, including better performance due to avoiding implicit pointer access when writing members for small classes like `string_view` that fits in registers and the possibility of a simple `sorted()`-like function that returns a modified version of self without modifying in-place.

But more importantly, there is no reason why a (static or not) member function cannot be a template. What makes DT special? Its first argument can also be templated!
```cpp
struct S
{
    T value;
    T& fun() { return value; }
    const T& fun() const { return value; } // common overload set to serve both kinds of this

    template<typename U>
    auto& fun(this U&& self) { return self.value; } // only need to write once!
};
```
Using a forwarding reference (sometimes in conjunction with `std::forward[_like]`), we can collapse the two or four duplicate overloads needed to handle different `const`-ness into one templated member, and the right overload will be instantiated when needed.

The second important advantage of DT is the possibility of exposing the `this` pointer in a lambda. Since lambdas are basically syntactic sugars for anonymous classes with an `operator()` overload, we cannot normally use `this` to refer to that anonymous class because of `this`-related captures. However, with DT syntax, we now have a way to refer to the lambda object inside itself:
```cpp
auto fac = [](this auto fac, int n)
{ return n <= 1 ? 1 : n * fac(n - 1); }
fac(5); // 120
```
Besides the obvious recursive lambda, this also enables us to write a better overloading lambda wrapper. See [the original proposal](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2021/p0847r7.html#recursive-lambdas) for details.

The third advantage is not actually mentioned in the proposal at all and is a very less-known fact of normal member functions in C++. It is so less known that the standard itself made mistakes in this aspect, and this advantage is actually very relevant to why using DT to overload operators is a good idea. What is the weird quirk, you may ask? Basically, the above text (and the standard)’s reference to the “normal, non-`const` member function’s implicit object argument is of type `S&`” is a lie. Only lvalues of type `S` will be accepted for a normal function taking an `S&` argument. However, for normal non-`const` member functions, both lvalue and rvalues are accepted!
```cpp
struct S { void fun(); };
void fun2(S&);

int main()
{
    S s;
    s.fun(); // okay
    fun2(s); // okay
    S{}.fun(); // prvalue, okay
    fun2(S{}); // prvalue, error!
}
```
You see, the implicit object argument of non-`const` member functions is actually the first instance of a “universal reference” in C++ standard that can accept both lvalues and rvalues, introduced way before C++11 forwarding references are a thing. This quirk does not apply to `const` member functions because a normal function with `const S&` arguments can already accept both lvalues and rvalues, making them truly equivalent.

What does this quirk have to do with operator overloading? Remember, **operator functions are just normal functions with a special name**, so all the properties of a regular member function apply. This has two important implications:
1. **Asymmetry of Two Forms**: In nearly all regards, the compiler treats an operator’s member and non-member forms equivalently; `a + b` will search and make overload resolutions with both forms and rewrite accordingly. However, this quirk means that if you write `operator+=` as a member (without defense, see below), it will accept rvalues as the left-hand operand, making `S{} += 2` valid. That statement will be invalid if you implement `operator+=` as a non-member.
2. **Rvalue Modification**: This might be somewhat obvious since `S{} += 2`, or in general, modifying an rvalue, which is most likely a temporary expression, is usually not a great idea. The modification result is most likely discarded, so write `S{} + 2` is probably clearer. The standard library itself made this mistake: all of its `operator=`s are member functions without defense, so nonsense expressions like `std::string{} = std::string{}` [are actually valid](https://godbolt.org/z/TcPaeT4vY).

You may wonder who actually writes expressions like that, modifying clearly temporary values. Well, maybe not directly, but you should remember that misspelling `==` as `=` is a very common mistake:
```cpp
std::optional<int> getOptional();
int getInt();

if (getOptional() = 2) // oops, meant to be ==
if (getInt() = 2) // protected! compile error
```
Built-in types like `int` do not have overloaded operators, so `operator=` on `int`s does not accept rvalues as LHS, and the above mistake is actually protected. However, regarding `std::optional` (or any other STL types), even though `getOptional()` returns a prvalue, you can still write an assignment like that, and [all major compilers compile successfully, albeit with a warning](https://godbolt.org/z/MMzTYKEf7). (Apparently, MSVC does not even warn about this…)

Now, a defense against this quirk exists, which is the *ref-qualifier* feature introduced in C++11. This feature allows you to append `&` or `&&` after a member function to constraint whether the function only accepts lvalue `this` or rvalue `this`:
```cpp
struct S
{
    void fun();
    void fun2() &;
    void fun3() &&;
};

S getS();

int main()
{
    S s;
    s.fun(); // okay
    s.fun2(); // lvalue, okay
    s.fun3(); // error!

    getS().fun(); // okay (quirk)
    getS().fun2(); // error! (good)
    getS().fun3(); // rvalue, okay
}
```
This not only gives you a way to express a member function with implicit object argument as `S&&`, but appending `&` also gives you feature parity with a normal `S&` argument. Now, `struct S { void fun() &; };` is indeed equivalent to `void fun(S&);`, minus calling syntax. (However, now `struct S { void fun() const &; };` is again not equivalent to `void fun(const S&);`, instead being a non-expressible “const true lvalue reference” that only accepts lvalue. Isn’t C++ *fantastic*? 😜)

Applying this feature to operator overloading, we can now guard against modifying rvalues, and achieving symmetry:
```cpp
struct S
{
    S& operator=(int) &; // <- notice the &
};
S s;
S getS();
s = 2; // okay
getS() = 2; // error, good
```
Unfortunately, *ref-qualifier*s is probably one of the least known features of C++11, with little to no adoption both inside and outside the STL. There had been [a proposal](https://wg21.link/N2819) in the C++11 cycle requesting WG21 to change all existing standard library types to use an `operator=` with `&` qualifier and eventually modify the automatic generation rules to force that as default. However, due to the sheer amount of breakage this may cause, without any surprise, that proposal is not accepted. To maintain consistency, new library types introduced after C++11 still haven’t adopted any `operator=` with a qualifier, resulting in our unsatisfactory contemporary status.

But now, we may have a cure for that disease: Deducing This. One of the main reasons `&`-qualified members had not seen great adoption is due to its asymmetry: you have to remember to add `&` for non-`const` members, but also remember **not** to add `&` for `const` members to achieve feature parity. However, DT has no such asymmetry: due to its equivalence with static functions, `void fun(this S&)` is, so obviously, equivalent to normal `void fun(S&)`, and `void fun(this const S&)` is also just equivalent to normal `void fun(const S&)`. Even better, since DT uses normal function declarations syntax, there is literally no way to write the quirky “universal reference” or “const true lvalue reference” in DT members, so there are no bad defaults here; you have to write out the type physically. By simply writing all (non-`virtual`, for now) members (including operator overloads) in DT form, you already achieved the rvalue modification prevention goal without intentionally doing anything!

So, in conclusion, for modifying operators that probably should be written as non-`const` member functions (see below section for why), the canonical form is to either write it in Deducing This form or to append the `&` qualifier. This way, both symmetry and prevention of rvalue modification can be achieved.
```cpp
struct S
{
    S& operator=(this S&, const S&); // canonical and preferred
    S& operator=(const S&) &; // canonical
    S& operator=(const S&); // not recommended
};
```
(Of course, if your operator does want to allow modification on rvalues, you can write it as a normal member (or preferably a DT member with forwarding reference); maybe the Builder pattern’s `operator=` can be one example.)

### Hidden Friends and the Barton-Nackman Trick
Now that we know the canonical forms for member function implementation of operator overloading, what about the non-member implementation? There, no symmetry problem occurs since both arguments are treated equally. However, another problem arose, necessitating the introduction of another commonly used implementation technique of non-member functions: the Hidden Friend Idiom.

To understand hidden friends, we first must understand a `friend` declaration. Traditionally, `friend` declarations are used to intentionally loosen a class’s encapsulation in a controlled manner. For example, you may have a CRTP base class that you want to access some private method to aid implementation, which you do not want to expose to the outside world:
```cpp
template<typename Derived>
struct provide_work
{
    void work() { static_cast<Derived*>(this)->doWork(); /* do some logging */ }
};

struct concrete_class : private provide_work<concrete_class>
{
    friend class provide_work<concrete_class>;
private:
    void doWork();
};
```
`doWork()` is an internal function without logging, so you may not want to expose it to the outside world. However, since the CRTP base class usually uses `private` inheritance due to the nature of the composition, that cast inside `work()` doesn’t actually work unless you make it see the inheritance through a `friend` declaration.

> [!TIP]
> This example works much better if you use Deducing This, in which you simply write `void work(this const auto&)` and don’t worry about `friend`s anymore.) `friend` declarations can apply to both classes (like above) and non-member functions (like `friend void fun();`), and in both cases, the mentioned class/function will gain access to the `private` members of `concrete_class`.

However, in modern C++, `friend` declarations are increasingly less necessary due to the focus on reducing coupling between classes and also strengthening encapsulation. Those relationships are usually much better expressed by utilizing a class’s `public` API, maybe through a hidden base class. However, another (unintended?) use of `friend` declarations has risen in popularity in recent years and has gradually become one of the most important use cases of the `friend` keyword: the Hidden Friend Idiom.

Now, what is a hidden friend? Basically, when using `friend` to befriend a function, simply put that function’s definition right after the `friend` declaration (define the function in-line), and you get a hidden friend.
```cpp
struct S
{
    S(int);
    friend void fun(S s) // hidden friend!
    {
        // implement fun(), can use private parts of S here
    }
};
S s;
fun(s); // okay
fun(2); // error!
fun(S(2)); // okay
::fun(s); // error!
```
A hidden friend like this is **still** a non-member function, albeit residing inside the definition of a class. However, precisely because the function only has a declaration inside a class scope, it is *hidden* against all normal lookup methods. Thus, it cannot be found from normal qualified lookup (like `::fun(s)`).

However, how is `fun(s)` valid then? This is because hidden friends can only be found via one special rule in the lookup family: Argument-Dependent Lookup (ADL). ADL is an exception in the unqualified lookup phase that is actually invented specifically to convenience operator overloading. Basically, for ADL to happen, three conditions must be met:
- The lookup performed must be an **un**qualified lookup (without namespace prefix); `::fun(s)` or `N::fun(s)` will not invoke ADL.
- Normal unqualified lookup must **only** find functions. This precludes the following scenario: (cannot “overload” function with non-function variables)
```cpp
namespace N { struct S {}; void fun(S); template<typename> struct Mem; }
int fun;
N::S s;
fun(s); // no ADL here, hard error
```
- Finally, at least one argument must be of (possibly a pointer or reference to) a class type.

When all the conditions are met, ADL specifies that a list of *associated entities* is compiled for each (class type or pointer to or reference to a class type) argument to the function. The rules for finding associated entities are a bit complex, but in general, the following are included:
- If a pointer or reference, associated entities of the referred type
- If a class type, then the class itself, all direct or indirect base classes, and all nested classes if the class is a nested type.
- In addition, if a templated class type, associated entities of all type parameters

This is not the full list of rules, but it is sufficient for this guide’s purpose. Notice especially that the second rule is not recursive: if `N::S` derives from `M::P`, then `M` is not an associated namespace for `s`. However, `M` *is* an associated namespace for `N::Mem<M::P>`.

After finding all the associated entities, the associated namespace is constructed by finding the innermost enclosing namespace for each entity. Then, ADL will search all the associated namespaces, as well as all hidden friends within the associated entities. What this all means is that ADL will find two more kinds of “distant” function declarations not found by normal unqualified lookup:
1. All function declarations residing in the same namespace as one of the associated entities; and
2. All the hidden friends in associated entities
```cpp
namespace M
{
    struct S
    {
        friend void fun(S);
    };
    void fun2(S);
}
N::S s;
fun(s); // okay, #2
fun2(s); // okay, #1
```
Alerted readers may ask, why is ADL a special rule invented specifically for operator overloading? Well, you see, again, operator functions are just normal functions with special names, and they can be found by ADL, too. This is especially suitable for operators because we almost never call them by the normal function syntax but instead choose to write `a + b`, which always tries to find `operator+` through unqualified lookup, so all the namespace-level and hidden friend `operator+` for `a` and `b` will be found. This is specifically to enable people to write operator functions inside the class’s own scope or enclosing namespace without polluting the global namespace. In fact, in the early days of C++ standardization, ADL only occurred when calling the operator through that syntactic sugar and was only extended to all functions [in 1996](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/1996/N0952.asc), very late in the standardization cycle.

Now we know when hidden friends are found, why are they useful in terms of operator overloading? Writing operator functions as hidden friends at least have three advantages. First, hidden friends greatly *reduce* the overload set, thus delivering significantly better compiling time and (most importantly) diagnostics. You see, if you write a normal non-member `operator+`, it will get picked up every time everyone writes `a + b`, no matter what type `a` or `b` has. Hidden friends can *only* be found via ADL, so at least one of `a` or `b` must have a relevant type to your `operator+`’s enclosing class. Otherwise, it will not be shown in the overload set (which the compiler often prints *in full* whenever some `a + b` goes wrong).

Secondly, hidden friends **reside physically** within the class scope. Yes, this is an advantage because operators are most definitely deeply tied to a class’s semantics and should form a class’s public API. If you define a non-member operator just at namespace scope, it may be separated arbitrarily from the class definition, thus making it hard to find and harder to link to the class. Also, a side note is that hidden friends also contribute to the feature-parity between non-members and member forms of operator overloading since hidden friends are still friends and can access the class’s `private` parts. This may arguably be a good or bad thing since many operators can be implemented fully from public API, and making more friends is generally seen as weakening the encapsulation. However, since member operator functions can (obviously) already access the `private` parts, I would argue that all operators of a class should be “seen as” members and should have equal access.

Finally, one of the most important advantages of using hidden friends for operator functions, and the trick that makes it indispensable in operator overloading, is the fact that hidden friends will enable the use of [the Barton-Nackman trick](https://en.wikipedia.org/wiki/Barton%E2%80%93Nackman_trick). If your class is actually templated (say, overloading `operator+` for `Rational<T>`), then there is a very important distinction between hidden friends and ordinary non-members:
```cpp
template<typename T>
struct Rational
{
    Rational(T); // implicit conversion from T

    // hidden friend
    friend Rational operator+(const Rational&, const Rational&);
};

// normal non-member
template<typename T>
Rational<T> operator+(const Rational<T>&, const Rational<T>&);
```
Have you found the distinction? The hidden friend is actually **not a template function**! This is a boon granted by being inside the `Rationl<T>` class scope: you don’t need to template the operator to refer to any kind of `Rational`; you only have to implement for the current `Rational<T>` (can be shortened to simply `Rational` inside the class scope, as seen above). And each invocation of `r1 + r2` will *synthesize* a non-template `operator+` from `r1` and `r2`’s class scope.

This distinction had profound implications for the usability of the operator: templated functions only do *substitution*; they never consider any kind of *casting*.
```cpp
Rational<int> r1, r2;
r1 + r2; // okay for both form
r1 + 2; // okay for hidden friend, error (!) for non-member
```
Why does `r1 + 2` fail for a non-member declaration? Because it is a template, the compiler tries to match `2` (aka `int`) against `const Rational<T>&` for the second argument and finds that no `T` can satisfy this equivalence; thus, the declaration is discarded. In the hidden friend case, since `operator+` is not a template, no substitution is needed; the compiler knows that it must try to *convert* `2` to some object of `Rational<int>`, so the constructor is selected.

This trick, the fact that hidden friends can strip away the template-ness of operators, is known as the Barton-Nackman trick and is the premier reason why operator overloading for templated classes is usually always done in member form or hidden friend form. (Though the most common knowledge of this trick probably stems from Item 46 of the famous *Effective C++* book, where the same example of `Rational<T>` is given.)

However, the other two advantages remain even for non-templated classes. This is why I recommend in this guide that all operator overloading be done in member form or hidden friend form if a non-member is preferred. It leads to better compiling time, better diagnostics, better grouping, and API documentation, and enables conversion in templates. What’s there not to love?

### [You Must Type It Three Times](https://www.youtube.com/watch?v=I3T4lePH-yA): SFINAE Woes
Now, we venture into some more advanced topics, like the concept of SFINAE-friendly, which you should consider for each of your overloaded operators.

> [!IMPORTANT]
> The answer to "Should I make my operator SFINAE-friendly?" is no 99% of the time, both because making it friendly is a bit complex and the advantage is only applicable in a very specific group of types. Most users don’t really need to care about this section. If you don’t know what SFINAE is at all, then you don’t need to read this section, as it will not really affect you.

So, what is SFINAE-friendly? This term refers to the fact that your type *perfectly forwards* SFINAE-ness. For a friendlier example, let’s again consider the example of `Rational<T>`. But this time, we will assume that there is a widely adopted concept `multipliable` that tests if your type is multipliable simply by testing if `t * u` is valid; and someone had written a function to choose different algorithm based on the multipliability of your type.
```cpp
template<typename T>
concept multipliable = requires (T t, T u) { t * u; };

template<multipliable T>
T fun(T t) { /* some specific impl */ return t * t; }

template<typename T>
T fun(T t) { /* some general impl */ return t; }
```
Now, assume that there is some wrapper on `int`s that only allows addition, not multiplication (perhaps because there is some invariant that it must hold, and it may require too much effort to maintain in multiplication):
```cpp
template<typename T>
struct Rational
{
    T n, d;
    friend Rational operator+(const Rational&, const Rational&) { /* ... */ }
    friend Rational operator*(const Rational& lhs, const Rational& rhs)
    {
        return Rational{lhs.n * rhs.n, lhs.d * rhs.d};
    }
};

struct Number
{
    int value;
    friend Number operator+(Number, Number);
    // no operator* defined
};
```
Now, on the surface, this is a very natural implementation of `operator*`, right? It uses hidden friends as recommended (though everything below applied to regular non-members and members, too) and simply returns an object with the calculated multiplication result. However, take a look at the following result! ([Compiler Explorer](https://godbolt.org/z/5nP85Mv7G))
```cpp
int main()
{
    Rational<int> ri{1, 2};
    ri + ri; // good
    ri * ri; // good
    Rational<Number> rn{Number{3}, Number{4}};
    rn + rn; // good, rn * rn will obviously error out
    static_assert(multipliable<Rational<int>>); // good
    static_assert(!multipliable<Number>); // good
    static_assert(multipliable<Rational<Number>>); // ???
    fun(ri); // good, returns ri * ri
    fun(Number{3}); // good, returns Number{3} itself
    fun(rn); // hard error!
}
```
Why is `Rational<Number>` multipliable? And why is `fun(rn)` a hard error?

Actually, the answer to the second question directly results from the answer to the first question. It is because `multipliable<Rational<Number>>` is satisfied, such that the specific overload for `fun` is selected, and evaluating `t * t` inside the body results in a hard error. So why is `multipliable` satisfied in the first place? The answer is that `Rational<T>`’s `operator*` is not SFINAE-friendly.

For a function to be SFINAE-friendly, it must perfectly forward the SFINAE-ness, meaning that when `lhs.n * rhs.n` is invalid; the entire `operator*` declaration should be SFINAE-away. However, as currently declared, `operator*` for `Rational<T>` is *always* present in the overload set, and simply testing for the validness of `rn * rn` will always succeed since you are only asking if `operator*` exists. However, *calling* that expression instantiated the operator and the `lhs.n * rhs.n` line simply results in a hard error. Then how do we make it SFINAE-friendly? The solution is to forward SFINAE-ness by adding a `requires` clause:
```cpp
template<typename T>
struct Rational
{
    // ...
    friend Rational operator*(const Rational& lhs, const Rational& rhs)
    requires requires (T t, T u) { t * u; }
    {
        return Rational{lhs.n * rhs.n, lhs.d * rhs.d};
    }
};
// Before C++20, this is typically done by
// friend auto operator*(const Rational& lhs, const Rational& rhs) -> decltype(lhs.n * rhs.n, void(), Rational{})
// simply doing a SFINAE test in the return type
```
(Or, in this case, `requires multipliable<T>` will do it.) Now, since `operator*` is only present if and only if `t * u` is valid, in the case of `Rational<Number>`, the `operator*` is simply *not present* in the overload set, and `multipliable` will now report false as `rn * rn` is no longer valid.

So, when is this technique actually useful? Actually, SFINAE-friendliness is only required in very limited cases, mostly dealing with TMP code. You only need to make your operator SFINAE-friendly if you actively *need* `multipliable` to detect your `operator*` status correctly; in most cases, there is no such concept to deal with, or the user is not expecting `Rational<Number>` to actually report its status transparently. Coupled with the fact that making functions SFINAE-friendly requires some non-trivial and non-obvious TMP work like the above `requires` clause, it is generally not recommended to just slap those kinds of requirements on the operators. Only if you are **sure** that your operator absolutely needs SFINAE-friendliness do you then do it.

One example of those kinds of needs in the STL is in the context of C++20 Ranges. A very important concept for any range is the range properties, like `sized_range<R>`. This concept basically tells you if your range is sized (i.e., can report its size in O(1) time) and is achieved by simply detecting if `ranges::size(r)` is valid (and also provides an opt-out in the form of `disable_sized_range<R>`). Then, each *range adaptor* like `views::transform` in the standard will then only provide the `size()` member function if and only if the underlying range is sized, making `sized_range<transform_view<R, F>>`  always equal to `sized_range<R>`. This is a critical requirement for those adaptors to calculate/forward the range properties correctly, so `filter_view::size()` is made SFINAE-friendly.

SFINAE-friendly also has some interesting implications in the context of perfect forwarding call wrappers, which will be discussed in the section for overloading `operator()`. Otherwise, this guide will not mention SFINAE-friendly again, and all canonical forms will assume that friendliness is not required. Please append the `requires` clause as needed.

Now that we know about some general idioms that apply to all operators, we went on to some choices that apply to some specific operators and their implications. Then, a classification of overloadable operators will be present, and the rest of the guide will focus on overloading specific operators.

## Choices and Classification
### Member or Hidden Friend? A Difficult Choice
Now that we know member operator functions should either be implemented via Deducing This or (sometimes) have a ref-qualifier attached, and non-member operator functions should nearly always be implemented via Hidden Friends, the question remains: Which form should we choose? Member or non-member (hidden friends)?

For some of the overloadable operators, the standard has made this choice for us:
- Operators `()`, `[]`, `->`, `=`, and `operator T` (conversion) **must** be overloaded via the member form.
- Operator `swap` and `operator ""s` (UDL) **must** be overloaded via the non-member form.
- When (mis)used as Input/Output operators, operators `<<` and `>>` **must** be overloaded via the non-member form.

For all other scenarios, there is no restriction: you can choose freely between the member form and the non-member form. However, again, there exists a canonical form (a custom) for which operators should be members, as a non-member `operator+=` just seems weird, while a member `operator+` seems equally weird.

In general, the rule of thumb here is that whenever the operator is unary, or binary and needs to modify its left-hand operand, it should be overloaded as a member; otherwise (binary and non-modifying), it should be a non-member. Notice here that this rule *technically* says nothing — there is no regulation requiring your `operator+=` to modify the left-hand operand. However, again, **remember the motto.** Your operators should all be following what the builtin ones do; `+=` on `int`s (and other builtin types) performs the operation `a = a + b`, and thus you should follow that convention.

The operators that are customarily left-hand modifying, and thus nearly always overloaded as members include:
- All the compound assignment operator `@=`, where `@` is one of `+ - * / % & | ^ << >>`. These are the most obvious bunch, since `operator=` had already been required to be a member, and those are closely tied to `=` since you should always make `a @= b` and `a = a @ b` equivalent.
- The increment and decrement operator `++` and `--` (both forms). These also modify their arguments, and since `++a` is equivalent to `a += 1` (at least I hope you make it so), they belong in the same category.
- All the unary operators. These include `u+`, `u-`, `u*`, `u&`, `!`, `~`, and `co_await`. Although those do not (usually) modify their arguments, the unary-ness makes them tied closely to the argument and thus suitable for being a member.

All other operators should be overloaded as non-members. The reasoning for the existence of those rules is that left-modifying operators are naturally asymmetrical towards their two arguments and also tie more closely to the LHS since it needs to modify the argument. Therefore, they should use an asymmetrical syntax, namely overload as a member function. Other binary, non-modifying operators often treat their arguments equally (there are exceptions to this, like `->*`) and expect the same treatment (conversion, etc.) to happen to both operators, which member functions cannot provide. As for why non-modifying unary operators are recommended to members, too, that’s probably just a customary thing since non-member `operator*` just seems too weird.

### The Big Classification
Finally, after all the preludes, the general introduction stops here. The rest of the guide will be tailored to each operator, as their similarities and general principles have already been introduced, and the rest of the text will introduce each operator’s intricacies and conventions in detail. However, before we can start our journey for real, we still need to classify all the operators into several groups since each operator group still has some generality that can be introduced together (such as compound assignment operators `@=` are practically following the same principle, even though `@` can be different).

There are many different ways to classify operators:

By arity:
- Unary: `u+`, `u-`, …
- Binary: `b+`, `b-`, …
- N-ary: `()`, `[]`
- N/A (Can’t talk about arity): Conversion `operator T` (technically unary, but too different to count) and UDL `operator ""s`

By membership-ness:
- Required to be members: `()`, `[]`, `->`, `=`, `operator T` (conversion)
- Usually members: `u*`, `+=`, …
- Usually non-members: `b+`, `b-`, …
- Required to be non-members: `swap`, `<<`, `>>` (as I/O), `operator ""s` (UDL)

However, in this guide, the operators will be classified through *how often you should overload them* (ordered from most frequently to least):
- [The Good Four](#the-good-four): `=`, `<=>`, `==`, `swap`. Those are the **only** operators that you should consider overloading for all classes. All other operators below this category are only meant to be overloaded for specialized kinds of classes, not universally.

> [!IMPORTANT]
> This does **not** mean that you **should** always overload these operators since the first rule for operator overloading is still **Don’t Do It!**. Only comparatively, those are the most commonly overloaded operators.

- [The Functors](#functors-overloading-operator): `()`. The call operator is so special and common that it deserves its own group.
- [The Pointer and Iterator](#simulating-a-pointer): `u*`, `->`, `->*`, `[]`, `++`, and `--` (all forms). You should consider overloading these operators only for **pointer-like** or **iterator-like** classes. Notice that increment and decrement appear twice; that’s because they have completely different meanings here and below.
- [UDLs](#user-defined-literal-hidden-pearl-of-c): `operator ""s`. This is very interesting and sufficiently different from all other operators that it deserves its own group. Definitely take a read, though; it may be more commonly useable than you think!
- [The Arithmetic](#arithmetic-operators): These are the operators you should consider overloading only for **number-like** classes. Multiple subgroups exist: (still ordered by often-ness)
	- Normal Arithmetic: `b+`, `b-`, `b*`, `/`, `%`. These should be considered for most number-like classes.
	- Weirdos: `u+` and `u-`. Whenever `b+` and `b-` are overloaded, these should be, too, but they are still weird.
	- Increment/Decrement: `++`, `--` (all forms). In general, most classes that are **closed** on `b+` and `b-` should consider these.
	- Bitwise Arithmetic: `|`, `b&`, `~`, `>>`, `<<`. These should **only** be considered for number-like classes for which a bitwise interface makes sense.
- [Coroutine](#coroutine-internals-overloading-operator-co_await): `co_await`. This is also special and deserves its own group. However, you, as a user, probably never need to overload this operator.
- [The Bad Nine](#the-bad-nine): `u&`, `&&`, `||`, `,`, all `new`/`delete` forms, and `operator T` (conversion). **Here lies the evil ones.** Under normal circumstances, you should **never** overload these operators at all, no matter what kind of class you are dealing with.
- Irrelevant: `<`, `>`, `<=`, `>=`, `!=`, `!`. These are the lowest category, however, not because they are evil or anything. It’s just that overloading those operators is completely pointless, and you should not bother with any of those since it doesn’t matter at all in functionality.

The rest of the guide will follow this classification (not in order, click the above links to jump), so please just jump to the corresponding operator group you want to learn about. Let the journey in the operator zoo finally begin!

## The Good Four
### Simple Assignment: `operator=`
TLDR
```cpp
// canonical forms
T& operator=(this T&, const T&); // best
T& operator=(const T&) &; // also okay
T& operator=(this T&, T&&) noexcept; // best
T& operator=(T&&) & noexcept; // also okay

// forms that are useful in specific circumstances
T& operator=(this T&, T) noexcept;
T& operator=(T) & noexcept;
template<typename U>
T& operator=(this T&, /* const U& or const T<U>& or ... */);
```
#### The Basics
Ah, `=`, the most commonly overloaded operator, and also the operator with one of the most complex stories, guidelines, and mechanisms behind it. It is so special, yet so commonplace, presented in nearly every single class that many people do not even realize its complexity. This operator is tied so deeply into value semantics, one of the core characteristics of C++, such that understanding `=` is probably all they need to know about operator overloading for 90% of the people. In fact, `operator=` is the *only* operator that the compiler will automatically synthesize for you, even without you writing anything! Their importance can be seen in this special treatment.

One thing to be clear here: even though `operator=` is a binary operator and has to be overloaded in the member form, there are absolutely no restrictions on its argument type and return type; you can write `Y X::operator=(Z) const volatile &&` and the compiler will not say anything. However, *if* you write some specific forms of `operator=` overloads, then the compiler will treat them specially. Those special forms are: (assuming we are overloading `operator=` inside class `X`)
- If the argument type is `X` or `cv X&` (where *cv* is any combination of `const` and `volatile`), then this overload is a **copy assignment operator**.
- If the argument type is `cv X&&`, then this overload is a **move assignment operator**.

> [!NOTE]
> There are no requirements on the return type, and a class can have more than one copy/move assignment operator since multiple forms are possible, and they can be overloaded.

The importance of these two operators is shown in their names: whenever a copy assignment happens, one copy assignment operator will be invoked; whenever a move assignment happens, one move assignment operator will be invoked. You may think this is obvious nonsense, but beware: not all use of `=` triggers `operator=`!
```cpp
A a;
A a2 = a; // NOT a copy assignment
a2 = a; // a copy assignment
A a3 = std::move(a); // NOT a move assignment
a3 = std::move(a); // a move assignment
const A ca;
a3 = std::move(ca); // (usually) NOT a move assignment
```
The reason for this distinction is the liberal allowance of `=`’s appearance in [copy initialization](https://en.cppreference.com/w/cpp/language/copy_initialization); the syntax `T some_obj = other` and `T some_obj = {other}` (and array versions of these) both invoke a *constructor*, not an `operator=`. Similarly, `T some_obj = {a, b, c}` is a [*copy-list-initialization*](https://en.cppreference.com/w/cpp/language/list_initialization), and also do not invoke an `operator=`. Such distinction is unfortunate; fortunately, these are all the special rules with regards to `=`, and all other uses of `=` actually *do* invoke a suitable `operator=` following the ordinary overload resolution rules. From the above example, we can see that `operator=` is invoked whenever you want to copy/move the contents of one object into another preexisting object, hence the name of those forms. Since a copy assignment operator, by definition, *copies* the contents of another object into this one, it does not modify the other object and *does* modify the `this` object. Thus, its parameter type should be `const T&`, and its object parameter type should be `T&`, thus leading to the two canonical forms shown above. (See the [above sections](#deducing-this-a-retrospective-and-a-mistake-unfixed) for why we use `&` as the *ref-qualifier* instead of omitting it, as seen in most tutorials you may have seen before.)

This topic leads to another trap regarding `operator=`: `std::move` does not actually move anything, which highlights how poor a name that function has. In fact, the only thing `std::move` does is a cast to rvalue, which on the surface seems to have nothing to do with move at all! In fact, the term “move assignment operator” is, in reality, just a custom; we are assuming *rvalue means short-liveness*, and thus an `operator=` that only accepts rvalue operators can assume that its parameter will not be used later (either because of its lifetime is actually short, or because as a custom the caller use rvalues to signal they will not use the parameter anymore), and thus can steal the value of the parameter instead of copying it. Such an assumption often leads to much better performance compared to copying:
```cpp
// Example vector implementation
template<typename T>
class vector
{
private:
    T* data;
    size_t size, capacity; // actually, the most common implementation is 3 pointers

public:
    /* ... */
    vector& operator=(this vector& self, vector&& other) noexcept
    {
        /* ... destroy self's data array ... */
        self.data = other.data;
        self.size = other.size;
        self.capacity = other.capacity;
    }
};
```
Here, apart from the destruction of `self`’s pointer, all the move assignment operator has to do is copy some pointer and integer values, thus achieving O(1) effectiveness, which is inherently not possible for copying.

With this knowledge, we can understand why the above `a3 = std::move(ca)` is not a move assignment operation. `std::move` cast the right-hand expression to be of type `const A&&`, which *is* an rvalue but is also `const`, which prohibits the canonical move assignment operator to be called. The reason that the canonical version used non-`const` rvalue references is that it needs to steal the value from `other`, thus needing to modify it. In such cases, the call will be silently degrading to a copy assignment by the overload resolution rules (`const A&&` cannot be bound to `A&&`, but can be bound to `const A&`, as `const`-ness cannot be silently stripped), thus often resulting in worse performance. (This is also a good argument *against* `const` all the things.)

However, astute readers will throw a question at me after reading the above paragraph: using rvalues to mean short-liveness is just a *custom*, not a *rule*! The language has no enforcement on this custom, which means that the signature of the move assignment is a lie! Indeed, *value category is not lifetime*. It is true that temporary values are often rvalues, but often is not always, and the reverse is also not true:
```cpp
void fun(std::string s)
{
    std::string s1 = "Hello", s2;
    s2 = std::move(s1); // (1) Actually long-lived rvalues
    std::println("{}", s1); // OOPS, read from moved-from objects

    s2 = s; // (2) Actually short-lived lvalues
    // OOPS, a copy, even though s will be discarded after the next line anyway
    std::println("{}", s2);
}
```
The (1) case is unfortunate in that an rvalue actually referenced a long-lived object (`s1`) that is used after the move assignment, resulting in reading from a moved-from object that gets an unspecified (but valid) value. Such a read is potentially dangerous if the logic after still expects `s1` to retain its original value. The (2) case is also unfortunate, in that even though `s` is not used after the assignment and will end its lifetime very soon, since it is a lvalue, the assignment must perform a copy, even though a move would suffice. Both cases exposed that rvalue actually has nothing to do with short-liveness. Thus, the signature of the move assignment will indeed cause inconvenience in some cases.

A full solution to those two cases requires connecting lifetime with value categories more firmly in C++. For example, for (1), the solution will be to introduce destructive moves, where moved-from objects cannot be used at all, thus preventing the danger. For (2), the solution would be to treat the definite last use of variables as rvalues automatically, thus eliminating this potential inefficiency. In fact, the language is already slowly moving in this direction in a small but crucial case: the `return` statement.
```cpp
std::string fun()
{
    std::string s;
    return s; // If no NRVO occurs, then a guaranteed move construction here; no copy!
}
```
Even though `s` is definitely a lvalue here, the language requires that such a direct `return` statement for local variables *must* treat its argument as an rvalue [since C++23](https://wg21.link/P2266), since this is *definitely* the last use of the local variable. This is called “implicit move” and has been an optimization well-known to the compilers since C++11. However, such treatment has not expanded to other definite last uses (yet?), and even if it does, cases where the variable is not the last use but its value is not needed anymore (such as dead stores) will still not be optimized, demonstrating the weakness in the rvalue abstraction.

The (1) case is more difficult and dangerous since it caused unexpected behavior instead of just a performance reduction. For this reason, the language introduced `std::move` to explicitly signal the creation of rvalues, and to inform the writer that the variable’s value better not be used after this statement. This custom is not enforced, nor is it perfect, but that’s what we are now, and the status quo is unlikely to change anymore. Just beware of this weak equality between rvalue and short-liveness and move on with life, then.

#### Automatic Generation Rules: The Rule of Three, The Rule of Five, and The Rule of Zero
Back on topic. I said earlier that `operator=` is the only operator that will be generated by the compiler even if you don’t write anything. A natural question arises: when will the compiler generate them, and what does the generated version do?

The second question is easier to answer:
- If the class in question is a normal class, the generated version of `operator=` will do the same operation *memberwise*.
- If the class in question is a union, the generated version of `operator=` will do a copy of the object representation (in other words, copy all the bytes of the object, as if by `std::memmove`).

There are two nuances worth pointing out with this seemingly simple description. First, the definition of *member* is not just *data* members but *subobjects*. The difference between those two terms is that the latter also includes the direct bases of a class since, in the C++ object representation, the base subobjects come first before any data members. (Astute readers may ask about what will happen for virtual indirect bases that are inherited multiple times, as they are guaranteed to only appear once in the object representation, but their construction requires coordination from even indirect subclasses. The answer is simple: whether their subobjects are assigned one time or multiple times in the implementation of the implicitly-defined assignment operators is unspecified. *Sigh*) The term “subobjects” also refers to each element of an array member and not the array itself, which guarantees the correct generation of default copy/move assignment for array members since built-in array types do not have an assignment operator at all. 

Another nuance with regards to unions is what is not said in the second bulletin: The *only* thing the automatically generated `operator=`s for a union will do is copy the bytes; notably, no calls to the data members’ `operator=` will happen! This is obviously a problem since non-trivial data members are non-trivial *because* their `operator=` does different things than just copying the bytes. For instance, `std::vector`’s copy assignment operator needs to allocate a new buffer in case the current buffer is not large enough, copy over the elements, and adjust the size/capacity pointer/member. If only the bytes are copied over, two `std::vector`s will refer to the same memory, which will result in a guaranteed double-deletion. It is for this reason that we say C++ unions are unsafe, and you need some auxiliary structure to keep track of the active member and overload the `operator=`s to call the appropriate underlying `operator=` is a necessity unless you only have trivial members. (Or, better yet, use a safe wrapper that handles these chores for you, such as `std::variant`.)

The questions of *when* will the compiler generate `operator=`s for you are a lot more complicated to answer. Obviously, if you are not writing a copy/move assignment operator, the compiler will generate one for you, right? Wrong! The rule for when the copy and move assignment operators are generated are encoded in the so-called Rule of Three and Rule of Five, where the former applies to C++98/03, and the latter applies to C++11 and later:
- **Rule of Three**: If you declare any of a copy constructor, copy assignment operator, or destructor, you should declare all three
- **Rule of Five**: If you declare any of a copy constructor, move constructor, copy assignment operator, move assignment operator, or destructor, you should declare all five

Now, the rules aren’t that simple: Declaring a copy constructor won’t affect the generation of a copy assignment operator (and vice versa), and declaring a destructor won’t affect the generation of a copy constructor or a copy assignment operator. However, for all other relationships (basically, those interacting with move operations, which C++11 can fix right away), the Rule of Five *does* apply, and the above irregularities are actually deprecated behavior. Therefore, personally, I recommend just treating the rule as-if by Rule of Five: if you declare any one of the five special member functions, **all** five will not be automatically generated. It is not the truth, but close enough to be a guideline to follow.

The reasoning behind Rule of Five and C++11’s forceful enforcement of it is due to an acronym commonly thrown around by C++ enthusiasts: RAII or Resource Acquisition Is Initialization. Now, this acronym is actually wrong; the behavior/principle that people actually *mean* when they say RAII is *Resource Release Is Destruction*, but RRID is not a good acronym, so we came up with RAII. The driving principle behind this idea is to treat C++ destructors as resource releasers:
```cpp
struct LockGuard
{
    std::mutex m;
    ~LockGuard() { m.unlock(); }
};

{
    std::mutex m; m.lock();
    LockGuard lk{m};
    /* ... no matter what happens here, even under an exception, the mutex is always unlocked */
}
```
Such resource management classes (or “RAII classes”) are the cornerstone of modern C++ resource management, and countless examples of these kinds of classes have found their way into the standard (`std::lock_guard`, smart pointer, `std::jthread`, IOStreams, …) and third-party libraries. They serve the same function as `finally` clauses in other languages serve: to ensure resource release always happens, no matter which exit path the code takes.

One crucial question to be answered for RAII classes is how their copying behavior is. A lot of choices exist, and each of them has its own benefits, drawbacks, and use cases such that no one is the preferred approach. For instance, you can do:
- **Unique Ownership**: The easiest way out. Just forbid copying and only allow moving (in some rare cases, you can even disallow moving if there is no suitable empty state). For memory resources, this is `std::unique_ptr`.
- **Deep-Copying**: If the underlying resource is not unique, just copy the resource on every copy of the management class. For memory resources, this is `std::indirect` or `std::polymorphic` ([C++26](https://wg21.link/P3019)).
- **Reference Counting**: One of the more complex approaches. Keep a carefully protected shared counter of the number of copies for each resource, and only release if the copy goes down to zero. This often requires intrusive bookkeeping or heap allocation while also requiring careful protection of concurrent modifications to the counter (through atomics or locks), and thus is much more heavyweight and more flexible than the above approaches. For memory resources, this is `std::shared_ptr` or `boost::intrusive_ptr`.
- **Shared Ownership**: If we can do a safe shared counter, why not share the entire resource? This requires coordination from the resource itself, such as the presence of concurrent queues or locks to safely handle concurrent requests and also some way of handling multiple releases. This essentially combines management classes into the resource itself. The management class can be a simple observer/view that has trivial copying.

All of these require different `operator=` behavior. For unique ownership, normally you want to not generate `operator=`; for the rest, you want the generation of `operator=` but with vastly different behavior. For instance, shared ownership management classes can do with the default memberwise behavior, but for reference counting, that would be a disaster. It is precisely because of the lack of a preferred approach that Rule of Five exists: If you are writing a destructor, you are probably writing a RAII class, and in that case, you should write out the behavior of copy/move operations directly and explicitly; automatic generation is usually wrong. Reversely, if you are customizing copy/move operations, you are probably managing some kind of resources, and you should write a destructor to be an RAII class.

Rule of Five is great and does prevent a lot of mistakes; however, writing classes under this rule is really annoying:
```cpp
class Widget
{
private:
    SomeResource resource;

public:
    // I'm managing resources; let's make this a RAII class
    ~Widget() { resource.release(); }

    // OOPS, that disable move operations; I want the shared ownership behavior, where defaulted copy/move suffice
    Widget(Widget&&) noexcept = default;
    Widget& operator=(Widget&&) & noexcept = default;

    // OOPS, those now disable copy operations
    Widget(const Widget&) = default;
    Widget& operator=(const Widget&) & = default;
};
```
Although it is correct to force you to always write out the intention explicitly, people are still lazy. In that case, I have a better rule to follow when overloading `operator=` as a special member function:
- **Rule of Zero**: If you declare any of a copy constructor, move constructor, copy assignment operator, move assignment operator, or destructor, you should declare all five; **however, normal classes shouldn’t define any of them; leave these to a (preferably standard) class specifically dealing with ownships**.

```cpp
class Widget
{
private:
    std::unique_ptr<SomeResource, decltype([](auto& r) { r.release(); })> resource;

public:
    // No need for a destructor!
    // Therefore, no need to manually restore move!
};
```
Once you factor out the handling of ownership into its own class, you’ll suddenly find that the automatically generated version Just Works. What a relief! Even better, as listed above, many common ownership handling classes have a standard version that handles everything for you, so ideally, you don’t ever need to write those five special members at all! This is why it is called the Rule of *Zero*.

> [!NOTE]
> Even though things like `unique_ptr` handles memory resources, they all supported some form of custom deleters that allows you to handle arbitrary release behaviors; of course, it’s better to use more specific classes that have a better interface, such as preferring `std::fstream` over `std::unique_ptr<FILE>`)

None of us lives in an ideal world, but at least you should factor out your ownership logic into its own (preferably generic) class and enjoy Rule of Zero for the rest.

#### When Compiler Fails: Defaulted as deleted, and why it matters

#### Copy-and-Swap Idiom: When and How

#### More Idioms
##### Copy-and-Move Idiom

##### Implementing Constructors by Assignment

##### A Nightmare Operator: Deal with `optional<T&>`

#### `operator=` That Is Not Copy/Move Assignment: Irrelevant or Optimization?

#### Templated `operator=`

#### Virtual `operator=`: Genius or Trap?

#### `const operator=`: When Is A Contradiction Useful?

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

## Functors: Overloading `operator()`
### `static`, `const`, Lambda, `mutable`, Oh My!

### Stateful and Pure Functors with Standard Algorithms

### Perfect-Forwarding Functors: `= delete` and Deducing This

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

### Iterator Special: Cornerstone of STL Algorithms
#### The Basics: Evolution of Iterator Category in the STL

#### `u*`, `->` and `++`: Disguised Core

#### `--`, `+=`, `-=`, and `[]`: Extending the Basic Iterator

#### Comparison For Iterators: A War Story

#### Sentinel: Revolution on the Old STL

#### Postfix `++ --` in C++20: A Rebellion

#### `explicit operator bool` for Ranges: A Twist

### `u*`: Nullable, Pointer or Optional?

### Deprecating and Decreasing `operator->`

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

### Overloadable `operator^^`: Customising Reflection

### A Pipeline-Rewrite Operator: `|>`

### A Control-Flow Operator: `??`

### A Implication Arrow: A Herculean Task

### A War Story on Pattern Matching and Operators (`is`, `as`, `match`, ...)
#### Basics: What Is PM And Why Should You Care?

#### Chaining vs Composition: The PM Debate in C++26

#### Generalized `match` and `is`: Converging Solutions

### Prefix UDL: String Interpolation and More

### Future of Operator Rewriting: Shooting An Arrow At The Star
#### MORE Rewriting! What's Not To Like?

#### Rewriting `->` and `->*`: War Signal From Library

#### Rewriting Arithmetic: How Far?

### Chained Comparison: A Dream Revisited
