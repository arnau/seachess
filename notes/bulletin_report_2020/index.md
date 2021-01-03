---
date: 2021-01-03
author: arnau
id: bulletin-report-2020
title: Bulletin report (2020)
type: note
status: published
tags:
  - bulletin
  - report
---

This report summarises the publication of the bulletin in 2020.

<!-- end -->


An attempt to draw some insights from the publication of the weekly bulletins in 2020.


Let's start with some general numbers to frame the rest of the report:

<table>
  <thead>
    <tr>
      <th>title</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amount of resources read</td>
      <td>1025</td>
    </tr>
    <tr>
      <td>Amount of resources published</td>
      <td>204</td>
    </tr>
    <tr>
      <td>Amount of sources</td>
      <td>32</td>
    </tr>
  </tbody>
</table>

Although each bulletin issue has 6 resources, the amount I read per week is higher. A summary:

<table>
  <thead>
    <tr>
      <th></th>
      <th>weekly_amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>count</td>
      <td>36.0</td>
    </tr>
    <tr>
      <td>mean</td>
      <td>28.5</td>
    </tr>
    <tr>
      <td>std</td>
      <td>7.6</td>
    </tr>
    <tr>
      <td>min</td>
      <td>14.0</td>
    </tr>
    <tr>
      <td>25%</td>
      <td>23.0</td>
    </tr>
    <tr>
      <td>50%</td>
      <td>28.0</td>
    </tr>
    <tr>
      <td>75%</td>
      <td>32.5</td>
    </tr>
    <tr>
      <td>max</td>
      <td>45.0</td>
    </tr>
  </tbody>
</table>


## Resources

I believe all web resources should be accessible via HTTPS so whenever I find
a URL using HTTP, I manualy change it to HTTPS. It turns out that some places
are either not publishing in HTTPS or doing so but neglecting it (e.g. expired
or untrusted certificates). This is the split of resources by either HTTP or
HTTPS:

<table>
  <thead>
    <tr>
      <th>title</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amount of resources published using HTTPS</td>
      <td>198</td>
    </tr>
    <tr>
      <td>Amount of resources read using HTTPS</td>
      <td>1002</td>
    </tr>
    <tr>
      <td>Amount of resources published using HTTP</td>
      <td>6</td>
    </tr>
    <tr>
      <td>Amount of resources read using HTTP</td>
      <td>23</td>
    </tr>
  </tbody>
</table>

I would've hoped that by 2020 we would've got rid of HTTP but there are a few
leftovers (or resisting bastions?).

In the bulletin I also flag whether a resource is a video, a PDF or text as a
means to heads up people before the follow a link:


<table>
  <thead>
    <tr>
      <th>content_type</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>pdf</td>
      <td>3</td>
    </tr>
    <tr>
      <td>text</td>
      <td>293</td>
    </tr>
    <tr>
      <td>video</td>
      <td>10</td>
    </tr>
  </tbody>
</table>

You'll notice that the first week recorded is the 17th week. So yes, there is
a gap between the first issue I published on the 2nd week of 2020 and the 17th
one when I started recording everything I read.


## Sources

My regular sources are where I find most of my reading. These are the top 10
sources and the total resources I found thanks to them:

<table>
  <thead>
    <tr>
      <th>source</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>lobsters</td>
      <td>182</td>
    </tr>
    <tr>
      <td>weekrust</td>
      <td>70</td>
    </tr>
    <tr>
      <td>dataelixir</td>
      <td>50</td>
    </tr>
    <tr>
      <td>tldr</td>
      <td>50</td>
    </tr>
    <tr>
      <td>twitter</td>
      <td>32</td>
    </tr>
    <tr>
      <td>webtoolsweekly</td>
      <td>31</td>
    </tr>
    <tr>
      <td>dbweekly</td>
      <td>23</td>
    </tr>
    <tr>
      <td>makermind</td>
      <td>22</td>
    </tr>
    <tr>
      <td>techproductivity</td>
      <td>17</td>
    </tr>
    <tr>
      <td>softwareleadweekly</td>
      <td>15</td>
    </tr>
  </tbody>
</table>

In contrast with the top 10 sources for resources I chose for the bulletin:

<table>
  <thead>
    <tr>
      <th>source</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>lobsters</td>
      <td>46</td>
    </tr>
    <tr>
      <td>dataelixir</td>
      <td>13</td>
    </tr>
    <tr>
      <td>tldr</td>
      <td>9</td>
    </tr>
    <tr>
      <td>twitter</td>
      <td>8</td>
    </tr>
    <tr>
      <td>dbweekly</td>
      <td>7</td>
    </tr>
    <tr>
      <td>weekrust</td>
      <td>6</td>
    </tr>
    <tr>
      <td>webtoolsweekly</td>
      <td>4</td>
    </tr>
    <tr>
      <td>cyberweekly</td>
      <td>3</td>
    </tr>
    <tr>
      <td>techproductivity</td>
      <td>3</td>
    </tr>
    <tr>
      <td>makermind</td>
      <td>2</td>
    </tr>
  </tbody>
