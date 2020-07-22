// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use crate::bulletin::{entry, issue, mention};
use crate::Error;
use csv;
use rusqlite::{Transaction, NO_PARAMS};
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use toml;

pub fn to_toml<P: AsRef<Path>>(tx: &Transaction, base_path: P) -> Result<(), Error> {
    let mut issue_stmt = tx.prepare(
        r#"
        SELECT id, publication_date, title, description, status
        FROM bulletin_issue
        "#,
    )?;
    let mut entry_stmt = tx.prepare(
        r#"
        SELECT url, title, comment, content_type, issue_id
        FROM bulletin_entry
        WHERE issue_id = ?;
            "#,
    )?;

    let issues = issue_stmt.query_map(NO_PARAMS, |row| {
        Ok(issue::Issue {
            id: row.get(0)?,
            date: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            status: row.get(4)?,
            entries: Vec::new(),
            _type: "Bulletin".into(),
        })
    })?;

    for result in issues {
        let mut issue = result?;
        let path = base_path.as_ref().join(&format!("{}.toml", &issue.id()));
        let mut f = File::create(path)?;
        let entries = entry_stmt.query_map(&[&issue.id()], |row| {
            Ok(entry::Entry {
                url: row.get(0)?,
                title: row.get(1)?,
                comment: row.get(2)?,
                content_type: row.get(3)?,
            })
        })?;

        for entry in entries {
            issue.entries.push(entry?);
        }

        let string = toml::to_string(&issue)?;
        f.write_all(string.as_bytes())?;
    }

    Ok(())
}

pub fn issues_to_csv<W: Write>(tx: &Transaction, writer: W) -> Result<(), Error> {
    let mut wtr = csv::Writer::from_writer(writer);
    let mut stmt = tx.prepare(
        r#"
        SELECT id, publication_date, title, description, status
        FROM bulletin_issue
        ORDER BY publication_date;
        "#,
    )?;
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(issue::Record {
            id: row.get(0)?,
            publication_date: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            status: row.get(4)?,
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
        SELECT url, title, comment, content_type, issue_id
        FROM bulletin_entry
        WHERE issue_id IS NOT NULL
        ORDER BY issue_id;
        "#,
    )?;
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(entry::Record {
            url: row.get(0)?,
            title: row.get(1)?,
            comment: row.get(2)?,
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
        SELECT mention_url, entry_url
        FROM bulletin_mention AS m
        JOIN bulletin_entry AS e ON e.url = m.entry_url
        ORDER BY e.issue_id, mention_url;
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
