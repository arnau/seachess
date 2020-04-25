---
date: 2020-04-23
author: arnau
id: git-grafting
title: Git grafting
type: note
status: published
tags:
  - git
  - recipe
---

This note describes how to extract part of a [Git](https://git-scm.com/)
repository and _graft_ it into another repository.


<!-- end -->

The process detailed here is not the [only one nor the
fastest](https://github.com/newren/git-filter-repo/). But it's
straightforward enough and requires nothing but standard Git.

If you want to follow along, you can setup the scene running the
script in the [appendix section](#appendix) at the end.


## The scene

Let's set up the scene. We have a repository `forest` with information
about trees. We also have a repository `garden` with information about trees
we like.

The goal is to copy the `apple-tree` from `forest` to `garden` keeping its
history, i.e. preserving all commits related to `apple-tree` but nothing else
from the `forest`.

To twist it a bit, although we are interested in `apple-tree` we don't want in
our `garden` the `forest-apple`.

Our `forest` looks as follow:

```
forest
├── almond-tree
│  └── index.md
├── apple-tree
│  ├── domestic-apple
│  │  ├── index.md
│  │  ├── picture1.jpg
│  │  └── picture2.jpg
│  ├── forest-apple
│  │  ├── index.md
│  │  └── picture1.jpg
│  └── history.md
├── elm-tree
│  └── index.md
├── mango-tree
│  └── index.md
├── oak-tree
│  └── index.md
└── README.md
```

Our `garden` looks as follow:

```
garden
├── hazel-tree
│  └── index.md
├── orange-tree
│  └── index.md
└── plum-tree
   └── index.md
```

And we want our `garden` to look like:

```
garden
├── apple-tree
│  └── domestic-apple
│     ├── index.md
│     ├── picture1.jpg
│     └── picture2.jpg
├── hazel-tree
│  ├── ...
│  ...
├── orange-tree
│  ├── ...
│  ...
├── plum-tree
│  ├── ...
└── ...
```


## Preparation

This is a **destructive** process that will rewrite history to allow us to
preserve the information about historic changes.

First, clone the `forest` repository to a dedicated copy to preserve the
original `forest` intact:

```
git clone forest pruned-forest
```

Then, prepare the `garden`:

```
cd garden
git remote add pruned-forest ../pruned-forest
git checkout -b apple-tree
```

The above registers a remote `pruned-forest` pointing to the recently created
`pruned-forest` repository, creates a branch `apple-tree` and switches to it.
This way, if the result is not satisfactory you will only need to remove this
branch.


## Pruning the forest

Now it's time to remove anything we don't want to preserve. We need to change
the shape of `apple-tree`, our target directory, to our final needs.

```
cd ../pruned-forest
git rm -r apple-tree/forest-apple
git commit -m "Remove Malus sieversii"
```

This scenario is fairly simple, in more complex situations you will have to
move and remove files and directories until you end up with a directory that
contains the desired result.


## Rewriting history

This is the **destructive** step. We are working with the copy `pruned-forest`
so it's fine.

Note that Git (version 2.25.1) will prompt a warning. Ignore it for this task.

```
WARNING: git-filter-branch has a glut of gotchas generating mangled history
         rewrites.  Hit Ctrl-C before proceeding to abort, then use an
         alternative filtering tool such as 'git filter-repo'
         (https://github.com/newren/git-filter-repo/) instead.  See the
         filter-branch manual page for more details; to squelch this warning,
         set FILTER_BRANCH_SQUELCH_WARNING=1.
```

```
# still in pruned-forest
git filter-branch --subdirectory-filter apple-tree
```

Now the `pruned-forest` has exclusively the _content_ of the `apple-tree`
directory:

```
pruned-forest
└── domestic-apple
   ├── index.md
   ├── picture1.jpg
   └── picture2.jpg
```

Check the history with:

```
git log --name-status --oneline
```

You'll see all commits that at some point affected any of the contents of
`apple-tree` are preserved but no other commit is there.

Finally, we want to graft this into the `garden` inside an `apple-tree`
directory so let's prepare it this way:

```
# still in pruned-forest
mkdir apple-tree
git mv domestic-apple history.md apple-tree/
git commit -m "Move apple tree contents back inside an apple-tree directory"
```


## Grafting the garden

Last step. The `--allow-unrelated-histories` is the key to allow this kind of
grafting to happen.

```
cd ../garden
git pull --allow-unrelated-histories pruned-forest master
```

And with that, we are able to graft a different history into `garden`
preserving the history from `forest`.


## Appendix

The following bash script creates both `forest` and `garden` repositories.

```sh
#! /usr/bin/env bash

set -euf -o pipefail

add_tree() {
  mkdir -p "$1"
  touch "$1/index.md"
  git add "$1"
  git commit -m "Add $1"
}


## Create the forest

git init forest

cd forest

touch README.md
git add README.md
git ci -m "Add readme"

add_tree "almond-tree"
add_tree "apple-tree/domestic-apple"
add_tree "elm-tree"
add_tree "mango-tree"
add_tree "apple-tree/forest-apple"
add_tree "oak-tree"

touch apple-tree/forest-apple/picture1.jpg
touch apple-tree/domestic-apple/picture1.jpg
touch apple-tree/domestic-apple/picture2.jpg
touch apple-tree/history.md

git add apple-tree
git ci -m "Add apple-tree pictures and history"

cd ..

## Create the garden

git init garden

cd garden

add_tree "hazel-tree"
add_tree "orange-tree"
add_tree "plum-tree"
```

## Addendum

Git grafting is a big and diverse topic. This note barely scratches the
surface. Check [git replace](https://git-scm.com/book/en/v2/Git-Tools-Replace)
to see an example of splitting a repository in two _reconnectable_ parts.
