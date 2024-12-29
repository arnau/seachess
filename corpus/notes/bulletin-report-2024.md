---
type: note
id: bulletin-report-2024
publication_date: 2024-12-29
author: arnau
tags:
  - bulletin
  - report
---
# Bulletin report (2024)

This report summarises the publication of the bulletin in 2024.

<!-- body -->

An attempt to draw some insights from the publication of the weekly
bulletins in 2023. See also previous years:

- [analysis for 2020](/notes/bulletin-report-2020/)
- [analysis for 2021](/notes/bulletin-report-2021/)
- [analysis for 2022](/notes/bulletin-report-2022/)
- [analysis for 2023](/notes/bulletin-report-2023/)

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
| 2024 | 427        | 204             | 14           | 12                |

This year I've read less than last year, continuing the trend downwards. I've been sharing 4 links instead of 6 which has provided a good balance between my current reading frequency and publication rate.

| year | mean  | std  | min | max |
| ---- | ----: | ---: | --: | --: |
| 2020 | 27.37 | 9.75 | 1   | 45  |
| 2021 | 21.23 | 7.05 | 9   | 44  |
| 2022 | 12.48 | 6.04 | 5   | 43  |
| 2023 | 9.31  | 3.87 | 3   | 25  |
| 2024 | 8.21  | 4.59 | 1   | 26  |

## HTTPS vs HTTP

I believe all web resources should be accessible via HTTPS. However, some places only  publish their content using HTTP.

| year | read_https | read_http | published_https | published_http |
| ---- | ---------: | --------: | --------------: | -------------: |
| 2020 | 1017       | 23        | 300             | 6              |
| 2021 | 1091       | 13        | 305             | 1              |
| 2022 | 642        | 7         | 304             | 2              |
| 2023 | 444        | 3         | 291             | 3              |
| 2024 | 424        | 3         | 202             | 2              |


## Sources

My regular sources are where I find most of my readings. These are the top 10 sources and the total resources I found thanks to them. Note that the empty source signals either an ad-hoc source like following a link from another item.

| source            | 2024 | 2023 | 2022 | 2021 | 2020 |
| ----------------- | ---: | ---: | ---: | ---: | ---: |
|                   | 226  | 112  | 126  | 289  | 474  |
| mastodon          | 113  | 149  | 7    | 0    | 0    |
| family            | 23   | 19   | 20   | 16   | 0    |
| lobsters          | 20   | 57   | 148  | 218  | 182  |
| friend            | 11   | 6    | 20   | 20   | 0    |
| techmanagerweekly | 8    | 4    | 0    | 0    | 0    |
| weekrust          | 6    | 14   | 28   | 70   | 70   |
| tldr              | 5    | 25   | 45   | 51   | 50   |
| dataelixir        | 4    | 6    | 14   | 59   | 50   |
| work              | 3    | 33   | 29   | 83   | 1    |

This year I haven't been as diligent in recording the source, hence the spike of empty source. Most of them were either mastodon or lobsters which are based on memory the two main sources I've used this year.

The other important change to know is that I pruned lots of sources I was no longer reviewing on a regular basis. The only noticeable impact has been the removal of the webtoolsweekly as a top 10 source.

In contrast with the top 10 sources for resources I chose for the bulletins:

| source             | 2024 | 2023 | 2022 | 2021 | 2020 |
| ------------------ | ---: | ---: | ---: | ---: | ---: |
|                    | 97   | 73   | 56   | 77   | 108  |
| mastodon           | 67   | 91   | 4    | 0    | 0    |
| lobsters           | 9    | 32   | 74   | 69   | 45   |
| family             | 8    | 18   | 5    | 9    | 0    |
| friend             | 5    | 3    | 12   | 3    | 0    |
| tldr               | 4    | 23   | 26   | 23   | 9    |
| weekrust           | 4    | 10   | 13   | 10   | 6    |
| work               | 3    | 22   | 13   | 14   | 0    |
| dataelixir         | 3    | 3    | 8    | 21   | 13   |
| programming_digest | 2    | 1    | 5    | 0    | 0    |

This year both lists are pretty similar. Interestingly, readings from the techmanagerweekly don't make the cut.

Another way of thinking about sources is to look at how often domains repeat. It's a weird one though given that a single domain doesn't necessarily equate to a single publisher. Good examples of this are `github.com`, `youtube.com` or `medium.com`.

