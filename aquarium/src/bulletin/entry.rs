// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use super::content_type::ContentType;
use super::issue;
use serde::{Deserialize, Serialize};
use skim::prelude::*;
use std::fmt;
use std::iter::FromIterator;

/// Represents an entry record in the storage.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Record {
    pub url: String,
    #[serde(deserialize_with = "de_trim")]
    pub title: String,
    #[serde(deserialize_with = "de_trim")]
    pub summary: String,
    #[serde(default)]
    pub content_type: ContentType,
    #[serde(default)]
    pub issue_id: Option<issue::Id>,
}

fn de_trim<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = String::deserialize(deserializer)?;
    Ok(value.trim().to_string())
}

impl fmt::Display for Record {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.title)
    }
}

impl SkimItem for Record {
    fn text(&self) -> Cow<str> {
        Cow::Borrowed(&self.url)
    }

    fn preview(&self, _context: PreviewContext) -> ItemPreview {
        ItemPreview::Text(format!("{}\n\n{}", &self.title, &self.summary))
    }
}

#[derive(Debug, Clone)]
pub struct Set(Vec<Record>);

impl Set {
    pub fn new(raw: Vec<Record>) -> Self {
        Self(raw)
    }

    pub fn as_slice(&self) -> &[Record] {
        self.0.as_slice()
    }

    pub fn to_vec(&self) -> Vec<Record> {
        self.0.clone()
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn first(&self) -> Option<&Record> {
        self.0.first()
    }
}

impl IntoIterator for Set {
    type Item = Record;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl FromIterator<Record> for Set {
    fn from_iter<I: IntoIterator<Item = Record>>(iter: I) -> Self {
        let mut v = Vec::new();

        for item in iter {
            v.push(item);
        }

        Self::new(v)
    }
}

impl fmt::Display for Set {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let list: Vec<String> = self.0.iter().map(|tag| format!("{}", tag)).collect();

        if f.alternate() {
            write!(f, "{}", list.join("\n"))
        } else {
            write!(f, "{}", list.join(";"))
        }
    }
}

impl Set {
    pub fn as_skim_buffer(&self) -> SkimItemReceiver {
        let (tx_item, rx_item): (SkimItemSender, SkimItemReceiver) = unbounded();

        for tag in self.to_vec() {
            let _ = tx_item.send(Arc::new(tag));
        }

        drop(tx_item);

        rx_item
    }
}

impl From<Set> for SkimItemReceiver {
    fn from(input: Set) -> SkimItemReceiver {
        let (tx_item, rx_item): (SkimItemSender, SkimItemReceiver) = unbounded();

        for tag in input {
            let _ = tx_item.send(Arc::new(tag));
        }

        drop(tx_item);

        rx_item
    }
}
