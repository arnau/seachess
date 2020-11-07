---
date: 2020-12-25
author: arnau
id: dive-into-frictionlessdata
title: Dive into Frictionless Data
type: note
status: published
tags:
  - csv
  - web
  - data
---

This note captures my personal views on “Frictionless Tabular Data Package”, a
specification to provide metadata for CSV files.

<!-- end -->

The [Tabular Data Package] is a specification covering structural information,
validation rules and contextual information.

In this note I'll be assessing Frictionless Tabular Data Package under the
assumption that it is a reasonable choice for increasing the reliability of
CSV data consumption. If you are in a rush, go straight to the [closing
thoughts](#closing-thoughts).


## Overview

The Tabular Data Package is part of the [Frictionless Data] framework. It is
a profile (see the [Profiles] specification) built on top of [Data Package]
and [Tabular Data Resource] which in turn is a profile that builds on top of
[Data Resource], [Table Schema] and [CSV Dialect].

In a gist, this format is about:

* Data files encoded as CSV (Comma-Separated Values).
* A data descriptor as JSON.

On that basis, it looks straightforward to publish and consume a dataset using
this format.


## Context

**CSV is a poor data format** with a limited ability to set enough
expectations on the structure and values contained within. Many have said that
CSV is simple but I am of the opposite opinion: CSV is extremely complex from
a user experience point of view; it feels simple at first but eventually it
lets you down. Acknowledging this puts us in a good place to understand what
Tabular Data Package is trying to help with.

There are other attempts to solve the same problem such as [CSV on the Web].
Check my [Dive into CSV on the Web] for my take on it.


## The Package structure

The Tabular Data Package package is defined in terms of a directory and its
contents, extending the Data Package specification.

The only requirement for a directory to be a Data Package is to contain the
_descriptor_, a `datapackage.json` file.

Optionally, it can contain:

* A `README.md` (Markdown) file.
* A `data/` directory for CSV data files.
* A `scripts/` directory for data processing scripts.
* Files for data and scripts directly in the root directory.

The _descriptor_ is expected to have:

* A `profile` property with the value `tabular-data-package`.
* A `resources` property with at least one Tabular Data Resource.
* Optionally, contextual annotations such as title, description, licence, sources, etc.

Note that the scripts are not well defined in the specification. Based on what
I've seen in the datasets in https://github.com/datasets/ scripts tend to be
Python scripts to process the data and achieve the result stored in `data/`.


## The descriptor

This section collects my notes on general aspects of the descriptor.

The descriptor must be a valid JSON object as defined by [IETF RFC 4627]. I'm
unclear whether they expect compliance with IETF RFC 4627 or whether they
haven't come around updating the reference to the newer [IETF RFC
8259].

The specification seems to assume that the descriptor will always be
co-located with the data in the same file system. So I'm assuming that the
distribution of a package needs to happen as a unit, for example as a zip
file. The authors describe a pattern [Describing files inside a compressed
file such as Zip] that reinforces this but is somewhat unclear by reading the
specification alone.

I would've welcomed a section describing ways of distribution and discovery,
perhaps with a complementary way using a mechanism like `Link` HTTP header
([IETF RFC 8288]).

Finally, as an extension mechanism, any property not defined in the
specification can be used but it is up to the publisher and consumer to agree
on their meaning using a new profile that follows the [Profiles]
specification. What is unclear to me is how a potential extension would be
declared given that the `profile` type is predefined if you are to comply with
the Tabular Data Package.


## The resource

This section collects my notes on general aspects of the Tabular Data Resource.

The Tabular Data Package restricts the data format to CSV but the Tabular Data
Resource allows for embedding data as JSON directly in the descriptor file.
This adds an extra level of complexity when processing the package for a
marginal benefit and opens the door to express non-tabular data in a package
that is supposed to be rigid in this matter.

The data in CSV is expected to follow the [IETF RFC 4180], except that instead
of being prescriptive on most details, the specification adopts the [CSV
Dialect] specification to be able to describe divergences such as the encoding
which instead of being US-ASCII by default it is expected to be UTF-8, or the
delimiter which by default is a comma but could be anything else. I see this
as a good thing, it adds the tolerance required given the wide range of things
out there claiming to be CSV.


