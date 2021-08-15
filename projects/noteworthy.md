---
title:  Noteworthy
date: September 16, 2020
tags: note-taking, math
tools: typescript, prosemirror, electron
thumb_url: images/thumbnails/noteworthy2.png
github_url: https://github.com/benrbray/noteworthy
demo_url: https://noteworthy.ink/
summary: An open-source Markdown editor with bidirectional links and excellent math support!
---

# Noteworthy

A free, open-source, local-first Markdown editor built with [ProseMirror](https://prosemirror.net/).

* Works directly with your **local** files, entirely **offline**.
* Write your notes in **Markdown**, plus a few optional extensions.
* Build your own personal wiki with **bidirectional links**.
* Excellent **math** support — seamlessly transition between source and rendered math, thanks to [KaTeX](https://katex.org/) and [prosemirror-math](https://github.com/benrbray/prosemirror-math).

## Excellent Math Support

Inline Math:

![inline math](/images/prosemirror-math/prosemirror-math_inline.gif)

Display Math:

![display math](/images/prosemirror-math/prosemirror-math_display.gif)

## Screenshot

> (screenshot taken 16 September 2020)

![screenshot from 16 September 2020](/images/noteworthy/noteworthy_16sept2020.png)

> (screenshot taken 17 September 2020)

![screenshot from 17 September 2020](/images/noteworthy/noteworthy_17sept2020.png)

## Feature Comparison

The table below compares Noteworthy to other editors with similar features.  Of course, each editor has its own unique features not listed!  For an even more detailed comparison, check out the [exhaustive feature comparison](https://www.notion.so/db13644f08144495ad9877f217a161a1?v=ff6777802811416ba08dc114e0b11837) put together by the folks at [Athens Research](https://github.com/athensresearch/athens).

![feature comparison](/images/noteworthy/noteworthy-comparison_16sept2020.png)


## Acknowledgements

* Thanks to [Marijn Haverbeke](https://marijnhaverbeke.nl/) for developing [ProseMirror](https://prosemirror.net/)!
* Thanks to [Hendrik Erz](https://github.com/nathanlesage) for keeping [Zettlr](https://github.com/Zettlr/Zettlr) open source!  When I started developing Noteworthy, I had no clue how to set up an Electron app or responsibly interact with the user's file system from Node, and the Zettlr source was a great reference.
* Thanks to Microsoft for keeping [VS Code](https://github.com/Microsoft/vscode) open source!  I learned a lot by reading the source of the VS Code tree viewer and plugin system.
* Thanks to [Fabio Spampinato](https://fabiospampinato.com/) for releasing the source to an early version [Notable](https://github.com/notable/notable)!