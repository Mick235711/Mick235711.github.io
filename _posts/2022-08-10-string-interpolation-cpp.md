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