</table>

So, by the looks of it, the source where I find an article does not affect
whether I will chose it for the bulletin.

Another way of thinking about sources is to look at how often domains repeat.
It's a weird one though given that a single domain don't necessarily equate to
a single publisher. Good examples of this are `github.com`, `youtube.com` or
`medium.com`. In any case, see below the list of domains I read more than 4
times:

<table>
  <thead>
    <tr>
      <th>domain</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>github.com</td>
      <td>118</td>
    </tr>
    <tr>
      <td>medium.com</td>
      <td>45</td>
    </tr>
    <tr>
      <td>dev.to</td>
      <td>29</td>
    </tr>
    <tr>
      <td>nesslabs.com</td>
      <td>26</td>
    </tr>
    <tr>
      <td>www.youtube.com</td>
      <td>13</td>
    </tr>
    <tr>
      <td>towardsdatascience.com</td>
      <td>8</td>
    </tr>
    <tr>
      <td>hacks.mozilla.org</td>
      <td>7</td>
    </tr>
    <tr>
      <td>leaddev.com</td>
      <td>6</td>
    </tr>
    <tr>
      <td>jvns.ca</td>
      <td>6</td>
    </tr>
    <tr>
      <td>untools.co</td>
      <td>5</td>
    </tr>
    <tr>
      <td>martinfowler.com</td>
      <td>5</td>
    </tr>
    <tr>
      <td>blog.logrocket.com</td>
      <td>5</td>
    </tr>
  </tbody>
</table>


## Topics


Once I read an article I tag it with a set of tags that I think represent the
topic of the article. Although I use free-form tags, I try to be consistent.

The top 10 tags in 2020 are:

<table>
  <thead>
    <tr>
      <th>tag</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>rust</td>
      <td>185</td>
    </tr>
    <tr>
      <td>tool</td>
      <td>88</td>
    </tr>
    <tr>
      <td>management</td>
      <td>58</td>
    </tr>
    <tr>
      <td>data</td>
      <td>51</td>
    </tr>
    <tr>
      <td>database</td>
      <td>48</td>
    </tr>
    <tr>
      <td>methodology</td>
      <td>45</td>
    </tr>
    <tr>
      <td>software_development</td>
      <td>43</td>
    </tr>
    <tr>
      <td>webassembly</td>
      <td>43</td>
    </tr>
    <tr>
      <td>javascript</td>
      <td>41</td>
    </tr>
    <tr>
      <td>python</td>
      <td>38</td>
    </tr>
  </tbody>
</table>

And the top 10 that where published in the bulletin:

<table>
  <thead>
    <tr>
      <th>tag</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>rust</td>
      <td>33</td>
    </tr>
    <tr>
      <td>tool</td>
      <td>28</td>
    </tr>
    <tr>
      <td>python</td>
      <td>16</td>
    </tr>
    <tr>
      <td>computer_science</td>
      <td>13</td>
    </tr>
    <tr>
      <td>data</td>
      <td>12</td>
    </tr>
    <tr>
      <td>database</td>
      <td>11</td>
    </tr>
    <tr>
      <td>security</td>
      <td>11</td>
    </tr>
    <tr>
      <td>sqlite</td>
      <td>10</td>
    </tr>
    <tr>
      <td>git</td>
      <td>9</td>
    </tr>
    <tr>
      <td>management</td>
      <td>8</td>
    </tr>
  </tbody>
</table>


Looks like even though I read a lot about management, I rarely find it good
enough to be in the bulletin.


## Conclusions

This exercise has shown me a few things I've done right and some others I
should improve in 2021. The things to be improved are mostly about recording
more information, for example I would've liked to answer the following:

* How often do I find a resource and leave it for a while to read?
* When so, how long does it take for me from finding it to reading it?
* Is there any impact on my reading habits when I'm on leave?

The things I've done well enough:

* I recorded all resources I've read.
* I keep all this data as a relational database (actually CSV loaded into SQLite).
* I keep the bulletin data as a relational database (also CSV loaded into SQLite), so I can merge both databases.
* I built a rudimentary CLI to manage my resources and another one to manage the bulletins. This makes a huge difference in keeping the management of all this  low friction.

Let's see how things change in 2021.
