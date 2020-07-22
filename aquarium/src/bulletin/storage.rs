// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use super::{entry, issue, Entry, Issue, Status};
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

/// Stores an issue to the storage.
///
/// If the information is already there, it ignores it. For example, if the given issue has 6
/// entries but the storage already has 5 of them it will store the new entry and not fail.
///
/// If everything is already in the store, it is effectively a noop.
pub fn store_issue(tx: &Transaction, issue: &Issue) -> Result<(), Error> {
    insert_issue(tx, &issue)?;

    for entry in issue.entries() {
        insert_entry(tx, issue.id(), &entry)?;

        let mentions = extract_links(&entry.comment());
        for mention in mentions {
            insert_mention(tx, &[&mention, &entry.url()])?;
        }
    }

    Ok(())
}

pub fn store_issue_record(tx: &Transaction, issue: &issue::Record) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        INSERT OR IGNORE INTO bulletin_issue
        (id, publication_date, description, title, status)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )?;
    let values: [&dyn rusqlite::ToSql; 5] = [
        &issue.id,
        &issue.publication_date,
        &issue.description,
        &issue.title,
        &issue.status,
    ];

    stmt.execute(&values)?;

    Ok(())
}

fn insert_issue(tx: &Transaction, issue: &Issue) -> Result<(), Error> {
    let mut stmt = tx.prepare("INSERT OR IGNORE INTO bulletin_issue VALUES (?, ?, ?, ?, ?)")?;
    let values: [&dyn rusqlite::ToSql; 5] = [
        &issue.id,
        &issue.date,
        &issue.description,
        &issue.title,
        &issue.status,
    ];

    stmt.execute(&values)?;

    Ok(())
}

pub fn issue_exists(tx: &Transaction, id: &issue::Id) -> Result<bool, Error> {
    let answer = tx.query_row(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM bulletin_issue
            WHERE id = ?
        )
        "#,
        &[id],
        |row| row.get(0),
    )?;

    Ok(answer)
}

pub fn get_issue(tx: &Transaction, id: &issue::Id) -> Result<issue::Record, Error> {
    let mut stmt = tx.prepare(
        r#"
        SELECT id, publication_date, title, description, status
        FROM bulletin_issue
        WHERE id = ?
        "#,
    )?;

    let issue = stmt.query_row(&[id], |row| {
        Ok(issue::Record {
            id: row.get(0)?,
            publication_date: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            status: row.get(4)?,
        })
    })?;

    Ok(issue)
}

/// Computes the next state for the given issue.
///
/// This basically means that:
///
/// * Draft - {6 entries} -> Ready
/// * Ready - {publication_date} -> Published
pub fn issue_next_state(tx: &Transaction, id: &issue::Id) -> Result<issue::Record, Error> {
    let count = count_issue_entries(tx, id)?;

    if count == 6 {
        change_issue_status(tx, id, &Status::Ready)?;
    }

    get_issue(tx, id)
}

pub fn change_issue_status(tx: &Transaction, id: &issue::Id, status: &Status) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        UPDATE bulletin_issue
        SET status = ?
        WHERE id = ?
        "#,
    )?;
    let values: [&dyn rusqlite::ToSql; 2] = [status, id];
    stmt.execute(&values)?;

    Ok(())
}

pub fn get_unpublished(tx: &Transaction) -> Result<Vec<entry::Record>, Error> {
    let mut stmt = tx.prepare(
        r#"
        SELECT
            e.url,
            e.title,
            e.comment,
            e.content_type,
            e.issue_id
        FROM bulletin_issue AS i
        JOIN bulletin_entry AS e
            ON i.id = e.issue_id
        WHERE i.status <> 'published'
        ORDER BY issue_id, url
        "#,
    )?;
    let mut list = Vec::new();
    let rows = stmt.query_map(NO_PARAMS, |row| {
        Ok(entry::Record {
            url: row.get(0)?,
            title: row.get(1)?,
            comment: row.get(2)?,
            content_type: row.get(3)?,
            issue_id: row.get(4)?,
        })
    })?;

    for result in rows {
        list.push(result?);
    }

    Ok(list)
}

pub fn get_entry(tx: &Transaction, url: &str) -> Result<entry::Record, Error> {
    let mut stmt = tx.prepare(
        r#"
        SELECT
            url,
            title,
            comment,
            content_type,
            issue_id
        FROM bulletin_entry
        WHERE url = ?
        "#,
    )?;

    let entry = stmt.query_row(&[url], |row| {
        Ok(entry::Record {
            url: row.get(0)?,
            title: row.get(1)?,
            comment: row.get(2)?,
            content_type: row.get(3)?,
            issue_id: row.get(4)?,
        })
    })?;

    Ok(entry)
}

pub fn count_issue_entries(tx: &Transaction, id: &issue::Id) -> Result<u32, Error> {
    let count: u32 = tx.query_row(
        r#"
        SELECT count(*)
        FROM bulletin_entry
        WHERE issue_id = ?
        "#,
        &[id],
        |row| row.get(0),
    )?;

    Ok(count)
}

pub fn store_entry_record(tx: &Transaction, entry: &entry::Record) -> Result<(), Error> {
    let mut stmt = tx.prepare(
        r#"
        INSERT OR IGNORE INTO bulletin_entry
        (url, title, comment, content_type, issue_id)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )?;
    let values: [&dyn rusqlite::ToSql; 5] = [
        &entry.url,
        &entry.title,
        &entry.comment,
        &entry.content_type,
        &entry.issue_id,
    ];

    stmt.execute(&values)?;

    let mentions = extract_links(&entry.comment);
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

fn insert_entry(tx: &Transaction, issue_id: &str, entry: &Entry) -> Result<(), Error> {
    let mut stmt = tx.prepare("INSERT OR IGNORE INTO bulletin_entry VALUES (?, ?, ?, ?, ?)")?;
    let values: [&dyn rusqlite::ToSql; 5] = [
        &entry.url,
        &entry.title,
        &entry.comment,
        &entry.content_type,
        &issue_id,
    ];

    stmt.execute(&values)?;

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
