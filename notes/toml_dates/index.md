---
type: note
id: toml-dates
date: 2021-07-12
author: arnau
title: TOML dates
status: published
tags:
  - rust
  - toml
---

This note captures my experience using [TOML] with [Serde] in [Rust], particularly whilst using dates.

<!-- end -->

[TOML] is a configuration format resembling the [INI] syntax but well defined with an extensive test suite to ensure parsers are compatible.

It has a richer set of features than [JSON] and less error-prone than [YAML]. That said, it's not free from friction. Different implementations will have their own dragons but this note focuses on an issue I repeatedly faced whilst using [toml-rs].

Note that although _toml-rs 0.5_ implements [TOML v0.5], the issue with dates applies to [TOML v1.0] as well.

## The date type

TOML has a built-in notation for dates and times based on the [RFC3339] but making it more flexible, closer to the spirit of the [ISO8601].
You get to choose from [Offset Date-Time], [Local Date-Time], [Local Date] or [Local Time].

Where a string would be anything surrounded by double quotes (`"`), dates are pattern-based.

So, a valid TOML document would be:

```toml
type = "note"
publication_date = 2021-07-12
title = "TOML dates"
tags = ["rust", "standard"]
```

## TOML implementations in Rust

The most popular implementation in Rust is [toml-rs] which at the time of writing implements TOML v0.5.

There is also [Taplo] which implements TOML v1.0 but I haven't tried it yet so I can't compare.

## The problem

Let's represent the previous TOML document as a struct in Rust:

```rust
struct Note {
  _type: String,
  publication_date: ?,
  title: String,
  tags: Vec<String>,
}
```

The first decisions to make is how to represent the date field. You could use a string, implement your own date type or, what I tend to do: use [Chrono].


Chrono has a set of types to choose from, roughly speaking though, the mapping with TOML looks like:

- TOML Offset Date-Time -> [Chrono `DateTime`] (with a `Ts::Offset`).
- TOML Local Date-Time -> [Chrono `NaiveDateTime`].
- TOML Local Date -> [Chrono `NaiveDate`]. Note that `Date` also exists but is not intended to be used this way.
- TOML Local Time -> [Chrono `NaiveTime`].

Given that I want a date and not be bothered by the time component, I'll go with a `NaiveDate`:

```rust
use chrono::NaiveDate;

struct Note {
  _type: String,
  publication_date: NaiveDate,
  title: String,
  tags: Vec<String>,
}
```

To implement the conversion from and to a string [Serde] is a safe choice:


```rust
use chrono::NaiveDate;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Note {
  #[serde(rename = "type")]
  _type: String,
  publication_date: NaiveDate,
  title: String,
  tags: Vec<String>,
}
```

When you try to deserialise with:

```rust
let raw r#"
type = "note"
publication_date = 2021-07-12
title = "TOML dates"
tags = ["rust", "standard"]
"#;
let note: Note = toml::from_str(raw)?;
```

It fails with a not so obvious message:

```
Error: invalid type: map, expected a formatted date string for key `publication_date`
```

The problem is that the toml-rs serde implementation for dates is just for the `toml::Value::Datetime`. Optionally, you can compile Chrono with the `serde` feature but even with that you'd be out of luck because the implementation only works for `DateTime`.

So a simple enough option is to 1) implement your type and 2) implement the Serde deserialisation for it.

```rust
use anyhow::Result;
use chrono::NativeDate;
use serde::{Deserialize, Serialize};
use std::str::FromStr;


#[derive(Copy, Clone, PartialEq)]
struct Date(NativeDate);

impl<'de> Deserialize<'de> for Date {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        use serde::de::Error;

        let value = toml::value::Datetime::deserialize(deserializer)?;
        let date = Date::from_str(&value.to_string()).map_err(Error::custom)?;

        Ok(date)
    }
}

impl FromStr for Date {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let naive = NaiveDate::from_str(s)?;

        Ok(Self(naive))
    }
}
```

The implementation piggy-backs from toml-rs' own implementation which is likely to be what you want when implementing an efficient solution but it does the job.

With that we can now use `toml::from_str` free of errors but `toml::to_string` still has a quirck as it serialises `Date` as a string if you choose to derive the implementation.

So, we need to implement our own:


```rust
// Date and Deserialize implementation omited.

use std::fmt;

impl Serialize for Date {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::Error;

        let s = self.to_string();
        let value = toml::value::Datetime::from_str(&s).map_err(Error::custom)?;

        value.serialize(serializer)
    }
}

impl fmt::Display for Date {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0.format("%Y-%m-%d").to_string())
    }
}
```

