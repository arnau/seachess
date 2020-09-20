// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use clap::{AppSettings, Clap};

use aquarium::cli;

#[derive(Debug, Clap)]
enum Subcommand {
    Logo(cli::logo::Cmd),
    #[clap(alias = "b")]
    Bulletin(cli::bulletin::Cmd),
}

#[derive(Debug, Clap)]
#[clap(name = "aq", version, global_setting(AppSettings::ColoredHelp))]
struct Cli {
    #[clap(subcommand)]
    subcommand: Subcommand,
}

fn main() {
    let cli: Cli = Cli::parse();

    match cli.subcommand {
        Subcommand::Logo(mut cmd) => match cmd.run() {
            Ok(msg) => {
                println!("{}", msg);
            }
            Err(err) => {
                eprintln!("{:?}", err);
            }
        },
        Subcommand::Bulletin(cmd) => match cmd.run() {
            Ok(_msg) => {
                // println!("{}", msg);
            }
            Err(err) => {
                eprintln!("{:?}", err);
            }
        },
    }
}
