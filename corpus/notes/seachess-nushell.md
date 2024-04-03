---
type: note
id: seachess-nushell
publication_date: 2024-04-02
author: arnau
tags:
  - seachess
  - nushell
  - data
---
# A nushell script for the Seachess bulletin

This note captures my approach to interacting with my database of articles I've read and shared in my [weekly bulletin](/bulletins).

<!-- body -->

## Overview

Back in 2020 I started a weekly bulletin where I share a few links that I found interesting. The original data structure was a mixture of CSV and TOML and the way to interact with it was with a command-line tool I built specifically for this purpose. 

In 2023 I adopted [Nushell] as my interactive shell of choice. After a while I found it a much better interaction than my handmade command-line tool, allowing me to interact not only with my original CSV and TOML files but with a larger set of data I have stored in a variety of formats.

This note describes the simple data model and the Nushell scripts I use to record my readings and the process of compiling a bulletin issue.


### Data model

The fundamental concepts are:

- The _trail_. A set of _trail entries_ capturing what I've read and when.
- The _stash_. A set of _bulletin entries_ I flagged as candidates for the bulletin.
- The _bulletin_. A set of _bulletin issues_ I have published.

### The _trail entry_

- _date_. The day I read the resource.
- _url_. The URL for the resource. Acts as the primary identifier.
- _title_. The name of the resource. Title of an article, paper or book, name of a tool, etc.
- _summary_. The description of the resource. Typically my own take on the resource.
- _source_. The place where I found the resource.
- _tags_. A set of tags to classify the resource.

An example:

| key     | value                                                                                |
| ------- | ------------------------------------------------------------------------------------ |
| date    | 2020-01-23                                                                           |
| url     | https://github.com/flamegraph-rs/flamegraph                                          |
| title   | Flamegraph                                                                           |
| summary | A tool to profile a running process and generate a flamegraph in SVG for the result. |
| tags    | [programming_language/rust, topic/tool]                                              |
| source  |                                                                                      |


### The _bulletin issue_

- _id_. The ISO week the bulletin issue was published on.
- _publication_date_. The date the bulletin issue was published on.
- _summary_. A short description of what the entries are about.
- _type_. The type of record. Always `bulletin`.
- _entries_. The list of entries for the bulletin issue.

A _bulletin issue entry_ has a slightly different shape than a _trail entry_:

- _content type_. Whether the resource is text, video or pdf.
- _url_. The URL for the resource. Acts as the primary identified.
- _title_. The name of the resource. Title of an article, paper or book, name of a tool, etc.
- _summary_. The description of the resource. Can be different from the _trail entry_, for example adding a bit of commentary on top of the description.

An example:

| key              | value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| id               | 2023-W01                                                         |
| publication_date | 2023-01-08                                                       |
| summary          | This week has been about reactive libraries mechanics, graph […] |
| type             | bulletin                                                         |
| entries          | […]                                                              |


## Data storage

The data storage has evolved over time and as a consequence there is a variety of formats in the mix. The original idea was to store data in a text format such that Git could easily track changes. The data then would be imported and normalised into a [SQLite] database and queried with SQL. Currently, the picture looks like:

- The _trail_ is stored as an append-only CSV (one file per year) where the tags column is encoded as a JSON array.
- The _bulletin_ is stored as an append-only jsonl (JSON Lines), where each line is a single _bulletin issue_.
- The _stash_ is stored as TOML.
- The _sources_ as stored as a single CSV.


## Querying the data

