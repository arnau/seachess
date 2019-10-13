---
date: 2019-10-12
author: arnau
id: what-is-an-api
title: What is an API?
type: note
status: published
tags:
  - http
  - concepts
---

Lately, I find myself having to explain what is an API to co-workers and
friends. This note attempts to explain it.

<!-- end -->

”API“ is an acronym that stands for **Application Programming Interface**. As
the name suggests, an API is a type of interface, like a UI (User Interface)
but for applications.

The key concept here is **interface**, defined in Wikipedia as:

> In computing, an interface is a shared boundary across which two or more
> separate components of a computer system exchange information.
>
> — https://en.wikipedia.org/wiki/Interface_(computing)

In other words, an interface is a set of rules defined by a party (the
provider) to let other parties (the consumers) *interact* with it.
In the case of an API, the consumer party is expected to be a system as well.

There are many types of API such as hardware devices, operating systems,
applications or remote applications but in recent years when people use the
term "API" they tend to mean HTTP based APIs such as a
[REST](https://en.wikipedia.org/wiki/Representational_state_transfer) APIs.


## APIs in the Web

The Web offers a wealth of APIs that we all use indirectly. Let's depict it:

```dot
digraph g {
  bgcolor="#ffffff00" # RGBA (with alpha);
  rankdir = LR;

  User [ shape = egg ];
  Browser [ shape = egg ];
  Server [ shape = egg ];

  User -> Browser [ label = "UI interaction" ];
  Browser -> Server [ label = "API interaction" ];
}
```

This graph illustrates that _any_ interaction between a browser and a server
occurs through an API, specifically an HTTP API.

In the scenario of a website, the API most likely lets the browser get
some [HTML](https://en.wikipedia.org/wiki/HTML), some
[CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets) and perhaps some
[JavaScript](https://en.wikipedia.org/wiki/JavaScript) which allow the
browser to compose the user interface the way the user expects to see it.

In the scenario of a REST API, the API lets the consumer get the
information in formats such as JSON or XML. The consumer will do different
things depending on the case.

For example, a mobile application may be fetching data to display the last
releases of your favourite TV series; a chat application will broadcast your
message to all members of the chat channel; the list goes on and on.

The increasing popularity of HTTP APIs has made the term "API" mean HTTP API
or even REST API, which admittedly makes things more confusing for people that
don't understand the general concept of API.
