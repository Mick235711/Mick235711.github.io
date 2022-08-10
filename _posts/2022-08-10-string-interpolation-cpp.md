---
title: "String Interpolation For C++: Going Down The Rabbit Hole"
categories:
- C++
- Language
- Mass Survey
feature_image: "/upload/iceberg.jpg"
---

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

| Language     | Mode          | Syntax                 |
|--------------|---------------|------------------------|
| ABAP         | Dynamic (DSL) | `|{...}|`              |
| Bash         | Dynamic       | `"$..."`, `"${...}"`   |
| Boo          | Dynamic       | `"$(...)"`             |
| C#           | Static (VM)   | `$"{...}"`             |
| ColdFusion   | Dynamic       | `"#...#"`              |
| CoffeeScript | Dynamic       | `"#{...}"`             |
| Dart         | Static (VM)   | `'$...'`, `'${...}'`   |
| Groovy       | Both          | `"$..."`, `"${...}"`   |
| Haxe         | Static (VM)   | `'$...'`, `'${...}'`   |
| JavaScript   | Dynamic       | `` `${...}` ``         |
| Julia        | Dynamic       | `"$..."`, `"$(...)"`   |
| Kotlin       | Static (VM)   | `"$..."`, `"${...}"`   |
| Nemerle      | Static (VM)   | `$"$..."`, `$"$(...)"` |
| Nim          | Static        | `fmt"{...}"`           |
| Nix          | Dynamic (DSL) | `"${...}"`             |
| ParaSail     | Both          | ``"`(...)`"``          |
| Perl         | Dynamic       | `"$..."`, `"@{...}"`   |
| PHP          | Dynamic       | `"$..."`, `"{...}"`    |
| Python       | Dynamic       | `f"{...}"`             |
| Ruby         | Dynamic       | `"#{...}"`             |
| Rust         | Static        | `println!("{...}")`    |
| Scala        | Static (VM)   | `s"$..."`, `s"${...}"` |
| Sciter       | Dynamic (DSL) | `$fun({...})`          |
| Swift        | Static        | `"\(...)"`             |
| Tcl          | Dynamic       | `"$..."`               |
| TypeScript   | Dynamic       | `` `${...}` ``         |
| Visual Basic | Static (VM)   | `$"{...}"`             |

### Big Picture
Test
