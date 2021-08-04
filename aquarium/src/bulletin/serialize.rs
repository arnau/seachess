// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use crate::bulletin::{entry, issue, mention};
use crate::Error;
use chrono::NaiveDate;
use csv;
use rusqlite::{params, Transaction, NO_PARAMS};
use serde::Serialize;
use std::fmt;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use std::str::FromStr;

#[derive(Copy, Clone, Debug, PartialEq)]
struct Date(NaiveDate);

impl FromStr for Date {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let naive = NaiveDate::from_str(s)?;

        Ok(Self(naive))
    }
}

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

#[derive(Debug, Clone, Serialize)]
pub struct Issue {
    #[serde(rename = "type")]
    _type: String,
    id: String,
    publication_date: Date,
    summary: String,
    entries: Vec<Entry>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Entry {
    url: String,
    title: String,
    summary: String,
    content_type: String,
}

pub fn issues_to_toml(tx: &Transaction, path: &Path) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        SELECT
            id,
            publication_date,
            summary
        FROM
            bulletin_issue
        ORDER BY
            publication_date;
        "#,
    )?;
    let mut rows = stmt.query(NO_PARAMS)?;

    while let Some(row) = rows.next()? {
        let id: String = row.get(0)?;
        let filename = format!("{}.toml", &id);
        let mut file = File::create(path.join(&filename))?;
        let date: String = row.get(1)?;
        let entries = query_entries(tx, &id)?;
        let issue = Issue {
            _type: "bulletin".to_string(),
            id,
            publication_date: Date::from_str(&date)?,
            summary: row.get(2)?,
            entries,
        };
        let issue_str = toml::to_string(&issue)?;

        file.write_all(issue_str.as_bytes())?;
    }

    Ok(())
}

pub fn query_entries(tx: &Transaction, issue_id: &str) -> Result<Vec<Entry>, Error> {
    let mut stmt = tx.prepare(
        r#"
        SELECT
            url,
            title,
            summary,
            content_type
        FROM
            bulletin_entry
        WHERE
            issue_id = ?
        "#,
    )?;
    let mut res = Vec::new();
    let rows = stmt.query_map(params![issue_id], |row| {
        Ok(Entry {
            url: row.get(0)?,
            title: row.get(1)?,
            summary: row.get(2)?,
            content_type: row.get(3)?,
        })
    })?;

    for record in rows {
        res.push(record?);
    }

    Ok(res)
}

pub fn issues_to_csv<W: Write>(tx: &Transaction, writer: W) -> Result<(), Error> {
    let mut wtr = csv::Writer::from_writer(writer);
    let mut stmt = tx.prepare(
        r#"
        SELECT
            id,
            publication_date,
            summary
        FROM
            bulletin_issue
        ORDER BY
            publication_date;
        "#,
    )?;
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(issue::Record {
            id: row.get(0)?,
            publication_date: row.get(1)?,
            summary: row.get(2)?,
        })
    })?;

    for record in rows {
        wtr.serialize(record?)?;
    }

    wtr.flush()?;

    Ok(())
}

pub fn entries_to_csv<W: Write>(tx: &Transaction, writer: W) -> Result<(), Error> {
    let mut wtr = csv::Writer::from_writer(writer);
    let mut stmt = tx.prepare(
        r#"
        SELECT
            url,
            title,
            summary,
            content_type,
            issue_id
        FROM
            bulletin_entry
        WHERE
            issue_id IS NOT NULL
        ORDER BY
            issue_id;
        "#,
    )?;
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(entry::Record {
            url: row.get(0)?,
            title: row.get(1)?,
            summary: row.get(2)?,
            content_type: row.get(3)?,
            issue_id: row.get(4)?,
        })
    })?;

    for record in rows {
        wtr.serialize(record?)?;
    }

    wtr.flush()?;

    Ok(())
}

pub fn mentions_to_csv<W: Write>(tx: &Transaction, writer: W) -> Result<(), Error> {
    let mut wtr = csv::Writer::from_writer(writer);
    let mut stmt = tx.prepare(
        r#"
        SELECT
            mention_url,
            entry_url
        FROM
            bulletin_mention AS m
        JOIN
            bulletin_entry AS e ON e.url = m.entry_url
        WHERE
            e.issue_id IS NOT NULL
        ORDER BY
            e.issue_id,
            mention_url;
        "#,
    )?;
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(mention::Mention {
            mention_url: row.get(0)?,
            entry_url: row.get(1)?,
        })
    })?;

    for record in rows {
        wtr.serialize(record?)?;
    }

    wtr.flush()?;

    Ok(())
}
