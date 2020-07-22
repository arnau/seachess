// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use super::content_type::ContentType;
use super::issue;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Entry {
    pub(crate) url: String,
    pub(crate) title: String,
    pub(crate) comment: String,
    #[serde(
        default,
        rename(serialize = "type", deserialize = "type"),
        skip_serializing_if = "ContentType::is_text"
    )]
    pub(crate) content_type: ContentType,
}

impl Entry {
    pub fn comment(&self) -> &str {
        &self.comment
    }

    pub fn url(&self) -> &str {
        &self.url
    }
}

/// Represents an entry record in the storage.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Record {
    pub url: String,
    #[serde(deserialize_with = "de_trim")]
    pub title: String,
    #[serde(deserialize_with = "de_trim")]
    pub comment: String,
    #[serde(default)]
    pub content_type: ContentType,
    #[serde(default)]
    pub issue_id: issue::Id,
}

fn de_trim<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = String::deserialize(deserializer)?;
    Ok(value.trim().to_string())
}
