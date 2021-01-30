---
date: 2019-06-22
author: arnau
id: dive-into-the-link-header
title: A dive into the <code>Link</code> header
type: note
status: published
tags:
  - web
  - standards
---

This note describes my current understanding of the `Link` header as defined
by the [IETF RFC8288].

<!-- end -->

## The link model

In words of the RFC8288, “[...] a link is a typed connection between two
resources [...]”.

The RFC defines the following concepts:

* Link **context**: The subject of the connection.
* Link **target**: The object of the connection.
* Link **relation type**: The type of connection.
* Target **attributes**: A set of optional target descriptors.
* Target **attribute extension**: Set of attributes not defined by the RFC.

For example, given a resource `A`, the context, linked to a resource `B`, the
target, with a relation type `alternate` it can be depicted as:



```dot
digraph g {
  bgcolor="#ffffff00" # RGBA (with alpha);
  rankdir = LR;

  A [ shape = egg ];
  B [ shape = egg ];

  A -> B [ label = "alternate" ];
}
```


Building on that, let's define that `B`, the target, has a content type
[[IETF RFC2046]] of `text/csv`:

```dot
digraph g {
  bgcolor="#ffffff00" # RGBA (with alpha);
  rankdir = LR;

  A [ shape = egg ];
  B [ shape = egg ];

  A -> B [ label = "alternate" ];
  "text/csv" [ shape = box ];
  B -> "text/csv" [ label = "type" ];
}
```

Given that we are in HTTP territory, resources are identified by URLs. The
previous example, using URLs could be something like:

```dot
digraph g {
  bgcolor="#ffffff00" # RGBA (with alpha);
  rankdir = TB;

  A [ label = "https://example.org/foo.html", shape = egg ];
  B [ label = "https://example.org/foo.csv", shape = egg ];
  "text/csv" [ shape = box ];

  A -> B [ label = "alternate" ];
  B -> "text/csv" [ label = "type" ];
}
```

This model can be expressed in many ways: HTML, Atom, Turtle, etc. The RFC8288
defines how to express links using the HTTP `Link` header.


## The header syntax

At first, the syntax seems straightforward but bit by bit we'll see how it
gets more knitted. Let's start with a basic example:

```rfc8288
<https://example.org/foo.csv>; rel="alternate"; type="text/csv"
```

It can be expressed in ABNF as:

```abnf
header = link *(OWS "," OWS link)
link   = "<" target ">" *(OWS ";" OWS param)
param  = name ["=" value]
target = uriref
name   = token
value  = token / quoted-string
```

The above, although not complete, already expresses a few rules that are not
obvious with the initial example:

* Whitespace (OWS) is optional in many cases.
* A param may not have a value.
* A value may or may not be quoted.

For example, this is equivalent to the first example:

```rfc8288
<https://example.org/foo.csv>;rel=alternate;type="text/csv"
```

Another example with multiple links:

```rfc8288
<https://example.org/foo.csv>; rel="alternate"; type="text/csv",
<https://example.org/>; rel=canonical,
<http://other.net>; private; anchor="#foo"
```

Let's twist it a bit; when the param name ends in `*` the value
should follow the [IETF RFC8187], for example
`UTF-8'en'An%20example`. With that in mind we can extend the original ABNF as:

```abnf
header    = link *(OWS "," OWS link)
link      = "<" target ">" *(OWS ";" OWS (ext-param / param))
param     = name ["=" value]
target    = uriref
name      = token
value     = token / quoted-string
ext-param = name "*" "=" ext-value
ext-value = encoding "'" [language] "'" pct-value
```


## The semantics

Once we have extracted the primitive values from the `Link` header, we need to
process them to obtain the list of actual links.

### The context

The **context** is the resource where the header comes from. Its identifier is
the request URL. For example, the following HTTP request makes
`https://example.net/things` the context for all links found in the response
header.

```http
GET /things HTTP/1.1
Host: example.net
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: </things?p=2>; rel="next"
```

Things couldn't be that straightforward; if a link has a param `anchor`, the
context will change. The `anchor` value must be a valid URI, either absolute
or relative.

If it's absolute, it replaces the context entirely. For example:

```http
GET /things HTTP/1.1
Host: example.net
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: </>; rel="canonical"; anchor="https://other.org"
```

Makes `https://other.org` the context for that link.

If it is relative, the rules for joining URI's apply. For example:

```http
GET /things HTTP/1.1
Host: example.net
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: </copyright>; rel="copyright"; anchor="#section_3"
```

Makes `https://example.net/things#section_3` the context for that link.

Any `anchor` param other than the first one must be ignored.

Finally, the RFC says:

> Note that depending on HTTP status code and response headers, the
> link context might be "anonymous" (i.e., no link context is
> available).  For example, this is the case on a 404 response to a
> GET request.

The rules and reasoning for that escape my understanding.

### The target

The **target** is identified by the URI resulting of joining the URI reference
found in `target` (see ABNF rules) with the **context**.

For example, the following HTTP request makes `https://example.net/things?p=2`
the link target.


```http
GET /things HTTP/1.1
Host: example.net
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: </things?p=2>; rel="next"
```

### The relation type

