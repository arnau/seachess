---
date: 2020-12-24
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

In this note I'll be assessing Frictionless [Tabular Data Package] under the
assumption that it is a reasonable choice for increasing the reliability of
CSV data consumption. If you are in a rush, go straight to the [closing
thoughts](#closing-thoughts).


## Overview

The [Tabular Data Package] is part of the [Frictionless Data] framework. It is
a profile (see the [Profiles] specification) built on top of [Data Package]
and [Tabular Data Resource] which in turn is a profile that builds on top of
[Data Resource], [Table Schema] and [CSV Dialect].

In a gist, this format is about:

* Data files encoded as CSV (Comma-Separated Values).
* A data descriptor as JSON.

On that basis, it looks straightforward to publish a dataset using this format
and fairly easy to consume.


## Context

**CSV is a poor data format** with a limited ability to set enough
expectations on the structure and values contained within. Many have said that
CSV is simple but I am of the opposite opinion: CSV is extremely complex from
a user experience point of view; it feels simple at first but eventually it
lets you down. Acknowledging this puts us in a good place to understand what
Tabular Data Package is trying to help with.

There are other attempts to solve the same problem such as [CSV on the Web].
Check my [Dive into CSV on the Web] for my take on it.

Note that the first reason the Tabular Data Package specification gives to
support the choice of CSV is:

> CSV is very simple – it is possibly the most simple data format

Let's disagree and move on.


## Foundations

The Tabular Data Package builds on top of a few technical specifications. I'll
cover the ones I find most relevant as potential points of friction for
implementors, publishers and consumers.

The [Tabular Data Resource] extends the [Data Resource] with:

* [Table Schema] to describe the structural information for each CSV.
* [CSV Dialect] to describe divergences from the [IETF RFC 4180].

Note that the encoding is defined in the Tabular Data Resource instead of the
CSV Dialect. And it is UTF-8 by default instead of the US-ASCII defined by the
[IETF RFC 4180].

The [Tabular Data Resource] allows for embedding data as JSON directly in the
descriptor file. This adds an extra level of complexity for a marginal
benefit, I think. It would be good to have some use cases that frame choices
like this one.

The specification (all of them in fact) say that the descriptor must be JSON
as defined by [IETF RFC 4627] although it has been replaced by [IETF RFC
8259]. Probably a negligible detail but implementors would benefit from
clarity on this matter.

The specification does not cover any way to discover the data from the
descriptor or viceversa. Maybe a paragraph suggesting the usage of the `Link`
HTTP header ([IETF RFC 8288]) would suffice.

Most of the time the specifications assume you are working locally and paths
are relative to the _root_ of the package. This probably means that _a
package_ needs to be distributed in some sort of bundle like a zip file. In
fact, there is a pattern [Describing files inside a compressed file such as Zip]
that reinforces this.


## Data Package

The package consists of:

* Metadata that describes the structure and contents of the package.
* Resources such as data files that form the contents of the package.

A data package is at its minimum, a directory containing a `datapackage.json`
file. Optionally, it can contain:

* A `README.md` (Markdown) file.
* A `data/` directory for data files e.
* A `scripts/` directory for data processing scripts.
* Files for data and scripts directly in the root directory.

The _descriptor_, `datapackage.json`, must be a valid JSON object as defined
by [IETF RFC 4627] (and hopefully [IETF RFC 8259] as well).

A descriptor provides:

* The `resources` property with at least one [Tabular Data Resource].
* The `profile` property with the value `tabular-data-package`.
* Optionally, contextual annotations.


## Structural information

Structural attributes are the ones you would expect from any Data Definition
Language (DDL). The [Tabular Data Resource] provides:

* The `name` property to identify the dataset.
* The `path` property to define the relative path to the CSV file.
* The `schema` property following the [Table Schema].
* The `profile` property with the value `tabular-data-resource`.
* The `dialect` property with the [CSV Dialect].
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

According to the specification, types are based on the type set of [JSON Schema] but not quite. It says:

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
only wonder why this what chosen over other definitions like the one in JSON
which is the one JSON Schema uses.

The `bareNumber` property got me by surprise, I would've thought that would
fall under the string type. Types are complex business indeed.

Both `object` and `array` are types that feel quite foreign to CSV. Maybe they
are there because data can be inlined in the JSON descriptor? Maybe it's
because they found GeoJSON and TopoJSON important. Your guess is as good as
mine.

The `date` type and it's extended family is difficult to understand, they
overlap with each other and feel redundant.

The `duration` type might have its place but durations may vary in length
depending on the point of origin, that's why the [ISO 8601] has the concept of
time interval.

I'll end this overly long section on types with a mention to the section “Rich
Types”. The section squeezes in a mention to RDF via the `rdfType` property
which allows to map to a RDF class. I haven't found a complementary way to map
a field to a RDF property though. If you are in need of RDF, [CSV on the Web]
seems like a more robust option to me. Perhaps instead of having `rdfType` in
here, there is an opportunity to have a profile dedicated to RDF that could be
mixed in?


## Constraints

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


## Contextual annotations

Contextual annotations cover a diverse set of needs such as licences,
contributors, keywords, description of the package etc. Check the [Tabular
Data Package JSON Schema] for the full list of optional properties.

Any property not defined in the specification can be used but it is up to the
publisher and consumer to agree on their meaning using a new profile that
follows the [Profiles] specification. What is unclear to me is how a potential
extension would be declared given that the `profile` type is predefined if you
are to comply with the Tabular Data Package.


## State of the art

The team behind the [Frictionless Data] specifications maintain two reference
implementations:

* [Python frictionless](https://github.com/frictionlessdata/frictionless-py)
* [JavaScript frictionless](https://github.com/frictionlessdata/goodtables-js)

At the time of the review there were some broken links and confusion between
_GoodTables_ and _Frictionless_. According to https://github.com/frictionlessdata/frictionless-py is a renaming exercise.

That said, the Python library looks like a reliable piece of software.

Finally, there are other tools worth exploring:

* https://frictionlessdata.io/tooling/application/
* https://frictionlessdata.io/tooling/libraries/


## Closing thoughts

The [Frictionless Data] website does a great job in putting everything you
need to know about the [Tabular Data Package] in one place. Things like this
make the difference when choosing tools and standard practices.

Even with the points raised in this note, the specifications look well thought
through, built on well-known and current standards.

If I were in need to publish CSV and had the need to choose a way to do it,
[Frictionless Data] would be a strong candidate to consider.


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