| domain              | 2024 | 2023 | 2022 | 2021 | 2020 |
| ------------------- | ---: | ---: | ---: | ---: | ---: |
| github.com          | 125  | 124  | 129  | 142  | 121  |
| www.youtube.com     | 8    | 4    | 4    | 6    | 13   |
| medium.com          | 3    | 2    | 12   | 25   | 45   |
| dl.acm.org          | 3    | 0    | 1    | 0    | 0    |
| dev.to              | 3    | 3    | 9    | 32   | 29   |

Note that I'm excluding domains with 2 or less repetitons for practical reasons. This is the summary for 2024:

| 2024 | count | percentage |
| ---: | ----: | ---------: |
| 1    | 265   | 94.64%     |
| 2    | 10    | 3.57%      |
| 3    | 3     | 1.07%      |
| 8    | 1     | 0.36%      |
| 125  | 1     | 0.36%      |

These are the top 10 domains from resources published in the bulletin:

| domain                  | 2024 | 2023 | 2022 | 2021 | 2020 |
| ----------------------- | ---: | ---: | ---: | ---: | ---: |
| github.com              | 76   | 95   | 90   | 61   | 34   |
| www.youtube.com         | 4    | 3    | 4    | 2    | 9    |
| www.wheresyoured.at     | 2    | 0    | 0    | 0    | 0    |
| encore.dev              | 2    | 0    | 0    | 0    | 1    |
| dl.acm.org              | 2    | 0    | 1    | 0    | 0    |
| arxiv.org               | 2    | 0    | 0    | 4    | 1    |
| aeon.co                 | 2    | 1    | 0    | 2    | 1    |

Once again, GitHub stays as the dominant domain.

| 2024 | count | percentage |
| ---: | ----: | ---------: |
| 1    | 114   | 94.21%     |
| 2    | 5     | 4.13%      |
| 4    | 1     | 0.83%      |
| 76   | 1     | 0.83%      |


## Topics

Once I read an article I tag it with a set of tags that I think represent the topic of the article. The top 10 tags are:

| tag                             | 2024 | 2023 | 2022 | 2021 | 2020 |
| ------------------------------- | ---: | ---: | ---: | ---: | ---: |
| programming_language/rust       | 142  | 144  | 153  | 188  | 192  |
| topic/tool                      | 63   | 60   | 92   | 125  | 94   |
| topic/artificial_intelligence   | 28   | 17   | 3    | 3    | 5    |
| programming_language/python     | 28   | 32   | 26   | 42   | 40   |
| topic/security                  | 27   | 20   | 28   | 86   | 33   |
| topic/management                | 25   | 6    | 33   | 50   | 58   |
| topic/software_development      | 20   | 25   | 42   | 48   | 43   |
| topic/large_language_model      | 16   | 6    | 0    | 0    | 0    |
| programming_language/javascript | 16   | 19   | 41   | 56   | 41   |
| topic/library                   | 16   | 16   | 14   | 25   | 28   |

And the top 10 that where published in the bulletin:

| tags                             | 2024 | 2023 | 2022 | 2021 | 2020 |
| -------------------------------- | ---: | ---: | ---: | ---: | ---: |
| programming_language/rust        | 76   | 99   | 74   | 44   | 37   |
| topic/tool                       | 53   | 47   | 63   | 61   | 32   |
| programming_language/python      | 15   | 19   | 18   | 18   | 18   |
| topic/security                   | 15   | 14   | 15   | 28   | 12   |
| topic/artificial_intelligence    | 13   | 12   | 1    | 2    | 2    |
| programming_language/webassembly | 12   | 14   | 14   | 17   | 8    |
| topic/database                   | 10   | 21   | 35   | 20   | 14   |
| programming_language/javascript  | 9    | 14   | 24   | 22   | 6    |
| programming_language/typescript  | 9    | 15   | 18   | 6    | 1    |
| topic/software_development       | 8    | 13   | 22   | 15   | 8    |

Rust stays as my main interest followed by tools. Noticeable that `topic/web` is no longer in the top 10. 

## Conclusions

This year has been quite similar to 2023 in topics and sources. Moving from 6 to 4 links has made a substantial positive impact on my ability to publish only links I consider worth sharing. I'll continue with this approach in 2025.
