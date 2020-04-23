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

Also, at the time of writing Git (version 2.25.1) will prompt the following:

```
WARNING: git-filter-branch has a glut of gotchas generating mangled history
         rewrites.  Hit Ctrl-C before proceeding to abort, then use an
         alternative filtering tool such as 'git filter-repo'
         (https://github.com/newren/git-filter-repo/) instead.  See the
         filter-branch manual page for more details; to squelch this warning,
         set FILTER_BRANCH_SQUELCH_WARNING=1.
```

## The scene

Let's set up the scene. We have an old repository `forest` with information
about trees. We also have a new repository `garden` with information about
flowers.

The goal is to copy the `apple-tree` from `forest` to `garden` keeping it's
history, i.e. preserving all commits related to `apple-tree` but none of any
other thing from the forest.

To twist it a bit, although we are interested in `apple-tree` we don't want in
our `garden` the `forest-apple`.

Our `forest` looks as follow:

```
forest
├── README.md
├── almond-tree
│  ├── ...
│  ...
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
│  ├── ...
│  ...
├── mango-tree
│  ├── ...
│  ...
├── oak-tree
│  ├── ...
└── ...
```

Our `garden` looks as follow:

```
garden
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

This process is a **destructive** process that will rewrite history to allow
us to preserve the information about historic changes. Similar but not the
same.

First, clone the `forest` repository to a dedicated copy:

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
`pruned-forest` repository.


## Pruning the forest

Now it's time to remove anything we don't want to preserve. We need to change
the shape of `apple-tree` our target directory to our final needs.

```
cd ../pruned-forest
git rm -r apple-tree/forest-apple
git commit -m "Remove Malus sieversii"
```

This scenario is fairly simple, in more complex situations you will have to
remove and or remove files and directories until you end up with a directory
that contains the desired result.


## Rewriting history

This is the **destructive** step. We are working with the copy `pruned-forest`
so it's fine.

```
git filter-branch --subdirectory-filter apple-tree
```

Now the `pruned-forest` has exclussively the _content_ of the `apple-tree`
directory:

```
pruned-forest
└── domestic-apple
   ├── index.md
   ├── picture1.jpg
   └── picture2.jpg
```

If you check with `git log` you'll see all commits that at some point affected
any of the contents of `apple-tree` are preserved but no other commit is
there. If you look closer you'll see that the commits are not the same, they
_look_ the same.

Finally, we want to graft this into the `garden` inside an `apple-tree`
directory:

```
# still in pruned-forest
mkdir apple-tree
git mv domestic-apple apple-tree/
git commit -m "Move apple tree contents back inside an apple-tree directory"
```

## Grafting the garden

Last step.

```
cd ../garden
git pull --allow-unrelated-histories pruned-forest master
```

And with that, we are able to graft a different history into `garden`
preserving the history from `forest`.
