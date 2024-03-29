---
type: note
id: addresspack-note
publication_date: 2020-06-11
author: arnau
tags:
  - geospatial
  - sqlite
  - geopackage
  - addressbase
  - addresspack
---
# Addresspack

This note describes my efforts in processing AddressBase from [Ordnance
Survey] into SQLite.

[Ordnance Survey]: https://orders.ordnancesurvey.co.uk/orders/index.html

<!-- body -->


The [Addresspack] project processes a standard “AddressBase Premium full
(CSV)” into a SQLite database.

Before jumping into AddressBase details, you might want to consider [OS Open
UPRN].  It is a slim option if you only want the coordinates for a given URPN.
It is licenced under the [Open Government Licence] and offers two options: a
table-oriented CSV and a [GeoPackage].

Notice that now [AddressBase Core is also offered as GeoPackage](https://github.com/arnau/addresspack/issues/3).


## Context

AddressBase Premium CSV is a particular beast. The download is a ~8GB zip
file that contains around 352 files with a `.csv` extension.

Although these files are labelled as "csv" they are not structured as a table.
They have to be treated as a single list of comma-separated lines where each
line starts with the numeric identifier for the table they belong to.

So, to recompose the original relational model, you need to read the
[technical specification] and create the expected schema.

If you only want construct tabular CSV files, you might be able to get away
with just using the [header files].

At this point, you need to read the given files line by line, parse each line
as CSV, promote empty values as `NULL`, and load all ~352 million records into
the expected table.


## Why SQLite

The journey you have to go through to get from what Ordnance Survey gives you
to the point where you are able to run your first query against the
AddressBase database can't be qualified as a good experience.

SQLite is a single-file relational database with a good SQL engine. What would
be the experience if instead of downloading the CSV zip you could instead
download a SQLite database ready to be used? Perhaps the database could
include some metadata and enough documentation to let you get an understanding
of what is each table for and what are the relationships between them. Similar
to what you get in the technical specification but co-located with the data.

Well, Addresspack is an exercise to explore this idea.

The [bare schema] before loading the full dataset
provides `table_info` and `column_info` which lets you explore the basic
documentation for each table and columns.

For example, to know what columns are available and what are they for for the
table with id `10` (the first record of every CSV file starts with `10`) you
could:

```
sqlite3 addresspack.sqlite \
"select table_info.name, column_info.id, column_info.definition \
from column_info join table_info on column_info.table_id = table_info.id \
where table_id = 10;"
```


## Getting the data

The [Ordnance Survey] website has an order's section where you can buy access
to the AddressBase Premium database. The one Addresspack expects is the CSV
with Download as a delivery method.


## Install

You can download the pre-build package for your platform from the [release
page] or you can build and install with `cargo`:

```
cargo install \
  --git https://github.com/arnau/addresspack \
  --tag v0.1.0
```

Note: It has only been tested with Rust 1.44 but it is likely that it works
for older versions as well.


## Limitations

SQLite only allows a single writer so Addresspack can't use multiple threads
to parallelise. Although I tried to make the ingestion process fast, it is
extremely slow. In the order of hours.

By default, a transaction is commited every 10 files (i.e. every 10,000,000
inserts) using the [SQLite WAL] journaling. If the process stops (e.g. you
kill the process), you can run it again and it will resume where it stopped
with a potential data loss of 10 million rows.

If you have ideas or want to contribute to make it faster, you are more than
welcome to reach to me!

Another limitation is that Addresspack is only able to process the full
version of AddressBase Premium. I haven't looked at what would it mean to load
a data update.


## Impracticalities

The `application_cross_reference` table can be impractical to use due to its
size:

```
$ time sqlite3 addresspack.sqlite "select count(*) from application_cross_reference;"
191207473
2.26s user 29.48s system 21% cpu 2:29.76 total
```

So, if there is a need for a query that requires a full scan, expect it to be
slow.

Out of curiosity, this is the same count using [xsv] after exporting the
table to CSV:

```
$ time xsv count xref.csv
191207473
30.49s user 8.93s system 96% cpu 40.764 total
```

In any case, for more realistic queries like finding records for a particular
`xref_key`, SQLite is lightning fast whilst other means like [xsv] or [rg] are
slower.

And of course, SQLite is a single file for the whole database which was the
main driver for this exercise.


## Measurements

These are some numbers that might help understand the scale of the task:

|file|size|
|----|---:|
|AB76GB_CSV.zip|8.13 GB|
|AB76GB_CSV (unzipped, 352 files)|44 GB|
|addresspack.sqlite.zip|13.97 GB|
|addresspack.sqlite|46.6 GB|

|id|table|count|
|--|-----|----:|
|10|`header`|352|
|11|`street`|1439574|
|15|`street_descriptor`|1555308|
|21|`basic_land_property_unit`|39207495|
|23|`application_cross_reference`|191207473|
|24|`local_property_identifier`|43831026|
|28|`delivery_point_address`|29501884|
|29|`metadata`|352|
|30|`successor`|0|
|31|`organisation`|1268612|
|32|`classification`|43022571|
|99|`trailer`|352|



[Addresspack]: https://github.com/arnau/addresspack
[GeoPackage]: https://www.geopackage.org/
[OS Open UPRN]: https://www.ordnancesurvey.co.uk/business-government/products/open-uprn
[Open Government Licence]: http://os.uk/opendata/licence
[Ordnance Survey]: https://orders.ordnancesurvey.co.uk/orders/index.html
[Rust]: https://www.rust-lang.org/
[SQLite WAL]: https://www.sqlite.org/wal.html
[bare schema]: https://github.com/arnau/addresspack/tree/main/src/sql/bootstrap.sql
[header files]: http://www.os.uk/docs/product-schemas/addressbase-premium-header-files.zip
[release page]: https://github.com/arnau/addresspack/releases/
[rg]: https://github.com/BurntSushi/ripgrep/
[technical specification]: https://www.ordnancesurvey.co.uk/documents/product-support/tech-spec/addressbase-premium-technical-specification.pdf
[xsv]: https://github.com/BurntSushi/xsv/
