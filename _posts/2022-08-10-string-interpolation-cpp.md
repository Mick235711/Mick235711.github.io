---
title: "String Interpolation For C++: Going Down The Rabbit Hole"
categories:
- C++
- Language
- Mass Survey
feature_image: "/upload/iceberg.jpg"
---

## Contents

* TOC
{:toc}

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
very caution to add new feature into the already-complex-enough-language-mess that is C++. So is there a compelling
reason to add yet another kind of string literal into C++?

I think there is.

Being used to these "f-strings" in Python, I found them shine especially bright in the context of debugging
and logging. For example:
```python
def connect(ip: str, port: int) -> None:
    print(f"Connecting to {ip}:{port}...")

for i in range(1000):
    print(f"[{i:3}/1000] Result = {result()}...")

# Output:
# [  1/1000] Result = 0.1...
# [  2/1000] Result = 0.3...
# ...
```
It is also useful in constructing strings that embed other information,
such as `__repr__`/`__str__` methods:
```python
class Student:
    def __init__(self, name: str, age: int) -> None:
        self.name, self.age = name, age

    def __repr__(self) -> str:
        return f'<Student {self.name} with age {self.age}>'
```

### But don't we already have `std::format`?
Yes, and I'm also aware that there is proposals to add `constexpr` formatting capabilities
to `std::format`. However, `std::format`, as a library feature, does not come close to the
user-friendliness and convenience brought by string interpolation. Compare:
```cpp
std::format("<Student {} with age {}>", name, age);
f"<Student {name} with age {age}>"
```
I do think that interpolated literals bring the variables and expressions to be replaced directly
into the place they belong. In the formatting example, we still need to manually map the positioning
of `{}`s and variables in our mind. It is even worse if we specify positional argument in `std::format`,
as we need to manually re-position all the variables.

Of course, this is not to say that string interpolation is a direct replacement of `std::format`.
There is still the advantage of i18n localized formatted strings, in which we can provide `{0} {1}`
in one language and `{1} {0}` in another language where grammar were reversed. Another
advantage is the ability of repeating positional specifier to repeat a variable.

Both EWGI and EWG had expressed support in a future C++ string interpolation facility, so it is worthwhile
to have a look at how other language did it, and find a good way for C++ to process forward.
> EWGI (2019-07 Cologne): Spend committee time on this vs other proposals given that time is limited?

<table style="width: 250px; margin-bottom: 1rem;" class="withborder">
    <thead><tr>
        <td>SF</td><td>F</td><td>N</td><td>A</td><td>SA</td>
    </tr></thead>
    <tbody><tr>
        <td>3</td><td>5</td><td>2</td><td>2</td><td>0</td>
    </tr></tbody>
</table>

> EWG (2022-08-04): Given our time is limited, and our resources are scarce, EWG Encourages further work in the direction of P1819.

<table style="width: 250px; margin-bottom: 1rem;" class="withborder">
    <thead><tr>
        <td>SF</td><td>F</td><td>N</td><td>A</td><td>SA</td>
    </tr></thead>
    <tbody><tr>
        <td>3</td><td>5</td><td>3</td><td>0</td><td>0</td>
    </tr></tbody>
</table>

> Result: Consensus

## Survey
At a glance, string interpolation seems a pretty simple feature: just factor out all the expressions
and rewrite to a `std::format` call, right? However, there are a surprisingly large number of subtle
issues involved in this concept, with most of them no clear answer. Therefore, I want to take a practical
approach, or what WG21 often describe as "standardizing existing practice"... take a look at all the language
that already have string interpolation ability, and look at how they solve the issues.