### Structural information

This section gives an overview of the structual properties from the Tabular
Data Resource as well as my notes on matters like types and formats. In
sumamry, the type system seems overly complicated but not rigid enough, it's
my least favourite part of the specification.

Structural attributes are the ones you would expect from any Data Definition
Language (DDL). The Tabular Data Resource provides:

* The `name` property to identify the dataset.
* The `path` property to define the relative path to the CSV file.
* The `schema` property following the Table Schema.
* The `profile` property with the value `tabular-data-resource`.
* The `dialect` property with the CSV Dialect.
* Optionally, the `encoding` property when the value is not UTF-8.
* Optionally, the title, description, hash, licences, etc.
* Optionally, the format (i.e.) "csv" and media type "text/csv".

The `schema` property in turn provides:

* The `fields` property with at least one field descriptor.
* Optionally, missing value rules, primary key and foreign keys.

And each field provides:

* The `name` property with a unique identifier matching the CSV column.
* Optionally, type, format, title and description.
* Optionally, the `constraints` property to aid a validator.


### Types and formats

According to the specification, types are based on the type set of [JSON
Schema] but not quite. It says:

> [...] with some additions and minor modifications (cf other type lists include
> those in Elasticsearch types)

A bit unsettling that these _some_ are not clear and that the Elasticsearch
link is broken.

Most of the types are primitives such as string, integer or boolean and yet
they are not clear enough to me. Let me go through my concerns at risk of
sounding too picky.

The `string` type is defined as _sequences of characters_. No definition of
character is provided. It's definitely a challenge to define this given that
encoding can vary.

The `string` type can be refined with the `format` property. The values are
understandable but open for interpretation which means there is room for
discrepancy between implementations. From `email` which is very hard to
validate anyway to `uri` which may or may not refer to [IETF RFC 3986] or to
[WHATWG URL]. It would help to have more thorough definitions and probably a
bit of context on why these formats are important to have in the specificaiton
but others didn't make the cut.

The `number` type uses the lexical formatting of [XML Schema Decimal]. I can
only wonder why this was chosen over other definitions like the one in JSON
which is the one JSON Schema uses.

The `bareNumber` property got me by surprise, I would've thought that would
fall under the string type. Types are complex business indeed.

Both `object` and `array` are types that feel quite foreign to CSV. Maybe they
are there because data can be inlined in the JSON descriptor? I would've
preferred a single `json` type or a `json` format part of the `string` type.
It would open the door to other formats such as `markdown`, `xml`, `html` to
name a few.

The `date` type and its extended family is difficult to understand, they
overlap with each other and feel redundant. For example, `time`, `datetime`,
`year` and `yearmonth` can be described using the pattern form of the `format`
property.

The `duration` type might have its place but durations may vary in length
depending on the point of origin, that's why the [ISO 8601] has the concept of
time interval which allows to pin a duration to either a start or end date.

Finally, the “Rich Types” section adds a mention to RDF via the
`rdfType` property which allows to map to a RDF class. In all honesty, it
feels out of place in this specification. Instead of this partial way to map
to RDF, a dedicated profile allowing to express both class and property
mapping would be more useful.


### Constraints

Constraints are a set of properties that allow expressing constraints on
values beyond the type and format. Most of them are familiar and
uncontrovertial to me so I'll briefly mention `pattern` which overlaps with
some type format rules and is probably what I would use instead if I had the
need to express restrictions on values.

It is worth mentioning that it expects regular expressions according to the
[XML Schema Regular Expressions] specification. Similar to the case of the
`number` type, I wouldn't be surprised if implementations are inconsistent
with this given the differences between JSON Schema and XML Schema regular
expressions.


## Relations

Both the `primaryKey` and `foreignKeys` should be familiar to anyone that has
worked with the relational model. I would've preferred requiring an array
instead of allowing strings as well but I don't have any comments on either
mechanism.


## State of the art

The team behind the Frictionless Data specifications maintain two reference
implementations:

* [Python frictionless](https://github.com/frictionlessdata/frictionless-py)
* [JavaScript frictionless](https://github.com/frictionlessdata/goodtables-js)

At the time of the review there were some broken links and confusion between
_GoodTables_ and _Frictionless_. According to [Python frictionless] it is a
renaming exercise.

That said, the Python library looks like a reliable piece of software.

Finally, there are other tools worth exploring:

* https://frictionlessdata.io/tooling/application/
* https://frictionlessdata.io/tooling/libraries/


## Closing thoughts

The Frictionless Data website does a great job in putting everything you
need to know about the Tabular Data Package in one place. Things like this
make the difference when choosing tools and standard practices.

The main concern I raise in this note is the lack of consistency when building
on top of other specifications such as JSON or JSON Schema. The divergences
make room for more clunky implementations which is undesirable.

That said, the specifications look well thought through, built on well-known
and current standards. The [Patterns] section deserves a mention, I really
liked the idea and the content.

If I were in need to publish CSV and had the need to choose a way to do it,
Frictionless Data would be a strong candidate to consider.


## Resources

* Frictionless [CSV Dialect]. January 2017.
* Frictionless [Data Package]. May 2017.
* Frictionless [Data Resource]. April 2018.
* Frictionless [Profiles]. May 2017.
* Frictionless [Table Schema]. October 2020.
* Frictionless [Tabular Data Package]. May 2017.
* Frictionless [Tabular Data Resource]. May 2017.
* [IETF RFC 3986]. Uniform Resource Identifier (URI): Generic Syntax. January 2005.
* [IETF RFC 4180]. Common Format and MIME Type for Comma-Separated Values (CSV) Files. October 2005.
* [IETF RFC 4627]. The application/json Media Type for JavaScript Object Notation (JSON). July 2006.
* [IETF RFC 8259]. The JavaScript Object Notation (JSON) Data Interchange Format. December 2017.
* [IETF RFC 8288]. Web Linking. October 2017.

[CSV Dialect]: https://specs.frictionlessdata.io/csv-dialect/
[Data Package]: https://specs.frictionlessdata.io/data-package/
[Data Resource]: https://specs.frictionlessdata.io/data-resource/
[Profiles]: https://specs.frictionlessdata.io/profiles/
[Table Schema]: https://specs.frictionlessdata.io/table-schema/
[Tabular Data Package]: https://specs.frictionlessdata.io//tabular-data-package/
[Tabular Data Resource]: https://specs.frictionlessdata.io/tabular-data-resource/
[Frictionless Data]: https://frictionlessdata.io/
[Tabular Data Package JSON Schema]: https://specs.frictionlessdata.io/schemas/tabular-data-package.json
[Describing files inside a compressed file such as Zip]: https://specs.frictionlessdata.io/patterns/#describing-files-inside-a-compressed-file-such-as-zip
[Patterns]: https://specs.frictionlessdata.io/patterns/

[data-package-creator]: https://create.frictionlessdata.io/
[goodtables]: http://try.goodtables.io/

[IETF RFC 4627]: https://tools.ietf.org/html/rfc4627
[IETF RFC 8259]: https://tools.ietf.org/html/rfc8259
[IETF RFC 3986]: https://tools.ietf.org/html/rfc3986
[IETF RFC 4180]: https://tools.ietf.org/html/rfc4180
[IETF RFC 8288]: https://tools.ietf.org/html/rfc8288
[ISO 8601]: https://en.wikipedia.org/wiki/ISO_8601
[XML Schema Regular Expressions]: https://www.w3.org/TR/xmlschema-2/#regexs
[XML Schema Decimal]: https://www.w3.org/TR/xmlschema-2/#decimal
[JSON Schema]: https://json-schema.org/
[JSON Schema Regular Expressions]: https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.6.4
[CSV on the Web]: https://www.w3.org/TR/2016/NOTE-tabular-data-primer-20160225/
[Dive into CSV on the Web]: https://www.seachess.net/notes/dive-into-csvw
[WHATWG URL]: https://url.spec.whatwg.org/
