---
type: note
id: bulletin-report-2022
publication_date: 2023-01-01
author: arnau
tags:
  - bulletin
  - report
---
# Bulletin report (2022)

This report summarises the publication of the bulletin in 2022.

<!-- body -->

An attempt to draw some insights from the publication of the weekly
bulletins in 2022. See also previous years:

- [analysis for 2020](/notes/bulletin-report-2020/)
- [analysis for 2021](/notes/bulletin-report-2021/)

As usual, let's start with some general numbers to frame the rest of the report. This year I'll pull in numbers from las year as well to compare.

| title                                             | 2021 | 2022 |
|---------------------------------------------------|-----:| ----:|
| Number of resources read                          | 1101 | 639  |
| Number of resources published                     | 306  | 306  |
| Number of sources                                 | 33   | 53   |
| Number of sources not used                        | 14   | 27   |

This year I read substantially less than previous years likely due to changing jobs. I didn't realise I added 20 new sources to my weekly routine, I should do some pruning, it's getting wild.

The numbers per week have dropped as expected although the maximum stays quite the same.

| metric     | weekly_number_2021 | weekly_number_2022 |
|------------|-------------------:|-------------------:|
| week count | 52.0               | 51.0               |
| mean       | 21.2               | 12.5               |
| std        | 7.2                | 6.2                |
| min        | 9.0                | 5.0                |
| 25%        | 16.0               | 8.0                |
| 50%        | 20.5               | 12.0               |
| 75%        | 24.2               | 14.5               |
| max        | 44.0               | 43.0               |


## Resources

I believe all web resources should be accessible via HTTPS so whenever I
find a URL using HTTP, I manualy change it to HTTPS. It turns out that
some places are either not publishing in HTTPS or doing so but
neglecting it (e.g. expired or untrusted certificates). This is the
split of resources by either HTTP or HTTPS.


| title                                     | 2021  | 2022  |
|-------------------------------------------|------:|------:|
| Number of resources published using HTTPS | 305   | 304   |
| Number of resources read using HTTPS      | 1088  | 632   |
| Number of resources published using HTTP  | 1     | 2     |
| Number of resources read using HTTP       | 13    | 7     |

Year after year some resources persist in not offering HTTPS. Patience.


## Sources

My regular sources are where I find most of my readings. These are the
top 10 sources and the total resources I found thanks to them. Notice that this year “webtoolsweekly” didn't make the cut and instead “family” got in.

| source             | 2021 | 2022 |
|--------------------|-----:|-----:|
| lobsters           | 218  | 146  |
| twitter            | 134  | 133  |
| tldr               | 51   | 45   |
| weekrust           | 70   | 28   |
| work               | 83   | 27   |
| friend             | 19   | 19   |
| family             | NA   | 19   |
| dataelixir         | 59   | 14   |
| github             | 22   | 13   |
| softwareleadweekly | 26   | 12   |
| webtoolsweekly     | 21   | NA   |

In contrast with the top 10 sources for resources I chose for the bulletins:

| source           | 2021 | 2022 |
|------------------|-----:|-----:|
| lobsters         | 69   | 72   |
| twitter          | 31   | 59   |
| tldr             | 24   | 24   |
| work             | 14   | 13   |
| weekrust         | 10   | 11   |
| github           | 12   | 10   |
| friend           | NA   | 10   |
| webtoolsweekly   | 12   | 8    |
| dataelixir       | 21   | 8    |
| family           | 8    | 7    |
| techproductivity | 4    | NA   |

“friend” made the cut whilst “techproductivity” did not. The three lead sources maintain the order from 2021. Next year this will change given that I stopped using Twitter in favour of Mastodon.

Similar to 2021, I read a few articles from “softwareleadweekly” but none got into the bulletin.

Another way of thinking about sources is to look at how often domains
repeat. It's a weird one though given that a single domain doesn't
necessarily equate to a single publisher. Good examples of this are
`github.com`, `youtube.com` or `medium.com`. In any case, see below the
list of domains I read more than 4 times:

| domain                 | total |
|------------------------|------:|
| github.com             | 128   |
| medium.com             | 12    |
| dev.to                 | 8     |
| blog.logrocket.com     | 6     |

In contrast, these are the top 10 domains from resources published in the bulletin:

| domain                 | 2021 | 2022 |
|------------------------|-----:|-----:|
| github.com             | 59   | 87   |
| dev.to                 | 4    | 2    |
| www.youtube.com        | 2    | 4    |
| www.joshwcomeau.com    | NA   | 3    |
| notes.eatonphil.com    | NA   | 3    |
| fly.io                 | NA   | 3    |
| medium.com             | 2    | 2    |
| ncase.me               | NA   | 2    |
| github.blog            | NA   | 2    |
| christine.website      | NA   | 2    |
| arxiv.org              | 4    | NA   |
| writing.kemitchell.com | 2    | NA   |
| pythonspeed.com        | 2    | NA   |
| psyche.co              | 2    | NA   |
| observablehq.com       | 2    | NA   |
| nesslabs.com           | 2    | NA   |

GitHub stays as the dominant domain which is not a surprise, most times I share an interesting tool I use their repository which is rarely not in GitHub. The rest is mostly disjoint with last year which again is what I would expect given the diversity of domains people use to publish resources.


## Topics

Once I read an article I tag it with a set of tags that I think
represent the topic of the article. The top 10 tags are:

| tag                  | 2021 | 2022 |
|----------------------|-----:|-----:|
| rust                 | 187  | 151  |
| tool                 | 124  | 91   |
| web                  | 98   | 64   |
| data                 | 98   | 54   |
| database             | NA   | 50   |
| sqlite               | NA   | 43   |
| software_development | NA   | 42   |
| javascript           | 54   | 40   |
| webassembly          | 60   | 39   |
| management           | 50   | 32   |
| api                  | 115  | NA   |
| security             | 86   | NA   |
| teamwork             | 48   | NA   |

And the top 10 that where published in the bulletin:

| tag                  | 2021 | 2022 |
|----------------------|-----:|-----:|
| rust                 | 44   | 72   |
| tool                 | 60   | 62   |
| database             | 21   | 33   |
| data                 | 24   | 32   |
| web                  | 39   | 31   |
| sqlite               | NA   | 31   |
| javascript           | 23   | 23   |
| software_development | NA   | 20   |
| typescript           | NA   | 18   |
| python               | 18   | 18   |
| security             | 28   | NA   |
| computer_science     | 17   | NA   |
| api                  | 16   | NA   |

Rust stays as my main interest, tools over other kinds of resources as well and there is a noticeable shift from API to databases, SQLite in particular. Interestingly enough, my curated list of SQLite resources, [Some SQLite](https://github.com/arnau/some-sqlite) hasn't grown faster than in 2021.

For a second year, WebAssembly doesn't show often enough in the bulletin although it has been, with Rust, my main focus for years.


## Conclusions

In 2020 I thought I would record more information so I could answer:

- How often do I find a resource and leave it for a while to read?
- When so, how long does it take for me from finding it to reading it?
- Is there any impact on my reading habits when I'm on leave?

For a second year in a row, I haven't managed to incorporate enough information to address them. Maybe 2023 is the year?

Changing jobs has made a big impact on the bulletin. I had less time for reading or I was too tired to do so, and the context change has influenced the kind of resources I foucus on. 2021 was orbiting around data standards, API design and alike however 2022 has been about software development, distributed systems, and databases.

My personal interests, however, have remained roughly unchanged: Rust, offline-first tooling and WebAssembly.