The `rel` param defines the **relation type** of a link.
Any `rel` param other than the first one must be ignored.

The RFC requires a link to have a relation type but the syntax is lax enough
to allow for a link to not have one. That makes it somewhat compatible with
HTML which does not require links to have any relation type.

For example, the following link defines `https://example.net/` as the
canonical resource for the context.

```rfc8288
<https://example.net/>; rel="canonical"
```

You can express multiple relation types at once by separating the types with
spaces. For example, the following are equivalent:

```rfc8288
<https://example.org/things>; rel="first previous"
```

```rfc8288
<https://example.org/things>; rel="first", <https://example.org/things>; rel="previous"
```

Previous versions of this RFC define a `rev` param to define a reverse
relation type. RFC8288 deprecates it.

### The target title

The `title` param defines the **target title** attribute. Any `title` param
other than the first one must be ignored. For example:

```rfc8288
</spoons/>; rel="chapter"; title="Spoons, spoons and some more spoons"
```

Now, HTTP headers are not supposed to have characters other than a subset of
the US-ASCII encoding so `title` values are quite limited. The way to escape
from this limitation is using the `title*` param. It expects its value to
follow the [IETF RFC8187]. In short, it encodes three values in one: encoding,
language and the title encoded with [percent-encoding].

The syntax looks like:

```abnf
ext-value = encoding "'" [language] "'" pct-value
```

Where `encoding` is `UTF-8`, the optional `language` is a valid [IETF
RFC5646](https://tools.ietf.org/html/rfc5646) language tag and the percent
encoded value uses valid UTF-8 codepoints. The encoding could be something
different but as far as I can tell only UTF-8 is normative.

The following link defines both `title` and `title*`. As per the RFC, `title*`
takes precedence as long as it can be decoded, otherwise it falls back to
`title`.

```rfc8288
</spoons/>; rel="chapter"; title="Spoons"; title*=UTF-8'en'Spoons%20%F0%9F%A5%84
```

So the title of the link above is “Spoons 🥄” but falls back to “Spoons” if
the processor can't handle UTF-8 correctly.

### The target content type

The `type` param hints the **target content type** attribute. Any `type` param
other than the first one must be ignored.

The value is expected to conform to the [IETF
RFC6838](https://tools.ietf.org/html/rfc6838#section-4.2) media type.

```rfc8288
</spoons/>; rel="chapter"; type="text/html"
```

### The target language

The `hreflang` param hints the **target language** attribute. Multiple
`hreflang` param hint that the target resource is available in these
languages.

The value is expected to conform to the [IETF RFC5646] language tag.

```rfc8288
</spoons/>; rel="chapter"; hreflang="de"; hreflang="en"
```

### The target medium

The `media` param hints the **target medium** attribute. Any `media` param
other than the first one must be ignored.

The value is expected to conform to the [W3C media
queries](https://www.w3.org/TR/mediaqueries-4/).

```rfc8288
</spoons/>; rel="chapter"; media="screen and (color)"
```

### Other target attributes

Any other param is considered be a target attribute with unknown
semantics. It is suggested that the star rule applied to `title` and `title*`
is applied to other pairs (e.g. `author` and `author*`).


## Why would I want to use a link header instead of “x”?

Links can be defined in many ways depending on the capabilities of the
serialisation format. For example, [HTML](https://www.w3.org/TR/html5/) has a
well defined way via `link`, `a` and `area`;
[HAL](http://stateless.co/hal_specification.html) has the `_links` property;
[JSON-LD](https://json-ld.org/) builds on top of RDF; etc.

But not all serialisation formats have the same expressivity. For example, CSV
is a rigid tabular format with no margin for contextual information. In
this case, expressing links via a HTTP header is an interesting possibility.
[CSV on the Web](https://www.w3.org/TR/tabular-data-primer/) uses it to link
to the metadata with a `rel="describedby"`.


## Resources

* [IETF RFC2046](https://tools.ietf.org/html/rfc2046). Multipurpose Internet
  Mail Extensions (MIME) Part Two: Media Types.
* [IETF RFC3986](https://tools.ietf.org/html/rfc3986). Uniform Resource
  Identifier (URI): Generic Syntax.
* [IETF RFC5646](https://tools.ietf.org/html/rfc5646). Tags for Identifying
  Languages.
* [IETF RFC6838](https://tools.ietf.org/html/rfc6838). Media Type
  Specifications and Registration Procedures.
* [IETF RFC8187](https://tools.ietf.org/html/rfc8187). Indicating Character
  Encoding and Language for HTTP Header Field Parameters.
* [IETF RFC8288](https://tools.ietf.org/html/rfc8288). Web linking.
* [IANA relation type registry](https://www.iana.org/assignments/link-relations/link-relations.xhtml).
* [W3C RDF 1.1](https://www.w3.org/TR/rdf11-concepts/).


[IETF RFC8288]: https://tools.ietf.org/html/rfc8288
[IETF RFC8187]: https://tools.ietf.org/html/rfc8187
[IETF RFC2046]: https://tools.ietf.org/html/rfc2046
[percent-encoding]: https://tools.ietf.org/html/rfc3986#section-2.1
[IETF RFC5646]: https://tools.ietf.org/html/rfc5646
