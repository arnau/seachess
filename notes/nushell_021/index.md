---
date: 2020-11-01
author: arnau
id: nushell-v0210
title: "Review: nushell v0.21.0"
type: note
status: published
tags:
  - shell
  - terminal
  - tool
  - review
insights:
  topic: nushell
  maturity: hold
  category: product
---

This note captures my review on [Nushell v0.21.0][nu_0210] released on
2020-10-13.

<!-- end -->

Nushell is a shell aiming to provide higher abstractions to work with
strctured data. In their words:

> The goal of this project is to take the Unix philosophy of shells, where
> pipes connect simple commands together, and bring it to the modern style of
> development.

## Summary

Nushell v0.21.0 is not ready to fully replace my current shell, [zsh][], but
it shows great potential already so it is worth checking its evolution closely.

## Learning curve

The learning curve is soft an steady. The [book][nu_book] does a great job at
introducing concepts bit by bit and the [cookbook][nu_cookbook] is a good
complement for ready to go recipes. In both cases though I found the examples
slightly out of sync, consequence of the rapid evolution of Nu.

## Highlights

The shell is a pleasure to use, feels intuitive and composing pipelines over
structured data makes it very attractive for data transformations. The fact
that it can open most of the common formats (e.g. CSV, JSON, XML, TOML) making
the converge into the same model is a game changer for me.

## Limitations

This is the list of issues that make me think the Nushell is not ready for my
day to day shell:

### Background/foreground jobs

I rely quite heavily on `CTRL+z` to send Vim to the background and `fg` to
bring it back. Unfortunately Nushell does not implement this or any equivalent
that I could find.

### Scripting

I don't write shellscripts very often but Nushell offering makes it more
compelling for data wrangling. It's an enhancement being worked out at the
moment so not a big deal.

I couldn't find a way to interpolate environment variables in strings for
example in `echo`. This is particularly noticeable in setting variables from
other variables and when setting aliases.


[nu]: https://www.nushell.sh/
[nu_0210]: https://github.com/nushell/nushell/releases/tag/0.21.0
[nu_0210_release]: https://www.nushell.sh/blog/2020/10/13/nushell_0_21.html
[nu_book]: https://www.nushell.sh/book/
[nu_cookbook]: https://www.nushell.sh/cookbook/
[zsh]: https://www.zsh.org/
