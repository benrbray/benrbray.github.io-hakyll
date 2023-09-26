---
title:  Digital Humanities &amp; German&nbsp;Periodicals
date: December 1, 2016
tags:  nlp, machine-learning
tools: python, js
thumb_url: images/thumbnails/deutsche-rundschau_thumb.png
banner_url: images/thumbnails/deutsche-rundschau_long.png
banner_comment: "Image <a href='https://twitter.com/FontaneArchiv/status/999271012591177728'>@FontaneArchiv</a>"
summary: "<p>As an undergraduate research assistant, I ran statistical topic models on a corpus of 19th-century German-language periodicals."

---

As an undergraduate research assistant, I spent three years as the primary developer for an NLP-driven web application built to assist a humanities professor with his research on 19th-century German literature.  The application allowed him to run statistical topic models (LDA, HDP, dynamic topic models, etc.) on a large corpus of text, and displayed helpful visualizations of the results.  The application was built using Python / Flask / Bootstrap and also supported toponym detection and full-text search.  
# Overview

As an undergraduate research assistant, I spent three years as the primary developer for an NLP-driven web application built to assist a humanities professor ([Dr. Peter McIsaac](https://lsa.umich.edu/german/people/faculty/pmcisaac.html), University of Michigan) with his research on 19th-century German literature.  The application allowed him to run statistical topic models ([LDA](http://jmlr.org/papers/volume3/blei03a/blei03a.pdf), [HDP](http://proceedings.mlr.press/v15/wang11a/wang11a.pdf), [DTM](https://mimno.infosci.cornell.edu/info6150/readings/dynamic_topic_models.pdf), etc.) on a large corpus of text and displayed helpful visualizations of the results.  The application was built using **Python** / **Flask** / **Bootstrap** and also supported toponym detection and full-text search.  We used [`gensim`](https://radimrehurek.com/gensim/) for topic modeling.

Using the web application I built, my supervisor was able to effectively detect cultural and historical trends in a large corpus of previously unstudied documents<span class="aside">This is a cheeky remark!</span>.  Our efforts led to a number of publications in humanities journals and conferences, including [[McIsaac 2014]](http://www.jstor.org/stable/10.7722/j.ctt5vj848.11):

<blockquote class="citation">
McIsaac, Peter M. <a href="http://www.jstor.org/stable/10.7722/j.ctt5vj848.11">“Rethinking Nonfiction: Distant Reading the Nineteenth-Century Science-Literature Divide.”</a> <i>Distant Readings: Topologies of German Culture in the Long Nineteenth Century</i>, edited by Matt Erlin and Lynne Tatlock, ed., Boydell and Brewer, 2014, pp. 185–208.
</blockquote>

## Motivation

Our analysis focused on a corpus of widely-circulated periodicals, published in Germany during the 19th-century around the time of the administrative [unification](https://en.wikipedia.org/wiki/Unification_of_Germany) of Germany in 1871.  Through [HathiTrust](https://www.hathitrust.org/) and partnerships with university libraries, we obtained digital scans of the following periodicals:

* *Deutsche Rundschau* (1874-1964)
* *Westermann's Illustrirte Monatshefte* (1856-1987)
* *Die Gartenlaube* (1853-1944)

These periodicals, published weekly or monthly, were among Germany's most widely-read print material in the latter half of the nineteenth century, and served as precursors <span class="aside">This is a longer remark that provides more detail about something in the main article.</span>to the modern magazine.  Scholars have long recognized the cultural significance of these publications (c.f. [[Belgum 2002]](https://books.google.com/books?hl=en&lr=&id=yGHo-Alkp84C&oi=fnd&pg=PR9&dq=belgum+2002+popularizing+the+nation+Audience,+Representation,+and+the+Production+of+Identity+in+Die+Gartenlaube&ots=VFwEvxdUUS&sig=kF6W0ktdb6BOcD1TY7Rdwtf_tsc#v=onepage&q&f=false)), but their enormous volume had so far precluded comprehensive study.

<figure>
<div class="img-gallery horizontal">
<img src="/images/dhgp/westermanns-cover.jpg">
<img src="/images/dhgp/gartenlaube.jpg">
</div>
<figcaption>Cover of <cite>Westermann's Monatshefte</cite> and front page of <cite>Die Gartenlaube</cite>.  Courtesy of HathiTrust.</figcaption>
</figure>

Using statistical methods, including [topic models](http://journalofdigitalhumanities.org/2-1/topic-modeling-a-basic-introduction-by-megan-r-brett/), we aimed to study the development of a German national identity following the 1848 revolutions, through the 1871 unification, and leading up to the world wars of the twentieth century.  This approach is commonly referred to as **digital humanities** or **distant reading** (in contrast to [close reading](https://en.wikipedia.org/wiki/Close_reading)).

## Preprocessing

Initially, we only had access to digital scans of books printed in a difficult-to-read blackletter font.  In order to convert our scanned images to text, I used [Google Tesseract](https://github.com/tesseract-ocr) to train a custom optical character recognition (OCR) model specialized to fonts from our corpus.  Tesseract performed quite well, but our scans exhibited a number of characteristics that introduced errors into the OCR process:

* Poor scan quality (causing speckles, erosion, dilation, etc.)
* Orthographic differences from modern German, including ligatures and the [long s](https://en.wikipedia.org/wiki/Long_s)
* Inconsistent layouts (floating images, multiple columns per page, etc.)
* Blackletter fonts which are difficult to read, even for humans
* The use of fonts such as Antiqua for dates and foreign words
* Headers, footers, page numbers, illustrations, and hyphenation

The examples below highlight some of the challenges we faced during the OCR phase.

<figure role="group">
<div class="img-gallery large">
<figure class="img-col-2" >
<img src="/images/dhgp/deutsche-rundschau-wikipedia.jpg">
<figcaption>From <cite>Deutsche Rundschau</cite>, courtesy of <a href="https://www.hathitrust.org/">HathiTrust</a>.</figcaption>
</figure>
<figure>
<img src="/images/dhgp/fraktur-antiqua-wiki.jpg">
<figcaption>Wikipedia, <a href="https://en.wikipedia.org/wiki/Antiqua%E2%80%93Fraktur_dispute">Antiqua-Fraktur Dispute</a></figcaption>
</figure>
<figure>
<img src="/images/dhgp/gartenlaube-1.jpg">
<figcaption>From <cite>Die Gartenlaube</cite>, courtesy of <a href="https://www.hathitrust.org/">HathiTrust</a>.</figcaption>
</figure>
</div>
</figure>

As a result, significant pre- and post-processing of OCR results was necessary.  We combined a number of approaches in order to reduce the error rate to an acceptable level:

* I used [Processing](https://processing.org/) to remove noise and other scanning artifacts from our images.
* I wrote code to automatically remove running headers, text decorations, and page numbers.
* Through manual inspection of a small number of documents, we compiled a list of common OCR mistakes.  I developed scripts to automatically propagate these corrections across the entire corpus.
* I experimented with several custom OCR-correction schemes to correct as many mistakes as possible and highlight ambiguities.  Our most successful approach used a [Hidden Markov Model](https://en.wikipedia.org/wiki/Hidden_Markov_model) to correct sequences of word fragments.  Words were segmented using [Letter Successor Entropy](https://www.sciencedirect.com/science/article/pii/0020027174900448).

With these improvements, we found that our digitized texts were good enough for the type of exploratory analysis we had in mind.  By evaluating our OCR pipeline on a synthetic dataset of "fake" scans with known text and a configurable amount of noise (speckles, erosion, dilation, etc.), we found that our OCR correction efforts improved accuracy from around 80% to 95% or higher.

## Topic Modeling

In natural language processing, <b>topic modeling</b> is a form of statistical analysis used to help index and explore large collections of text documents.  The output of a topic model typically includes:

* A list of <b>topics</b>, each represened by a list of related words.  Each word may also have an associated weight, indicating how strongly a word relates to this topic.  For example:
  * (Topic 1) <i>sport, team, coach, ball, coach, team, race, bat, run, swim...</i>
  * (Topic 2) <i>country, government, official, governor, tax, approve, law...</i>
  * (Topic 3) <i>train, bus, passenger, traffic, bicycle, pedestrian...</i>
* A <b>topic probability vector</b> for each document, representing the importance of each topic to this document.  For example, a document about the Olympics may be 70% sports, 20% government, and 10% transportation.

The most popular topic model is [Latent Dirichlet Allocation (LDA)](https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation), which is succinctly described by the following probabilistic graphical model.  There are $T$ topics, $M$ documents, $N$ words per document, and $V$ words in the vocabulary.

<figure>
<div class="img-gallery horizontal" style="align-items: center">
<!-- Graphical Model -->
<img src="/images/dhgp/pgm-lda.png">
<!-- Distributions -->
<div style="font-size: 0.8em">
$$\begin{aligned}
\text{hyperparameters}  &&& \alpha \in \mathbb{R}^{T}, \eta \in \mathbb{R}^{V}\\
\text{topics}           && \beta_t \mid \eta & \stackrel{iid}{\sim} \mathrm{Dirichlet}(\eta)          \\
\text{topic mixtures}   && \theta_m \mid \alpha  &\stackrel{iid}{\sim} \mathrm{Dirichlet}(\alpha)           \\
\text{topic indicators} && z_{mn} \mid \theta_m  &\stackrel{iid}{\sim} \mathrm{Categorical}(\theta_m)       \\
\text{word indicators}  && w_{mn} \mid z_{mn}    &\stackrel{iid}{\sim} \mathrm{Categorical}(\beta_{z_{mn}})
\end{aligned}$$
</div>
</div>
</figure>

Each topic $t$ is represented by a probability distribution $\beta_t$ over the vocabulary, indicating how likely each word is to appear under topic $t$.  LDA posits that documents are written using the following <b>generative process</b>:

1. For each document $d_{m}$,
  1. Decide in what proportions $\theta_m = (\theta_{m1},\dots,\theta_{mt})$ each topic will appear.
  2. To choose each each word $w_{mn}$,
    1. According to $\theta_m$, randomly decide which topic to use for this word.
    2. Randomly sample a word according to the chosen topic.

Of course, this is not how humans actually write.  LDA represents documents as <b>bags-of-words</b>, ignoring word order and sentence structure.  When topic models are used to index or explore large corpora, as was our goal, this is an acceptable compromise.  Given a collection of documents, LDA attempts to "invert" the generative process by computing a [maximum likelihood estimate](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation) of the topics $\beta_t$ and topic mixtures $\theta_m$.  These estimates are typically computed using <b>variational expectation-maximziation</b>.

## DHGP Browser

Using **Python / Flask / Bootstrap**, I built a web application enabling humanities researchers to train, visualize, and save topic models.  Features:

* Support for several popular topic models:
  * Online Latent Dirichlet Allocation (via `gensim`)
  * Online Hierarchical Dirichlet Process (via `gensim`)
  * Dynamic Topic Models (custom implementation based [[Blei 2006]](https://mimno.infosci.cornell.edu/info6150/readings/dynamic_topic_models.pdf))
* [Toponym Resolution](https://en.wikipedia.org/wiki/Toponym_resolution) for identifying and mapping place names mentioned in our texts 
* Full-text / metadata search using [ElasticSearch](www.elastic.co)
* Support for any corpus with metadata saved in JSON format.

I no longer have access to the most up-to-date version of `dhgp-browser`, but here are some screenshots from mid-2015:

<figure>
<div class="img-gallery col-2">
<figure>
<img src="/images/dhgp/dhgp-browser-3.png">
<figcaption>Topic View</figcaption>
</figure>
<figure>
<img src="/images/dhgp/dhgp-browser-2.png">
<figcaption>Topic Listing</figcaption>
</figure>
<figure>
<img src="/images/dhgp/dhgp-browser-1.png">
<figcaption>Corpus View</figcaption>
</figure>
<figure>
<img src="/images/dhgp/dhgp-browser-4.png">
<figcaption>Document Graph</figcaption>
</figure>
</div>
</figure>

# Miscellaneous

## UROP Symposium Poster

The poster below summarizes the progress made during my first year on the project, which I initially joined through the [UROP Program](https://lsa.umich.edu/urop) at UM.  After my first year, I was hired to continue working on the project as an undergraduate research assistant.

<a href="/static/dhgp/dhgp_urop-poster_benrbray.pdf">
<img src="/images/dhgp/dhgp-poster.png"></img>
</a>

# References

* **[McIsaac 2014]** McIsaac, Peter M. [“Rethinking Nonfiction: Distant Reading the Nineteenth-Century Science-Literature Divide.”](http://www.jstor.org/stable/10.7722/j.ctt5vj848.11) *Distant Readings: Topologies of German Culture in the Long Nineteenth Century*, edited by Matt Erlin and Lynne Tatlock, ed., Boydell and Brewer, 2014, pp. 185–208.
* **[Belgum 2002]** Belgum, Kirsten. [Popularizing the Nation: Audience, Representation, and the Production of Identity in Die Gartenlaube](https://books.google.com/books?hl=en&lr=&id=yGHo-Alkp84C&oi=fnd&pg=PR9&dq=belgum+2002+popularizing+the+nation+Audience,+Representation,+and+the+Production+of+Identity+in+Die+Gartenlaube&ots=VFwEvxdUUS&sig=kF6W0ktdb6BOcD1TY7Rdwtf_tsc#v=onepage&q&f=false), 1853-1900. U of Nebraska Press, 1998.