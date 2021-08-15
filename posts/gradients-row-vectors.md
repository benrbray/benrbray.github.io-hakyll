---
title:  Gradients are Row Vectors (and you can too!)
date:  2019-08-20
unpublished: True
tags:  calculus, linear-algebra
summary:  Mathematicians tend to agree that gradients are row vectors, but for some reason computer scientists can't get on borad with the idea.  The goal of this post is to explain why gradients are most naturally expressed as row vectors, and to demonstrate the advantages of this perspective.
---

$$
\newcommand{\grad}{\nabla}
$$

In this post, we will explore the following question:

> Should the gradient of a function $F: \R^n \rightarrow \R$ be a row or column vector?

The answer is quite controversial depending on who you ask!  Mathematicians tend to agree that gradient sshould be row vectors, but for some reason computer scientists can't get on board with the idea.  

The [matrix calculus entry](https://en.wikipedia.org/wiki/Matrix_calculus) on Wikipedia [endeavors](https://en.wikipedia.org/wiki/Talk:Matrix_calculus) to remain neutral, suggesting that perhaps the choice is inconsequental and both conventions have their merits.  **Wrong!**  I claim that the gradient-as-column-vector dogma prevalent in computer science is actively holding us back from a deeper understanding of derivatives!

# Derivatives and Linear Maps

**Def:** (One dimension) The function $f : \R \rightarrow \R$ is differentiable at $x \in \R$ if the following limit exists:
	$$
	f'(x) \equiv \lim_{h \rightarrow 0} \frac{f(x+h)-f(x)}{h}
	$$

Notice that if $f'(x) = 0$ exists, then it must satisfy

	$$
	\begin{align}
	f'(x) \equiv \lim_{h \rightarrow 0} \frac{f(x+h)-f(x)}{h}
	&\iff
	\lim_{h \rightarrow 0} {f(x+h) - f(x) - hf'(x)}{h} = 0
	\end{align}
	$$

An equivalent definition is

**Def:** (One dimension) The function $f : \R \rightarrow \R$ is differentiable at $x \in \R$ if there exists a scalar $a \in \R$

One can show that if such an $a \in \R$ exists, it is unique.  So we can unambiguously use the notation $f'(x)$ to refer to the unique derivative of $f$ at $a$.

# Bonus:  Differentiation as a Functor

Differentiation is a functor!