---
title: "Fun With Deducing This, SMFs and = delete"
published: 2025-01-07
description: Exploring deducing this, special member functions, and implementation divergence.
tags: [Language, "Operator Overloading", "Implementation Divergence"]
category: C++
---
<style>
:root {
    --legendwidth: 250px;
    --launcherwidth: 70px;
}

figure.screenshot, figure.star-count {
    display: block;
    text-align: center;
}
figure.screenshot img {
    vertical-align: top;
}
figure.screenshot figcaption {
    font-size: medium;
}

table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
}

/*@media (prefers-color-scheme: dark) {
    th {
        background-color: #222;
        color: white;
    }
    .dropped, .ext, .yes, .no, .notreally, .mixed, .almost, .kdeapp, .gnomeapp, .mktshare1, .mktshare5, .mktshare20, .mktshare30, .mktshare40, .mktshare100, .otherclients, .mau0, .mau1, .mau2, .mau3, .mau4, .mau5, .mau6 {
        color: black;
    }
    table tr.product td {
        border-color: #333;
    }
}*/

table.comparison {
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
    text-align: center;
    border: none;
    table-layout: fixed;
    font-size: small;
    width: calc(2 * var(--legendwidth) + 6 * var(--launcherwidth));
}

table.comparison tr td table {
    margin: 0;
    padding: 0;
    text-align: center;
    border: none;
    table-layout: fixed;
    font-size: small;
    height: inherit;
}

thead {
    border: none;
    position: sticky;
    position: -webkit-sticky;
    top: 0px;
    z-index: 10000;
}

thead tr td {
    background-color: white;
    font-weight: bold;
}

.legend {
    background-color: white;
    z-index: 999;
}

/*@media (prefers-color-scheme: dark) {
    thead tr td, .legend {
        background-color: #222;
        color: white;
    }
}*/

@media (min-width: 578px) {
    table.comparison tr>td:first-child[colspan="2"], table.comparison tr>td:first-child:not([colspan]) + td, .legend {
        position: -webkit-sticky;
        position: sticky;
        left: 0;
    }
}

td {
    border: none;
    padding: 0px;
    vertical-align: top;
    overflow-wrap: break-word;
    hyphens: auto;
}

td img {
    padding: 15px 0px;
}

table.split {
    border: none;
    table-layout: fixed;
    width: calc(var(--launcherwidth));
    height: 100%;
}

table.split tr td {
    border: none !important;
    width: 50%;
    overflow-wrap: break-word;
    hyphens: auto;
}

/*table.comparison tr td:first-child[colspan="2"], table.comparison tr td:first-child:not([colspan]) + td {
    border-left: 1px dotted lightgrey;
}

table.comparison tr td:last-child {
    border-right: 1px dotted lightgrey;
}*/

.semititle {
    text-decoration: underline;
    font-weight: bold;
    vertical-align: bottom;
}

table.comparison tr td, table.comparison tr td table tr td {
    line-height: normal;
    vertical-align: middle;
    font-size: small;
}

table.comparison tr td:not(:has(table)), table.comparison tr td table tr td {
    padding: 5px 0 5px 0;
}

.center, table.comparison tr td {
    text-align: center;
}

.tooltip {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: darkred;
}

.tooltip .tooltiptext {
    width: max-content;
    max-width: 200px;
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 5px;
    position: absolute;
    z-index: 1000;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
    font-weight: normal;
}

.yes {
    background-color: #CEE6BB;
}

.almost {
    background-color: #E7F2DD;
}

.mixed {
    background-color: #E7DEB1;
}

.notreally {
    background-color: #F5E0D6;
}

.no {
    background-color: #EBC1AD;
    color: #384743;
}

img.logo {
    object-fit: cover;
    width: 80%;
    max-height: 100%;
}

img {
    display: block;
    margin-left: auto;
    margin-right: auto;
}

td.yes,
td.almost,
td.no,
td.mixed,
td.notreally,
td.line,
td.grey, td.blue, td.greyblue, td.extracolour1, td.extracolour2, td.purple, td.purple2, td.purple3 {
    border-top: 1px solid lightgrey;
    border-bottom: 1px solid lightgrey;
    /* FIXME: sticky cannot use border-collapse: collapse */
}

