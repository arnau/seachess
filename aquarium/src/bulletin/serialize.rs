// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use crate::bulletin::{entry, issue, mention};
use crate::Error;
use csv;
use rusqlite::{Transaction, NO_PARAMS};
use std::io::prelude::*;

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
