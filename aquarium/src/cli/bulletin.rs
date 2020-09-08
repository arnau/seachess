// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use crate::bulletin::Issue;
use crate::bulletin::{entry, issue, serialize, storage, Status};
use crate::{Achievement, Error};
use clap::Clap;
use dialoguer::{theme::ColorfulTheme, Editor, Select};
use rusqlite::Transaction;
use std::fs::File;
use std::io::prelude::*;
use std::path::{Path, PathBuf};

#[derive(Debug, Clap)]
enum Subcommand {
    Add(Add),
    Edit(Edit),
    Extrude(Extrude),
    Load(Load),
    Remove(Remove),
    Publish(Publish),
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
        }
    }
}

#[derive(Debug, Clap)]
pub struct Add {
    /// Cache path
    #[clap(long, value_name = "path", default_value = "./bulletin.db")]
    cache_path: PathBuf,
}

impl Add {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;
        let template = r#"content_type = "text"
title = ""
url = ""
comment = """



"""
issue_id = ""
"#;

        if let Some(value) = Editor::new().extension(".toml").edit(template)? {
            let entry: entry::Record = toml::from_str(&value)?;

            add_new_entry(&tx, entry)?;
        } else {
            return Ok(Achievement::Cancelled);
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

fn add_new_entry(tx: &Transaction, entry: entry::Record) -> Result<Achievement, Error> {
    if entry.url.is_empty() {
        return Err(Error::BadUrl(entry.url));
    }

    if storage::entry_exists(&tx, &entry.url)? {
        return Err(Error::UrlExists(entry.url));
    };

    if !storage::issue_exists(&tx, &entry.issue_id)? {
        storage::store_issue_record(&tx, &issue::Record::new(entry.issue_id.clone()))?;
    }

    let issue = storage::get_issue(&tx, &entry.issue_id)?;

    if issue.status != Status::Draft {
        return Err(Error::LockedIssue(entry.issue_id.to_string()));
    }

    storage::store_entry_record(&tx, &entry)?;
    storage::issue_next_state(&tx, &issue.id)?;

    Ok(Achievement::Done)
}

#[derive(Debug, Clap)]
pub struct Edit {
    /// Cache path
    #[clap(long, value_name = "path", default_value = "./bulletin.db")]
    cache_path: PathBuf,
}

impl Edit {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;

        let entry = select_entry(&tx)?;
        storage::delete_entry(&tx, &entry.url)?;

        let value = toml::to_string(&entry)?;

        if let Some(value) = Editor::new().extension(".toml").edit(&value)? {
            let entry: entry::Record = toml::from_str(&value)?;

            add_new_entry(&tx, entry)?;
        } else {
            return Ok(Achievement::Cancelled);
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

#[derive(Debug, Clap)]
pub struct Remove {
    /// Cache path
    #[clap(long, value_name = "path", default_value = "./bulletin.db")]
    cache_path: PathBuf,
}

impl Remove {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;

        let entry = select_entry(&tx)?;

        storage::delete_entry(&tx, &entry.url)?;

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

fn select_entry(tx: &Transaction) -> Result<entry::Record, Error> {
    let list = storage::get_unpublished(&tx)?;

    let idx = match list.len() {
        0 => return Err(Error::Unknown("No entries to edit.".to_string())),
        1 => 0,
        _ => {
            let list_s: Vec<String> = list
                .iter()
                .map(|record| format!("{}: {}", record.issue_id, record.title))
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

#[derive(Debug, Clap)]
pub struct Load {
    /// Path to write the resulting bulletin data.
    #[clap(long, short = "i", value_name = "path", default_value = "./bulletins/")]
    input_path: PathBuf,

    /// Cache path
    #[clap(long, value_name = "path", default_value = "./bulletin.db")]
    cache_path: PathBuf,

    #[clap(long, short = "f", default_value = "toml", possible_values = &["csv", "toml"])]
    format: String,
}

impl Load {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        storage::bootstrap(&conn)?;
        let tx = conn.transaction()?;

        match self.format.as_ref() {
            // TODO: Probably a good idea to check the CSV schema here.
            "csv" => {
                let issues_path = &self.input_path.join("issues.csv");
                let entries_path = &self.input_path.join("entries.csv");

                process_csv_issues(&issues_path, &tx)?;
                process_csv_entries(&entries_path, &tx)?;
            }
            "toml" => {
                let paths = collect_toml_paths(&self.input_path)?;

                for path in paths {
                    process_toml(&path, &tx)?;
                }
            }
            _ => unreachable!(),
        }

        tx.commit()?;
        storage::disconnect(&conn)?;

        Ok(Achievement::Done)
    }
}

fn collect_toml_paths(base_path: &Path) -> Result<Vec<PathBuf>, Error> {
    let mut paths: Vec<PathBuf> = Vec::new();
    for result in base_path.read_dir()? {
        let entry = result?;
        let path = entry.path();

        if let Some(ext) = path.extension() {
            if ext == "toml" {
                paths.push(path);
            }
        }
    }

    Ok(paths)
}

fn process_toml(path: &Path, tx: &Transaction) -> Result<(), Error> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let issue: Issue = toml::from_str(&contents)?;
    storage::store_issue(tx, &issue)?;

    Ok(())
}

fn process_csv_issues(path: &Path, tx: &Transaction) -> Result<(), Error> {
    let mut rdr = csv::Reader::from_path(path)?;

    for result in rdr.deserialize() {
        let issue: issue::Record = result?;
        storage::store_issue_record(tx, &issue)?;
    }

    Ok(())
}

fn process_csv_entries(path: &Path, tx: &Transaction) -> Result<(), Error> {
    let mut rdr = csv::Reader::from_path(path)?;

    for result in rdr.deserialize() {
        let entry: entry::Record = result?;
        storage::store_entry_record(tx, &entry)?;
    }

    Ok(())
}

#[derive(Debug, Clap)]
pub struct Extrude {
    /// Cache path
    #[clap(long, value_name = "path", default_value = "./bulletin.db")]
    cache_path: PathBuf,
    #[clap(long, short = "f", default_value = "csv", possible_values = &["csv", "toml"])]
    format: String,
    /// Path to write the resulting bulletin data.
    #[clap(long, short = "o", value_name = "path", default_value = "./bulletins/")]
    output_path: PathBuf,
}

impl Extrude {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;
        let issues_path = self.output_path.join("issues.csv");
        let entries_path = self.output_path.join("entries.csv");
        let mentions_path = self.output_path.join("mentions.csv");

        match self.format.as_ref() {
            "csv" => {
                serialize::issues_to_csv(&tx, File::create(issues_path)?)?;
                serialize::entries_to_csv(&tx, File::create(entries_path)?)?;
                serialize::mentions_to_csv(&tx, File::create(mentions_path)?)?;
            }
            "toml" => serialize::to_toml(&tx, &self.output_path)?,
            _ => unreachable!(),
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}

/// Publishes the next issue if it's in a `Ready` state.
#[derive(Debug, Clap)]
pub struct Publish {
    /// Cache path
    #[clap(long, value_name = "path", default_value = "./bulletin.db")]
    cache_path: PathBuf,
}

impl Publish {
    pub fn run(&self) -> Result<Achievement, Error> {
        let mut conn = storage::connect(&self.cache_path)?;
        let tx = conn.transaction()?;

        let mut issue = storage::get_ready(&tx)
            .map_err(|_| Error::Unknown("No issues found in a ready state.".into()))?;
        let mut value = issue.description.clone();
        let entries = storage::get_issue_entries(&tx, &issue.id)?;

        for entry in entries {
            value.push_str(&format!("\n\n  * {}", entry.comment));
        }

        if let Some(value) = Editor::new().extension(".md").edit(&value)? {
            issue.description = value;
            issue.status = Status::Published;

            storage::update_issue(&tx, &issue)?;
        } else {
            return Ok(Achievement::Cancelled);
        }

        tx.commit()?;

        Ok(Achievement::Done)
    }
}
