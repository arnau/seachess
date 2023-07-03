---
type: project
id: tree-sitter-csv
status: ongoing
start_date: 2023-07-03
source_url: https://github.com/arnau/tree-sitter-csv
---
# tree-sitter-csv

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar and highlighting queries for CSV.

<!-- body -->

Most popular editors have been adopting [tree-sitter](https://tree-sitter.github.io/tree-sitter/) to get fast, incremental and fault-tolerant highlighting as well as structural navigation.

This project simply provides the rules for dealing with CSV files, compliant with [RFC 4180](https://datatracker.ietf.org/doc/html/rfc4180) with some extras to distinguish between value types (string, integer, float, hex, boolean) as well as two keywords: `NA` and `NULL`.
