// Copyright 2020 Arnau Siches

// Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
// This file may not be copied, modified, or distributed except
// according to those terms.

use svg::node::element::{Group, Rectangle};
use svg::Document;

use crate::Error;

#[derive(Debug, Clone)]
struct Square<'a> {
    width: usize,
    height: usize,
    x: usize,
    y: usize,
    fill: &'a str,
    stroke: &'a str,
}

impl<'a> Square<'a> {
    fn new(side: usize, x: usize, y: usize, fill: &'a str, stroke: &'a str) -> Self {
        Square {
            width: side,
            height: side,
            x,
            y,
            fill,
            stroke,
        }
    }

    fn draw(self) -> Rectangle {
        Rectangle::new()
            .set("width", self.width)
            .set("height", self.height)
            .set("x", self.x)
            .set("y", self.y)
            .set("fill", self.fill)
            .set("stroke", self.stroke)
    }
}

fn row(side: usize, y: usize, colours: &[&str; 4], stroke: &str) -> Group {
    let x1 = 1;
    let x2 = 1 + (side * 1);
    let x3 = 1 + (side * 2);
    let x4 = 1 + (side * 3);

    Group::new()
        .add(Square::new(side, x1, y, colours[0], stroke).draw())
        .add(Square::new(side, x2, y, colours[1], stroke).draw())
        .add(Square::new(side, x3, y, colours[2], stroke).draw())
        .add(Square::new(side, x4, y, colours[3], stroke).draw())
}

pub fn build(side: usize) -> Document {
    let dim = (side * 4) + 2;

    let primary = "#00AAFF";
    let secondary = "#0055AA";
    let neutral = "#55CCEE";
    let hlight = "#FFDD00";

    let mut document = Document::new()
        .set("x", 0)
        .set("y", 0)
        .set("width", dim)
        .set("height", dim)
        .set("viewBox", (0, 0, dim, dim));

    let rows = vec![
        // row 1
        row(
            side,
            1,
            &[secondary, secondary, secondary, primary],
            neutral,
        ),
        // row 2
        row(
            side,
            1 + (side * 1),
            &[secondary, secondary, primary, secondary],
            neutral,
        ),
        // row 3
        row(
            side,
            1 + (side * 2),
            &[secondary, primary, hlight, secondary],
            neutral,
        ),
        // row 4
        row(
            side,
            1 + (side * 3),
            &[primary, secondary, secondary, secondary],
            neutral,
        ),
    ];

    for row in rows {
        document = document.add(row);
    }

    document
}

pub fn save(path: &str, document: &Document) -> Result<(), Error> {
    Ok(svg::save(path, document)?)
}
