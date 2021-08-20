---
title: Hakyll Configuration
date: 2021-08-08
unpublished: yes
---

### Migration

I recently migrated this static website from Pelican (with Python) to Hakyll (with Haskell).  Blogging about one's ownconvoluted Hakyll setup seems almost like a rite of passage, so here's mine!

### Pre-rendered KaTeX

### Pandoc Citations

### Fine-Tuning

* date last generated
* `fenced_divs` extension / markdown directive syntax

### Contributing to Pandoc / Citeproc / Hakyll

What I learned:

* I learned about the [`Uniplate` package](https://hackage.haskell.org/package/uniplate) for generic data structure traversals.  Apparently, list comprehensions support [pattern matching](https://en.wikibooks.org/wiki/Haskell/Pattern_matching#List_comprehensions)!
* I learned how to [configure](https://cabal.readthedocs.io/en/3.4/nix-local-build.html#developing-multiple-packages) `cabal` to compile `pandoc` against my local copy of `citeproc`.  I'm also using [remote versions](https://cabal.readthedocs.io/en/3.4/cabal-projecthtml#specifying-packages-from-remote-version-control-locations) of both `pandoc` and `hakyll`, until the latest changes make it into a release.  So, my Hakyll site can benefit immediately from the new changes :)
* I read most of the [CSL specification](https://docs.citationstyles.org/en/stable/specification.html), which will be useful later when I add citations to my [Noteworthy](https://github.com/benrbray/noteworthy) editor.

### References

LaTeX Math

Pandoc Citations

* jaspervdj, [`hakyll-citeproc-example`](https://github.com/jaspervdj/hakyll-citeproc-example)
* [Gist by mcmtroffaes](https://github.com/mcmtroffaes/homepage/blob/master/posts/2015-01-09-hakyll-and-bibtex.markdown)
* phiresky, [`url2cite`:  Automatic citation extraction from URLs](https://phiresky.github.io/blog/2019/pandoc-url2cite/) 

Pandoc Linked Titles

* StackOverflow, [Make pandoc link whole citation instead of only the year](https://stackoverflow.com/questions/45513465/make-pandoc-link-whole-citation-instead-of-only-the-year)
* pandoc-citeproc @ GitHub, [Adding option to link/color the entire citation, not only the year?](https://github.com/jgm/pandoc-citeproc/issues/268)

CSL

* CSL @ GitHub, [Feature request: hyperlinks on text](https://github.com/citation-style-language/documentation/issues/76)

Other

* Brouwers-Harries, [Last (git) modification time in Hakyll](https://clearairturbulence.co.uk/writing/last-git-modification-time-in-hakyll.html)