The language chosen are taken from the [string interpolation Wikipedia page](https://en.wikipedia.org/wiki/String_interpolation),
with a total of 27 different languages: ABAP, Bash, Boo, C#, ColdFusion, CoffeeScript,
Dart, Groovy, Haxe, JavaScript, Julia, Kotlin, Nemerle, Nim, Nix, ParaSail,
Perl, PHP, Python, Ruby, Rust, Scala, Sciter, Swift, Tcl, TypeScript and Visual Basic.

| Language     | Mode          | Syntax                   | Expression | Format           | Link |
|--------------|---------------|--------------------------|------------|------------------|------|
| ABAP         | Dynamic (DSL) | `|{...}|`                | ✅         | ❌               | [String Templates](https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abenstring_templates.htm) |
| Bash         | Dynamic       | `"$..."`, `"${...}"`     | ❌         | Many             | [Shell Parameter Expansion](https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion) |
| Boo          | Dynamic       | `"$..."`, `"$(...)"`     | ✅         | ❌               | [String Interpolation](https://github.com/boo-lang/boo/wiki/String-Interpolation) |
| C#           | Static (VM)   | `$"{...}"`               | ✅         | `{...,...:...}`  | [String Interpolation](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated) |
| ColdFusion   | Dynamic       | `"#...#"`                | ✅         | ❌               | [Parsed by Server](https://coldfusion.adobe.com/2021/04/coldfusion-101-tags-script-functions-part-3-functions/) |
| CoffeeScript | Dynamic       | `"#{...}"`               | ✅         | ❌               | [Strings](http://coffeescript.org/#strings) |
| Dart         | Static (VM)   | `'$...'`, `'${...}'`     | ✅         | ❌               | [Strings](https://dart.dev/guides/language/language-tour#strings) |
| Groovy       | Both          | `"$..."`, `"${...}"`     | ✅         | ❌               | [GString Interpolation](https://groovy-lang.org/syntax.html#_string_interpolation) |
| Haxe         | Static (VM)   | `'$...'`, `'${...}'`     | ✅         | ❌               | [String Interpolation](https://haxe.org/manual/lf-string-interpolation.html) |
| JavaScript   | Dynamic       | `` `${...}` ``           | ✅         | ❌               | [Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) |
| Julia        | Dynamic       | `"$..."`, `"$(...)"`     | ✅         | ❌               | [String Interpolation](https://docs.julialang.org/en/v1/manual/strings/#string-interpolation) |
| Kotlin       | Static (VM)   | `"$..."`, `"${...}"`     | ✅         | ❌               | [String Templates](https://kotlinlang.org/docs/basic-types.html#string-templates) |
| Nemerle      | Static (VM)   | `$"$..."`, `$"$(...)"`   | ✅         | ❌               | [String Interpolation](https://github.com/rsdn/nemerle/wiki/Features#string-interpolation) |
| Nim          | Static        | `fmt"{...}"`, `&"{...}"` | ✅         | `{...[=]:...}`   | [std/strformat Module](https://nim-lang.org/docs/strformat.html) |
| Nix          | Dynamic (DSL) | `"${...}"`               | ✅         | ❌               | [Nix Values: Antiquotation](https://nixos.org/manual/nix/stable/expressions/language-values.html) |
| ParaSail     | Both          | ``"`(...)`"``            | ✅         | ❌               | [ParaSail Reference Manual](https://adacore.github.io/ParaSail/images/parasail_ref_manual.pdf) |
| Perl         | Dynamic       | `"$..."`, `"@{...}"`     | Only Array | ❌               | [Array Interpolation](https://perldoc.perl.org/perldata#Array-Interpolation) |
| PHP          | Dynamic       | `"$..."`, `"{...}"`      | ✅         | ❌               | [Variable Parsing](https://www.php.net/manual/en/language.types.string.php#language.types.string.parsing) |
| Python       | Dynamic       | `f"{...}"`               | ✅         | `{...[=]!.:...}` | [Formatted String Literals](https://docs.python.org/3/reference/lexical_analysis.html#f-strings) |
| Ruby         | Dynamic       | `"#{...}"`               | ✅         | ❌               | [String Literals](https://ruby-doc.org/core-3.1.2/doc/syntax/literals_rdoc.html#label-String+Literals) | 
| Rust         | Static        | `println!("{...}")`      | ❌         | `{...:...}`      | [Named Parameters](https://doc.rust-lang.org/stable/std/fmt/#named-parameters) |
| Scala        | Static (VM)   | `s"$..."`, `s"${...}"`   | ✅         | ❌               | [String Interpolation](https://docs.scala-lang.org/overviews/core/string-interpolation.html) |
| Sciter       | Dynamic (DSL) | `$fun({...})`            | ✅         | ❌               | [Stringizer Functions](https://sciter.com/docs/content/script/language/Functions.htm#Stringizer) |
| Swift        | Static        | `"\(...)"`               | ✅         | ❌               | [String Interpolation](https://docs.swift.org/swift-book/LanguageGuide/StringsAndCharacters.html#ID292) |
| Tcl          | Dynamic       | `"$..."`                 | ❌         | ❌               | [Variable Substitution](http://tmml.sourceforge.net/doc/tcl/Tcl.html) |
| TypeScript   | Dynamic       | `` `${...}` ``           | ✅         | ❌               | Same as JavaScript |
| Visual Basic | Static (VM)   | `$"{...}"`               | ✅         | `{...,...:...}`  | [Interpolated Strings](https://docs.microsoft.com/en-us/dotnet/visual-basic/programming-guide/language-features/strings/interpolated-strings) |

## Syntax Design
### Big Picture
First, let's have a look at the general syntax components of a interpolated string literal.
They, in general, looks somewhat like this:
```python
f"Other things {myVar:.2} other things"
| ^^^^^^^^^^^^^||||||||||^^^^^^^^^^^^^ string component
|              ^||||||||^ delimeter
|               |||||^^^ formatter
|               ^^^^^ expression
^ introducer
```
Such literals usually composed of five parts: introducer
(some language use special quotation mark like backticks, those count as introducer too),
expression, formatter, delimeter, and string component. Often, some parts may be missing (like language that
does not support formatting will not have formatter), but in this post we will take a look at each of the components,
and their different appearance in each language.

Let's break down the easy part first. The string component is, obviously, the same for all language, these are just regular
strings. Other parts are much more complicated, and will be discussed from inside to outside.

### Expression
Expression is the part where you specify the variables or expressions that you want to substitute in.
There, most language just simply agrees that any expression can be put here, for example:
```python
apple = 3
print(f"I have {apple} apples.")  # I have 3 apples.
print(f"I have {apple + 1} apples.")  # I have 4 apples.
```
Notice that often, arbitrary expression support is required for convenience of this feature
(which is really all it is about, it is just a syntactic sugar), for example `apples[0]`,
`get_apples()` being substituted are very common case that appears in many real-world code.
Which is why most language agree that any expression can appear here.

However, some language take a different route: only allow a variable name here, nothing else.
Or in C++-speak, only allow a single *id-expression* here:
```rust
let apple = 3;
println!("I have {apple} apples.");  // Okay
println!("I have {apple + 1} apples.");  // Error!
```
On surface, this seems an arbitrary restriction, and really had prevented some useful use case
like subscripting and function call. Natuarally, only a handful of language take this route.
In the above table we can see that only Bash, Tcl and Rust have this restriction, while Bash
and Tcl are both dynamic scripting language that naturally only support `$variable` as variable
substitution and nothing else. This leaves Rust as the only language that only support variable
substitution, and in [RFC 2795](https://rust-lang.github.io/rfcs/2795-format-args-implicit-identifiers.html),
the author explained the rationale:
> If any expressions beyond identifiers become accepted in format strings, then the RFC author expects that users
> will inevitably ask "why is my particular expression not accepted?". This could lead to feature creep, and
> before long perhaps the following might become valid Rust:
```rust
println!("hello { if self.foo { &self.person } else { &self.other_person } }");
```
> This no longer seems easily readable to the RFC author.

In short, the reason that Rust does not allow anything above variable name is that allowing arbitrary expression
may leads to very complex expression being present, which is a bad style as the string is no longer easily readable.
This is a real problem, as many people may have written `None`-related conditionals in Python:
```python
result = get_int()  # may return int or None
print(f"Got {result if result is not None else 0} as result.")
```
This had already becoming hard to read, and if we introduce the same syntax into C++, the problem may become worse:
```cpp
std::optional<int> get_int();
auto result = get_int();
std::println(f"Got { get_int().transform([](auto a){ return a * 2; }).value_or(0) } as result.");
```

However, I personally don't think that this potential danger is worth discarding the great benefit that allowing
`get_int()`, `arr[2]` etc had given us. The author of [PEP 498](https://peps.python.org/pep-0498/) had rightfully
pointed out regarding this issue:
> While it’s true that very ugly expressions could be included in the f-strings, this PEP takes the position that
> such uses should be addressed in a linter or code review. 

I personally agree that this should just be a Core Guideline issue to not use long placeholders. In EWG review
of P1819R0 on 2022-08-04, WG21 also agrees with the decision that a future string interpolation facility in C++
should support arbitrary expression:
> EWG encourages more work in the direction of supporting arbitrary expressions, instead of just ID expressions.

<table style="width: 250px; margin-bottom: 1rem;" class="withborder">
    <thead><tr>
        <td>SF</td><td>F</td><td>N</td><td>A</td><td>SA</td>
    </tr></thead>
    <tbody><tr>
        <td>4</td><td>3</td><td>2</td><td>0</td><td>1</td>
    </tr></tbody>
</table>

> Result: Consensus

So I think that this issue had been solved.

### Formatter
The formatter component refer to the additional specifier after the expression, to format it.
For example, we can add some specification to make the expression result to have a fixed width:
```python
for i in range(1000):
    print(f"[{i:3}/1000] Hello!")
# Print:
# [  1/1000] Hello!
# [  2/1000] Hello!
# ...
```
These formatter specifiers had had a long history. Their first common-known appearance is probably
the C `printf`/`scanf` family of functions, in where type specifier like `%d` and fill/width specifier
like `%03d` are introduced. Later, Python improved these specifier by changing to a `{}` format, eliminating
the need for always specifying type specifiers, and also changed alignment specifier to a more straightforward
`<>^` system. This new type of formatter had been adopted by many languages coming forward, including C++ `std::format`.

However, contrary to the general acceptance of arbitrary expression for the expression part, there are very few
languages that actually support formatters in string interpolation. From the above table, we can see that only
6 languages (Bash, C#, Nim, Python, Rust, Visual Basic) support some kind of formatter. There are two main reason for
the general reluctancy of formatters:
1. Formatters often make the interpolation string looks more complicated and hard to read. Similar to the situation of
complicated expression, complex formatter can also hinder readability:
```cpp
vector ints{65192, 65535, 766, 8687, 65524, 14386};
std::println(f"Your IPv6 address is {ints:nd[:]:04x}.");
// Your IPv6 address is fea8:ffff:02fe:21ef:fff4:3832.
```
2. Interpolated string literals with formatters are harder to implement than those without. Among the language that does not
support formatter, many are reluctant to support it because they didn't even have a `str.format`-like function, thus do not
have any existing facility to utilize formatters. Furthermore, even among those who has formatting functions already, a simple
interpolation without formatter, like `f"I have {apple} apples"`, can simply be translated into a concatenation
```python
"I have " + apple + " apples"
```
which (assuming `toString()`'s existence or implicit calling of such method) can be an easy task for the compiler. However, with
formatter present, either we must resort to Nim's approach to translate to something like
```cpp
"I have" + std::format("{:02}", apple) + " apples"
```
Or translate directly into a single big `format` call:
```cpp
std::format("I have {:02} apples", apple)
```

However, both reason does not apply to C++ at all. In C++, we already have the formatting infrastructure provided by `std::format`,
so we can simply support the same *format-specifier* and all is well. Also, even if we restrict to no-formatter mode, we **still**
cannot use simple concatenation to translate interpolated strings, because in C++ we have no general `toString()` method at all!
`std::to_string` only works for arithmetic types, so the only general way we can get a string from any object is through
`std::format("{}", obj)`, which basically means that the support for formatters is already there, and dropping them will have
absolutely no performance gain. As for readability, I support the same argument as ones for the complicated expression concern,
namely this is a code review issue, not an issue that prevent us to support even the simplest formatting specifier.

Having decided that C++ have sufficient reason to support formatters, let's have a look at their syntax in existing language.
For C# and VB, their .NET format specifiers are not taken from Python, and instead have taken a form that looks like `{,[align]:[type][prec]}`,
so their string interpolation facility also support the same `{...,...:...}` format. This is, in fact, consistent with Rust, Python and Nim's `{...:...}`
choice, because the only difference is that C# and VB move the `[align]` part from after the colon to before the colon.
Apart from these standard specifiers, there are a few creative additions for Python and Nim. Python allow a `!s`, `!r` or `!a` specifier to
appear immediately before the colon, whose effect is to call `str()`, `repr()` or `ascii()` before formatting. In [PEP 498](https://peps.python.org/pep-0498/),
the author actually admitted that this is just for compatibility with `str.format`, and on their own are redundant specifiers:
> The `!s`, `!r`, and `!a` conversions are not strictly required. Because arbitrary expressions are allowed inside the f-strings, [...]
> However, `!s`, `!r`, and `!a` are supported by this PEP in order to minimize the differences with `str.format()`. `!s`, `!r`, and `!a` are
> required in `str.format()` because it does not allow the execution of arbitrary expressions.

Therefore, since in C++ we don't have such tradition in `std::format`, and there is no general string-conversion function like `str()` anyway,
I see no reason to introduce `!...` part into C++ interpolated strings. However, another addition introduced by both Python and Nim, the `=`
part before the colon, is more interesting. The effect of such a `=` is to introduce a debugging format, in which the expression text will be displayed
alongside its value:
```python
a = 3
print(f"I have {a=}")  # I have a=3
print(f"I have {a = }")  # I have a = 3
print(f"I have {a  =:02}")  # I have a  =03
```
Basically, this is a shorthand for the common practice of var = value trick in debugging prints. In my personal opinion, I think that this specifier
is very appealing, but at the same time it can be added later, after general interpolation is introduced (in Python, = is added two versions after f-strings anyway).
Also, this specifier has its own problem in C++ (will be described below in the issues section), so I suggest holding off its addition into separate proposal.

In conclusion, I suggest that C++ string interpolation facility should support *format-specifier*s, as they are naturally supported as a result of the implementation
strategy, and also the formatter format should (for now) simply be `{...:...}`, the same as `std::format`. The Python/Nim = specifier can be added later in a separate
proposal, once its issues are solved. (Technically, given WG21's favor for minimal proposals these days, support for formatters can also be added later, as colons are not
used much in C++ expressions; however I felt like that would be too minimal for a first proposal).

### Delimeter
Delimeters are a natural requirement to the proposed interpolation syntax, especially for those language that support interpolating arbitrary expressions. Even for those that
only support interpolating variables, the possibility of ambiguity still calls for a need of delimeter:
```bash
fruit=apple
echo "I want some $fruit"  # I want some apple
echo "I want some $fruits"  # I want some (unknown variable not displayed)
echo "I want some ${fruit}s"  # I want some apples
```
However, there is a catch: many languages (including Bash) support both a mode without delimeter and a mode with one, to give more convenience
to the user. The general rule here is that without a delimeter, the expression part will start from the introducer and match greedily, often
only stop when meeting a whitespace or end of string. So in the above example, `$fruit` can work but `$fruits` cannot. These languages with two modes
are recorded as none plus some delimeter type below, where none signals the `$fruit` case without delimeter.

As for the delimeter themselves, there are many choice:
- None + `{}`: (8) Bash, Dart, Groovy, Haxe, Kotlin, Perl, PHP, Scala
- `{}` only: (12) ABAP, C#, CoffeeScript, JavaScript, Nim, Nix, Python, Ruby, Rust, Sciter, TypeScript, Visual Basic
- None + `()`: (3) Boo, Julia, Nemerle
- `()` only: (2) ParaSail, Swift
- `#` only: (1) ColdFusion
- No delimeter (only support greedy variable interpolation): (1) Tcl

We can easily see that there are only two common choice of delimeter: `{}` and `()`. In which `{}` have 20 language users, while
`()` only have 5, so `{}` is the overwhelmingly favorite. Also, C++ `std::format` already used `{}` as delimeter, so I think that there
should be no controversy on the choice for C++: just continue to use `{}` as delimeter. However, noted that in C++ we have to use a prefix
introducer (more on this below), so we cannot introduce the greedy no-delimeter matching facility, forcing C++ to be in the `{}` only group
(it is the group with most people anyway).

### Introducer
Now comes the fun part.

Introducers are also one of the required feature of any string interpolation facility, as you have to distinguish interpolated string from regular
string in some way to process them differently. However, there are four general categories of languages with regard to introducers:
- Prefix, in which introducer are placed before the string, like `f"something"`
- Adjacent, in which introducer are placed immediately before delimeter, like `"something ${var}"`
- Quote, in which introducer are the quotes themselves (i.e. special quote is used), like `|something|`
- Function, in which interpolation is only available as parameters to certain functions

Adjacent is more common in scripting or dynamic languages, in which variables are often also referred as `$var`. It is also worth noting that the
aforementioned greedy no-delimeter substitution feature is only available with language in the adjacent group. The languages can be categorized as:
- Prefix: (4) C#, Visual Basic (both `$`), Python (`f`), Nim (`fmt` and `&`)
- Adjacent `$`: (9) Bash, Boo, Dart, Groovy, Haxe, Julia, Kotlin, Nix, Tcl
- Adjacent `#`: (3) ColdFusion (double `#`), CoffeeScript, Ruby
- Adjacent other: (4) ParaSail (double `` ` ``), Perl (`$` and `@`), PHP (`$` or None), Swift (`\`)
- Both Adjacent and Prefix: (2) Nemerle (both `$`), Scala (`s` prefix and `$` adjacent)
- Quote: (3) ABAP (`|`), JavaScript, TypeScript (both `` ` ``)
- Function: (2) Rust (`println!` family), Sciter (anything start with `$`)

Overall there are 6 Prefix, 18 Adjacent, 3 Quote and 2 Function, with Adjacent group being the overwhelmingly favorite. The reason for that result, I think,
is that generally we want the interpolated (substituted) part to be as distinct as possible from the rest of the string, in order for reader to quickly
realize that this part will be substituted, and add an introducer here can be a good way to remind them. Also, the Adjacent placement also enable the possibility
of no-delimeter, which over half of the 18 languages had utilized.

However, the Adjacent group have its own great limitation, which makes it unsuitable for C++: backward compatibility. We already have strings that contain `$` in C++,
and changing it to perform interpolation is simply a non-starter because it will break way too much legacy code. All the Adjacent group languages have had interpolation
since their first version, so there is no risk of breaking code. However, for C++, we must reject all Adjacent approach... except for one! The Swift Adjacent (`"\(...)"`)
is actually still viable for C++, given that `\(` is an unused escape sequence. However, currently all major C++ compilers will only produce a warning for unknown escape
sequences, and then proceed as if the backslash isn't here. Therefore if we want to be secure, we must first deprecate `\(` for at least one standard, and then reuse it.
(Given that there is very unlikely to be large number of code with this escape outside in the wild, I do think that we can skip the deprecation period and directly reuse this as
interpolation; however the Swift syntax does not look very appealing anyway). For those reasons, I will suggest that the whole Adjacent group is unsuitable for C++.

The Function group also deserves a closer look. For Rust, the `println!` family (to be precise, the target is actually the `format_args!` family) are already implemented as macros,
which means that it is possible to customize their argument behavior as a library feature, no need for core language change. Therefore, Rust can happily limit the interpolation scope
to only the `format_args!` family, and unuseable for anything else. Sciter also took an interesting strategy: any function with name starting from `$` will treats its argument as literal string,
and anything inside `{}` inside such an argument will simply be left out unquoted:
```javascript
var bodyDiv = self.$(div#body);
// equivalent to
var bodyDiv = self.$("div#body");

var nthDiv = self.$(div:nth-child({n}));
// equivalent to
var nthDiv = self.$("div:nth-child(", n, ")")
```
This way, the function can itself concatenate all the argument to form the interpolated string. However, both languages' approach cannot apply to C++: `std::format` is not a macro, and we do not want
to limit string interpolation to `std::format` and `std::print` family anyway; and introducing `$`-functions will simply be too much a change for C++ to handle. It is viable, but it would simply be too
radical, as the whole grammar need to change dramatically to allow this.

This only leaves Prefix and Quote as routes for C++. Both of these routes are viable, but I want to argue that Quote group have its own inherent limitation in C++ too: no existing practice. In C++, we have always had only
two kind of quotations, single and double for `char` and `const char*`. Introducing the third kind of quotation for solely the purpose of string interpolation seems a bit weird and aggressive, and also having a third
kind of quotation without a third kind of type (it will evaluate to `std::string` probably anyway) also seems weird to me. On the contrary, in C++ we have had prefix specifiers for years now (encoding and raw strings),
so adding a new kind of prefix specifier is not a radical change. Therefore, I personally support Prefix as the way for C++ to go.

However, inside the Prefix group the syntax is very split in different languages (I'm actually surprised that no one else used f-strings). C++ will face a choice here:
- `$`, the advantage is that there will be absolutely no possibility of breaking existing code, while the disadvantage will be to introduce a new novel syntax (`$` have no appearance in C++ yet)
- `f`, the advantage is that this will require no novel syntax learning, it is just similar to `u` and `R` prefix, convey clearly the "formatting" meaning,
and also does not introduce new symbol into C++ glossary; however the disadvantage is that there is a small possibility of breaking existing code with macro named `f`
- Other one-character prefix, the analyze is same with `f`, with the additional disadvantage that it has no clear link with "formatting" meaning
- `fmt` (or `format`, etc), the advantage is that the meaning is conveyed most clearly, however a big disadvantage is that this will be more clumsy to type (shorter typing
is the sole reason we introduce string interpolation anyway), and also have a bigger possibility of macro conflicting.

Overall, I don't see a clear winner. Personally, I think that `f` makes the most sense for C++, as it has the least disadvantages among the options (macro named `f` is increasingly rare anyway, and this problem is also
faced by `u` and `R` prefix too, they solved it, kinda). `$` can be a close second or even first if one day C++ introduced an operator with `$` in it so that it is no longer novel, and other choice I think is clearly worse.

So, in conclusion, my personal suggestion for C++ is the `f"{...}"` syntax, with support for *format-specifier*s (or in other words, copy Python).

## General design issues
These are the issues that applys to any string interpolation facility, not unique to C++.

### Implementation: eager or lazy?

### Escaping behaviour
Now this is the most difficult and contentious part of any such facility.

### Customization

## Issues specifically for C++
Of course, being one of the most complex language in the world, a string interpolation facility for C++ will face
its own bunch of issues, specifically because of its interaction with other features or limitations of C++.

### Availability of `@`, `$` and `` ` ``

### Macro conflict

### Ambiguity of `=` specifier

### (Non-existent?) issues with *format-specifier* support

### Concatenation

### Interaction with other prefix

### Interaction with UDL

### Translation stage

### Implementation difficulty
