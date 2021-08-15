---
title:  Seam Carving
date: December 28, 2014
tags:  image-processing, algorithms
tools: javascript
thumb_url: images/thumbnails/seam-carve_thumb.png
demo_url: /static/seam-carving/index.html
github_url: https://github.com/benrbray/benrbray.github.io-source/tree/master/content/static/seam-carving
summary: "[Seam Carving](https://en.wikipedia.org/wiki/Seam_carving) is a classic dynamic programming algorithm for content-aware image resizing.  Rather than scaling or cropping, the seam carving algorithm resizes images by removing (or copying) horizontal and vertical slices of the image.  These slices, called *seams*, must cross the entire image, but are allowed to zig and zag around salient regions in order to avoid too much deformation.  "
---

<style>
figure {
  position: relative;
}

.eqheight {
  display: flex;
  width: 100%;
  align-content: center;
  justify-content: center;
}

.eqheight img {
  max-width: 100%;
}

.eqheight div {
  padding: 0.2em;
}

#seam-algorithm {
  display: grid;
  align-items: center;
  grid: 1fr / 5fr 3fr;
  grid-auto-flow: row;
  grid-gap: 1em;
}
</style>

[Seam Carving](https://en.wikipedia.org/wiki/Seam_carving) is a classic dynamic programming algorithm for content-aware image resizing.  Rather than scaling or cropping, the seam carving algorithm resizes images by removing (or copying) horizontal and vertical slices of the image.  These slices, called *seams*, must cross the entire image, but are allowed to zig and zag around salient regions in order to avoid too much deformation.  

Below, the image to the left was resized using my [seam carving demo](/static/seam-carving/index.html) to produce the image on the right.  Images of hot-air balloons are practically the best-case scenario for seam carving, since the salient objects in the image (balloons!) are mostly surrounded by empty space.  Click the link to try it out for yourself, in real-time, on a variety of test images!

<figure><div class="eqheight">
<div><img src="/static/seam-carving/img/balloons.png"></div>
<div><img src="/static/seam-carving/results/balloons-after.png"></div>
</div></figure>

Seam carving was first introduced by **[Avidan & Shamir 2007]** at SIGGRAPH.  Due to its simplicity and effectiveness, the algorithm has since made its way into computer science textbooks as well as commercial photo editing software.  To me, this technique is quite refreshing, and serves as a reminder that not all problems require a deep neural network!

<blockquote class="citation">
Avidan, Shai, and Ariel Shamir. <a href="http://www.faculty.idc.ac.il/arik/SCWeb/imret/index.html">"Seam carving for content-aware image resizing."</a> In ACM SIGGRAPH 2007 papers, pp. 10-es. 2007.
</blockquote>

Typically, seam carving implementations alternate between taking horizontal and vertical slices to reduce the height and width of an image.  For width reduction, the algorithm works in several phases:

<figure id="seam-algorithm">
<div>
<b>Energy Computation.</b>  Assign an *importance* value to each pixel in the image.  Common choices for the energy function include gradient magnitude, entropy, and visual salience.
</div>
<img src="/static/seam-carving/results/balloons-salience.png">
<div>
<b>Downward Accumulation.</b>  In a dynamic programming implementation of seam carving, the downward accumulation phase keeps track of, for each pixel, the value of the *minimum* energy path from this pixel to the top of the image.
</div>
<img src="/static/seam-carving/results/balloons-energy.png">
<div>
<b>Backtracking & Seam Removal.</b> Once downward accumulation is complete, a backtracking algorithm is recovers the lowest-energy seams for each pixel in the bottom row of the image.  The seams with the lowest energy are removed from the image.
</div>
<img src="/static/seam-carving/results/balloons-seams.png">
</figure>

Vertical resizing follows an analogous procedure.  To increase the dimensions of an image, low-energy seams are *duplicated* instead of removed.  Further variations exist for efficiently removing many seams simultanously, for intelligently cropping after no low-energy seams remain, and even for [seam-carving videos](https://www.youtube.com/watch?v=Ug2aDccYN3c)!