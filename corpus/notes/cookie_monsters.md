---
type: note
id: cookie-monsters
publication_date: 2023-10-08
author: arnau
tags:
  - cookie
  - nushell
  - analysis
---
# Cookies analysis

Where I analyse how cookies are littering the world. For this exercise I'll be using [Nushell](https://www.nushell.sh/) with a bit of SQL to wrangle with Firefox profile data.

<!-- body -->

## Exploring how Firefox stores cookies

The [Profiles - Where Firefox stores your bookmarks, passwords and other user data](https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data) is a good start to get to understand what is what.

```nu
ls
| where type == 'file'
| get name
| group-by { path parse | get extension }
| transpose extension value
| where extension !~ '-(wal|shm)$'
| insert count { |row| $row.value | length }
| sort-by -r count
| reject value
```
  
```
╭───┬───────────┬───────╮
│ # │ extension │ count │
├───┼───────────┼───────┤
│ 0 │ json      │    18 │
│ 1 │ sqlite    │    11 │
│ 2 │ txt       │     6 │
│ 3 │ db        │     3 │
│ 4 │ mozlz4    │     1 │
│ 5 │ js        │     1 │
│ 6 │ ini       │     1 │
│ 7 │ lz4       │     1 │
╰───┴───────────┴───────╯
```

There are two places that are relevant for this analysis: `cookies.sqlite` and all databases that conform `storage/**/ls/data.sqlite`.

Before exploring how data is layed out there is a detour that will help filter out non-casual browsing: the Multi-Account Containers add-on. 


### Multi-Account Containers

The [Multi-Account Containers](https://addons.mozilla.org/en-GB/firefox/addon/multi-account-containers/) add-on lets you segregate cookies by container. Each container can be configured with an allowed list of domains so trusted websites can be kept separate from untrusted including casual browsing.

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

Any unknown website will go into the default container which has no `userContextId`. This fact is what will help identify casual browsing from the rest.


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

This table records the data you would expect from a cookie but it also tracks which container a cookie belongs to. The `originAttributes` field fulfils this purpose.

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

Websites not bound to a container have no `userContextId`.

```nu
open temp/cookies.sqlite
| query db "select host, originAttributes, name from moz_cookies"
| where originAttributes == ""
| first
```

```
╭──────────────────┬─────────────────────────────────────────────────────╮
│ host             │ medium.com                                          │
│ originAttributes │                                                     │
│ name             │ dd_cookie_test_4d98f155-3011-4887-8587-ee4c70b8765e │
╰──────────────────┴─────────────────────────────────────────────────────╯
```

The last bit that is relevant to know from the cookie database is that the `originAttributes` field can have a `partitionKey` either alone or combined with a `userContextId`. I won't be using it for this analysis but it's worth knowing that it exists and that it's the bit that allows you to connect a 3rd party cookie.

For example, a 3rd party cookie for Youtube (container 10) will look like: 

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

Not strictly cookies but definitely part of website littering. These are slightly more involved because storage is segregated per domain. The filesystem structure looks like:

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

Each `data.sqlite` database has two tables: `database` and `data`. `data` is what we are after so let's check its definition:

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
  - `2`, is `CompressionType::NUM_TYPES`. I don't know what this type is for nor I have any data with it. I'll ignore it.

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
    # for some reason some empty values are casted as strings
    if (($row.value | describe) == "string") {
      $row.value
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

Armed with this we can get on with the analysis of casual browsing littering. This analysis is minimal given that I used data stored after a couple of hours of casual browsing. I plan to collect snapshots at regular intervals so I can do a more meaningful analysis in a few months time.

To ensure I don't mess up my Firefox profile, let's copy of the relevant SQLite files into a `temp/` directory, flattening the structure of local storage a bit.

```nu
glob storage/default/**/ls/data.sqlite 
| where $it !~ "moz-extension"
| each { |path|
    let name = $path | path dirname -n 2 | path basename
    cp $path $"($temp)/storage/($name).sqlite"
  }
```

### Data to analyse

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
│ 0 │     116 │            93 │
╰───┴─────────┴───────────────╯
```

With the queries below, we can see that less than half websites store just one cookie. Assuming all of them required one cookie to capture consent, this means that the majority of websites require cookies to operate properly. For some value of "operate properly".

```nu
open temp/cookies.sqlite
| query db "select count(name) as value from moz_cookies where originAttributes not like '%userContextId%' group by host"
| sort-by value
| histogram value
```

```
╭───┬───────┬───────┬──────────┬────────────┬─────────────────────────────────────────╮
│ # │ value │ count │ quantile │ percentage │                frequency                │
├───┼───────┼───────┼──────────┼────────────┼─────────────────────────────────────────┤
│ 0 │     1 │    25 │     0.39 │ 39.06%     │ *************************************** │
│ 1 │     2 │    15 │     0.23 │ 23.44%     │ ***********************                 │
│ 2 │     4 │    10 │     0.16 │ 15.62%     │ ***************                         │
│ 3 │     3 │     7 │     0.11 │ 10.94%     │ **********                              │
│ 4 │     5 │     2 │     0.03 │ 3.12%      │ ***                                     │
│ 5 │     7 │     2 │     0.03 │ 3.12%      │ ***                                     │
│ 6 │     6 │     1 │     0.02 │ 1.56%      │ *                                       │
│ 7 │     9 │     1 │     0.02 │ 1.56%      │ *                                       │
│ 8 │    11 │     1 │     0.02 │ 1.56%      │ *                                       │
╰───┴───────┴───────┴──────────┴────────────┴─────────────────────────────────────────╯
```

This part is more concerning. Most websites I visit for casual browsing are for reading an article they have published or to check their offering so it's hard to justify the need for local storage.

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
| first 10
```

```
╭───┬──────────────────────┬───────╮
│ # │         host         │ count │
├───┼──────────────────────┼───────┤
│ 0 │ gap.co.uk            │    17 │
│ 1 │ phrase.com           │     7 │
│ 2 │ medium.com           │     5 │
│ 3 │ paradedb.com         │     4 │
│ 4 │ spacetimedb.com      │     3 │
│ 5 │ login.wikimedia.org  │     2 │
│ 6 │ en.wikipedia.org     │     2 │
│ 7 │ howtogeek.com        │     2 │
│ 8 │ sstatic.net          │     2 │
│ 9 │ www.researchgate.net │     2 │
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
