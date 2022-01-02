---
type: note
id: bulletin-report-2021
publication_date: 2022-01-02
author: arnau
tags:
  - bulletin
  - report
---
# Bulletin report (2021)

This report summarises the publication of the bulletin in 2021.

<!-- body -->

An attempt to draw some insights from the publication of the weekly
bulletins in 2021. See also the [analysis for 2020](/notes/bulletin-report-2020/).

Let's start with some general numbers to frame the rest of the report:

| title                                             | total |
|---------------------------------------------------|------:|
| Amount of resources read                          | 1101  |
| Amount of resources published                     | 306   |
| Amount of sources                                 | 33    |
| Amount of sources not used                        | 14    |
| Amount of sources not used in published resources | 26    |

Although each bulletin issue has 6 resources, the amount I read per week
is higher. A summary:

| metric | weekly_amount |
|--------|--------------:|
| count  | 52.0          |
| mean   | 21.2          |
| std    | 7.2           |
| min    | 9.0           |
| 25%    | 16.0          |
| 50%    | 20.5          |
| 75%    | 24.2          |
| max    | 44.0          |


## Resources

I believe all web resources should be accessible via HTTPS so whenever I
find a URL using HTTP, I manualy change it to HTTPS. It turns out that
some places are either not publishing in HTTPS or doing so but
neglecting it (e.g. expired or untrusted certificates). This is the
split of resources by either HTTP or HTTPS:


| title                                     | total |
|-------------------------------------------|------:|
| Amount of resources published using HTTPS | 305   |
| Amount of resources read using HTTPS      | 1088  |
| Amount of resources published using HTTP  | 1     |
| Amount of resources read using HTTP       | 13    |


I would've hoped that by 2021 we would've got rid of HTTP but there are
a few leftovers.


## Sources

My regular sources are where I find most of my reading. These are the
top 10 sources and the total resources I found thanks to them:

| source             | total |
|--------------------|------:|
| lobsters           | 218   |
| twitter            | 134   |
| work               | 83    |
| weekrust           | 70    |
| dataelixir         | 59    |
| tldr               | 51    |
| softwareleadweekly | 26    |
| github             | 22    |
| webtoolsweekly     | 21    |
| friend             | 19    |

In contrast with the top 10 sources for resources I chose for the bulletins:

| source           | total |
|------------------|------:|
| lobsters         | 69    |
| twitter          | 31    |
| tldr             | 24    |
| dataelixir       | 21    |
| work             | 14    |
| webtoolsweekly   | 12    |
| github           | 12    |
| weekrust         | 10    |
| family           | 8     |
| techproductivity | 4     |

Compared with 2020, even tough 'lobsters' is still the main source, 2021
has been more spread across.

Also interesting to see that I read quite a few articles from
'softwareleadweekly' but they don't make it to the bulletin.

This year I incorporated a few adhoc sources that I didn't record in
2020:

- 'work' for links provided by colleagues.
- 'family' for links provided by any member of my family.
- 'friends' for links provided by any friend.

Another way of thinking about sources is to look at how often domains
repeat. It's a weird one though given that a single domain doesn't
necessarily equate to a single publisher. Good examples of this are
`github.com`, `youtube.com` or `medium.com`. In any case, see below the
list of domains I read more than 4 times:

| domain                 | total |
|------------------------|------:|
| github.com             | 141   |
| dev.to                 | 32    |
| medium.com             | 25    |
| nordicapis.com         | 11    |
| css-tricks.com         | 8     |
| nesslabs.com           | 7     |
| www.youtube.com        | 6     |
| blog.cloudflare.com    | 6     |
| towardsdatascience.com | 5     |
| psyche.co              | 5     |
| protonmail.com         | 5     |
| jvns.ca                | 5     |
| arxiv.org              | 5     |

In contrast, these are the top 10 domains from resources published in the bulletin:

| domain                 | total |
|------------------------|-------|
| github.com             | 59    |
| dev.to                 | 4     |
| arxiv.org              | 4     |
| www.youtube.com        | 2     |
| writing.kemitchell.com | 2     |
| pythonspeed.com        | 2     |
| psyche.co              | 2     |
| observablehq.com       | 2     |
| nesslabs.com           | 2     |
| medium.com             | 2     |


## Topics

Once I read an article I tag it with a set of tags that I think
represent the topic of the article.

The top 10 tags are:

| tag         | total |
|-------------|------:|
| rust        | 187   |
| tool        | 124   |
| api         | 115   |
| web         | 98    |
| data        | 98    |
| security    | 86    |
| webassembly | 60    |
| javascript  | 54    |
| management  | 50    |
| teamwork    | 48    |

'web' is a new tag I didn't use in 2020 which is as broad as 'data' and
has pushed down 'python' even though it is quite frequent in my
readings.

And the top 10 that where published in the bulletin:

| tag              | total |
|------------------|------:|
| tool             | 60    |
| rust             | 44    |
| web              | 39    |
| security         | 28    |
| data             | 24    |
| javascript       | 23    |
| database         | 21    |
| python           | 18    |
| computer_science | 17    |
| api              | 16    |

The surprise for me here is not seeing 'webassembly' as 2021 has been
,or has felt, very focused on WebAssembly.


## Conclusions

In 2020 I thought I would record more information so I could answer:

-   How often do I find a resource and leave it for a while to read?
-   When so, how long does it take for me from finding it to reading it?
-   Is there any impact on my reading habits when I'm on leave?

I haven't managed to incorporate enough information to address them so
I'll have to try in 2022.

This time I had to fix a large set of tiny mistakes due to the fact that
I'm using 2 tools and some manual tasks to record all this information.
2022 should be about unifying all this under a more mature tool that
minimises input error.