Effectively the inverse of what we did for `Deserialize`. Now we can do a roundtrip:

```rust
let raw r#"
type = "note"
publication_date = 2021-07-12
title = "TOML dates"
tags = ["rust", "standard"]
"#;
let note: Note = toml::from_str(raw)?;
let raw_again = toml::to_string(&note)?;

assert_eq!(&raw_again, raw);
```


## What about JSON?

The previous implementation works well as long as you only care about TOML but will fail if you need to deserialize from other formats. To do that, we need a different approach: [the visitor trait]. Let's start from scratch:

```rust

use anyhow::Result;
use chrono::NativeDate;
use serde::{Deserialize, Serialize};
use serde::de::{self, Visitor};
use std::str::FromStr;

#[derive(Copy, Clone, PartialEq)]
struct Date(NativeDate);

impl FromStr for Date {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let naive = NaiveDate::from_str(s)?;

        Ok(Self(naive))
    }
}

struct DateVisitor;

impl<'de> Visitor<'de> for DateVisitor {
    type Value = Date;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an ISO8601 date")
    }

    fn visit_str<E: de::Error>(self, value: &str) -> Result<Self::Value, E> {
        let date = Date::from_str(value).map_err(de::Error::custom)?;

        Ok(date)
    }

    fn visit_string<E: de::Error>(self, value: String) -> Result<Self::Value, E> {
        let date = Date::from_str(&value).map_err(de::Error::custom)?;

        Ok(date)
    }

    fn visit_map<V>(self, mut visitor: V) -> Result<Self::Value, V::Error>
    where
        V: de::MapAccess<'de>,
    {
        let date = Date::from_str(visitor.next_value()?).map_err(de::Error::custom)?;

        Ok(date)
    }
}

impl<'de> Deserialize<'de> for Date {
    fn deserialize<D>(deserializer: D) -> Result<Date, D::Error>
    where
        D: de::Deserializer<'de>,
    {
        deserializer.deserialize_any(DateVisitor)
    }
}
```

Not too bad. Now we don't depend on toml-rs in our implementation other than knowing that it relied on a map to identify a date.

So now we can do:

```rust
let raw r#"
type = "note"
publication_date = 2021-07-12
title = "TOML dates"
tags = ["rust", "standard"]
"#;
let note: Note = toml::from_str(raw)?;
let note2: Note = serde_json::from_str(raw)?;

assert_eq!(note, note2);
```

At this time though, I don't know whether it's possible to serialise differently depending on which `Serializer` is driving.


## Closing thoughts

TOML is an appealing format for people that value identifying dates at source. But it imposes extra burden if you need be compatible with less expressive formats.




[INI]: https://en.wikipedia.org/wiki/INI_file
[JSON]: https://www.json.org/
[Rust]: https://www.rust-lang.org/
[Serde]: https://serde.rs/
[TOML v0.5]: https://toml.io/en/v0.5.0
[TOML v1.0]: https://toml.io/en/v1.0.0
[TOML]: https://toml.io/
[YAML]: https://yaml.org/
[toml-rs]: https://crates.io/crates/toml
[RFC3339]: https://datatracker.ietf.org/doc/html/rfc3339
[ISO8601]: https://en.wikipedia.org/wiki/ISO_8601
[Local Date]: https://toml.io/en/v0.5.0#local-date
[Local Date-Time]: https://toml.io/en/v0.5.0#local-date-time
[Offset Date-Time]: https://toml.io/en/v0.5.0#offset-date-time
[Local Time]: https://toml.io/en/v0.5.0#local-time
[Taplo]: https://taplo.tamasfe.dev/
[Chrono]: https://crates.io/crates/chrono
[Chrono `DateTime`]: https://docs.rs/chrono/0.4.19/chrono/struct.DateTime.html
[Chrono `NaiveDateTime`]: https://docs.rs/chrono/0.4.19/chrono/naive/struct.NaiveDateTime.html
[Chrono `NaiveDate`]: https://docs.rs/chrono/0.4.19/chrono/naive/struct.NaiveDate.html
[Chrono `NaiveTime`]: https://docs.rs/chrono/0.4.19/chrono/naive/struct.NaiveTime.html
[the visitor trait]: https://serde.rs/impl-deserialize.html