.grey { background-color: lightgrey; }
.blue { background-color: lightblue; }
.greyblue { background-color: #B0C6CD; }
.extracolour2 {background-color: darkkhaki; }
.extracolour1 {background-color: tan; }
.purple { background-color: plum; }
.purple2 { background-color: thistle; }
.purple3 { background-color: violet; }

/*@media (prefers-color-scheme: dark) {
    td.grey, td.blue, td.greyblue, td.extracolour1, td.extracolour2, td.purple, td.purple2, td.purple3 {
        color: black;
    }
}*/
</style>

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

Let's see! (All results are obtained from the trunk versions of compilers as of January 2025)

*Note*: since DT cannot be used on constructors or destructors, the only valid forms are on copy/move assignment operators and comparison operators.

<table class="comparison">

<colgroup>
<col style="text-align: left; white-space: nowrap; padding-right: 5px; width: var(--legendwidth);">
<col style="border-left: double; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; border-right: solid; width: var(--legendwidth);">
</colgroup>

<thead>
<tr>
<td class="legend">Form</td>
<td class="line">Standard</td>
<td class="line">GCC</td>
<td class="line">Clang</td>
<td class="line">MSVC</td>
<td class="line">EDG</td>
<td class="line">Link</td>
<td class="line">Comments</td>
</tr>
</thead>

<tbody>
<tr>
<td></td>
<td class="semititle line" colspan="7">Copy Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, const A&);</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Welp, it seems that MSVC does not implement CWG 2586 at all...</span></td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/o51EserWq">Godbolt</a></td>
<td class="line">Normal Copy Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, A&);</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Same as above, erroneously generate an implicit copy assignment operator and do resolution based on that</span></td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/hEh8z8GnE">Godbolt</a></td>
<td class="line">Stealing Copy Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, A);</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Same as above, ambiguous between the implicitly generated one and CAS</span></td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/ra1r4jY9b">Godbolt</a></td>
<td class="line">CAS Copy Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this const A&, const A&);</code></td>
<td class="yes tooltip" style="z-index: 1000;">✅<span class="tooltiptext">There is a note in CWG 2586 that pointed out that it is weird for this to be considered a copy assignment; however as of now it is the status quo in the standard.</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="mixed">?</td>
<td class="line"><a href="https://godbolt.org/z/WhYGooPE3">Godbolt</a></td>
<td class="line">Copy Assignment With <code>const A&</code> Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A, const A&);</code></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Ambiguous with the implicitly generated one</span></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Ambiguous with the implicitly generated one</span></td>
<td class="mixed">?</td>
<td class="line"><a href="https://godbolt.org/z/1bTbzdsPs">Godbolt</a></td>
<td class="line">Copy Assignment With <code>A</code> Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this int, const A&);</code></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Somehow generated an invalid redeclaration error</span></td>
<td class="line"><a href="https://godbolt.org/z/Mz7TeaGrx">Godbolt</a></td>
<td class="line">Copy Assignment With Unrelated Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this auto&&, const A&);</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must not be a template</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="line"><a href="https://godbolt.org/z/9881PM6T8">Godbolt</a></td>
<td class="line">Copy Assignment With Templated Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, const A&) = default;</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Currently it seems that MSVC just rejects defaulting functions with DT</span></td>
<td class="no tooltip">❌<span class="tooltiptext">EDG complains about signature only</span></td>
<td class="line"><a href="https://godbolt.org/z/aEvKhMejY">Godbolt</a></td>
<td class="line" rowspan="7">Above With <code>= default</code></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, A&) = default;</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no">❌</td>
<td class="no">❌</td>
<td class="line"><a href="https://godbolt.org/z/hjxMMzn8s">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, A) = default;</code></td>
<td class="yes tooltip" style="z-index: 1002;">❌<span class="tooltiptext">Not an allowed signature for defaulting</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="no tooltip">❌<span class="tooltiptext">Reject only because it cannot handle defaulting DT at all</span></td>
<td class="yes">❌</td>
<td class="line"><a href="https://godbolt.org/z/bY635q4cx">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this const A&, const A&) = default;</code></td>
<td class="yes tooltip" style="z-index: 1001;">✅<span class="tooltiptext">The last rule for defaulting above specifies that any kind of reference to A is acceptable</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/8anavTsze">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A, const A&) = default;</code></td>
<td class="yes tooltip" style="z-index: 1000;">❌<span class="tooltiptext">Not a reference to A, which <a href="https://eel.is/c++draft/dcl.fct.def.default#2.5">should</a> be default as deleted</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="yes tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/frrT8vhqj">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this int, const A&) = default;</code></td>
<td class="yes">❌</td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="yes tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/WMKrW91ch">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this auto&&, const A&) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must not be a template</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="line"><a href="https://godbolt.org/z/EK9175Yv8">Godbolt</a></td>
</tr>

