---
type: note
id: handling-json-with-duckdb.md
publication_date: 2024-12-19
author: arnau
tags:
  - duckdb
  - nushell
  - data
  - json
---
# Handling JSON with DuckDB

This note captures my learnings on JSON manipulation with [DuckDB](https://duckdb.org/).


<!-- body -->

I'll be using the [Star Wars API](https://swapi.info/) as our source of JSON data. It's not too large, reasonibly flat but not too much. All examples are done in a DuckDB interactive session:

```sh
duckdb star_wars.db
```

Using an in-memory session instead of a new `star_wars.db` will work as well.


## Fetching JSON data

The way to get JSON data into DuckDB is to use the table function [`read_json`](https://duckdb.org/docs/data/json/loading_json#the-read_json-function). It accepts either a filename or a URL, for example this fetches the list of Star Wars films:

```sql
select * from read_json('https://swapi.info/api/films');
```

The query above returns a table with 14 columns derived from the JSON objects found in the response. It first fetches the json data, detects it is an array, and creates one row per object found in it. Each row will then have a column for each top level key found in the objects where values will be of an equivalent type (e.g. `string` will become `varchar`, `number` will become `integer` or `float`). Most importantly, arrays and objects will be casted as [composite types](https://duckdb.org/docs/sql/data_types/overview.html#nested--composite-types).

One of the limitations of JSON is that it lacks a type for dates which means that columns like `created` will be of type `varchar`. DuckDB however, attempts to cast any column with a clue in its name. For example the `release_date` is of type `date`.

You can cast specific columns either with the `cast` function or the infix `::`:

```sql
select title, release_date, created::datetime, cast(edited as timestamp) from read_json('https://swapi.info/api/films');
```

But it also has a way to provide an explicit schema to `read_json`: the parameter `columns`. This parameter will take any definition and will attempt to create rows with it, including empty ones so beware of typos.

```sql
select * from read_json('https://swapi.info/api/films', columns = {title: varchar, release_date: date, created: timestamp, edited: timestamp});
```

The query above will produce a set of rows with only four columns, with the declared types. If a value cannot be casted to the provided type, you'll get an error (see `ignore_errors` in the documentation for a more forgiving approach).

The `read_json` function can return a list of JSON blobs by combining two parameters: `format` and `columns`:

```sql
select json_data from read_json('https://swapi.info/api/films', format = 'unstructured', columns = {json_data: 'json[]'});
```

`format = 'unstructured'` treats the incoming data as a single blob whereas `columns = {json_data: 'json[]'}` casts the resulting data as a list of JSON blobs instead of structs.

Next we can unfold the list into rows using the [`unnest` function](https://duckdb.org/docs/sql/query_syntax/unnest.html):

```sql
select unnest(json_data) as raw_data from read_json('https://swapi.info/api/films', format = 'unstructured', columns = {json_data: 'json[]'});
```

Now each row is a JSON object so we can handle them with the [JSON processing functions](https://duckdb.org/docs/data/json/json_functions).

Let's store the JSON objects into a table so we can move our focus away from the `read_json` function.

```sql
create table raw_film as
select unnest(json_data) as raw_data from read_json('https://swapi.info/api/films', format = 'unstructured', columns = {json_data: 'json[]'});
```

## Inspecting the structure of a JSON blob

DuckDB provides the [`json_structure` function](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions) which generates a schema from a JSON blob.

```sql
select json_structure(raw_data) from raw_film;
```

|                                  `json_structure(raw_data)`                                      |
|--------------------------------------------------------------------------------------------------------|
| `{"title":"VARCHAR","episode_id":"UBIGINT", …,"created":"VARCHAR","edited":"VARCHAR","url":"VARCHAR"}` |


Unfortunately the result is not compatible with the syntax required by the `read_json`'s `columns` parameter. However it can be used with the [`from_json` function](https://duckdb.org/docs/data/json/json_functions#transforming-json-to-nested-types). It's second parameter needs to be a constant so we'll use DuckDB's extended SQL:

```sql
set variable json_schema = (select json_structure(raw_data) from raw_film);
select from_json(raw_data, getvariable('json_schema')) as raw_data from raw_film;
```

Another useful tool is the [`json_keys` function](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions) which can be useful for a quick overview of what's available at the top level.
 
```sql
select unnest(json_keys(raw_data)) as keys from (select * from raw_film limit 1);
```

|     keys      |
|---------------|
| title         |
| episode_id    |
| opening_crawl |
| director      |
| producer      |
| release_date  |
| characters    |
| planets       |
| starships     |
| vehicles      |
| species       |
| created       |
| edited        |
| url           |


## Handling JSON values

Earlier we created a `raw_film` table storing the JSON blobs for each film:

```sql
select * from raw_film;
```

|                                      raw_data                                      |
|------------------------------------------------------------------------------------|
| `{'title': A New Hope…, 'episode_id': 4, 'opening_crawl': It is a period o…, 'di…` |
| `{'title': The Empire Strik…, 'episode_id': 5, 'opening_crawl': It is a dark tim…` |
| `{'title': Return of the Je…, 'episode_id': 6, 'opening_crawl': Luke Skywalker h…` |
| `{'title': The Phantom Mena…, 'episode_id': 1, 'opening_crawl': Turmoil has engu…` |
| `{'title': Attack of the Cl…, 'episode_id': 2, 'opening_crawl': There is unrest …` |
| `{'title': Revenge of the S…, 'episode_id': 3, 'opening_crawl': War! The Republi…` |


The main tools to use here are [JSON processing functions](https://duckdb.org/docs/data/json/json_functions.html). In particular the [`json_extract` (`->`) and `json_extract_string` (`->>`) functions](https://duckdb.org/docs/data/json/json_functions.html#json-extraction-functions):

```sql
select
  raw_data->>'title' as title
  , (raw_data->>'episode_id')::uint64 as episode_id 
  , (raw_data->'characters')::varchar[] as characters
from
  raw_film;
```

Both `->` and `->>` and `::` are infix notation for the functions `json_extract`, `json_extract_string` and `cast` respectively. The following is equivalent:


```sql
select
  json_extract_string(raw_data, 'title') as title
  , cast(json_extract_string(raw_data, 'episode_id') as uint64) as episode_id 
  , cast(json_extract(raw_data, 'characters') as varchar[]) as characters
from
  raw_film;
```

We can normalise this data further by unfolding the `characters` array into rows using the `unnest` function we saw earlier:

```sql
select
  json_extract_string(raw_data, 'title') as title
  , cast(json_extract_string(raw_data, 'episode_id') as uint64) as episode_id 
  , unnest(cast(json_extract(raw_data, 'characters') as varchar[])) as character_id
from
  raw_film;
```

|   title             | episode_id |          character_id            |
|---------------------|------------|----------------------------------|
| A New Hope          | 4          | https://swapi.info/api/people/1  |
| A New Hope          | 4          | https://swapi.info/api/people/2  |
| A New Hope          | 4          | https://swapi.info/api/people/3  |
| A New Hope          | 4          | https://swapi.info/api/people/4  |
| A New Hope          | 4          | https://swapi.info/api/people/5  |
| …                   | …          | …                                |
| Revenge of the Sith | 3          | https://swapi.info/api/people/83 |


**Warning**: Be careful with the `unnest` function. When you use it in two different columns it will unfold both by position like you would expect from a zip function. If the goal is to normalise the whole database (films, planets, people, species, vehicles and starships), do it one table at a time.





```sql
create table film as select * from read_json('https://swapi.info/api/films');
create table planet as select * from read_json('https://swapi.info/api/planets');
create table person as select * from read_json('https://swapi.info/api/people');
create table specie as select * from read_json('https://swapi.info/api/species');
create table vehicle as select * from read_json('https://swapi.info/api/vehicles');
create table starship as select * from read_json('https://swapi.info/api/starships');
```

## Things you can do that are likely a bad idea

```sql
select map(k, [raw_data->>x for x in k]) from (select json_keys(raw_data) as k, raw_data from raw_film);
```

## Gotchas

- json arrays are 0-indexed but lists are 1-indexed.
- `from_json` requires a second parameter that can't be dynamically generated.
- schema syntax for `read_json` is different from `from_json`. The former is compound type syntax wereas the latter is json syntax.
  - combine `from_json` and `typeof` to get the compound type syntax.


## Frequently used functions with JSON values

- [`read_json`](https://duckdb.org/docs/data/json/loading_json#the-read_json-function). Read a JSON file (or URL).
- [`json_structure`](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions). Return the schema of the given JSON blob.
- [`unnest`](https://duckdb.org/docs/sql/query_syntax/unnest.html). Unfold an array into rows.
- [`from_json`](https://duckdb.org/docs/data/json/json_functions.html#transforming-json-to-nested-types). Transforms a JSON value into a native one.
- [`json_extract` (`->`) and `json_extract_string` (`->>`)](https://duckdb.org/docs/data/json/json_functions.html#json-extraction-functions). Pick values out of a JSON value.
- [`json_keys`](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions). Returns the list of keys of a JSON object.



## Resources

- [DuckDB Documentation - JSON Overview](https://duckdb.org/docs/data/json/overview).
- [Analyze JSON Data Using SQL and DuckDB](https://motherduck.com/blog/analyze-json-data-using-sql/).
- [Shredding Deeply Nested JSON, One Vector at a Time](https://duckdb.org/2023/03/03/json.html).
- [Unnest JSON Array into Rows (pseudo-json_each)](https://duckdbsnippets.com/snippets/13/unnest-json-array-into-rows-pseudojsoneach).
- [Wrangling JSON with DuckDB](https://bnm3k.github.io/blog/wrangling-json-with-duckdb/).
