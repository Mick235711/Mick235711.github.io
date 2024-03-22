---
title: How are my WG21 proposals doing?
categories:
- C++
- WG21
feature_image: "https://isocpp.org/files/img/wg21-timeline-2019-07.png"
---

I have written several proposals for the ISO C++ committee (WG21). They are all written in
[Bikeshed](https://tabatkins.github.io/bikeshed/) so that automatic proposal referencing can be used,
and the resulting proposal looks nicer. All proposal source code are stored in the [wg21-papers](https://github.com/Mick235711/wg21-papers)
repo.

#### P2549: `std::unexpected<E>` should have `error()` as member accessor
- Audience: LWG
- Target: C++23
- Revisions: [R0](https://wg21.link/P2549R0), [R1](https://wg21.link/P2549R1)
- Current Status: Approved for C++23

This is my first ever proposal to WG21. It is a simple renaming proposal, proposing to fix an inconsistency in
the [std::expected paper](https://wg21.link/P0323), such that `std::expected::value()` returns the normal value
but `std::unexpected::value()` actually returns the error (abnormal) value.

History:
- 2022-07-25: R1 approved for inclusion in C++23 in the 2022-07-25 WG21 plenary. (Plenary -> Approved)
- 2022-07-08: R1 seen by LWG, approved for plenary. (Stage 3 -> Plenary)
- 2022-06-22: R0 passed [2022-05 LEWG Electronic Poll](https://wg21.link/P2575R0). (EP -> Stage 3)
- 2022-06-20: [P2549R1](https://wg21.link/P2549R1) shipped in the [2022-07 Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/#mailing2022-07).
- 2022-03-01: R0 seen by LEWG, approved for EP. (Stage 2 -> EP)
- 2022-02-13: [P2549R0](https://wg21.link/P2549R0) shipped in the [2022-02 Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/#mailing2022-02).

#### P2573: `= delete("should have a reason");`
- Audience: CWG
- Target: C++26
- Revisions: [R0](https://wg21.link/P2573R0), [R1](https://wg21.link/P2573R1), [R2](https://wg21.link/P2573R2)
- Current Status: Stage 3

C++20 added `[[nodiscard("with reason")]]`, together with `[[deprecated]]` and `static_assert`, forming the group of "diagnostic with reason" constructs in C++.
`= delete` functions often have a reason to delete themselves (alternative exist, prevent rvalue dangling, etc), so this proposal proposed adding a reason clause
to it too.

History:
- 2024-03-22: R2 seen by CWG in Tokyo (2024-03), approved for plenary.
- 2024-03-19: R1 seen by EWG in Tokyo (2024-03), approved for CWG. (Stage 2 -> Stage 3)
- 2022-04-12: [P2573R1](https://wg21.link/P2573R0) shipped in the [2023-12 post-Kona Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/#mailing2023-12).
- 2023-11-06: Backtrack to Stage 1, then [D2573R1](https://wg21.link/D2573R1) seen by EWGI in Kona (2023-11), approved for EWG. (Stage 2 -> Stage 1 -> Stage 2)
- 2022-04-12: [P2573R0](https://wg21.link/P2573R0) shipped in the [2022-04 Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/#mailing2022-04).

#### P2613: Add the missing `empty()` to `mdspan`
- Audience: LEWG, LWG
- Target: C++23
- Revisions: [R0](https://wg21.link/P2613R0), [R1](https://wg21.link/P2613R1)
- Current Status: Approved for C++23

This is a very rushed paper. In mid-June, I spotted a bunch of problems with the
about-to-be-approved [mdspan paper](https://wg21.link/P0009), and opened a [PR](https://github.com/ORNL/cpp-proposals-pub/pull/262),
wanting to add `noexcept` to some member functions, and also add the missing `mdspan::empty()`.
In the following LWG small-group review session, `noexcept` additions are approved, but a new function need its own proposal
to pass through LEWG review again. Thus the paper.

History:
- 2022-07-25: R1 approved for inclusion in C++23 in the 2022-07-25 WG21 plenary. (Plenary -> Approved)
- 2022-07-23: R1 passed [2022-07 LEWG Electronic Poll](https://wg21.link/P2611R0). (EP -> Plenary)
- 2022-07-08: R1 seen by LWG, approved for plenary. (Stage 3 preapproval)
- 2022-06-28: R0 seen by LEWG (of which I forgot to attend the telecon, sorry!), approved for EP. (Stage 2 -> EP)
- 2022-06-25: [P2613R1](https://wg21.link/P2613R1) shipped in the [2022-07 Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/#mailing2022-07) (LWG request a one-line wording change, so this is quick).
- 2022-06-23: [P2613R0](https://wg21.link/P2613R0) shipped in the [2022-06 Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/#mailing2022-06) (as a late paper).
