// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use super::{entry, issue};
use crate::Error;
use rusqlite::{Connection, Transaction, NO_PARAMS};
use std::include_str;
use std::path::Path;

/// Opens a SQLite database at the given path.
pub fn connect(path: &Path) -> Result<Connection, Error> {
    let conn = Connection::open(path)?;
    // conn.pragma_update(None, "foreign_keys", &"off")?;
    conn.pragma_update(None, "journal_mode", &"wal")?;

    Ok(conn)
}

/// WAL persists across connections, this ensures it is switched off.
pub fn disconnect(conn: &Connection) -> Result<(), Error> {
    conn.pragma_update(None, "wal_checkpoint", &"restart")?;
    conn.pragma_update(None, "journal_mode", &"delete")?;

    Ok(())
}

/// Sets up the bulletin schema.
pub fn bootstrap(conn: &Connection) -> Result<(), Error> {
    let bootstrap = include_str!("../sql/bulletin.sql");

    conn.execute_batch(&bootstrap)?;

    Ok(())
}

pub fn store_issue_record(tx: &Transaction, issue: &issue::Record) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        INSERT OR IGNORE INTO bulletin_issue
        (id, publication_date, summary)
        VALUES (?, ?, ?)
        "#,
    )?;
    let values: [&dyn rusqlite::ToSql; 3] = [&issue.id, &issue.publication_date, &issue.summary];

    stmt.execute(&values)?;

    Ok(())
}

pub fn get_issue(tx: &Transaction, id: &issue::Id) -> Result<issue::Record, Error> {
    let mut stmt = tx.prepare(
        r#"
        SELECT
            id,
            publication_date,
            summary
        FROM
            bulletin_issue
        WHERE
            id = ?
        "#,
    )?;

    let issue = stmt
        .query_row(&[id], |row| {
            Ok(issue::Record {
                id: row.get(0)?,
                publication_date: row.get(1)?,
                summary: row.get(2)?,
            })
        })
        .map_err(|_| Error::Unknown("No issue found for the given id.".into()))?;

    Ok(issue)
}

pub fn get_unpublished(tx: &Transaction) -> Result<Vec<entry::Record>, Error> {
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
            issue_id IS NULL
        ORDER BY
            url
        "#,
    )?;
    let mut list = Vec::new();
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(entry::Record {
            url: row.get(0)?,
            title: row.get(1)?,
            summary: row.get(2)?,
            content_type: row.get(3)?,
            issue_id: None,
        })
    })?;

    for result in rows {
        list.push(result?);
    }

    Ok(list)
}

pub fn get_issue_entries(tx: &Transaction, id: &issue::Id) -> Result<Vec<entry::Record>, Error> {
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
            issue_id = ?
        ORDER BY
            issue_id,
            url
        "#,
    )?;
    let mut list = Vec::new();
    let rows = stmt.query_map(&[id], |row| {
        Ok(entry::Record {
            url: row.get(0)?,
            title: row.get(1)?,
            summary: row.get(2)?,
            content_type: row.get(3)?,
            issue_id: row.get(4)?,
        })
    })?;

    for result in rows {
        list.push(result?);
    }

    Ok(list)
}

pub fn store_entry_record(tx: &Transaction, entry: &entry::Record) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        INSERT OR IGNORE INTO bulletin_entry
        (url, title, summary, content_type, issue_id)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )?;
    let values: [&dyn rusqlite::ToSql; 5] = [
        &entry.url,
        &entry.title,
        &entry.summary,
        &entry.content_type,
        &entry.issue_id,
    ];

    stmt.execute(&values)?;

    let mentions = extract_links(&entry.summary);
    for mention in mentions {
        insert_mention(tx, &[&mention, &entry.url])?;
    }

    Ok(())
}

/// Deletes the given entry and any related resources.
pub fn delete_entry(tx: &Transaction, entry_url: &str) -> Result<(), Error> {
    delete_mentions(tx, entry_url)?;

    let mut stmt = tx.prepare(
        r#"
        DELETE FROM bulletin_entry
        WHERE url = ?
        "#,
    )?;

    stmt.execute(&[entry_url])?;

    Ok(())
}

fn delete_mentions(tx: &Transaction, entry_url: &str) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        DELETE FROM bulletin_mention
        WHERE entry_url = ?
        "#,
    )?;
    stmt.execute(&[entry_url])?;

    Ok(())
}

fn insert_mention(tx: &Transaction, values: &[&str]) -> Result<(), Error> {
    let mut stmt = tx.prepare("INSERT OR IGNORE INTO bulletin_mention VALUES (?, ?)")?;

    stmt.execute(values)?;

    Ok(())
}

fn extract_links(input: &str) -> Vec<String> {
    use pulldown_cmark::{Event, LinkType, Options, Parser, Tag};

    Parser::new_ext(input, Options::empty())
        .filter_map(|event| match event {
            Event::Start(Tag::Link(LinkType::Inline, url, _)) => Some(url.to_string()),
            _ => None,
        })
        .collect()
}

pub fn entry_exists(tx: &Transaction, url: &str) -> Result<bool, Error> {
    let answer = tx.query_row(
        r#"
        SELECT EXISTS(
        SELECT 1 FROM bulletin_entry
        WHERE url = ?
        )
        "#,
        &[url],
        |row| row.get(0),
    )?;

    Ok(answer)
}
