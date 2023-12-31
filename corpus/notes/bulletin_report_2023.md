---
type: note
id: bulletin-report-2023
publication_date: 2023-12-31
author: arnau
tags:
  - bulletin
  - report
---
# Bulletin report (2023)

This report summarises the publication of the bulletin in 2023.

<!-- body -->

An attempt to draw some insights from the publication of the weekly
bulletins in 2023. See also previous years:

- [analysis for 2020](/notes/bulletin-report-2020/)
- [analysis for 2021](/notes/bulletin-report-2021/)
- [analysis for 2022](/notes/bulletin-report-2022/)

Note that previous reports may not show the same numbers as this report. This is due to retrospective data fixes.

Throughout this report I'll use a few terms worth defining upfront:

- Item: An article, video, tutorial, tool or other resource read or assessed.
- Source: A place where to find items like newsletters or social media.

Let's start with some general numbers to frame the rest of the report.

| year | read_items | published_items | read_sources | published_sources |
| ---- | ---------: | --------------: | -----------: | ----------------: |
| 2020 | 1040       | 306             | 33           | 20                |
| 2021 | 1104       | 306             | 34           | 22                |
| 2022 | 649        | 306             | 27           | 22                |
| 2023 | 447        | 294             | 19           | 17                |

This year I've read less than last year, continuing the trend downwards. The proportion between items read and items published is not great, I should reduce the amount of published items or increase my reading habits.

| year | mean  | std  | min | max |
| ---- | ----: | ---: | --: | --: |
| 2020 | 27.37 | 9.75 | 1   | 45  |
| 2021 | 21.23 | 7.05 | 9   | 44  |
| 2022 | 12.48 | 6.04 | 5   | 43  |
| 2023 | 9.31  | 3.87 | 3   | 25  |


## HTTPS vs HTTP

I believe all web resources should be accessible via HTTPS. However, some places only  publish their content using HTTP.

| year | read_https | read_http | published_https | published_http |
| ---- | ---------: | --------: | --------------: | -------------: |
| 2020 | 1017       | 23        | 300             | 6              |
| 2021 | 1091       | 13        | 305             | 1              |
| 2022 | 642        | 7         | 304             | 2              |
| 2023 | 444        | 3         | 291             | 3              |


## Sources

My regular sources are where I find most of my readings. These are the top 10 sources and the total items I found thanks to them. Note that the empty source signals either an ad-hoc source like following a link from another item.

| source         | 2023 | 2022 | 2021 | 2020 |
| -------------- | ---: | ---: | ---: | ---: |
| mastodon       | 149  | 7    | 0    | 0    |
|                | 112  | 126  | 289  | 474  |
| lobsters       | 57   | 148  | 218  | 182  |
| work           | 33   | 29   | 83   | 1    |
| tldr           | 25   | 45   | 51   | 50   |
| family         | 19   | 20   | 16   | 0    |
| weekrust       | 14   | 28   | 70   | 70   |
| github         | 7    | 14   | 22   | 1    |
| webtoolsweekly | 7    | 12   | 21   | 31   |
| friend         | 6    | 20   | 20   | 0    |

The biggest change this year is that I stopped using Twitter and started using Mastodon. This is how Twitter changed over time:

| source  | 2023 | 2022 | 2021 | 2020 |
| ------- | ---: | ---: | ---: | ---: |
| twitter | 0    | 133  | 136  | 32   |

In contrast with the top 10 sources for items I chose for the bulletins:

| source         | 2023 | 2022 | 2021 | 2020 |
| -------------- | ---: | ---: | ---: | ---: |
| mastodon       | 91   | 4    | 0    | 0    |
|                | 73   | 56   | 76   | 108  |
| lobsters       | 32   | 74   | 69   | 45   |
| tldr           | 23   | 26   | 23   | 9    |
| work           | 22   | 13   | 14   | 0    |
| family         | 18   | 5    | 9    | 0    |
| weekrust       | 10   | 13   | 10   | 6    |
| github         | 7    | 9    | 13   | 0    |
| webtoolsweekly | 5    | 8    | 12   | 4    |
| friend         | 3    | 12   | 3    | 0    |

This year both lists are pretty similar. As expected, Mastodon has replaced completely Twitter which I stopped using at the end of last year.

