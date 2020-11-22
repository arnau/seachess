// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use super::Status;
use crate::Error;
use chrono::prelude::*;
use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// An issue identifier.
///
/// An issue identifier is of the form `YYYY-Www`, an ISO8601 week date.
#[derive(Clone, Debug)]
pub struct Id(NaiveDate);

impl Id {
    pub fn date(&self) -> NaiveDate {
        self.0
    }
}

/// Deserialises a value into an issue Id.
///
/// If the given value is the empty string, it falls back into `Default::default`.
impl<'de> Deserialize<'de> for Id {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        use serde::de::Error;
        let value = String::deserialize(deserializer)?;
        let id = if value.trim().is_empty() {
            Id::default()
        } else {
            Id::from_str(value.trim()).map_err(Error::custom)?
        };

        Ok(id)
    }
}

impl Serialize for Id {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let s = self.to_string();
        s.serialize(serializer)
    }
}

impl Default for Id {
    /// Defaults to the Sunday of today's week.
    fn default() -> Self {
        let today = Utc::today();
        let year = today.year();
        let month = today.month();
        let date = NaiveDate::from_isoywd(year, month, Weekday::Sun);

        Id(date)
    }
}

impl fmt::Display for Id {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0.format("%Y-W%V"))
    }
}

impl FromStr for Id {
    type Err = Error;

    /// Must be a `YYYY-Www`.
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.len() != 8 {
            return Err(Error::ParseWeek(s.into()));
        }

        if &s[4..6] != "-W" {
            return Err(Error::ParseWeek(s.into()));
        }

        let year: i32 = s[..4].parse()?;
        let week: u32 = s[6..].parse()?;

        Ok(Id(NaiveDate::from_isoywd(year, week, Weekday::Sun)))
    }
}

impl FromSql for Id {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        Id::from_str(value.as_str()?).map_err(|e| FromSqlError::Other(Box::new(e)))
    }
}

impl ToSql for Id {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(self.to_string()))
    }
}

/// Represents an issue record in the storage.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Record {
    pub id: Id,
    pub publication_date: String,
    pub title: String,
    pub description: String,
    pub status: Status,
}

impl Record {
    pub fn new(id: Id) -> Record {
        // TODO: Should be derived at serialization
        let title = format!("Issue {}", &id);
        let publication_date = id.date().to_string();

        Record {
            id,
            publication_date,
            title,
            // TODO: Should be None
            description: "".to_string(),
            status: Status::Draft,
        }
    }
}

/// Custom parser to work around issues with parsing dates with Toml.
#[allow(dead_code)]
fn parse_date<'de, D>(deserializer: D) -> Result<NaiveDate, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = toml::Value::deserialize(deserializer)?;
    let date = NaiveDate::parse_from_str(&value.to_string(), "%Y-%m-%d").unwrap();

    Ok(date)
}

#[cfg(test)]
mod tests {
    use super::*;

    mod id {
        use super::*;
        #[test]
        fn parse_ok() -> Result<(), Error> {
            let week = "2020-W29".to_string();
            let id = Id::from_str(&week)?;

            assert_eq!(id.to_string(), week);

            Ok(())
        }

        #[test]
        fn parse_default() -> Result<(), Error> {
            let id = Id::default();

            assert_eq!(id.date().weekday(), Weekday::Sun);

            Ok(())
        }

        #[test]
        fn parse_err() {
            let id = Id::from_str("2020-29");

            assert!(id.is_err(), "Expected an invalid date.");
        }
    }
}
