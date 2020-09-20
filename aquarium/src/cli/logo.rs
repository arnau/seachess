// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use clap::Clap;

use crate::{logo, Achievement, Error};

/// Builds the Seachess logo.
#[derive(Debug, Clap)]
pub struct Cmd {
    /// Path to write the output SVG.
    #[clap(
        long,
        short = 'o',
        value_name = "path",
        default_value = "./src/assets/logo.svg"
    )]
    output_path: String,

    /// The size in pixels of the side of the logo.
    #[clap(long, value_name = "value", default_value = "8")]
    size: usize,
}

impl Cmd {
    pub fn run(&mut self) -> Result<Achievement, Error> {
        let document = logo::build(self.size);

        logo::save(&self.output_path, &document)?;

        Ok(Achievement::Done)
    }
}