Another way of thinking about sources is to look at how often domains
repeat. It's a weird one though given that a single domain doesn't
necessarily equate to a single publisher. Good examples of this are
`github.com`, `youtube.com` or `medium.com`.

| domain                 | 2023 | 2022 | 2021 | 2020 |
| ---------------------- | ---- | ---- | ---- | ---- |
| github.com             | 124  | 129  | 142  | 121  |
| www.youtube.com        | 4    | 4    | 6    | 13   |
| pythonspeed.com        | 4    | 1    | 4    | 1    |
| surma.dev              | 3    | 0    | 1    | 0    |
| dev.to                 | 3    | 9    | 32   | 29   |
| antonz.org             | 3    | 2    | 1    | 0    |

Note that I'm excluding domains with 2 or less repetitons for practical reasons. This is the summary for 2023:

| 2023 | count | percentage |
| ---: | ----: | ---------: |
| 1    | 282   | 94.00%     |
| 2    | 12    | 4.00%      |
| 3    | 3     | 1.00%      |
| 4    | 2     | 0.67%      |
| 124  | 1     | 0.33%      |


These are the top 10 domains from items published in the bulletin:

| domain            | 2023 | 2022 | 2021 | 2020 |
| ----------------- | ---: | ---: | ---: | ---: |
| github.com        | 95   | 90   | 61   | 34   |
| www.youtube.com   | 3    | 4    | 2    | 9    |
| dev.to            | 2    | 2    | 4    | 4    |
| jvns.ca           | 2    | 1    | 2    | 0    |
| mitchellh.com     | 2    | 0    | 0    | 0    |
| pythonspeed.com   | 2    | 0    | 2    | 1    |
| samwho.dev        | 2    | 0    | 0    | 0    |
| simonwillison.net | 2    | 1    | 0    | 1    |
| surma.dev         | 2    | 0    | 0    | 0    |

Once again, GitHub stays as the dominant domain. The rest is scattered despite the raise of platforms like `dev.to`. `medium.com` in particular is no surprise because I avoid as much as I can reading anything in that platform due to their cookie littering behaviour.

| 2023 | count | percentage |
| ---: | ----: | ---------: |
| 1    | 182   | 95.29%     |
| 2    | 7     | 3.66%      |
| 3    | 1     | 0.52%      |
| 95   | 1     | 0.52%      |


## Topics

Once I read an article I tag it with a set of tags that I think
represent the topic of the article. The top 10 tags are:

| tag                              | 2023 | 2022 | 2021 | 2020 |
| -------------------------------- | ---: | ---: | ---: | ---: |
| programming_language/rust        | 144  | 153  | 188  | 192  |
| topic/tool                       | 60   | 92   | 125  | 94   |
| topic/web                        | 37   | 66   | 98   | 29   |
| programming_language/python      | 32   | 26   | 42   | 40   |
| topic/database                   | 31   | 50   | 44   | 51   |
| topic/software_development       | 25   | 42   | 48   | 43   |
| topic/data                       | 23   | 56   | 98   | 53   |
| programming_language/typescript  | 22   | 28   | 16   | 3    |
| topic/security                   | 20   | 28   | 86   | 33   |
| programming_language/webassembly | 20   | 40   | 62   | 44   |

And the top 10 that where published in the bulletin:

| tag                             | 2023 | 2022 | 2021 | 2020 |
| ------------------------------- | ---: | ---: | ---: | ---: |
| programming_language/rust       | 99   | 74   | 44   | 37   |
| topic/tool                      | 47   | 63   | 61   | 32   |
| topic/web                       | 25   | 33   | 37   | 5    |
| topic/database                  | 21   | 35   | 20   | 14   |
| programming_language/python     | 19   | 18   | 18   | 18   |
| topic/data                      | 16   | 30   | 25   | 14   |
| programming_language/typescript | 15   | 18   | 6    | 1    |
| topic/programming_language      | 15   | 10   | 13   | 4    |
| programming_language/javascript | 14   | 24   | 22   | 6    |
| topic/library                   | 14   | 10   | 8    | 6    |

Rust stays as my main interest and databases and data have slown down a bit. 

For a third year in a row, WebAssembly doesn't show often enough in the bulletin although it has been, with Rust, my main focus for years.


## Conclusions

This year has been quite similar to 2022 in topics and sources (excluding the swap between Twitter and Mastodon). However I read substantially fewer items than previous years. I have decided to reduce the number of links per issue from 6 to 4.
