---
date: 2020-08-15
author: arnau
id: dive-into-csvw
title: Dive into CSV on the Web
type: note
status: draft
tags:
  - csv
  - rdf
  - web
  - data
---

This note captures my personal views on “CSV on the Web”, a specification to
provide metadata for CSV files.

<!-- end -->


The _CSV on the Web_ (CSVW) is composed by four long specifications covering a
wide range of concerns including but not restricted to structural information,
discoverability, parsing hints, tranformation hints and contextual
annotations.

In this note I'll be assessing CSVW under the assumption that it is a
reasonable choice for increasing the reliability of CSV data consumption. If
you are in a rush, go straight to the [closing thoughts](#closing-thoughts).


## Overview

What does it mean to publish “CSV on the Web”?

* Publish your CSV file such that it can be retrieved with a `text/csv` content type.
* Publish a metadata JSON file that conforms to the [metadata vocabulary][tabular-metadata] and [tabular data model][tabular-data-model].
* Provide a way for users to discover the metadata file from a CSV URL and discover a CSV file from a metadata file.

What does it mean to consume “CSV on the Web”?

* From a metadata file:
  * Process the metadata file (or fetch it from a URL).
  * Fetch the CSV files identified in the metadata.
* From a CSV URL (note that starting from a CSV alone file is a dead end):
  * Fetch the CSV file.
  * Process the HTTP headers or fallback to `/.well-known/csvw` to obtain the
    URL and extra metadata rules.
  * Fetch the metadata file. This can mean fetching from one to tens or more
    URLs.
* Validate the CSV data against the metadata rules.
* Extract contextual information, transform to RDF, etc.


Bottomline: it is more or less easy to publish a CSVW by hand as long as you
know JSON-LD, a pinch of RDF and the CSVW vocabulary. It is unreasonable to
expect consuming CSVW without a robust tool.


## Context

**CSV is a poor data format** with a limited ability to set enough
expectations on the structure and values contained within. Many have said that
CSV is simple but I am of the opposite opinion: CSV is extremely complex from
a user experience point of view; it _feels_ simple at first but eventually it
lets you down. Acknowledging this puts us in a good place to understand what
CSVW is trying to help with.

There are other attempts to solve the same problem such as the Frictionless
Data Standard [Tabular Data Package][tabular-data-package] but I'll reserve my
thoughts on other solutions for another time.


## Foundations

CSVW build on top of a few technical specifications, In this section I'll
cover the ones I find most relevant for the complexity of CSVW.

**[IETF RFC 4180][rfc4180]** is an attempt to formalise CSV. It aims to
improve the expectations on tooling operate in this format.

The RFC defines a couple of topics:

* Fields are delimited by a comma character (`,`).
* Rows are delimited by a line break sequence (CRLF).
* Fields enclosed in double-quotes (`"`) allow commas, double-quotes and line
  breaks per field.
* Whitespace characters in fields must be preserved.
* Rows must have the same amount of fields. Empty fields are allowed.
* The content type (i.e. MIME type) is `text/csv`.
* Content should be encoded as US-ASCII or provide a `charset` attribute to
  the content type.

All of the above are no more than suggestions that CSVW takes as defaults,
mostly. CSVW also provides annotations to inform a parser of other dialects,
such as using other field separators.

A noticeable divergence is that the default encoding for CSVW is UTF-8 which
makes CSVW have defaults that are incompatible with what both RFC4180 and IANA
assume. It is a mild concern given that UTF-8 is a superset of US-ASCII but
still, inconsistencies always come back to bite you.


**HTTP** is, unsurprisingly, the expected vehicle to publish CSVW. It gets
more entangled than expected though. For example, resetting the expected
encoding or defining the absence of a header row is expected to be done via
the `Content-Type` header.

Related to HTTP, CSVW depends on a handful other specifications to handle
discoverability such as [IETF RFC 8288][rfc8288], [IETF RFC 5785][rfc5785] and
[IETF RFC 8288][rfc6570].


**[Resource Description Framework][rdf]** (RDF) is a requirement coming directly from
the [charter][csvw-charter]. More specifically, the ambition was to reuse
existing vocabularies where possible so “[...] provide additional information
that search engines may use to gain a better understanding of the content of
the data” and “[...] to bind the CSV content to other datasets in different
formats and to Linked Data in general”.

This basically means that you **must** buy into RDF to fully benefit from the
complexity you have to handle when you use CSVW otherwise you'll get lots of
friction with little reward. Quite a gamble.

From the RDF requirement you get “for free” the set of datatypes defined by
[XML Schema][xmlschema]. The specification offers a mechanism for using other
datatypes, as long as you can point to a URI. It's unclear to me on how such
case would be defined and actually used by a CSVW processor though.


**[JSON-LD][json-ld]** is the format of choice to represent the metadata file.
Although it is a concrete RDF syntax it deserves its own section.

Worth noting that not any JSON-LD representation is acceptable, CSVW uses a
JSON-LD dialect with a couple of restrictions. I'm afraid I don't know how
much this impacts the consumption of CSVW though.


## Use cases

The CSVW Working Group compiled a set of [use cases and
requirements][csvw-ucr] to drive the developmemnt of the specification. This
should help understanding whether my requirements align with the scope of
CSVW, nice.

The first use case is worth thinking about:

> [...] the predominant format used for the exchange of Transcriptions of Records is
> CSV as the government departments providing the Records lack either the
> technology or resources to provide metadata in the XML and RDF formats [...]

So, CSV is expected due to lack of resources to do it in RDF but the
specification is built on top of RDF and requires understanding and investment
on it. Sounds like conflicting expectations to me.

Across the document there is a conflation of two requirements “globally unique
identifiers” and “resolvable identifiers” under the “URI mapping” requirement.
More evidence of a bias towards RDF. On top of that, a substantial part of the
use cases already need to eventually transform to RDF, bias?.

Another important point is that the use cases are for tabular data, not
strictly CSV. Well, some use cases are not directly tabular data at all but
the authors took the liberty to tranform them into a normalised tabular
structure. I found this a bit surprising, where is the line between use cases
with a genuine need for tabular data and use cases that _could_ use tabular
data or any other data model?


The requirements that are likely to fit to my common use cases are:

* [Cell microsyntax](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-CellMicrosyntax).
* [Validation](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-CsvValidation).
* [Foreign key](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-ForeignKeyReferences).
* [Primary key](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-PrimaryKey).
* [Syntactic validation](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-WellFormedCsvCheck).
* [Colocated metadata](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-ZeroEditAdditionOfSupplementaryMetadata).
* [Independent metadata](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-IndependentMetadataPublication).
* [Link from metadata to data](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-LinkFromMetadataToData).
* [Supplementary information](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-AnnotationAndSupplementaryInfo).
* [Column datatypes](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-SyntacticTypeDefinition).
* [Missing values](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-MissingValueDefinition).
* [Table groups](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-GroupingOfMultipleTables).
* [Multilingual](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-MultilingualContent).


I can picture the potential need for these as well:

* [Transform CSV into JSON](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-CsvToJsonTranformation).
* [Cell delimiters other than comma](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-NonStandardCellDelimiter).
* [Text and table direction](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-RightToLeftCsvDeclaration).

And hardly see the case for the following:

* [Transform CSV into RDF](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-CsvToRdfTransformation).
* [Transform CSV to a core tabular data model](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-CanonicalMappingInLieuOfAnnotation).
* [Property-value pair per row](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-SpecificationOfPropertyValuePairForEachRow).
* [External code association](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-AssociationOfCodeValuesWithExternalDefinitions).
* [RDF type mapping](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-SemanticTypeDefinition).
* [URI mapping](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-URIMapping).
* [Units](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-UnitMeasureDefinition).
* [Repeated properties](https://www.w3.org/tr/2016/note-csvw-ucr-20160225/#R-RepeatedProperties).
* [CSV subsets](https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/#R-CsvAsSubsetOfLargerDataset).

It shows that I have a bias towards normalised, self-contained, relational
datasets. And by now it's clear that I do not have RDF as a priority, quite
the opposite. Would the specification be significantly simpler this way?
Possibly.

In any case, the document is a good place to understand why the authors of the
specification made the choices they made. I wonder how many of these 25 use
cases have successfully adopted CSVW.


## Data model

The data model looks fairly uncontroversial. I would've like to have a
specification for the conceptual data model with no mention to parsing hints
nor transformation hints (or RDF patches). It feels like it would've been a
nice reusable definition other specific specifications for parsing and for
transformation could extend.


```dot
digraph g {
  bgcolor="#ffffff00" # RGBA (with alpha);
  rankdir = LR;

  Table -> TableGroup [ label = "belongs" ];
  Table -> Column [ label = "has" ];
  Table -> Column [ label = "primary key" ];
  Table -> Table [ label = "foreign key" ];
  Table -> Row [ label = "has" ];
  Column -> Table [ label = "belongs" ];
  Column -> Cell [ label = "has" ];
  Row -> Table [ label = "belongs" ];
  Row -> Cell [ label = "has" ];
  Cell -> Column [ label = "belongs" ];
  Cell -> Row [ label = "belongs" ];
}
```

The data model covers a few types of attributes (annotations in the
specification jargon).

### Structural information

Structural attributes are the ones you would expect from any Data Definition
Language (DDL) where you define the columns for each table, the datatypes for
each column, etc.

The line between these and parsing hints blurs a bit given that you can define
your own datatypes that refine on top of other ones but other than that it
feels like what I would benefit the most to reliably consume a CSV dataset as
it was intended.


### Contextual annotations

Contextual annotations cover an unbounded range of needs. Provenance, spatial
coverage, temporality, operational details, descriptions, licensing, etc.

To harness this massive and unknown scope the specification delegates on the
extensibility mechanisms provided by RDF. In short, any attribute you might
want to use is in scope as long as you can back it up with an RDF-aware
vocabulary. By default you are expected to use [Dublin Core][dc],
[Schema.org][schemaorg] and [Data Catalogue][dcat].

But of course, these vocabularies refine each other, overlap and your choices
might not be exactly the same as mine so, in order to reason about them you
need an RDF aware system. Even if you don't know what that entails, or if you
can afford the costs of maintaining. Am I being too bitter here? I guess it's
the consequence of once being very excited with the promises RDF and friends
offered and after more than a decade only seeing a trail of deception and
disenchantment. Perhaps [Solid][solid] is the cure. Perhaps not.


## Closing thoughts

It's evident that the specification (the four of them) is extremely complex
and ambitious. It aims to solve a wide range of problems including structural
information, contextual information, parsing hints and transformation hints.

The fact that the specification builds on top of the RDF data model leaks all
over the place which makes CSVW quite expensive both tooling and cognitive
wise when RDF is not part of your stack.

In summary, although CSVW aims to provide mechanisms to increase the
reliability of CSV consumption, the amount of complexity you have to accept as
a processor implementor or even as a casual consumer is unreasonably high.

To make this more evident, implementations are scarce, incomplete and most
times abandoned.

Is CSVW a reasonable choice when you don't have or plan to have an RDF
infrastructure?

My answer is no as long as there are more affordable alternatives. I guess
I'll have to dig into these some time soon.


## Resources

* [CSV Engine][csv-engine]. Tools and services for processing and enriching CSV files.
* [CSV on the Web Working Group Charter][csvw-charter].
* [CSV on the Web: A Primer][csvw-primer]. February 2016.
* [CSV on the Web: Use Cases and Requirements][csvw-ucr]. February 2016.
* [CSVW Implementation Report][implementation-report]. October 2015. 
* [Generating JSON from Tabular Data on the Web][csv2json]. December 2015.
* [Generating RDF from Tabular Data on the Web][csv2rdf]. December 2015.
* [IETF RFC 4180][rfc4180]. Common Format and MIME Type for Comma-Separated Values (CSV) Files. October 2005.
* [IETF RFC 5785][rfc5785]. Defining Well-Known Uniform Resource Identifiers (URIs). April 2010.
* [IETF RFC 6570][rfc6570]. URI Template. March 2012.
* [IETF RFC 8288][rfc8288]. Web Linking. October 2017.
* [JSON-LD 1.0][json-ld]. January 2014.
* [Metadata Vocabulary for Tabular Data][tabular-metadata]. December 2015.
* [Model for Tabular Data and Metadata on the Web][tabular-data-model]. December 2015.
* [W3C XML Schema Definition Language (XSD) 1.1 Part 2: Datatypes][xmlschema]. April 2012.
* [RDF 1.1 Concepts and Abstract Syntax][rdf]. February 2014.
* [Tabular Data Package][tabular-data-package]. May 2017.


[csv-engine]: https://data.wu.ac.at/csvengine/
[csv2json]: https://www.w3.org/TR/2015/REC-csv2json-20151217/
[csv2rdf]: https://www.w3.org/TR/2015/REC-csv2rdf-20151217/
[csvw-charter]: https://www.w3.org/2013/05/lcsv-charter
[csvw-primer]: https://www.w3.org/TR/2016/NOTE-tabular-data-primer-20160225/
[csvw-ucr]: https://www.w3.org/TR/2016/NOTE-csvw-ucr-20160225/
[dc]: https://dublincore.org/
[dcat]: https://www.w3.org/TR/vocab-dcat-2/
[implementation-report]: https://w3c.github.io/csvw/tests/reports/index.html
[json-ld]: https://www.w3.org/TR/json-ld/
[rdf]: https://www.w3.org/TR/rdf11-concepts/
[rfc4180]: https://tools.ietf.org/html/rfc4180
[rfc5785]: https://tools.ietf.org/html/rfc5785
[rfc6570]: https://tools.ietf.org/html/rfc6570
[rfc8288]: https://tools.ietf.org/html/rfc8288
[rust]: https://www.rust-lang.org/
[schemaorg]: https://schema.org/
[solid]: https://solid.github.io/specification/
[tabular-data-model]: https://www.w3.org/TR/2015/REC-tabular-data-model-20151217/
[tabular-metadata]: https://www.w3.org/TR/2015/REC-tabular-metadata-20151217/
[xmlschema]: http://www.w3.org/TR/xmlschema11-2/
[tabular-data-package]: https://specs.frictionlessdata.io//tabular-data-package/