<tr>
<td></td>
<td class="semititle line" colspan="7">Move Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, A&&);</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Erroneously generate an implicit move assignment operator and do resolution based on that</span></td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/89TojWb7f">Godbolt</a></td>
<td class="line">Normal Move Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, const A&&);</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no">❌</td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/qh9G38xET">Godbolt</a></td>
<td class="line">Weird Move Assignment</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this const A&, A&&);</code></td>
<td class="yes tooltip" style="z-index: 1000;">✅<span class="tooltiptext">There is a note in CWG 2586 that pointed out that it is weird for this to be considered a move assignment; however as of now it is the status quo in the standard.</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ambiguous with the implicitly generated one</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/z71hfK9WT">Godbolt</a></td>
<td class="line">Move Assignment With <code>const A&</code> Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&&, A&&);</code></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Ambiguous with the implicitly generated one</span></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Ambiguous with the implicitly generated one</span></td>
<td class="yes">✅</td>
<td class="line"><a href="https://godbolt.org/z/a31jsj7WG">Godbolt</a></td>
<td class="line">Move Assignment With <code>A&&</code> Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this int, const A&);</code></td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Conflicts with copy assignment</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Silently calls the implicitly generated one</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Conflicts with copy assignment</span></td>
<td class="line"><a href="https://godbolt.org/z/vz3vfP9rY">Godbolt</a></td>
<td class="line">Move Assignment With Unrelated Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this auto&&, A&&);</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must not be a template</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="line"><a href="https://godbolt.org/z/eon5f8x9v">Godbolt</a></td>
<td class="line">Move Assignment With Templated Object Param</td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, A&&) = default;</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Currently it seems that MSVC just rejects defaulting functions with DT</span></td>
<td class="no tooltip">❌<span class="tooltiptext">EDG complains about signature only</span></td>
<td class="line"><a href="https://godbolt.org/z/fa13cqanz">Godbolt</a></td>
<td class="line" rowspan="6">Above With <code>= default</code></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&, const A&&) = default;</code></td>
<td class="yes tooltip" style="z-index: 1002;">❌<span class="tooltiptext">Not a permitted deviation; only stripping const is allowed; <a href="https://eel.is/c++draft/dcl.fct.def.default#2.5">should</a> be default as deleted</span></td>
<td class="yes tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="yes tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/nPqnha7Pd">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this const A&, A&&) = default;</code></td>
<td class="yes tooltip" style="z-index: 1001;">✅<span class="tooltiptext">The last rule for defaulting above specifies that any kind of reference to A is acceptable</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/rfxqPPa9n">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this A&&, A&&) = default;</code></td>
<td class="yes">✅</td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="yes tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/zv9hKeb57">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this int, A&&) = default;</code></td>
<td class="yes">❌</td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="yes tooltip">❌<span class="tooltiptext">Default as deleted</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="almost tooltip">❌<span class="tooltiptext">Ill-formed</span></td>
<td class="line"><a href="https://godbolt.org/z/cja4WcsWY">Godbolt</a></td>
</tr>

<tr>
<td class="legend"><code>A& operator=(this auto&&, A&&) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must not be a template</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="line"><a href="https://godbolt.org/z/K49T9nK4q">Godbolt</a></td>
</tr>

<tr>
<td></td>
<td class="semititle line" colspan="7">Comparison</td>
</tr>

<tr>
<td class="legend"><code>auto operator<=>(this A, A) = default;</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no tooltip">❌<span class="tooltiptext">Refuse to recognize this as a comparison</span></td>
<td class="no tooltip">❌<span class="tooltiptext">Refuse to default comparison written in DT</span></td>
<td class="line"><a href="https://godbolt.org/z/z45hcEMY7">Godbolt</a></td>
<td class="line">Normal Spaceship With <code>A</code></td>
</tr>

<tr>
<td class="legend"><code>auto operator<=>(this const A&, const A&) = default;</code></td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="yes">✅</td>
<td class="no">❌</td>
<td class="no">❌</td>
<td class="line"><a href="https://godbolt.org/z/Mnfr1zW7f">Godbolt</a></td>
<td class="line">Normal Spaceship With <code>const A&</code></td>
</tr>

<tr>
<td class="legend"><code>auto operator<=>(this const A&, A) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Two parameter must be of same type</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="no">❌</td>
<td class="no">❌</td>
<td class="line"><a href="https://godbolt.org/z/he97vfb71">Godbolt</a></td>
<td class="line">Asymmetric Spaceship</td>
</tr>

<tr>
<td class="legend"><code>auto operator<=>(this A&, A&) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Two parameter must be of either A or const A&</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="no">❌</td>
<td class="no">❌</td>
<td class="line"><a href="https://godbolt.org/z/9jcYhax4z">Godbolt</a></td>
<td class="line">Wrong Param Type Spaceship</td>
</tr>

<tr>
<td class="legend"><code>int operator<=>(this A, A) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must return auto or a category type</span></td>
<td class="no">✅</td>
<td class="yes">❌</td>
<td class="no">❌</td>
<td class="no">❌</td>
<td class="line"><a href="https://godbolt.org/z/b6aGWP7zK">Godbolt</a></td>
<td class="line">Wrong Return Type Spaceship</td>
</tr>

<tr>
<td class="legend"><code>int operator==(this A, A) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must return bool</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="no">❌</td>
<td class="no">❌</td>
<td class="line"><a href="https://godbolt.org/z/66E7vfGM1">Godbolt</a></td>
<td class="line">Wrong Return Type Equality</td>
</tr>

<tr>
<td class="legend"><code>auto operator<=>(this auto, A) = default;</code></td>
<td class="yes tooltip">❌<span class="tooltiptext">Must not be a template</span></td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="yes">❌</td>
<td class="line"><a href="https://godbolt.org/z/v66s7jdvr">Godbolt</a></td>
<td class="line">Templated Spaceship</td>
</tr>
</tbody>
</table>

Hmmm... Guess let's not use DT on SMFs for now if you want portability...
