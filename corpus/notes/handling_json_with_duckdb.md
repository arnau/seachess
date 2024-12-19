---
type: note
id: handling-json-with-duckdb
publication_date: 2024-12-21
author: arnau
tags:
  - duckdb
  - data
  - json
---
# Handling JSON with DuckDB

This note captures my learnings on JSON manipulation with [DuckDB](https://duckdb.org/). The approach is to rely on JSON as the main data type just because the objective is to explore what's possible within DuckDB. In no way it's a recommendation on approach.


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

The query above returns a table with 14 columns derived from the JSON objects found in the response. It first fetches the json data, detects it is an array, and creates one row per object found in it. Each row will then have a column for each top level key found in the objects where values will be of an equivalent type (e.g. `string` will become `varchar`, `number` will become `integer` or `float`). Most importantly, arrays and objects will be cast as [composite types](https://duckdb.org/docs/sql/data_types/overview.html#nested--composite-types).

One of the limitations of JSON is that it lacks a type for dates which means that columns like `created` will be of type `varchar`. DuckDB however, attempts to cast any column with a clue in its name. For example the `release_date` is of type `date`.

You can cast specific columns either with the `cast` function or the infix `::`:

```sql
select title, release_date, created::datetime, cast(edited as timestamp) from read_json('https://swapi.info/api/films');
```

But it also has a way to provide an explicit schema to `read_json`: the parameter `columns`. This parameter will take any definition and will attempt to create rows with it, including empty ones so beware of typos:

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

Let's store the JSON objects into a table so we can move our focus away from the `read_json` function:

```sql
create table raw_film as
select unnest(json_data) as raw_data from read_json('https://swapi.info/api/films', format = 'unstructured', columns = {json_data: 'json[]'});
```

## Inspecting the structure of a JSON blob

The first thing to do when facing a new JSON blob is to understand its structure (i.e. which fields exist and of what data type each field holds).

The [`json_structure` function](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions) generates a JSON blob describing the original JSON blob:

```sql
select json_structure(raw_data) from raw_film;
```

|                             `json_structure(raw_data)`                             |
|------------------------------------------------------------------------------------|
| `{"title":"VARCHAR","episode_id":"UBIGINT", …,"edited":"VARCHAR","url":"VARCHAR"}` |


Unfortunately the result is not compatible with the syntax required by the `read_json`'s `columns` parameter. However it can be used with the [`from_json` function](https://duckdb.org/docs/data/json/json_functions#transforming-json-to-nested-types). It's second parameter needs to be a constant so we'll use DuckDB's extended SQL:

```sql
set variable json_schema = (select json_structure(raw_data) from raw_film limit 1);
select from_json(raw_data, getvariable('json_schema')) as raw_data from raw_film;
```

|                                      raw_data                                      |
|------------------------------------------------------------------------------------|
| `{'title': A New Hope…, 'episode_id': 4, 'opening_crawl': It is a period o…, 'di…` |
| `{'title': The Empire Strik…, 'episode_id': 5, 'opening_crawl': It is a dark tim…` |
| `{'title': Return of the Je…, 'episode_id': 6, 'opening_crawl': Luke Skywalker h…` |
| `{'title': The Phantom Mena…, 'episode_id': 1, 'opening_crawl': Turmoil has engu…` |
| `{'title': Attack of the Cl…, 'episode_id': 2, 'opening_crawl': There is unrest …` |
| `{'title': Revenge of the S…, 'episode_id': 3, 'opening_crawl': War! The Republi…` |

Notice that the data type is no longer `json`. It's now a struct. And with a struct, you can use the `unnest` function to unfold it into actual columns:

```sql
set variable json_schema = (select json_structure(raw_data) from raw_film limit 1);
select unnest(from_json(raw_data, getvariable('json_schema'))) as raw_data from raw_film;
```

|          title          | episode_id |  opening_crawl  |
|-------------------------|------------|-----------------|
| A New Hope              | 4          | It is a period… |
| The Empire Strikes Back | 5          | It is a dark t… |
| Return of the Jedi      | 6          | Luke Skywalker… |
| The Phantom Menace      | 1          | Turmoil has en… |
| Attack of the Clones    | 2          | There is unres… |
| Revenge of the Sith     | 3          | War! The Repub… |


Another useful tool is the [`json_keys` function](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions) which can be useful for a quick overview of what's available at the top level:
 
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


## Creating JSON

JSON is a decent format for packing non-tabular data into a single structure. Ideal for denormalised data or data that is non-tabular by nature such as event logs where each even holds a unique structure.

For this section, let's create a couple of new tables using the `read_json` function to get data into a tabular structure:

```sql
create table film as select * from read_json('https://swapi.info/api/films');
create table character as select * from read_json('https://swapi.info/api/people');
create table planet as select * from read_json('https://swapi.info/api/planets');
create table species as select * from read_json('https://swapi.info/api/species');
```

We will use the [JSON creation functions](https://duckdb.org/docs/data/json/creating_json#json-creation-functions) to create a JSON structure with the basic information for each character adding a few details of each movie they appear in.

Let's see the whole query first, then we can look at the few key bits:

```sql
with
film_character as (
  select
    title
    , url
    , director
    , unnest(characters) as character
  from
    film
)
, character_blob as (
  select
    { type: 'character'
    , url: character.url
    , name: character.name
    , homeworld: { type: 'planet'
                 , url: planet.url
                 , name: planet.name
                 , climate: planet.climate
                 }
    , species: species.name
    } as character
  from
    character
  join
    planet on planet.url = character.homeworld 
  left join
    species on species.url = character.species[1] 
)
, film_blob as (
  select
    { type: 'film'
    , url: film_character.url
    , title: film_character.title
    , director: film_character.director
    , characters: array_agg(character_blob.character)
    } as film
  from
    film_character
  join
    character_blob on character_blob.character.url = film_character.character
  group by
    film_character.url
    , film_character.title
    , film_character.director
)
select
  to_json(film) as film
from
  film_blob;
```

The `film_character` subquery uses the `unnest` function to unfold the `characters` array, nothing we haven't seen in previous sections:

```sql
[…]
film_character as (
  select
    title
    , url
    , director
    , unnest(characters) as character
  from
    film
)
[…]
```

The `character_blob` subquery is slightly more interesting. It uses the literal struct syntax to compose a tree structure packing some bits from the `character` table, and some related bits from both `planet` and `species`.


```sql
[…]
, character_blob as (
  select
    { type: 'character'
    , url: character.url
    , name: character.name
    , homeworld: { type: 'planet'
                 , url: planet.url
                 , name: planet.name
                 , climate: planet.climate
                 }
    , species: species.name
    } as character
  from
    character
  join
    planet on planet.url = character.homeworld 
  left join
    species on species.url = character.species[1] 
)
[…]
```

Also notice the `character.species[1]` expression at the very end. It takes advantage of the fact that the `species` field in the `character` table is an array of either 0 or 1 items. By using the [`list[index] notation`](https://duckdb.org/docs/sql/functions/list#listindex) we either get the first item or `null`.

The `film_blob` subquery uses the same literal struct syntax to pack the film data into a struct. This time we also use the [`array_agg` function](https://duckdb.org/docs/sql/functions/aggregates.html#array_aggarg) to fold all characters back into their respective films. As with any other aggreate function, we use `group by` to describe the grouping criteria.

```sql
[…]
, film_blob as (
  select
    { type: 'film'
    , url: film_character.url
    , title: film_character.title
    , director: film_character.director
    , characters: array_agg(character_blob.character)
    } as film
  from
    film_character
  join
    character_blob on character_blob.character.url = film_character.character
  group by
    film_character.url
    , film_character.title
    , film_character.director
)
[…]
```

Finally, the [`to_json` function](https://duckdb.org/docs/data/json/creating_json#json-creation-functions) is used to cast the film struct into JSON. Using `cast(film as json)` or `film::json` will give you the same result.

```sql
[…]
select
  to_json(film) as film
from
  film_blob;
```

There are many other JSON functions that can help generate JSON but we have covered the essentials.


## Writing JSON

Writing JSON out of DuckDb boils down to the [`copy` statement](https://duckdb.org/docs/sql/statements/copy.html). For example, to write a file `star_wars_films.json` from a table simply do:

```sql
copy film to 'star_wars_films.ndjson';
```

By default `copy` writes a line-delimited list of JSON objects. You can output a single JSON array with:

```sql
copy film to 'star_wars_films.json' (format json, array true);
```

## Streaming in and out

Sometimes you might want to use DuckDB as a transient JSON processor, getting JSON in, processing and then getting it out can be done with what we have already seen:

```sql
'[{"a": 1, "b": [2, 3]}, {"a": 2, "b": [4, 5]}]' | duckdb -json -c "select a, unnest(b) as b from read_json('/dev/stdin')"
```

And to get things out
  
```sql
duckdb -c "copy (select title, unnest(characters) as character from film) to '/dev/stdout' (format json, array true)" star_wars.db
```

JSON is just one of the formats DuckDB is able to handle. A few more worth mentioning: CSV, Parquet and markdown.


## Frequently used functions with JSON values

- [`read_json`](https://duckdb.org/docs/data/json/loading_json#the-read_json-function). Read a JSON file (or URL).
- [`json_structure`](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions). Return the schema of the given JSON blob.
- [`unnest`](https://duckdb.org/docs/sql/query_syntax/unnest.html). Unfold an array into rows.
- [`from_json`](https://duckdb.org/docs/data/json/json_functions.html#transforming-json-to-nested-types). Transforms a JSON value into a native one.
- [`json_extract` (`->`) and `json_extract_string` (`->>`)](https://duckdb.org/docs/data/json/json_functions.html#json-extraction-functions). Pick values out of a JSON value.
- [`json_keys`](https://duckdb.org/docs/data/json/json_functions.html#json-scalar-functions). Returns the list of keys of a JSON object.
- [`to_json` function](https://duckdb.org/docs/data/json/creating_json#json-creation-functions). Casts a native type into JSON.
- [`array_agg` function](https://duckdb.org/docs/sql/functions/aggregates.html#array_aggarg). Folds a set of values into an array. Think of it as the inverse of `unnest`.


## Resources

- [DuckDB Documentation - JSON Overview](https://duckdb.org/docs/data/json/overview).
- [Analyze JSON Data Using SQL and DuckDB](https://motherduck.com/blog/analyze-json-data-using-sql/).
- [Shredding Deeply Nested JSON, One Vector at a Time](https://duckdb.org/2023/03/03/json.html).
- [Unnest JSON Array into Rows (pseudo-json_each)](https://duckdbsnippets.com/snippets/13/unnest-json-array-into-rows-pseudojsoneach).
- [Wrangling JSON with DuckDB](https://bnm3k.github.io/blog/wrangling-json-with-duckdb/).
