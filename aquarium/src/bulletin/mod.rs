// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

pub(crate) mod content_type;
pub(crate) mod entry;
pub(crate) mod issue;
pub(crate) mod mention;
pub(crate) mod serialize;
pub(crate) mod status;
pub(crate) mod storage;

pub use content_type::ContentType;
pub use status::Status;

use crate::{Achievement, BulletinError, Error};
use dialoguer::Editor;
use dialoguer::{theme::ColorfulTheme, Select};
use rusqlite::Transaction;
use skim::prelude::*;
use std::path::Path;

/// Checks the integrity of the entry record.
pub fn check_entry(tx: &Transaction, entry: &entry::Record) -> Result<(), Error> {
    if entry.url.is_empty() {
        return Err(Error::BadUrl(entry.url.clone()));
    }

    if storage::entry_exists(&tx, &entry.url)? {
        return Err(Error::UrlExists(entry.url.clone()));
    };

    Ok(())
}

/// Adds the given entry to the storage.
pub fn add_new_entry(tx: &Transaction, entry: entry::Record) -> Result<Achievement, Error> {
    check_entry(tx, &entry)?;

    storage::store_entry_record(&tx, &entry)?;

    Ok(Achievement::Done)
}

/// Select a single bulletin entry interactively.
pub fn select_entry(list: &Vec<entry::Record>) -> Result<entry::Record, Error> {
    let idx = match list.len() {
        0 => return Err(Error::Unknown("No entries to edit.".to_string())),
        1 => 0,
        _ => {
            let list_s: Vec<String> = list
                .iter()
                .map(|record| format!("{}", record.title))
                .collect();

            if let Some(value) = Select::with_theme(&ColorfulTheme::default())
                .with_prompt("Select entry")
                .default(0)
                .items(&list_s)
                .interact_opt()?
            {
                value
            } else {
                return Err(Error::Unknown("Cancelled operation".to_string()));
            }
        }
    };

    let entry = list[idx].clone();

    Ok(entry)
}

/// Select multiple bulletin entries interactively.
pub fn select_entries(items: entry::Set) -> Result<Vec<entry::Record>, Error> {
    let options = SkimOptionsBuilder::default()
        .height(Some("100%"))
        .multi(true)
        .preview(Some(""))
        .preview_window(Some("down:20%"))
        .prompt(None)
        .build()
        .map_err(Error::Unknown)?;

    let full_set = items.to_vec();
    let selected_items: Vec<String> = Skim::run_with(&options, Some(items.into()))
        .map(|out| out.selected_items)
        .unwrap_or_else(|| Vec::new())
        .iter()
        .map(|item| item.output().into())
        .collect();

    let filtered_set = full_set
        .into_iter()
        .filter(|item| (&selected_items).contains(&item.url))
        .collect();

    Ok(filtered_set)
}

pub fn get_unpublished(tx: &Transaction) -> Result<Vec<entry::Record>, Error> {
    storage::get_unpublished(&tx)
}

pub fn process_csv_issues(path: &Path, tx: &Transaction) -> Result<(), Error> {
    let mut rdr = csv::Reader::from_path(path)?;

    for result in rdr.deserialize() {
        let issue: issue::Record = result?;
        storage::store_issue_record(tx, &issue)?;
    }

    Ok(())
}

pub fn process_csv_entries(path: &Path, tx: &Transaction) -> Result<(), Error> {
    let mut rdr = csv::Reader::from_path(path)?;

    for result in rdr.deserialize() {
        let entry: entry::Record = result?;
        storage::store_entry_record(tx, &entry)?;
    }

    Ok(())
}

/// Publishes the selected entries in a new issue.
pub fn publish_issue(tx: &Transaction, amount: usize) -> Result<Achievement, Error> {
    let entries = unpublished_entries(&tx, amount)?;
    let summary = String::new();
    let issue = build_unpublished_issue(summary, &entries)?;

    publish_issue_and_entries(&tx, &issue, &entries)?;

    Ok(Achievement::Done)
}

fn unpublished_entries(tx: &Transaction, amount: usize) -> Result<Vec<entry::Record>, Error> {
    let unpublished = storage::get_unpublished(&tx)?;

    if unpublished.len() < amount {
        return Err(Error::Bulletin(BulletinError::NotEnoughEntries));
    }

    let entries = if unpublished.len() == amount {
        unpublished
    } else {
        select_entries(entry::Set::new(unpublished))?
    };

    if entries.len() < amount {
        return Err(Error::Bulletin(BulletinError::NotEnoughEntries));
    }

    Ok(entries)
}

fn build_unpublished_issue(
    mut summary: String,
    entries: &Vec<entry::Record>,
) -> Result<issue::Record, Error> {
    for entry in entries {
        summary.push_str(&format!("\n\n  * {}", entry.summary));
    }

    if let Some(value) = Editor::new().extension(".md").edit(&summary)? {
        Ok(issue::Record::new(issue::Id::default(), &value))
    } else {
        return Err(Error::Bulletin(BulletinError::PublicationCancelled));
    }
}

fn publish_issue_and_entries(
    tx: &Transaction,
    issue: &issue::Record,
    entries: &Vec<entry::Record>,
) -> Result<(), Error> {
    storage::store_issue_record(&tx, issue)?;

    for entry in entries {
        storage::publish_entry(&tx, &entry.url, &issue.id)?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_entry(tx: &Transaction, url: &str) -> Result<(), Error> {
        let entry = entry::Record {
            url: url.to_string(),
            title: "title".to_string(),
            summary: "summary".to_string(),
            content_type: ContentType::Text,
            issue_id: None,
        };

        storage::store_entry_record(&tx, &entry)
    }

    #[test]
    fn publish_issue() -> Result<(), Error> {
        let issue_id = issue::Id::default();
        let amount = 1;

        let mut conn = storage::connect(&storage::Strategy::Memory)?;
        storage::bootstrap(&conn)?;
        let tx = conn.transaction()?;

        make_entry(&tx, "first")?;

        let entries = unpublished_entries(&tx, amount)?;
        let issue = issue::Record::new(issue_id.clone(), "A summary");
        publish_issue_and_entries(&tx, &issue, &entries)?;

        let entries = storage::get_issue_entries(&tx, &issue_id)?;

        assert_eq!(entries.len(), amount);

        tx.commit()?;
        Ok(())
    }
}