[Nushell] makes querying data in disparate formats straightforward but it can be a bit verbose. The main commands are about listing things (see the [Appendix A](#appendix-a) for the full implementation). For example, `trail list` is implemented as:

```nu
# sea/trail.nu

export def list [] {
    open data/trail/*.csv
    | insert year { |row| $row.date | date to-record | get year }
    | update tags { from json }
}
```

Having the ability to list all resources with commands like `{resource-type} list` makes it straightforward to compose. For example, one of the queries I used to build the [Bulletin report (2023)](/notes/bulletin-report-2023/) looks like:

```nu
bulletin list
| flatten --all
| join (trail list) url
| group-by --to-table year
| update items { $in.source | uniq | length }
| rename year published_sources
| sort-by year
```

Which results in:

| year | published_sources |
| ---- | ----------------- |
| 2020 | 20                |
| 2021 | 22                |
| 2022 | 22                |
| 2023 | 17                |
| 2024 | 7                 |

If you squint at the query above you'll likely see the resemblance with the following SQL:

```sql
select
      year
    , count(source)
from (
    select distinct
          bulletin.year
        , trail.source
    from
        bulletin
    join
        trail using(url)
)
group by
    year
order by
    year;
```

## Weekly actions

Each week there are a few common actions that help me build the next _bulletin issue_. The most common by far is adding a new _entry_ to the _trail_. In an interactive shell I flow through the following:

```nu
# New entry record. It's an empty structure with the exception of the date.
mut entry = (trail new)

# Add the URL
$entry.url = "https://foo.bar"

# Add the title
$entry.title = "Foo Bar"

# Add the summary
$entry.summary = "Lorem ipsum dolor sit amet."
```

This part is as rudimentary as it gets, plain Nushell assignments agains a record I could've created by hand. The next two bits are more interactive though:

```nu
# Prompts a fuzzy search over the list of sources.
$entry = ($entry | trail add source)

# Prompts a fuzzy search over the list of previously used tags.
$entry = ($entry | trail add tag)
```

Once happy with the entry, I save it to the trail:

```nu
$entry | trail save
```

And if the entry should be a candidate for the bulletin, I add it to the stash:

```nu
$entry | stash add | stash save
```

Finally, when I'm ready to publish a new _bulletin issue_ I do:

```nu
# Prompts the list of stash entries and allows to select the ones I need.
mut bulletin = (bulletin new)

$bulletin | bulletin save
```

Finally, I generate an HTML version I can paste into my newsletter management service:

```nu
$bulletin | bulletin to html | pbcopy
```


## Closing thoughts

Nushell offers a convenient way to specialise an environment to act as a sort-of DSL which makes some command-line tools redundant. This approach has meant I can quickly iterate over my commands as I find new patterns or points of friction including completely changing the shape of the data.


## Appendix A

The commands used in this note are split in multiple files and imported into a single module. To use it, activate the module:

```nu
overlay use sea.nu
```

Note that I automatically add the overlay using a [conditional hook on entering the directory](https://www.nushell.sh/book/hooks.html#automatically-activating-an-environment-when-entering-a-directory) that has the data.


The file structure is as follow:

```
├── sea
│  ├── bulletin.nu
│  ├── sources.nu
│  ├── stash.nu
│  └── trail.nu
└── sea.nu
```

```nu
# sea.nu
export use ./sea/sources.nu
export use ./sea/trail.nu
export use ./sea/stash.nu
export use ./sea/bulletin.nu
```

```nu
# sea/sources.nu

# Lists available sources.
export def list [] {
    open data/sources.csv
}

# Lists available sources and lets you select one using fuzzy matching.
export def picker [] {
    list
    | get id
    | input list --fuzzy "source: "
}
```

```nu
# sea/trail.nu

# avoids clashing names
alias save-file = save


# Creates a new trail entry.
export def new [] {
    {
        url: null
        date: (date now | format date "%Y-%m-%d")
        title: null
        summary: null
        tags: []
        source: null
    } 
}

# Lists all trail entries
export def list [] {
    open data/trail/*.csv
    | insert year { |row| $row.date | date to-record | get year }
    | update tags { from json }
}

# Appends the given entry to the trail.
export def save [] {
    let input = $in
    let stamp = $input.date | parse "{year}-{month}-{day}"

    $input 
    | update tags { to json -r }
    | select date url title summary tags source
    | to csv -n
    | save-file -a $"data/trail/($stamp.year.0).csv"
}


# Search across the trail main text fields. It forces a case-insensitive search.
export def search [term: string]: string -> list<any> {
    let search_term = $"\(?i\)($term)"

    list
    | where title =~ $search_term or url =~ $search_term or summary =~ $search_term
}

# Lists all tags from the trail
export def "tags list" [] {
    list
    | get tags
    | flatten
    | uniq
    | sort
}

# Lists available tags and lets you select one using fuzzy matching.
export def "tags picker" [] {
    tags list
    | input list --fuzzy "tag: "
}

# Adds the selected source to the given trail entry.
export def "add source" [] {
    $in | upsert source (sources picker)
}

# Adds the selected tag to the given trail entry.
export def "add tag" [] {
    $in | upsert tags { |record|  $record.tags | append (tags picker) }
}
```

```nu
# sea/stash.nu

# avoids clashing names
alias save-file = save

# Opens the bulletin stash.
export def list [] {
    open data/bulletins/stash.toml
}

# Overrides the bulletin stash.
export def save [] {
    $in | save-file -f data/bulletins/stash.toml
}

# Removes the given entries.
export def drop [] {
    let input = $in

    list
    | get entries
    | filter { |e|
          $input
          | all { |x| $x != $e }
      }
}

# Wipes out the bulletin stash entries.
export def flush [] {
    list
    | update entries [] 
    | save
}

# The list of possible content types for a bulletin entry.
def content-types [] { ["text" "pdf" "video" ] }

# Transforms a trail entry into a bulletin entry
def "into bulletin" [] {
    let entry = $in 

    {
        url: ($entry.url)
        title: ($entry.title)
        summary: ($entry.summary)
        content_type: ($entry.content_type)
    }
}


# Adds an entry to the stash. Use it in combination with `stash save`.
export def add [] {
    let input = $in
        let content_type = (content-types | input list --fuzzy "content_type: ")

        if ($content_type == null) {
            error make {msg: "aborted"}
        } else {
            list
            | update entries {
                  $in
                  | append ($input | insert content_type $content_type | into bulletin)
              }
       }
}
```

```nu
# sea/bulletin.nu

# avoids clashing names
alias save-file = save

# use std formats * should do it but nu seems to loose context after `use sea.nu`
def "from jsonl" [] {
    $in
    | each { open --raw | from json --objects }
    | flatten
}

def "to jsonl" [] {
    $in
    | each { to json --raw }
    | to text
}

# Creates a bulletin structure
export def new [
    date?: string # The publication date `YYYY-MM-DD`
] {

    let stamp = if $date != null {
        $date | into datetime
    } else {
        date now
    }
    let week = $stamp | format date "%Y-W%W"
    let publication_date = $stamp | format date "%Y-%m-%d"
    let entries = (stash list | get entries | input list --multi)

    print $entries
    
    {
        type: "bulletin"
        id: ($week)
        publication_date: ($publication_date)
        summary: (input "summary: ")
        entries: $entries
    }
}

# Creates a bulletin structure
export def save [] {
    let input = $in
    let stamp_year = $input
        | get publication_date
        | into datetime
        | into record
        | get year
    let stamp_week = $input.id

    ($input
    | to jsonl
    | save-file -a $"data/bulletins/($stamp_year).jsonl")
}


# List all bulletins
export def list [] {
    glob data/bulletins/*.jsonl
    | from jsonl
    | update publication_date { into datetime }
    | insert year { |row| $row.publication_date | date to-record | get year }
}

# Gets the bulletin for the given identifier.
export def pick [bulletin_id: string] {
    list
    | where id == $bulletin_id
    | get 0
}

# Displays a bulletin in html.
export def "to html" [] {
    let input = $in
    let week_stamp = $input.id | parse "{year}-{week}"

    let preface = [
        $"($input.summary)"
        "<br><br>"
        $"Also available online: https://www.seachess.net/bulletins/($week_stamp.year.0)/($input.id)"
    ]
    let entries = $input
        | get entries
        | each { |entry|
            [
                ""
                $"<h2># ($entry.title)</h2>"
                ""
                $"URL: ($entry.url)\n<br><br>\n($entry.summary)"
            ]
        }

    $preface 
    | append $entries
    | flatten --all
    | str join "\n"
}
```



[SQLite]: https://sqlite.org/
[Nushell]: https://www.nushell.sh/
