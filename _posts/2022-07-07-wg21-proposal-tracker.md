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
- Current Status: Approved for plenary

This is my first ever proposal to WG21. It is a simple renaming proposal, proposing to fix an inconsistency in
the [std::expected paper](https://wg21.link/P0323), such that `std::expected::value()` returns the normal value
but `std::unexpected::value()` actually returns the error (abnormal) value.

History:
- 2022-07-08: R1 seen by LWG, approved for plenary. (Stage 3 -> Approved for plenary)
- 2022-06-22: R0 passed [2022-05 LEWG Electronic Poll](https://wg21.link/P2575R0). (EP -> Stage 3)
- 2022-06-20: [P2549R1](https://wg21.link/P2549R1) shipped in the 2022-07 Mailing.
- 2022-03-01: R0 seen by LEWG, approved for EP. (Stage 2 -> EP)
- 2022-02-13: [P2549R0](https://wg21.link/P2549R0) shipped in the [2022-02 Mailing](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/#mailing2022-02)
