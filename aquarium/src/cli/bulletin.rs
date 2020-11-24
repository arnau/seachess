// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use crate::bulletin::{self, entry, issue, serialize, storage};
use crate::{Achievement, Error};
use clap::Clap;
use dialoguer::Editor;
use std::fs::File;
use std::path::PathBuf;

static CACHE_PATH: &str = "./cache.db";
static CANONICAL_STORAGE_PATH: &str = "./bulletins/";

#[derive(Debug, Clap)]
enum Subcommand {
    Add(Add),
    Edit(Edit),
    Extrude(Extrude),
    Load(Load),
    Remove(Remove),
    Publish(Publish),
    Show(Show),
}

/// Manages bulletins
#[derive(Debug, Clap)]
pub struct Cmd {
    #[clap(subcommand)]
    subcommand: Subcommand,
}

impl Cmd {
    pub fn run(&self) -> Result<Achievement, Error> {
        match &self.subcommand {
            Subcommand::Add(cmd) => cmd.run(),
            Subcommand::Edit(cmd) => cmd.run(),
            Subcommand::Extrude(cmd) => cmd.run(),
            Subcommand::Load(cmd) => cmd.run(),
            Subcommand::Remove(cmd) => cmd.run(),
            Subcommand::Publish(cmd) => cmd.run(),
            Subcommand::Show(cmd) => cmd.run(),
        }
    }
}

/// Adds a new unpublished entry
#[derive(Debug, Clap)]
pub struct Add {
    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
}

impl Add {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;
        let template = r#"content_type = "text"
title = ""
url = ""
summary = """



"""
"#;

        if let Some(value) = Editor::new().extension(".toml").edit(template)? {
            let entry: entry::Record = toml::from_str(&value)?;

            bulletin::add_new_entry(&tx, entry)?;
        } else {
            return Ok(Achievement::Cancelled);
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

/// Edits an unpublished entry
#[derive(Debug, Clap)]
pub struct Edit {
    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
}

impl Edit {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;

        let unpublished = storage::get_unpublished(&tx)?;
        let entry = bulletin::select_entry(&unpublished)?;
        storage::delete_entry(&tx, &entry.url)?;

        let value = toml::to_string(&entry)?;

        if let Some(value) = Editor::new().extension(".toml").edit(&value)? {
            let entry: entry::Record = toml::from_str(&value)?;

            bulletin::add_new_entry(&tx, entry)?;
        } else {
            return Ok(Achievement::Cancelled);
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

/// Removes an unpublished entry
#[derive(Debug, Clap)]
pub struct Remove {
    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
}

impl Remove {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;
        let unpublished = storage::get_unpublished(&tx)?;
        let entry = bulletin::select_entry(&unpublished)?;

        storage::delete_entry(&tx, &entry.url)?;

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

/// Loads raw bulletins in CSV into the cache
#[derive(Debug, Clap)]
pub struct Load {
    /// Path to write the resulting bulletin data.
    #[clap(long, short = 'i', value_name = "path", default_value = CANONICAL_STORAGE_PATH)]
    input_path: PathBuf,

    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
}

impl Load {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        storage::bootstrap(&conn)?;
        let tx = conn.transaction()?;

        // TODO: Probably a good idea to check the CSV schema here.
        let issues_path = &self.input_path.join("issues.csv");
        let entries_path = &self.input_path.join("entries.csv");

        bulletin::process_csv_issues(&issues_path, &tx)?;
        bulletin::process_csv_entries(&entries_path, &tx)?;

        tx.commit()?;
        storage::disconnect(&conn)?;

        Ok(Achievement::Done)
    }
}

/// Exports the cache as CSV
#[derive(Debug, Clap)]
pub struct Extrude {
    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
    /// Path to write the resulting bulletin data.
    #[clap(long, short = 'o', value_name = "path", default_value = CANONICAL_STORAGE_PATH)]
    output_path: PathBuf,
}

impl Extrude {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;
        let issues_path = self.output_path.join("issues.csv");
        let entries_path = self.output_path.join("entries.csv");
        let mentions_path = self.output_path.join("mentions.csv");

        serialize::issues_to_csv(&tx, File::create(issues_path)?)?;
        serialize::entries_to_csv(&tx, File::create(entries_path)?)?;
        serialize::mentions_to_csv(&tx, File::create(mentions_path)?)?;

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

/// Publishes the next issue if it's in a `Ready` state
#[derive(Debug, Clap)]
pub struct Publish {
    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
    /// Amount of entries to publish
    #[clap(long, short = 'n', value_name = "n", default_value = "6")]
    amount: usize,
}

impl Publish {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;

        let unpublished = storage::get_unpublished(&tx)?;

        if unpublished.len() < self.amount {
            return Err(Error::Unknown("Not enough entries to publish.".into()));
        }

        let entries = if unpublished.len() == self.amount {
            unpublished
        } else {
            bulletin::select_entries(entry::Set::new(unpublished))?
        };

        if entries.len() < self.amount {
            return Err(Error::Unknown("Not enough entries to publish.".into()));
        }

        let mut summary = String::new();

        for entry in entries {
            summary.push_str(&format!("\n\n  * {}", entry.summary));
        }

        if let Some(value) = Editor::new().extension(".md").edit(&summary)? {
            let issue = issue::Record::new(issue::Id::default(), &value);

            storage::store_issue_record(&tx, &issue)?;
        } else {
            return Ok(Achievement::Cancelled);
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

/// Shows the given issue or the list of unpublished entries
#[derive(Debug, Clap)]
pub struct Show {
    /// Cache path
    #[clap(long, value_name = "path", default_value = CACHE_PATH)]
    cache_path: PathBuf,
    #[clap(value_name = "id")]
    issue_id: Option<issue::Id>,
}

impl Show {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;
        let mut value = String::new();

        let entries = if let Some(issue_id) = &self.issue_id {
            let issue = storage::get_issue(&tx, issue_id)?;
            value = issue.summary.clone();

            storage::get_issue_entries(&tx, &issue.id)?
        } else {
            storage::get_unpublished(&tx)?
        };

        for entry in entries {
            value.push_str(&format!(
                "\n\n# {}\n\nURL: {}\n\n{}\n",
                entry.title, entry.url, entry.summary
            ));
        }

        println!("{}", value);
        tx.commit()?;

        Ok(Achievement::Done)
    }
}
