---
type: note
id: moving-away-from-gatsby
publication_date: 2021-08-10
author: arnau
tags:
  - seachess
  - gatsby
  - rust
  - zola
---
# Moving away from Gatsby

This note logs my thinking on moving Seachess from Gatsby to a custom system.

<!-- body -->

## The starting point

Back in 2019 I started once again my personal website. At the time I was interested in [React], [GraphQL] and [Jamstack]. So [Gatsby] was the natural choice to build it.

Since then, my interests have shifted into other things which have made the points of friction with Gatsby and the way I chose to use it (e.g. plugins) not fun.

**Cold builds can take up to 5 minutes**. In theory, Gatsby caching system would help spped things up but because at least once a week there are some dependency upgrades, the cache is never used. At the time of writing the build has 124 pages to handle.

**The migration from Gatsby 1 to Gatsby 2 was a pain**. Gatsby 3 is coming and I can't bear the thought of migrating.

**[Material-UI] is too heavy for a simple website like mine**. It's normal for customisable tools to bloat a bit, nothing wrong with that, but it's time for me to go back to plain HTML with hand-made CSS.

**Takes 1.50 seconds to load the homepage**, up to 2 seconds to finish and requires 20 requests, where 9 of them are JavaScript and 5 are JSON.

Most of it is for React rehydration, offline caching and other clever things tend to be less useful for one-page visit websites like mine. This is an assumption given that I don't use trackers.

**I managed to end up with 43 direct dependencies**. Which expands into a dependency tree of 6498 nodes.

The biggest problem with the dependencies is that some of them, depend on things that have outstanding high severity bugs for weeks even though I upgrade at least once a week.



## The journey

With the above points of friction in mind I started looking for an alternative approach to build my static website. The main goals being:

- Be able to write different types of content in the way I find most convinient. For example, I like to write notes like this one as [YAML] + [Markdown] but bulletins as [TOML] with attributes in Markdown.
- Be able to write diagrams as code. For example, I describe diagrames using the [dot] syntax but I want it rendered as [SVG].
- Minimise duplication of information. For example, all sketches link to the tooling I used to make them which is likely to be the same for many.
- Faster builds. Although I didn't have a specific target, more than 1 minute would be alarming.
- Minimise client-side JavaScript. For example, a runtime such as React's with a hydration process is a no-go.

To a lesser extent, I wanted to minimise maintaining JavaScript code and favour [Rust] over other options. No other reason than taste.

I looked into the state of static site generators in Rust. At the time of writing are [Zola], [Cobalt] and [mdBook].

mdBook wasn't a good choice for my as I wanted more control over the HTML generation and wouldn't benefit from the book-oriented approach. Between Zola and Cobalt I chose Zola, mainly because the proposition and documentation felt better.

Zola's selling point is offering a single binary with everything included.
Although this is quite an appealing idea, I knew it wouldn't tick all the boxes for me so I'm approaching as a two step process that should allow me to accomodate my taste but still benefit from lots that Zola has to offer.


The process is as follows:

- Write things in a convenient format depending on the task. E.g. notes are conventional yaml + markdown, bulletins are [TOML].
- Transform everything into toml + markdown as required by Zola.
- Let Zola do its job and trasform all that into HTML.

The implementation is slightly more involved. The first thing is to read every known source and store it in a normalised [SQLite] database.
Then, query it to compose each Zola-ready file with a convenient set of metadata.

For example, each sketch co-locates (denormalises) information about the author (me) and tools, bulletin issues are grouped by year. And of course, notes are preprocessed to transform blocks of code to generate diagrams.

Originally I thought Zola would handle the RSS feed generation but found it more convenient to generate it in the previous step.


## The result

The change has involved a fair amount of coding but the result ticks my goals.

- Cold builds can take up to 30 seconds.
- Takes 800 milliseconds to load the homepage. And up to 1.3 seconds to finish.
- Requires 8 requests. 3 of them are JavaScript.
- I have 19 direct dependencies. Which expands into a dependency tree of 176 nodes.

The less good things:

- Two binaries instead of just one.
- The code to maintain by myself is larger.
- RSS is difficult to control with Zola, ended up building my own.
- Code highlighting inlines styles. Not my choice.
- Move away from React back into templates is not great.


## Closing thoughts

TODO



[CommonMark]: https://commonmark.org/
[Gatsby]: https://www.gatsbyjs.com/
[GraphQL]: https://graphql.org/
[Jamstack]: https://jamstack.org/
[Markdown]: https://en.wikipedia.org/wiki/Markdown
[Material-UI]: https://material-ui.com/
[React]: https://reactjs.org/
[Rust]: https://www.rust-lang.org/
[SQLite]: https://sqlite.org/index.html
[SVG]: https://en.wikipedia.org/wiki/Scalable_Vector_Graphics
[TOML]: https://toml.io/
[YAML]: https://yaml.org/
[Zola]: https://www.getzola.org/
[dot]: https://en.wikipedia.org/wiki/DOT_(graph_description_language)
[Cobalt]: https://cobalt-org.github.io/
[mdBook]: https://github.com/rust-lang/mdBook
