// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use std::fmt;

#[derive(Clone, Debug)]
pub enum Achievement {
    /// The task did not make any change.
    Noop,
    /// The task was cancelled by the user.
    Cancelled,
    /// The task was done as expected.
    Done,
}

impl fmt::Display for Achievement {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        use Achievement as A;

        match self {
            A::Noop => write!(f, "Nothing to do."),
            A::Cancelled => write!(f, "Cancelled the task at hand."),
            A::Done => write!(f, "Finished processing all given work."),
        }
    }
}
