---
type: note
id: cookie-monsters
publication_date: 2023-10-14
author: arnau
tags:
  - cookie
  - nushell
  - analysis
---
# Cookie monsters

Where I analyse how cookies are littering the world. For this exercise I'll be using [Nushell](https://www.nushell.sh/) to wrangle with [Firefox Profile data](https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data) enriched with data coming from the [Multi-Account Containers](https://addons.mozilla.org/en-GB/firefox/addon/multi-account-containers/) add-on. 

<!-- body -->

Let me start by defining two terms I will be using during the analysis:

- **cookie littering**: The act done by a website of storing **unsolicited information** like [browser cookies](https://en.wikipedia.org/wiki/HTTP_cookie) or any other form of [Web storage](https://en.wikipedia.org/wiki/Web_storage). This typically happens when doing some _casual browsing_, landing on a webpage and making the effort to reject all “non-essential cookies”. This includes the most pernicious webites that directly don't ask for consent, store **unsolicited information** first and then they let you know that consent is assumed if you use their website.
- **casual browsing**: The act of landing on a website after following a link or putting a URL directly in the browser navigation bar. This excludes recurrent use of a website where you have an account with them.


## Exploring how Firefox stores cookies

Let's start with a glance to what kind of files are stored in the profile. I'm excluding some temporary and backup files to reduce noise.


```nu
ls **/*
| where type == 'file'
| get name
| group-by { path parse | get extension }
| transpose extension value
| where extension !~ '-(wal|shm)$' and extension !~ '(jsonlz4-.+|baklz4)$'
| insert count { |row| $row.value | length }
| sort-by -r count
| reject value
```
  
```
╭────┬───────────┬───────╮
│  # │ extension │ count │
├────┼───────────┼───────┤
│  0 │ final     │  1693 │
│  1 │ sqlite    │   216 │
│  2 │ jsonlz4   │   187 │
│  3 │           │    91 │
│  4 │ json      │    46 │
│  5 │ txt       │    44 │
│  6 │ xpi       │    10 │
│  7 │ bin       │     3 │
│  8 │ db        │     3 │
│  9 │ dylib     │     2 │
│ 10 │ mozlz4    │     2 │
│ 11 │ marker    │     1 │
│ 12 │ js        │     1 │
│ 13 │ sig       │     1 │
│ 14 │ info      │     1 │
│ 15 │ ini       │     1 │
│ 16 │ lz4       │     1 │
╰────┴───────────┴───────╯
```

There is a lot in a profile however this analysis only needs a tiny fraction of the files, namely:

- `cookies.sqlite` — Where the cookies are stored
- `storage/**/ls/data.sqlite` — Where each local storage data is stored

My current session has 77 databases matching `storage/**/ls/data.sqlite`.


### Multi-Account Containers

Before exploring how data is layed out, there is a detour that will help filter out non-casual browsing: the Multi-Account Containers add-on. 

The [Multi-Account Containers](https://addons.mozilla.org/en-GB/firefox/addon/multi-account-containers/) add-on lets you segregate cookies by container. Each container can be configured with an allowed list of domains so trusted and untrusted websites can be kept separate including casual browsing.

This add-on stores some of its configuration in `containers.json` which looks something like:

```json
{
  "identities": [
    {
      "userContextId": 6,
      "name": "github"
    },
    {
      "userContextId": 10,
      "name": "google"
    },
    ...
  ]
}
```

Any unknown website will go into the default container which has no `userContextId`. This fact is what will help identify and filter out non-casual browsing.


### The cookie database

The `cookies.sqlite` database contains one table defined as:

```sql
CREATE TABLE moz_cookies (
  id INTEGER PRIMARY KEY,
  originAttributes TEXT NOT NULL DEFAULT '',
  name TEXT,
  value TEXT,
  host TEXT,
  path TEXT,
  expiry INTEGER,
  lastAccessed INTEGER,
  creationTime INTEGER,
  isSecure INTEGER,
  isHttpOnly INTEGER,
  inBrowserElement INTEGER DEFAULT 0,
  sameSite INTEGER DEFAULT 0,
  rawSameSite INTEGER DEFAULT 0,
  schemeMap INTEGER DEFAULT 0,
  CONSTRAINT moz_uniqueid UNIQUE (name, host, path, originAttributes)
)
```

This table keeps the data you would expect from a cookie but it also tracks which container a cookie belongs to in the `originAttributes` field.

```nu
open temp/cookies.sqlite
| query db "select host, originAttributes, name from moz_cookies"
| where host =~ "youtube"
| first
```

```
╭──────────────────┬───────────────────╮
│ host             │ .youtube.com      │
│ originAttributes │ ^userContextId=10 │
│ name             │ CONSENT           │
╰──────────────────┴───────────────────╯
```

This record shows how the host `.youtube.com` belongs to the container 10. A quick lookup to `containers.json` shows that 10 is the identifier for the container I use for Google.

Websites not bound to a container have no `userContextId`. The following query shows the main filter I'll be using to filter out non-casual browsing cookies.

```nu
open temp/cookies.sqlite
| query db "select host, originAttributes, name from moz_cookies"
| where originAttributes !~ "userContainerId"
| first
```

```
╭──────────────────┬─────────────────────────────────────────────────────╮
│ host             │ medium.com                                          │
│ originAttributes │                                                     │
│ name             │ dd_cookie_test_4d98f155-3011-4887-8587-ee4c70b8765e │
╰──────────────────┴─────────────────────────────────────────────────────╯
```

The last bit that is relevant to know from the cookie database is that the `originAttributes` field can have a `partitionKey` either alone or combined with a `userContextId` which represents the domain of a 3rd party cookie.

For example, a 3rd party cookie for Youtube (container 10) would look like: 

```nu
open temp/cookies.sqlite
| query db "select * from moz_cookies"
| select host originAttributes name
| where originAttributes =~ "userContainerId=10" and originAttributes =~ "partitionKey"
| first
```

```
╭──────────────────┬──────────────────────────────────────────────────────────╮
│ host             │ .google.com                                              │
│ originAttributes │ ^userContextId=10&partitionKey=%28https%2Cyoutube.com%29 │
│ name             │ CONSENT                                                  │
╰──────────────────┴──────────────────────────────────────────────────────────╯
```

### The Local Storage database

Not strictly cookies but definitely part of cookie littering. These are slightly more involved because storage is segregated per domain. The filesystem structure looks like:

```
storage/default
├── https+++accounts.google.com^userContextId=10
│  └── ls
│     └── data.sqlite
.
.
└── https+++zellij.dev
   └── ls
      └── data.sqlite
```

Within each `data.sqlite` database there is a `data` table:

```sql
CREATE TABLE data(
  key TEXT PRIMARY KEY,
  utf16_length INTEGER NOT NULL,
  conversion_type INTEGER NOT NULL,
  compression_type INTEGER NOT NULL,
  last_access_time INTEGER NOT NULL DEFAULT 0,
  value BLOB NOT NULL
)
```

`key`, `value` and `last_access_time` are self-explanatory but the other three require a bit of digging. Based on my partial understanding after checking 
[geko-dev](https://github.com/mozilla/gecko-dev/blob/abbea4195b00e82af2ae9abaafc31e4b4ec4f8c0/dom/localstorage/LSValue.h#L47) these fields mean the following:

- `utf16_length` is the combined byte length of `key` and `value`. We don't need it.
- `conversion_type` is either `0` or `1` and `1` means the data is encoded in UTF-8. This is my educated guess given that all my data is of type `1` and I've been able to decode it as UTF-8.
- `compression_type` signals whether the value is compressed. 
  - `0` means uncompressed. 
  - `1` means compressed with [snappy](https://google.github.io/snappy/).
  - `2`, is `CompressionType::NUM_TYPES`. <del datetime="2023-10-21">I don't know what this type is for nor I have any data with it. I'll ignore it</del> <ins datetime="2023-10-21">Seems to represent the number of types in the `CompressionType` enum so it should be safe to ignore it. Thanks Karl!</ins>.

To have a peek at the data stored in the `value` blob I'm using [szip](https://crates.io/crates/szip), a CLI similar to `gzip` using the Snappy algorithm.

```nu
glob storage/default/**/data.sqlite
| wrap path
| insert data { |row|
    open $row.path
    | query db "select key, value, compression_type from data"
  }
| flatten --all
| where compression_type != 2
| update value { |row|
    if ($row.value | is-empty)) {
      null
    } else {
      match $row.compression_type {
        0 => { $row.value | decode utf-8 },
        1 => { $row.value | ^szip -d --raw },
      }
    }
  } 
| explore -i
```

## Analysis

Armed with this we can start the analysis of casual browsing littering. This analysis is minimal given that I used data stored after a couple of hours of casual browsing. I plan to collect snapshots of this data regularly so I can do a more meaningful analysis in a few months time.

To ensure I don't mess up my Firefox profile, I copied the relevant SQLite files into a `temp/` directory, flattening the structure of local storage a bit.

```nu
cp cookies.sqlite $temp

glob storage/default/**/ls/data.sqlite 
| where $it !~ "moz-extension"
| each { |path|
    let name = $path | path dirname -n 2 | path basename
    cp $path $"($temp)/storage/($name).sqlite"
  }
```

First, let's get a feel for the size of the data. I want to focus on casual browsing so I'll exclude any entry with a `userContextId`.

```nu
open temp/cookies.sqlite
| query db "select count(1) as cookies from moz_cookies where originAttributes not like '%userContextId%'"
| insert local_storage (
    ls temp/storage/
    | where name !~ "userContextId"
    | reduce -f 0 { |row, acc|
         open $row.name
         | query db "select count(1) as count from data"
         | get 0.count | $in + $acc
       }
  )
```

```
╭───┬─────────┬───────────────╮
│ # │ cookies │ local_storage │
├───┼─────────┼───────────────┤
│ 0 │      55 │            93 │
╰───┴─────────┴───────────────╯
```

With the queries below, we can see that about half websites store just one cookie. Assuming all of them required one cookie to capture consent, this means that the majority of websites require cookies to operate properly. For some value of "operate properly".

```nu
open temp/cookies.sqlite
| query db "select host, name, originAttributes from moz_cookies"
| where originAttributes !~ "userContextId"
| group-by { $in.host | str replace -r '^(?:\.|www\.)' '' }
| transpose host value
| update value { |row| $row.value | length }
| sort-by value
| histogram value
```

```
╭───┬───────┬───────┬──────────┬────────────┬─────────────────────────────────────────────────╮
│ # │ value │ count │ quantile │ percentage │                    frequency                    │
├───┼───────┼───────┼──────────┼────────────┼─────────────────────────────────────────────────┤
│ 0 │     1 │    18 │     0.62 │ 62.07%     │ *********************************************** │
│   │       │       │          │            │ ***************                                 │
│ 1 │     2 │     5 │     0.17 │ 17.24%     │ *****************                               │
│ 2 │     3 │     3 │     0.10 │ 10.34%     │ **********                                      │
│ 3 │     5 │     1 │     0.03 │ 3.45%      │ ***                                             │
│ 4 │     6 │     1 │     0.03 │ 3.45%      │ ***                                             │
│ 5 │     7 │     1 │     0.03 │ 3.45%      │ ***                                             │
╰───┴───────┴───────┴──────────┴────────────┴─────────────────────────────────────────────────╯
```

`value` in the table above means "number of cookies per host". `count` is the number of hosts with that number of cookies. Note that I haven't done any reconciliation to merge hosts that belong to the same domain. For example, `.wikipedia.org` and `en.wikipedia.org` are counted separately. Properly aggregating would probably yield a slightly more concerning picture.

The histogram clearly shows cookie littering. Most websites I visit for casual browsing are for reading an article they have published or to check their offering so it's hard to justify any so-called “required cookies” beyond a single consent one.

```nu
ls temp/storage/
| where name !~ "userContextId"
| each { |row| open $row.name | query db "select count(key) as count from data" |  get 0.count }
| sort
| histogram
```

```
╭───┬───────┬───────┬──────────┬────────────┬───────────────────────────────────────────────╮
│ # │ value │ count │ quantile │ percentage │                   frequency                   │
├───┼───────┼───────┼──────────┼────────────┼───────────────────────────────────────────────┤
│ 0 │     1 │    16 │     0.46 │ 45.71%     │ ********************************************* │
│ 1 │     2 │     8 │     0.23 │ 22.86%     │ **********************                        │
│ 2 │     4 │     3 │     0.09 │ 8.57%      │ ********                                      │
│ 3 │     3 │     2 │     0.06 │ 5.71%      │ *****                                         │
│ 4 │     6 │     2 │     0.06 │ 5.71%      │ *****                                         │
│ 5 │     5 │     1 │     0.03 │ 2.86%      │ **                                            │
│ 6 │     7 │     1 │     0.03 │ 2.86%      │ **                                            │
│ 7 │     8 │     1 │     0.03 │ 2.86%      │ **                                            │
│ 8 │    11 │     1 │     0.03 │ 2.86%      │ **                                            │
╰───┴───────┴───────┴──────────┴────────────┴───────────────────────────────────────────────╯
```

`value` in the table above means “number of local storage entries per domain”. `count` is the number of domains with the same number of local storage entries.

This whole table is hard to justify. Local storage for casual browsing is unnecessary and a waste for most circumstances.


###  Top cookie litterers

```nu
open temp/cookies.sqlite
| query db "select host, name, originAttributes from moz_cookies"
| where originAttributes !~ "userContextId"
| group-by { $in.host | str replace -r '^(?:\.|www\.)' '' }
| transpose host value
| insert count { |row| $row.value | length }
| reject value
| sort-by -r count
| first 5
```

```
╭───┬──────────────────────┬───────╮
│ # │         host         │ count │
├───┼──────────────────────┼───────┤
│ 0 │ medium.com           │     7 │
│ 1 │ phrase.com           │     7 │
│ 2 │ support.mozilla.org  │     3 │
│ 3 │ paradedb.com         │     4 │
│ 4 │ en.wikipedia.com     │     3 │
╰───┴──────────────────────┴───────╯
```

### Top local storage litterers

With the following we can narrow down the websites storing more than 10KB for no apparent good reason.

```nu
ls temp/storage/
| reject type modified
| where name !~ "userContextId"
| insert count { |row|
    open $row.name
    | query db "select count(key) as count from data"
    |  get 0.count
  }
| update name { |row| $row.name | path basename }
| sort-by count
| where size >= 10KB
```

```
╭───┬──────────────────────────────────────┬──────────┬───────╮
│ # │                 name                 │   size   │ count │
├───┼──────────────────────────────────────┼──────────┼───────┤
│ 0 │ https+++www.eventbrite.co.uk.sqlite  │ 405.5 KB │    11 │
│ 1 │ https+++medium.com.sqlite            │  18.4 KB │     6 │
│ 2 │ https+++en.wikipedia.org.sqlite      │ 325.6 KB │     4 │
╰───┴──────────────────────────────────────┴──────────┴───────╯
```

Eventbrite took me by surprise with these 405.5KB. I was expecting Medium to be at the very top but 18.4KB can't compare.

Now, the Wikipedia storing 325.6KB is both surprising and concerning. Particularly because most of it seems to be chunks of JavaScript as if they were using local storage as a cache. A cache with no expiry date that is.


## Closing thoughts

The world of cookies and by extension local storage is a mess. Regulations like the [Directive (EU) 2018/1972 of the European Parliament and of the Council of 11 December 2018 establishing the European Electronic Communications Code (Recast)Text with EEA relevance.](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32018L1972) claim to have improved the situation but it's frankly hard to see. We have lots of littering and on top of that we have to suffer a dreadful variety of cookie walls.

By the way, if you follow the EU directive link you'll observe that after you have rejected all non-essential cookies they still put 11 cookies in your browser. 11 cookies for dropping into a website you might not even want to navigate feels like abuse to me.
