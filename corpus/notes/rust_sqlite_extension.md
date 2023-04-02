---
type: note
id: rust-sqlite-extension
publication_date: 2023-04-02
author: arnau
tags: [rust, sqlite]
---
# Building a SQLite extension with Rust

This note captures my experience building a [SQLite] extension in [Rust].

[Rust]: https://www.rust-lang.org/
[SQLite]: https://sqlite.org/

<!-- body -->

[SQLite](https://sqlite.org/) has the [ability to load extensions](https://sqlite.org/loadext.html) at runtime. Some examples are [application-defined SQL functions](https://sqlite.org/appfunc.html), [collating sequences](https://sqlite.org/datatype3.html#collation), [virtual tables](https://sqlite.org/vtab.html) and  [virtual file systems](https://sqlite.org/vfs.html). The SQLite project offers a few examples of extensions, for example the [FTS5 virtual table to enable full-text search](https://sqlite.org/fts5.html).

In [Rust](https://www.rust-lang.org/), the main SQLite library is [Rusqlite](https://crates.io/crates/rusqlite). However, as per v0.29, it only allows building extensions that are loadable by a Rust application using Rusqlite. This means that Rusqlite is not able to generate an artefact that can be dynamically loaded by, for example, the SQLite CLI or the [Python SQLite module](https://docs.python.org/3/library/sqlite3.html).

There is a [long standing proposal](https://github.com/rusqlite/rusqlite/pull/910) (circa 2019) that suggests that eventually the project will allow for this feature but there is no expected delivery time. In the meantime we need an alternative.

[sqlite-loadable](https://github.com/asg017/sqlite-loadable-rs) is a young (v0.0.5) attempt offering such feature using an interface very similar to the one offered by Rusqlite for building non-dynamic extensions. The author is using it to build a set of extensions already. Worth checking out [sqlite-xsv](https://github.com/asg017/sqlite-xsv) and [sqlite-regex](https://github.com/asg017/sqlite-regex) as well as the article [Introducing sqlite-loadable-rs: A framework for building SQLite Extensions in Rust](https://observablehq.com/@asg017/introducing-sqlite-loadable-rs).

So I built a [SQLite extension that lets you query against a collection of TOML files](https://github.com/arnau/sqlite-toml-vtab) using sqlite-loadable.

## A virtual table for collections of TOML files

The goal was to build a SQLite extension offering virtual table that would allow a user to query against a set of TOML files doing something like:

```sql
CREATE VIRTUAL TABLE temp.recipe USING toml(dirname="recipes");

SELECT DISTINCT
    json_extract(ingredient.value, '$.name') AS ingredient_name
FROM
    temp.recipe, json_each(json_extract(temp.recipe.value, '$.ingredients')) AS ingredient
ORDER BY ingredient_name
```

In other words, the extension should surface a virtual table constructor `toml()` with a parameter `dirname` to provide the root directory for locating TOML files.

And for each TOML file, create a row in the virtual table with its contents serialised as JSON.

A future iteration could allow passing the list of expected columns instead but this approach keeps things simple with a fix set of columns: `filename` and `value`.

With that and the [JSON functions and operators](https://www.sqlite.org/json1.html) it is possible to query, normalise and manipulate the data freely.

## Building blocks

Any extension requires an entry point with a shape as follows:

```rust
#[sqlite_entrypoint]
pub fn sqlite3_tomlvtab_init(db: *mut sqlite3) -> Result<()> {
    // define virtual table or other functions here

    Ok(())
}
```
The `sqlite_entrypoint` takes care of the boilerplate required by SQLite.

A virtual table needs two structs, one implementing the [`VTab` trait](https://docs.rs/sqlite-loadable/latest/sqlite_loadable/table/trait.VTab.html) and another one implementing the [`VTabCursor` trait](https://docs.rs/sqlite-loadable/latest/sqlite_loadable/table/trait.VTabCursor.html).

`VTab` takes care of processing the given parameters, creating the virtual table and handling the cursor for a given query.

The main focus is on the `connect` method, where the work of checking the incoming parameters are valid should happen. It expects returning the schema as a [`CREATE TABLE` statement](https://www.sqlite.org/lang_createtable.html). In this case a static:

```sql
CREATE TABLE x(
  "filename" TEXT,
  "value"    TEXT
);
```

Indexes are to be built using the `best_index` method. I opted for a non-optimal but easy no-index situation so every query will to a full scan.

Finally, the `open` method takes care of initialising the cursor. In my implementation I read from disk and load into memory all data at this point.

`VTabCursor` takes care of a row from the virtual table, a-la `Iterator`. It requires implementing the methods `filter`, `next`, `column`, `eof` and `rowid`.

For this implementation `filter` is a no-op method given that we are not using indexes.

`next` checks that the current rowid is in bounds of the data stored in memory and if so, increments rowid.

`column` is where the magic happens. It reads from the data in memory and returns (via a shared Context object) the value for the current {row, column}. In this naive implementation all values are `TEXT` but in a fancier version with a custom set of columns this would be the point to determine the right [column affinity](https://www.sqlite.org/datatype3.html#determination_of_column_affinity).

And that's it. sqlite-loadable takes care of the rest.

## Closing thoughts

It took me a while to realise that Rusqlite was not able to handle loadable extensions which was a bit frustrating. sqlite-loadable was great though. It is designed after Rusqlite which means that pretty much all the work I did initally was portable within an hour.

That said, the fact that sqlite-loadable is an unstable large set of `unsafe` code makes me not recommend it for general use. It looks highly promising though.
