---
date: 2020-07-25
author: arnau
id: iso8601-retrospective
title: A retrospective on the ISO 8601 Ruby gem
type: note
status: published
tags:
  - iso8601
  - date
  - time
---

Ten years ago I had a need to record information about the duration of my
tasks. I was already familiar with the [ISO8601][iso8601_wp] specification to
encode dates and times so it felt natural to use the same specification to
encode durations in my dataset.

<!-- end -->

It's never that simple. Although the International Organization for
Standardization (ISO) purpose is to aim to standardise, without adoption it's
merely a specification.

In the case of the ”ISO8601 Data elements and interchange formats –
Information interchange – Representation of dates and times” a subset of the
specification is extremely popular and has dedicated profiles such as the
famous [IETF RFC 3339][rfc3339] but other parts of the specification have a
lack of adoption. To my disappointment, the part about encoding durations had
little love.

At the time I was developing mostly in [Ruby][ruby], so I started my journey
of making a parser for ISO8601 duration. My first parser.

I was very fond of regular expressions at the time, and they did serve me well
in this case, but I got carried away and expanded the project from a handful
of functions to a [proper gem][iso8601_gem] (i.e. a Ruby library) to implement
the full specification. This goes from dates, times, to durations, and
recurrent time intervals. And of course, parsing alone is not enough so I
interfaced with the Ruby native types for dates and times.

Time went by, I stopped using Ruby and gradually reduced my interest in
evolving the library. It had a very mild adoption so I kept updating small
bits and bobs over time. Eventually I [asked for volunteers to take over its
maintenance][iso8601_maintenance] but so far no one has stepped up.

Anyway, this is the brief story of a pet project that got me a bit obssessed
with how time is represented in computers and how I got more and more
horrified with the truth behind time. I recommend reading [Time Disorder](https://caolan.uk/articles/time-disorder/).
and [Time on UNIX](https://venam.nixers.net/blog/unix/2020/05/02/time-on-unix.html)
for a taste.

After 10 years the ISO8601 specification seems to have more or less the same
dysfunctional adoption. The moral of the story is that I haven't changed that
much either. Now I'm in a self-imposed need to have a parser for ISO8601 weeks
such as `2020-W30`, this time my language of choice is Rust and the main
library for handling dates and times, [Chrono][chrono] seems to lack precisely
what I need. Oh well!


[chrono]: https://crates.io/crates/chrono
[iso8601_gem]: https://github.com/arnau/ISO8601
[iso8601_maintenance]: https://github.com/arnau/ISO8601/issues/50
[iso8601_wp]: https://en.wikipedia.org/wiki/ISO_8601
[iso]: https://www.iso.org/
[rfc3339]: https://tools.ietf.org/html/rfc3339
[ruby]: https://www.ruby-lang.org
