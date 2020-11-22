-- Copyright 2020 Arnau Siches
--
-- Licensed under the MIT license <LICENCE or http://opensource.org/licenses/MIT>.
-- This file may not be copied, modified, or distributed except
-- according to those terms.

CREATE TABLE IF NOT EXISTS bulletin_issue (
  id               text NOT NULL PRIMARY KEY,
  publication_date date NOT NULL,
  summary          text NOT NULL
);

CREATE TABLE IF NOT EXISTS bulletin_entry (
  url          text NOT NULL PRIMARY KEY,
  title        text NOT NULL,
  summary      text NOT NULL,
  content_type text NOT NULL,
  issue_id     text,

  FOREIGN KEY (issue_id) REFERENCES bulletin_issue (id)
);

CREATE TABLE IF NOT EXISTS bulletin_mention (
  mention_url text NOT NULL,
  entry_url   text NOT NULL,

  UNIQUE (mention_url, entry_url),
  FOREIGN KEY (entry_url) REFERENCES bulletin_entry (url)
);
