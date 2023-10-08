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

## Firefox storage

Cookies are stored in `cookies.sqlite` in the active profile. For example in MacOS:

```
~/Library/Application\ Support/Firefox/Profiles/{profile_id}/cookies.sqlite
```

This database only contains one table, `moz_cookies`, defined as:

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

### Multi-Account Containers

The [Multi-Account Containers](https://addons.mozilla.org/en-GB/firefox/addon/multi-account-containers/) add-on lets you segregate cookies by container. Each container can be configured with an allowed list of domains. As a result, you can keep trusted websites in specific containers separate from pernicious ones like Facebook, Google and the like both isolated from any casual browsing littering like the dreadful Medium.

This add-on stores some of its configuration in `containers.json`. Mine looks something like (removing some noise):

```json
{
  "identities": [
    {
      "userContextId": 6,
      "name": "github"
    },
    {
      "userContextId": 8,
      "name": "twitter"
    },
    {
      "userContextId": 9,
      "name": "bluesky"
    },
    {
      "userContextId": 10,
      "name": "google"
    },
    {
      "userContextId": 11,
      "name": "instagram"
    },
    {
      "userContextId": 12,
      "name": "mastodon"
    },
    ...
  ]
}
```

Effectively segregating the usual suspects in different buckets so harm is more difficult from the inside as well as from the outside. The majority of casual browsing goes into the default container which I regularly wipe. This bucketing also helps with ensuring I don't remove login related cookies from services I want to keep logged in during a session.

### The `moz_cookies` table

This table has every cookie recorded by Firefox and keeps track of the container using the `originAttributes` field.

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

In this case we can see that YouTube is contained in the Google bucket.

Websites not bound to a container have no `userContextId`.

```nu
open temp/cookies.sqlite
| query db "select * from moz_cookies"
| select host originAttributes name
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

Finally, the `originAttributes` field can have a `partitionKey`, either alone or combined with a `userContextId`.

```nu
open temp/cookies.sqlite
| query db "select * from moz_cookies"
| select host originAttributes name
| where originAttributes =~ "partitionKey"
| first
```

```
╭──────────────────┬──────────────────────────────────────────────────────────╮
│ host             │ .google.com                                              │
│ originAttributes │ ^userContextId=10&partitionKey=%28https%2Cyoutube.com%29 │
│ name             │ CONSENT                                                  │
╰──────────────────┴──────────────────────────────────────────────────────────╯
```

### Local storage

Not strictly cookies but definitely part of website littering. These are slightly more involved because storage is segregated per domain.

The filesystem in macos has a structure like:

```
storage/default
├── https+++accounts.google.com^userContextId=10
│  ├── ls
│  │  └── data.sqlite
└── https+++zellij.dev
   └── ls
      └── data.sqlite
```

And each `data.sqlite` has two tables: `database` and `data`. `data` is defined as:

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

We can have a peek at what data is stored in the `value` blob. In order to handle blobs we need to know its encoding and whether it's compressed using `conversion_type` and `compression_type`. 

I haven't been able to find any documentation but a bit of diving into [geko-dev](https://github.com/mozilla/gecko-dev/blob/abbea4195b00e82af2ae9abaafc31e4b4ec4f8c0/dom/localstorage/LSValue.h#L47) suggests that:

- `0` signals the blob is uncompressed. 
- `1` signals the blob is compressed with [snappy](https://google.github.io/snappy/).
- `2`, is `CompressionType::NUM_TYPES` which I cannot decipher, and I don't seem to have any data of this type.

For this one, I'm using [szip](https://crates.io/crates/szip), a CLI similar to `gzip` using the Snappy algorithm.

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

Armed with this we can get on with the analysis of casual browsing littering. This analysis is just testing the waters for a session that lasted a few hours. I plan to collect snapshots at regular intervals to do a more meaningful analysis in a few months. 

To ensure I don't mess up my Firefox profile, let's copy of the relevant SQLite files into a `temp/` directory, flattening the structure of local storage a bit.

```nu
glob storage/default/**/ls/data.sqlite 
| where $it !~ "moz-extension"
| each { |path|
    let name = $path | path dirname -n 2 | path basename
    cp $path $"($temp)/storage/($name).sqlite"
  }
```

### Overall number of local storage databases

```nu
ls temp/storage/
| length
```

```
57
```

### Top local storage litterers

```nu
ls temp/storage/
| reject type modified
| insert count { |row|
    open $row.name
    | query db "select count(key) as count from data"
    |  get 0.count
  }
| update name { |row| $row.name | path basename }
| sort-by -r count
| where size >= 10KB
```

```
╭───┬──────────────────────────────────────────────────┬──────────┬───────╮
│ # │                       name                       │   size   │ count │
├───┼──────────────────────────────────────────────────┼──────────┼───────┤
│ 0 │ https+++github.com^userContextId=6.sqlite        │ 139.3 KB │   189 │
│ 1 │ https+++app.netlify.com^userContextId=6.sqlite   │  22.5 KB │    22 │
│ 2 │ https+++www.eventbrite.co.uk.sqlite              │ 405.5 KB │    11 │
│ 3 │ https+++www.fundingcircle.com.sqlite             │  10.2 KB │     7 │
│ 4 │ https+++github.dev^userContextId=6.sqlite        │  10.2 KB │     7 │
│ 5 │ https+++medium.com.sqlite                        │  18.4 KB │     6 │
│ 6 │ https+++www.linkedin.com^userContextId=15.sqlite │  10.2 KB │     5 │
│ 7 │ https+++meet.google.com^userContextId=10.sqlite  │  10.2 KB │     4 │
│ 8 │ https+++en.wikipedia.org.sqlite                  │ 325.6 KB │     4 │
╰───┴──────────────────────────────────────────────────┴──────────┴───────╯
```

The good news are that the top offenders are mostly for services I have logged in and have given permission to store data. This leaves me with 2 offenders:

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


Ugh, 405.5KB for _what_? 18.4KB of unwanted data is dreadful but Eventbrite has managed to render Medium as not too nasty. Sigh.

Also, Wikipedia storing 325.6KB where most of it is chunks of JavaScript. Just ugh. That's what happens when you look under the carpet.

### Overall number of cookies

```nu
open temp/cookies.sqlite | query db "select count(1) as count from moz_cookies"
```

```
╭───┬───────╮
│ # │ count │
├───┼───────┤
│ 0 │   308 │
╰───┴───────╯
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

## Closing thoughts

The world of cookies and by extension local storage is a mess. Regulations like the [Directive (EU) 2018/1972 of the European Parliament and of the Council of 11 December 2018 establishing the European Electronic Communications Code (Recast)Text with EEA relevance.](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32018L1972) claim to have improved the situation but it's frankly hard to see. We have lots of littering and on top of that we have to suffer a dreadful variety of cookie walls.

By the way, if you follow the EU directive link you'll observe that after you have rejected all non-essential cookies they still put 11 cookies in your browser. 11 cookies for dropping into a website you might not even want to navigate feels like abuse to me.
