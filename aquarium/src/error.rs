// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use chrono::format::ParseError as ChronoError;
use csv;
use rusqlite;
use serde::{de, ser};
use std::fmt::Display;
use std::{io, num};
use thiserror::Error;
use toml;
use url;

#[derive(Error, Debug)]
pub enum Error {
    #[error("date error")]
    Date(#[from] ChronoError),
    #[error("url error")]
    Url(#[from] url::ParseError),
    #[error("io error")]
    Io(#[from] io::Error),
    #[error("csv error")]
    Csv(#[from] csv::Error),
    #[error("sqlite error")]
    Sqlite(#[from] rusqlite::Error),
    #[error("unexpected integer")]
    ParseInt(#[from] num::ParseIntError),
    #[error("bad isoweek {0}")]
    ParseWeek(String),
    #[error("toml error")]
    TomlDe(#[from] toml::de::Error),
    #[error("toml error")]
    TomlSer(#[from] toml::ser::Error),
    #[error("bad status {0}")]
    ParseStatus(String),
    #[error("unknown {0}")]
    Unknown(String),
    #[error("url exists '{0}'")]
    UrlExists(String),
    #[error("bad url '{0}'")]
    BadUrl(String),
    #[error("serde {0}")]
    Serde(String),
    #[error("locked issue {0}")]
    LockedIssue(String),
}

impl ser::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        Error::Serde(msg.to_string())
    }
}

impl de::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        Error::Serde(msg.to_string())
    }
}
