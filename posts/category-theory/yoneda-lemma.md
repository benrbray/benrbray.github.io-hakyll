---
tags: math, category-theory, yoneda-lemma
katex_macros: category-theory.katex
title: Yoneda Lemma
bib: bib/category-theory.bib
toc: yes
date: 2021-08-01
date_updated: 2021-08-10
summary:  Bridging the gap between formal and informal presentations of the Yoneda Lemma.
---

## Yoneda Lemma

> Note:  This post is mostly a retelling of [@riehl2017:category, §2.3] and [@milewski:ct4p-yoneda], with quite a few missing details filled in and a number of extra examples.

As discussed by [@milewski:ct4p-yoneda], 

> many constructions in category theory generalize results from other, more specific, areas of mathematics.   The **Yoneda Lemma** stands out in this respect as a sweeping statement about categories in general, with little or no precedent in other areas of mathematics, but with far-reaching implications.

For this reason, the Yoneda Lemma is called by some the **"first" theorem in category theory**.

### Prerequisites

* co/contravariant [[hom-functors]] act on Hom-sets by post/precomposition
* [[representable-functors]] are naturally isormorphic to $\Hom_C(x,-)$ or $\Hom_C(-,y)$

### Introduction

Quoted from Milewski

> We have seen previously that some $\Set$-valued functors are [[representable]], being naturally isomorphic to a co/contravariant [[hom-functor]].  The **Yoneda Lemma** reveals that *all* $\Set$-valued functors can be obtained from hom-functors through natural transformations, and explicitly enumerates all such transformations.

> In fact, a natural transformation between a hom-functor and any functor $F : C \rightarrow \Set$ is completely determined by specifying the value of a single component at just one point!  The rest of the natural transformation follows from naturality conditions, which evidently are quite restrictive!

Moreover, the **Yoneda Lemma** helps to clarify the relationship between representable functors and [[universal-properties]] by answering the following questions (Riehl):

* If two objects represent the same functor, are they isomorphic?
* What data is involved in the construction of a natural isomorphism between a representable functor $F : C \rightarrow \Set$ and the functor $\Hom_C(c,-) : C \rightarrow \Set$ represented by an object $c$?
* How do the universal properties expressed by representable functors relate to initial and [[terminal-objects]] ?

The Yoneda Lemma is often stated in the language of [[presheaves]] .  There is also a version Yoneda Lemma for [[enriched-categories]].

### Informal Characterizations of Yoneda

We have previously seen that

Roughly, the Yoneda lemma says that an object in a category is no more and no less than its web of relationships with other objects, formalizing the idea that categories allow for [[point-free]] reasoning.

From [[milewski:ct4p-yoneda]] ,

> One way of understanding the Yoneda lemma is to realize that natural transformations between **Set**-valued functors are just families of functions, and functions are in general lossy -- a function may collapse information and it may cover only parts of its codomain.
>
> The only functions that are not lossy are the ones that are invertible — the **isomorphisms**. It follows then that the best structure-preserving **Set**-valued functors are the representable ones. They are either the hom-functors or the functors that are naturally isomorphic to hom-functors.
>
> Any other functor `F` is obtained from a hom-functor through a lossy transformation. Such a transformation may not only lose information, but it may also cover only a small part of the image of the functor `F` in **Set**.

### Formal Statement

Let $C$ be a locally small category.  According to [@riehl2017:category], natural transformations $\eta : \Hom_C(x,-) \Rightarrow F$ whose domain is a **represented functor** are completely determined by the choice of a single element, which lives in the set $Fx \in \Set$ defined by evaluating the codomain functor $F : C \rightarrow \Set$ at the representing object $x \in C$, and moreover any choice is permitted.

:::: {.container data-name=theorem}
(Yoneda Lemma) Consider a locally small category $C$.  For any object $x \in C$ and any (covariant) functor $F : C \rightarrow \Set$, there is a bijection $\Phi$ of sets

$$
[C,\Set]( \Hom_C(x,-), F) \cong Fx
$$

that associates each natural transformation $\eta : \Hom_C(x,-) \Rightarrow F$ with the element $\Phi(\eta) \equiv \eta_x(\id_x) \in Fx$.  Moreover, this correspondence is natural in both $x$ and $F$.

::: {.container data-name=proof}
We prove the bijection $\Phi$ by manually constructing an inverse $\Psi$ and showing that the two maps are mutually inverse.  For naturality, see [@riehl2017:category], Sec 2.2.

* The inverse map $\Psi : Fx \rightarrow [C,\Set](\Hom_C(x,-),F)$ must send each $p \in Fx$ to a natural transformation $\Psi(p) : \Hom_C(x,-) \Rightarrow F$, with component morphisms satisfying the naturality squares depicted below, for all $f : a \rightarrow b$ in $C$.

  ![](data\:image/png;base64,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)
* To define $\Psi(p) : \Hom_C(x,-) \Rightarrow F$ for a particular $p \in Fx$, consider the image of the morphism $\id_x \in \Hom_C(x,x)$ wrt each path in the naturality square above.  Our choice is constrained by the following naturality condition:
  $$
  \Psi(p)_b f = (Ff)( {\color{green} \underline{\Psi(p)_x \id_x}} ) \qquad 
  \forall\, f : x \rightarrow b, \forall\, p \in F x
  $$
* Our inverse map must obey $\Phi(\Psi(p)) = p$ for all $p \in Fx$.  Applying our explicit formula for $\Phi$ results in following constraint on $\Psi$,
  $$
  \Phi(\Psi(p)) = {\color{green} \underline{\Psi(p)_x \id_x} } = p \quad \forall\, p \in Fx
  $$
* These two constraints uniquely determine the inverse map,
  $$
  \Psi(p)_b f = (F f) p \qquad \forall p \in Fx, b \in C
  $$
* This choice of $\Psi(p)$ guarantees that the naturality squares for any $f : x \rightarrow b$ commute, but we must verify naturality for generic $f : a \rightarrow b$ with $a,b \in C$.  So, consider the image of any $g : x \rightarrow a$ along both paths.
  $$
  \begin{aligned}
  \text{\color{gray}(top-right)} &&
  (Ff)(\Psi(p)_a g) &= (Ff)(Fg)(p) \\ &&&= F(fg) p = \Psi(p)_b (g ; f)
  && \text{\color{gray}(left-bottom)}
  \end{aligned}
  $$

Hence $\Psi(p)$ is a valid natural transformation. To show $\Psi$ and $\Phi$ are mutually inverse,

* By construction $\Phi(\Psi(p)) = \Psi(p)_x (\id_x) = F (\id_x) p = \id_{Fx}(p) = p$.
* To show $\Psi(\Phi(\eta)) = \eta$ for all natural transformations $\eta : \Hom_C(x,-) \Rightarrow F$, we check componentwise equality.  For all $f : a \rightarrow b$,
  $$
  \begin{aligned}
  \Psi(\Phi(\eta))_a f
  &= \Psi(\eta_x (\id_x))_a f & \text{(expand $\Phi$)} \\
  &= (F f)(\eta_x (\id_x))    & \text{(expand $\Psi$)} \\
  &= \eta_a (f)               & \text{(naturality of $\eta$)}
  \end{aligned}
  $$
  The last step follows from the naturality square for $\eta$ and $f  : a \rightarrow b$ .
:::
::::

### CoYoneda Lemma

There is an analogous **coYoneda Lemma** for contravariant functors.


:::: {.container data-name=theorem}
(coYoneda Lemma) Consider a locally small category $C$.  For any object $x \in C$ and any contravariant functor $F : C^{op} \rightarrow \Set$, there is a bijection $\Phi$ of sets

$$
[C^{op},\Set]( \Hom_C(-,x), F) \cong Fx
$$

::: {.container data-name=proof}
Apply the Yoneda Lemma to $C^{op}$.  Formulas for the forward $\Phi(\eta) = \eta_x(id_x)$ and reverse $\Psi(p)_b h = (Fh) p$ bijections are the same as before.
:::
::::

## Yoneda Embedding

Let $C$ be a locally small category.  An important special case of the Yoneda lemma is when $F = \Hom_C(-,y)$ is another [[hom-functor]], leading us to the **Yoneda Embeddings**.  The following definition is a special case of the bijection $\Psi$ used in the Yoneda proof.

::: {.container data-name=definition}
The (covariant) **Yoneda Embedding** is the covariant functor

$$
\begin{aligned} Y : C &\rightarrow [C^{op}, \Set] \\
x &\mapsto \Hom_C(-,x) & \text{(objects)} \\
(f : x \rightarrow y) &\mapsto (- \fcmp f) & \text{(morphisms)}
\end{aligned}
$$

sending each object to its contravariant Hom-functor, and each morphism $(f : x \rightarrow y)$ to the natural transformation $(-\fcmp f)$ defined by the $f$-postcomposition.
:::

See [[hom-functor]] for details about the natural transformation $(- \fcmp f)$.  Before proceeding, we should verify that the map $Y$ is indeed a covariant functor.

::: {.container data-name=proof}
The morphisms $f : x \rightarrow y$ and $g : y \rightarrow z$ in $C$ are sent by the Yoneda embedding to the natural transformations

$$
\begin{aligned}
Yf &= (- \fcmp f) : \Hom_C(-,x) \Rightarrow \Hom_C(-,y) \\
Yg &= (- \fcmp g) : \Hom_C(-,y) \Rightarrow \Hom_C(-,z) \\
\end{aligned}
$$

We must show $Y(f \fcmp g) = (Yf \fcmp Yg)$, where the composition $(f \fcmp g) : x \rightarrow z$ has image

$$
Y(f \fcmp g) = (- \fcmp (f \fcmp g)) : \Hom_C(-,x) \Rightarrow \Hom_C(-,z)
$$

whose components $(- \fcmp (f \fcmp g))_c : \Hom_C(c,x) \rightarrow \Hom_C(c,z)$ act on morphisms $h : c \rightarrow x$ as

$$
\begin{aligned}
\left[ Y (f \fcmp g) \right]_c h
&= (- \fcmp (f \fcmp g))_c h     \\
&= (h \fcmp (f \fcmp g))         \\
&= ((h \fcmp f)) \fcmp g)        \\
&= (- \fcmp g)_x (h \fcmp f)     \\
&= (- \fcmp g)_x (- \fcmp f)_c h
 = [ Yf \fcmp Yg ]_c h
\end{aligned}
$$

where the middle step relies on associativity of function composition.
:::

The most useful fact about the Yoneda functor is that it is [[fully-faithful]], meaning that we always have a bijection between hom-sets in the domain and image of $Y$.

:::: {.container data-name=proposition}
For a locally small category $C$, the Yoneda Embedding $Y : C \rightarrow [C^{op},\Set]$ is a [[fully-faithful]] functor, embedding $C$ as a [[full-subcategory]] of $[C^{op}, \Set]$.

::: {.container data-name=proof}
We must show that the maps $\Hom_C(x,y) \stackrel{Y}{\rightarrow} [C^{op},\Set](\Hom_C(-x,), \Hom_C(-,y))$ are surjective (full) and injective (faithful) for all $x,y \in C$.  Choosing $F := \Hom_C(-,y)$ in the coYoneda Lemma gives a bijection $\Psi$ between these same sets.

We claim $Y = \Psi$.  The inverse bijection $\Psi$ maps each morphism $f : x \rightarrow y$ to a natural transformation whose component morphisms $\Psi(f)_c : \Hom_C(c,x) \rightarrow \Hom_C(c,y)$ act on morphisms $h : c \rightarrow x$ in $C$ by the formula

$$
\Psi(f)_c h = \left[ \Hom_C(-,y) h \right] f = (- \fcmp h) f = (f \fcmp h) = (f \fcmp -)_c h
$$

Thus $\Psi f = (f \fcmp -) = Yf$ coincides with the Yoneda embedding on $\Hom_C(x,y)$.  Since $\Psi$ is a bijection, the maps $Y|_{x,y}$ are injective and surjective for all $x,y \in C$.
:::
::::

By now, it should be clear that we did not pull the Yoneda embedding out of thin air -- instead, $Y$ is the result of applying the Yoneda Lemma to the functors $\Hom_C(-,x)$ and $\Hom_C(-,y)$ for all pairs $x,y \in C$, and assembling the resulting bijections into a functor.

:::: {.container data-name=corollary}
In a locally small category, $\Hom_C(x,-) \cong \Hom_C(y,-) \iff x \cong y$.

::: {.container data-name=proof}
Every [[fully-faithful]] functor reflects isomorphisms.
:::
::::

### Contravariant Yoneda Embedding

Naturally, there is a contravariant Yoneda embedding found by applying the above to $C^{op}$

> [[todo]] : according to a comment on Milewski's blog, the coYoneda embedding functor is also known as the [[free-functor]].  

::: {.container data-name=proposition}
The contravariant **Yoneda Embedding** is the contravariant functor

$$
\begin{aligned}
Y : C^{op} &\rightarrow [C, \Set] \\
x &\mapsto \Hom_C(x,-) & \text{(objects)} \\
(f : x \rightarrow y) &\mapsto (f \fcmp -) & \text{(morphisms)}
\end{aligned}
$$

sending each object to its covariant [[hom-functor]] and each morphism $(f : x \rightarrow y)$ to the natural transformation $(f \fcmp -)$ defined by $f$-precomposition.  The functor $Y$ is [[fully-faithful]] and embeds $C^{op}$ as a [[full-subcategory]] of $[C, \Set]$.  Consequently,

$$
\Hom_C(x,-) \cong \Hom_C(y,-) \iff x \cong y
$$
:::

### Yoneda and Universal Elements

See [[universal-element]] for the connection between Yoneda and [[universal-properties]].

### Yoneda Embedding / Evaluation

> this section is incomplete ! [[TODO]]

The pair $(x,F)$ in the statement of the Yoneda Lemma defines an object in the product category $C \times \Set^C$, where $\Set^C$ denotes the category of functors $C \rightarrow \Set$ and natural transformations between them.

We can think of the bijection maps $\Phi_{(x,F)}$ used in the Yoneda Lemma as components of a natural isomorphism $\Phi$ between two functors we will now introduce.

* The **codomain** of $\Phi$ is the covariant bifunctor $\ev : C \times \Set^C \rightarrow \Set$ defined by the evaluation map $(x,F) \mapsto F x$.
* The **domain** is the covariant bifunctor $G : (x,F) \mapsto \Hom_{Funct}(\Hom_C(x,-),F)$

For details of how the domain functor is constructed, see [@riehl2017:category].  The Yoneda Lemma guarantees that this bifunctor is valued in the category of sets.  Now, taking the Yonda Lemma together for each $(x,F)$ pair asserts that evaluating the representing object's identity morphism defines a natural isomorphism

![](data\:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR4AAACuCAIAAABvFvVAAAAgAElEQVR4Ae2de1gTV/rHx/a3DvU21PoYtZUgWpJCJVArQa0kXgOKBOxi0AqBqgRdNWmrBrUqKhqqFaxVwq5ovAIt1Gh1CSIrKiJWrenjskTxElktcVfX0JujtTK/Z3KBJARISCZMyMkfMHPmzHve833PZ85lZhIIAx+gAFCAAAUgAmwCk0ABoAAG0AKNAChAiAIALUJkBUaBAgAt0AaAAoQoANAiRFZgFCgA0AJtAChAiAIALUJkBUaBAgAt0AaAAoQoANAiRFZgFCgA0AJtAChAiAIALUJkBUaBAgAt0AaAAoQoANAiRFZgFCgA0AJtAChAiAIALUJkBUaBAgAt0AaAAoQoANAiRFZgFCgA0AJtAChAiAIALUJk7Xqj2nNi/qaLaJONnqhkC1ILbtmYGc+mLhLw81Q227fBMnpBMjet4pENOd0jC0DLPeJkp5f1OTGRmcrfbDxLW7GCxSvS2JjbmE0jF7AEx7XGXSf8R69tZnO2q144wRQJTHg8WtoTfAadinhBEATBA2mM6FzVC7UskUHzRfAkCKH6M3h5ahKEynYXGmTxDMFx1MYT0EvCYNZ2dScadH0OOzC14lcby7ElG1ohorF2upfabdXL49HSCfNEngxDcFj2TROZGvdGDITg8fs0nWhzJma6YPPyiuDgNOUfNpbcIIuncg92rvN5XJBEYe20t7tr17FrK4Lfci6u7RZH4EGAFi5ukw4ttrQ1WlPcD61qMY22+KKtbebB3oghEbKHtma3yKct5nqHd6rHszDUsns1bZQv3+Yut+U80m0BtPCQOAEtW4dfhLeAq2mjvHlFtrqDsxGa2fnpTV1WGKXzZFoTA1UkU+y4NFgzQY40gBYeB9vQQtXyT3kcDofL5bCi0+S3dM23Pos9CIYgmLFMId8i4MdzmXQqc8FRtVohWcTjxTBpNJbwhFOHTO03nMa9EUOCJf80yYSqZIu5nDAGK8O4YFiXxR4RL9etxVWLad5xRzu/0IceiffxFVaaFOfwpiqL6TVln9bWtU2HyyPKAEALV1aHFoRQgxgmHyrSA4JbBoTqgngqbcEZfci15wT0YfEF93VhQS+I3oYQnwjJFRw2tFLg2xOhhqdV/w/fqxbTYH9Rta0zH4fjXLc5+FWzbkS5jScs16p3Mb2MbuBtl5pagbv0RJ6MUG0fPVrx7oLobYRrcydpxUCrJO1hjleQ7XPFVueTJQGghUei414LLecP6m3aG1xNGwNT55/RXe+vpo2B4BmFhgtt3eaw/jAnz7AwoNnD8vKKl//iqoBfXurbN6agpbirkkW56hcN0mk9kbijOg8fy2b2NHr7WDYTpi37wQHncB2aK+uAnZZT0RNcL6oLL0YtJTt3C6CF69kxWtViGgSb9gYN0mkw5K+/uNZKxsGUhDOGyNRnhfX35h037LkcLSG9nylaOjce5LAHGCdgaEnSCJiZcV13wApa6KVsfjyvzc/SQvNlelvQ0siXt2mPx4vPLjebGQK0DE2nW/zrGK0KMRWC2dJ7zdW1QKsnZb4ZWvxmtA5zvF7R9VrXNrOHwjBCpek+FG+6Y1MUbfXXcis3hVsNCDEM0xzmeHnHFOiXAa+toPcbJDilrwgYEDYH1OkboNfCJTWgZeW+lnGupS3mefeiiy83B+Bq2iiYYlgAwHstaodoYZg6h8VYpl8Wf1yQwpZcabbWiY2raWPMb8TpbeC340wHrnhqtZgKjzYsket6USNmukOIU5cxtA+0Zn2Q/TUDyxj2a0beM9q5ZZxrvGVcmx2JmC1jDGFLa/RVwgdF7Q4IDSM0I1qoof3VZXHeRJAZhVpNPp9BQUK3q15ckHBoCEJjhjMZDBotbp9h9FUvF06mUfEPjXdIg93IYgdSEC8Y8TGmtGh7QfSOcexnTFRlMeAg3Qp742khE4ZHtzxM5IzF9xZQNcVc75cRxx6nQBWpFMemf8Zqd/F/j++18Aedgg0POiE+7T7o1KiULeawWBwOh8WKFhXU6BffZfz38LVECKYyorcrCgXMtyhwDwj2YbAyFPJlTJpuaZ4SxBaXY+ocphc+IKQiSLz8uS7ylSm+U3ULzXWbw8J0rR/Nj3kjWFyJYtjp1ED97K42O5LGy1OjTZjmuwL59/peoY1eC0MVqVTL+0KNFZJoJnMql8tl0XpD1MXGsSuGYfjNA9M5pH3tUVvMHTS1+eqDaU8J6K/ByIzCzq/mY/gtY+N41T5nSJbb49FyZTyMvVZJEiNJ0Q5aw/TgnRaGROCzOzQ/ZljrNcZmtFCN+RAMrRTQGaaL11rVDziW+OfaimDEok9rkMZQHHjQicrNM79rh5akpjpwo+za5uC3usHyIIaB39fqCrRMytT1WpoX+N0wOsPYaw2L14FnRAurlUygcncq0SYMX77bpp+t1UomBIsrMe0Jnm+0cd3fYPiOdBpdcMow5VHjq//62RdaIabBPpZP6KGVAgYr13zdz8TDdjbrc9jviKrNH89FL4n5uzr9fC1aIWJwLFhtxwFSHwK9lsvCY1whZGWY3EdqLBGG0xhMJjOYSvGmMhdkLsaHlwg1XJKdxkC8YEqQSPErhtXLxVEMfF4VGi/V3ZjWvTHFYwwzS2mpSl1OxATDSyXVYhoSmlb9K6Y9Jwx+PVh4qvWTuFqFsLMvlVhYQ69K5qYqOvvOFXptMycit/NPXbXUnwxbAC0yRIEAH1pehazP50/DH87icFNlV1pzpSsbddKrkI2q6to2iuiwjuBVyA4lAhmAAkABMNcCbQAoQJACYEBIkLDArKcrANDy9BYA6k+QAgAtgoQFZj1dAYCWp7cAUH+CFABoESRs15htanL7l3O7RjgCSgVoESCqU002NTU9evTo1q1bly5dKi0tLSwszMnJ2bRp0yeffDJv3rzY2Fg2mx0UFOTj49OnTx8/P7+33357+vTpCxcu3Lx586FDh86dO3f37l2negSM2aQAQMsmmVyW6ebNm3/9619TU1PDwsLodPrAgQNhGB48eHBAQMC4ceNmzJiRkJAgFArT09N37Nhx4MCBEydOVFVVqVQqjUbz7Nmzp0+f3rhxo6ysLC8vb926dcnJyZMmTXrzzTd79uw5YsSIiRMn8vn8NWvW7N69++TJk9evX3/y5InLquZpBQG0uj7iDQ0Nhw8fnj9//vDhwwMCAhYvXnz8+PHvv//+9u3bWm1nn21oVa36+vrKysr8/PzMzMxFixZFRUWNHDkSQZAhQ4YkJSVt27bt5k3T74prdT5IsFMBgJadgjkp+88//3zs2DGRSBQUFESlUpOSkvbv3//vf//bSebtMPPw4cPLly+npaUFBAQwGIw1a9ZcvtzyxqcdhkBWcwUAWuZ6ELnX1NRUXl6+evXqsWPHvvbaa3/+85937dqlUqmILNM+27W1tZmZmWPHjvX19V26dOmpU4b3/O2zAnLrFABoEd4QLl68KJFIpk6dCsNwZGTkli1byN8t/Pjjj1KpdNq0ad7e3omJicXFxb///jvhSnWvAgBaRMXzl19+2bBhQ2Rk5Pjx49euXVtRUUFUSUTa/e233woKCmbPnt27d28ul7tnz56HDzv7LdZE+klC2wAt5wfl5s2bixYt6t+//8aNG7vTElxJSUlqauqQIUPYbHZWVlZdXZ3ztetGFgFazgxmZWXlzJkzAwICdu/e7Uy7JLNVVVUlFovff//9+Pj42tpaknlHFncAWs6JRFFR0dixYydOnHj8uPEbCJ1jmNRWvvnmGwaDMWfOnOvX9V8ZSmpvXewcQMtRwXfu3Dl8+PA5c+aQf3HC0aq2cX5RUdHIkSPnzp0LhoimCgG0TNWwY/vRo0erV6/u1avXRx991CX3o+zw1SVZv/rqq8DAwISEBHDrWa83QMvudldTUzN//vzBgwdv2bLl+XP9d57ZbaS7nlBYWBgQEMDn82/dsudHx7ujHAAtO6JaXl4eFRUVEhKyf/9+O07zvKz5+flvvfVWcnLynTt3PK/2hhoDtGwK/cWLF2NjYyMjI0+ePGnTCSAThh06dIhGo82bN88zH70HaHUMgVAoHD9+PFhl7lgpazkOHDjw5ptvzp8/v76+3trxbpsG0GovtAqFYuDAgTk5Oe1lAsdsUGD//v0jRoxISUnxnCUfgJb1dtHU1JSQkBAdHe3E1zqsl+RJqTKZLCgoaMOGDZ5QaYCWlSgfOnQIhuHCwkIrx0ic9KvuQ2IHDa5t3LgxNDT03r2W3wEkv8+d8BCgZSbaw4cPo6KikpOTzVLdZGfixIljx451C2eVSqWfn1/3HmkDtFqa4pdffjlkyBD3XQP09/enUqkt9SH9llAonD59+tOnT0nvaWccBGjhqtXV1Y0ZM+bjjz/ujITkOOfkyZMffPBBcnKyez3EWFZW1rdv36KiInKo6EwvAFpYenp6YGDglSsO/bKwM2Niv63Dhw/TaDT9eSNHjtyzZ4/9NrryjDlz5vD5/K70gICyPRqt6upqOp2+adMmAoR1hcm7d++eO3duxowZ7777rkgk0heZnp4eFhbG4XDOnj2rVnf6R+Rc4b9pGfn5+a+99pqbvjBqWpHmbc9FSygUhoeH3759u1kL99oIDw8fPnz47NmzS0pKtm3bZorW+vXry8vLExMTR4wYMXr0aHep188//zx16tRPPvmktcMZGRn79u1rnU7mFE9E6/Tp093gRvCzZ8+aG1ZrtJoPud0DxDt27KDT6TU1Nc1VuHv37tSpU5t33WXDE9Gqq6trbGx0lwjZ4mc7aNlyOtny3L59OyQkJDMzU+9YUVHRnDlzyOZkh/54IlodiuJ2GboZWnr916xZ89577z148EAqlX7++eduFxSAltuFzIrD3RItDMO+++67oUOHrly5Mjw83Eq1yZ0E0CJ3fGzzrluipdVqs7Ozk5OTQ0JChg4d6nbvVgK0bGu85M7V/dBSq9XTp09fsWLF+fPnS0tL165dGxYWRu4gWHoH0LJUxB33ux9asbGxFoFwu6VOgJZFBN1yt/uh5ZZhMHcaoGWuh3vuAbRIGDeAFgmDYrdLAC27JSP+BIAW8RoTXwJAi3iN7S4BoGUpGaouyxbO5nC4PD5fIBBI5N8rZQvSFL9a5iPTPkCLTNEw+ALQMg1KY3V2HI0Rl13xI2pIRmuzIxF4yj4tqX/ZHqBlGkWSbAO0mgOBXpVMQKhxRzUvmpPwDVUWk7NTY5ZEuh2AFulCgmEOoaVRHssWxLJovgj+odBYC/Yp/4dhjafFUaKKP0hY2/ZcUq5jwEhMwX3LPJoymaJVomWmLt4HaHVxAKwV31m0NOck3LcR2Icl2KVQNuiHT1rlQT6Txee9g8AzCgkYQWkqvuQxhyEwBMEDaawF2dmLGNQZ+yw6GWuVtCENPZ3qDyFxR1FSD/zaqognoqUuE3PfoSJeEARTGFNF0mwezTeJTFPizqClrf6SQ3kZpsXtU/1mEWy0WkyDesCsz53+dqu2YgUN7gFTQnmCpUJBLIPyEgRBEDw6U2U+frNwyGIXvVaQLVWoW5/yIIc9AGa2drtRWXFVa2GEfLu2o3VBwmEwGLoWCcEUfwaDmdS6oyZfBS090hznUf8EwT4sXopQmMSh9ccbAwRHyOz6MdjGatl2WcWPlsadtG83WqhqF8v7JYgaV2ilgWIYVpkyqE+w+LKT3Gs2U5/DHgBR4gqb+yj1IY73S3ajVSGiQjBberPZrnEDLYn3gRkZFj/Ahip3CqUt7+QZM5Puv+1o6V1vkMXC0MAkhbv+zMrVtDEQ5J9a8cgQCfTG5rD+OrTs+W5D9ATP62Uv7kHjkpWTw2onWuilFcEIBA2MlxtrZenP5RX0Ye1MtFDlSUWrvk5vA1W1eQjDKgW+PWGW6XICWpJEheDR260TbumWYb9CRIHgsOzWaGGochsT8U+St0yrtNW7heJip3e/bXjmULJdaGnV3+ULQiGoH1tSrtI8cajgrjkZPRI/BIJnmI7eH8tmwvb2WugJrtdLXtyDBI1K7EPrjnQaPtNhWl7dTRSuL5DsVbYzY1EX8Zmc7UrLkaS2+nMOM8Fyda7FLj5gg+CgVPmtlmuM5ju5wny0htYrJPNYtMEwBCOUII7wkMrgCVqSNEI3ZrD4Y9aDaZUHBZwwJisaH3OKxdnyf7WU1eIJGbdsREtT8SWfGczib8rmvwtDMIMzi0UdROMuP6q2DAcZK2niU61kHAT1CxOXt6zcovUVcoXKdIbfZmPAGmTxiEVD0O168w45ETO70Lq2IrgXBMFsa1d9k4p3tKk+zmey0pp7cwzTVqxhMReUNg/2rBlAq9cyEXx+hVBDufwV2QUlZjpiGIZe28wehE9qmdF8gYDH8oMhiMLJ03c7asUOsVAo5I2CIYjKWiA0fMQFrSC3VjjZ02xBS1uxggF7BUuuoBimHxCmVvxhEI0yZZ9dnX+X66E9JaD3xWdXFH8WN0Usza9QPzZzqt3GgKq+lYhFQmEsDeoB0aY2NwaJ3Jk/t2cPWpo9LK+XIMg/TenwwrqmTMAME+kWtTWKFSzWkva50quGqorEvAk0yiuGKw7inySrae5YrkrGwfgg57zxwtNYkvQWBPmIqk28bXtAaBYYd9uxAa3GvREDm2PXghaG6YZSEN3502OCRdRekglnMmmvwobW0C9M2DJ6t6kxkGhAqFyHUw7PKGxzvIeqKirUbR4111pTJmSF8YTxTNbyM6b9uHkua3uoVnVRLv2YQ+0Nwf5p1fpHkC4L6V4QHMQ1XoLw/9xA2GJm5bloPWgLrScFs2EIogsrrUntBmmo5nqF/AsB83UIj/U/dR7b1hhIhJYqi+nVA0LmlrYluLaYx8r4oa2jlun4M0QUxCfCynqdZVYMQ9XVxxT4/WiTj3IdA+rhKziFJ+lWe6yNn82Hr56LFqZVCGkwHCbBG59Jr6Xr25HxuXbdwzAJQpdsoqqzcsW/jMMTnQsovtAF6dd4bWwMJEILuyz0hSF4fBuLco2nRVPiTVbY2hUdrZXyGJydSs0POTFj403GdW2cpVshtFgcR8t53i978Yp0Y8JrK+heECXhqHkHiGq1zSNG3LIZWuhpYTjNjmtBG66RINmGASHupUaxlctgcIS7ZIL3YKhfhGSPhD+RwVogc7MJp36FcIr50wK6ES91/hm8orY1BnO0NHIBgxHtxDmnPXMtDLsjnYbgg4dTZhcMvDKNFyTRLOGJVulW2x2qzOYyuHmG5Tv0xl7euBhpy6zJ2jmVKYP+BMFBItPFD7mACsHBusswhmG12RPxJQruTqWRLlR3F8s4SNBZ1Y1pfQWncN7Qcr7vnyDaMpu7WWt+kSPNRrR0zqIa5RkZPwhffBcXV6vMZ//kqE5HXqD5Mfh6VZhuScaQWXefE+bk6dcMbWoMWDl/0P9BDH0DaMyPeaPtbqMjj6wdtw8tDHtwJGk0DPUL5u80rsmg6uqvxNwJMRKTlVBrJRnTcAiZ/EPm94vq8+PHxWTji1dtfHRo4UtCAxmcWQKBUMCbQIV7wLSEUiNIGFa3N8YfHxMi/ixuIp8fyUB6QBZrX+gl3ZTMh8VL5OGj8362DUfbcIo0yfaghTttuGXsds95GgTXo6VbIGRO5QuEQkEsk/IKBAcZJ974j8903BiwRt0tGZjGSeRz30EgiMoralnNdzi49qKFX+1V8i18TggV8YIRHxqDyRVsk9t88dPKl3IEJ6xVoP6IYLqozWfArm0OG8oW75LwIxnUQTB+c82HydtUYble31gtW8Vl0imIF0yhMnnL5a1uT6P4g45+MAwjtPBUWTswOyytCw3YjpYyO4HDYTOovfBLEC2UxeGIbB3Du7A+HRV1Wvi2LzdDKp7DYvjiz5RC/aishNxq86k41nFjwLSXsnmjKDAMU4I44mJbV+A6ck9/vBNo2WYY5HKhAraj5UKnPL0ogFZ3aAEALRJGEaBFwqDY7RJAy27JiD8BoEW8xsSXANAiXmO7SwBo2S0ZCU8AaJEwKAAtEgbFbpcAWnZLRvwJAC3iNSa+BIAW8RrbXQJAy27JSHgCQIuEQQFokTAodrsE0LJbMuJPAGgRrzHxJXQ/tP74w+QtO+IFJKIEgBYRqrraZvdD67333mtoaDDVUaOx9nicaQ6SbQO0SBaQTrnT/dDCMCwmJobL5R4+fHjHjh2zZ88eNWpUp7TpspMAWl0mvRML7pZoYRhWUlKycuXK0NBQf39/rda2N5acKKtjpgBajulHjrO7K1rffPNNnz59srOz2Ww2OZS2wwuAlh1ikTZrt0QrKSkpPj4ew7C9e/du2LCBtOK35ZgnonX+/PmaGjf4Tty2YtY6vZuhdfbs2QEDBhw+fFhfU4VCER0d3brWJE/xRLRqampCQkJWr15N8tjY7l53Qmv58uWTJ0/+6aefmqv//PnzN954o3nXXTY8ES19bLZs2eLn53f27Fl3CZWFn3PmzJk5c+a6devu37/fGq2HDx9u3LgxNjbWja73KpUqICBg+/btFjXFMKy4uHj37t2t08mc4rloYRh27969yZMnL1y4kMwRasu3+vr6Y8eOSaVSKpUaHR0tEon0OdPT06OiogYNGiSVSr/99tv6+vq2LJAqfevWrUFBQbduOfP7a7u2gh6Nll76vLw8BEGOHj3atZFwpPSPP/44MjJSb2HWrFmLFi1yxJqLz3306BGLxVq1apWLyyW6OIAWrvCTJ0/i4uJmzZr15Ik7/nIHXoUdO3Z89NFH69aty8jIILrRONG+TCYbPHjwhQsXnGiTJKYAWi2BkMvlCILs2bOnJcmttkaOHDl06FA3cvn9999PSUlxI4ftchWgZSlXamrq5MmT799v+aEtyxxk3Z80aZK7PA3097//HYbhb7/9lqxaOsEvgJYVEc+ePTts2LCtW7daOUbipMuXL58/f57EDhpcW7hwYUxMTFOTW/5stO3yArTa1GrVqlUhISHXrl1rMwc4YKcCGRkZffv2zcvLs/M8t8wO0GovbDU1NaNGjUpLS2svEzhmgwKbNm2CYXj9+vU25O0mWQBaHQdy27Ztvr6+5eXlHWcFOVopIJFIXnnllfT09G4/ArSoOkDLQhDruz/++KNAIAgMDPSQwYx1FexMzczM7NWr19q1a7vBK8N2Vh3PDtCyQ7S6urqFCxcOGDBg06ZNv/3mZj+tbUc9Hc66ZcuWPn36rFmz5vnz5w4bc1cDAC27I/fTTz+lp6d7e3svWbLk9u3bdp/frU/YunVrv379Vq9e/ezZs25d0Y4rB9DqWKO2cuTm5tLp9Li4uKqqqrbyeE76tm3bEARZtWoVirb9M2meIwcYEDoe66NHj7LZ7PHjxx85csRxa+5oISsr69VXX01LS3Pfx8SIkB30Ws5R9eLFizwez9/ff9euXc6x6A5Wtm/f3r9/f7FY/Ouvv7qDvy71EaDlTLnVarVIJOrbt+/atWvd7mtSbBTiyZMnBQUFs2fPZrPZy5cv/+WXX2w80dOyAbScH/GnT59KJJKBAwempKTcuHHD+QV0hcWGhobc3Nzp06cjCJKYmFhcXPz06dOucMRtygRoERgqmUwWHx8/bNiwDz/88ODBg/fu3SOwMGJMq1Sqzz77bNy4cVQqdcmSJWVlZcSU0w2tArQID+r9+/cPHjz44Ycf+vn5BQYGLlmy5MiRI48fPya8YAcKqK6uXrlyZWBgYFBQ0Keffnrp0iUHjHnoqQAtlwa+rq4uNzeXx+NRKJTQ0FCxWFxaWkqeW0ClpaWLFi164403wsPDP//887q6Opeq070KA2h1WTyVSmVWVlZ0dHSfPn0mTJiwYcOGc+fOudib//73v1euXDl27NgHH3zQt2/f6Ojo3bt3/+c//3GxG92yOIAWKcJ6/vz5jRs3Tpo0qVevXlFRUTk5OUeOHDl9+vQPP/xQX1/v+CrcvXv3qqqqCgoKPvvss7/85S8zZswYOXIkgiCvv/76mDFjli1b9vXXX4NlCec2BYCWc/V01Nrz589Pnjy5YcMGHo/H4XBGjx49YsSI/v379+7de+jQoUFBQWw2OzY2dt68ecuWLdu8ebNUKv3qq6/KysquXLly+/ZttVr9j3/8QyaTrV+/ft68eVOmTKHRaF5eXn5+fmw2OzEx8dNPP/3b3/5WWlp6/fp1cIfX0Wi1ez5Aq115SHPw999/f/DggUqlqqqqOnHixIEDB7744ot169YtXbp07ty506dPHzNmDJ1OHzt2bEREREpKSkZGxoEDB86cOXPnzp0XL16Qph4e5AhAy4OCDarqSgUAWq5UG5TlQQoAtDwo2KCqrlQAoOVKtUFZHqQAQMuDgg2q6koFAFquVBuU5UEKALQ8KNigqq5UAKDlSrVBWR6kAEDLg4INqupKBQBarlQblOVBCgC0PCjYoKquVACg5Uq1QVkepABAy42DrVUeFPIiOFwel8NJktXoalKfL5jNZQWHCU9oMQzTnhIwhrCz/+nGlXRb1wFa7ho6jVxAo4RnVv8PrwBazmcuuYhhd6SJIsWjxwUzeyJzS/Vo0ft68YrAl266PswALddr7owSNcVc717B4ss6W41KaQJLcArF6mXCrB+wxiPxPggnT6M79lgWb8zmjHKBDZsVAGjZLBWZMjZIp8FQPxpnFo/H4/L4YlmVHiTcRy1OXYTM8O1Rj2X8VAX4/s0uCB5AqwtEd7zIC6K3ISTuKGrlN0ufyJMReHyuRv/6Y+ORpKSjWivZHPcBWGhfAYBW+/qQ9OjVtDE9qYsvmninVanwdQsMq5WMg2nGQ5rDfOEJMNEy0cl1mwAt12ntzJKU6xjIlH2GrglVFSzh8g+pdQU0yGIRSkIp3qE9OCJI2qcGb+87U3jbbQG0bNeKVDlxnDgsDpfH43J5IlmVvsvCXURv7OWNY7CieTx+dsUjUjntUc4AtDwq3KCyrlMAoOU6rUFJHqUAQMujwg0q6zoFAFqu0xqU5FEKALQ8Ktygsq5TAKDlOq1BSdYGT54AAABcSURBVB6lAEDLo8INKus6BQBartMalORRCgC0PCrcoLKuUwCg5TqtQUkepQBAy6PCDSrrOgUAWq7TGpTkUQoAtDwq3KCyrlMAoOU6rUFJHqUAQMujwg0q6zoF/h/UXgG7S7dmzAAAAABJRU5ErkJggg==)

Hence every locally small category $C$ is isomorphic to the full subcategory of $\Set^{C^{op}}$ spanned by the contravariant represented functors and likewise, $C^{op}$ is isomorphic to the full subcategory of $\Set^C$ spanned by the covariant represented functors, via the canonically-defined **covariant** and **contravariant Yoneda embeddings.**

::: {.container data-name=corollary}
(Yoneda Embedding) The functors below are full and faithful embeddings.

![](data\:image/png;base64,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ZbI7e/ZsOBz++OOPE9eLReWvf/3r22/n/anaMvOabpe98847f/3rXxO1FovKxx9/fPTo0c8+k/1dsukGC/UtjsDJkyf//Oc/J+KKReXs2bORSCTV3opLDLHkCEBU5OjInPvss8++KmyrVq3iuKlffnznnXccDsell166fv16mWtxSp7A448/fumll959993Hjh1LicoPfvADi8Vy9dVXp4RcPhGcBQExgZdeeunKK6/s6OjYt29fSlQ2b9582223felLXzpx4oQ4MvaVEICoKKHHffLJJw8//PB999135513/vSnP503b14oFFKUIi5OEnjzzTfnzZu3bds2m812//33f+973/vkk0+SJ/EfBMohcOrUqXnz5r300ktNTU2PP/74kiVL/va3v5WTEK6RJgBRkWZT9JktW7Zcd911TU1NRV+BiMUSuOqqq6699tpnnnmm2AsQDwQKEViwYMGsWbP6+voKRcT5cghAVMqhlnvN5z//+f7+/txwhCgk8PDDD5MkqTARXA4CYgI7duy48MIL//CHP4gDsa8WgVAotGuXxI8VqZVHFdPR7DMt99xzz549e6pY0+mS1d69ex0Ox3SpLepZFQITExNWq7UqWSGTuiegmajUPTlUAARAAARAIIcARCUHCQJAAARAAATKJQBRKZccrgMBEAABEMghAFHJQYIAEAABEACBcglAVMolh+tAAARAAARyCEBUcpAgAARAAARAoFwCEJVyyeE6EAABEACBHAIQlRwkCAABEAABECiXAESlXHK4DgRAAARAIIcARCUHCQJAAARAAATKJQBRKZccrgMBEAABEMghAFHJQaLbgMk9zNd7/CerVz/2DbfNsTn0UfVyRE4goCsCdemzVReVyDYH3WI2NVLUnN7gp3XbAEacjReSJJHcSJKkOobe4zipcM0rGh9lbml1H2ArUJCYfyVtaTYZjZRx6V72bEYOkW12y11bIvjpyQwqdXQgZ9w6qgZfVCnflArXvHpZPsuOuudbzE0mYwNlezpWudIp9tmqiwrHRiOv9rVQBNW5M+sGVDlMFUqZPeBqOp8gZnb5P8jIQSo8I1JVD2J+l8n87dcrBJyNR0IbrYZzSOvGaE61Ir5FRnr1mznhCKgPArLGrY8qiEsp5ZtS4eJrq7uf67NsbDLsc1AE0eL5bUXLotBnqy8qHMfudjScS1qfyr0B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)
:::

That is, natural transformations between represented functors correspond to morphisms between representing objects!

## Applications of Yoneda

> everything you need to know about the Yoneda Lemma is encoded by its relationship with other topics!  :)

### Mathematics

::: {.container data-name=corollary}
Let $(P, \leq)$ be a [[preorder]] category, where each hom-set contains at most one morphism, and where each morphism $f : x \rightarrow y$ can be thought of as [[evidence]] that the statement $(x \leq y)$ is true.  The Yoneda embedding reads

$$
[P, \Set]\bigg( (x \leq -), (y \leq -) \bigg) \cong (y \leq x)
$$

Using [[coq]] syntax, the left-hand side is the set of polymorphic functions which convert evidence that $(x \leq z)$ into evidence that $(y \leq z)$, that is,

```haskell
η : forall z, (x <= z) -> (y <= z)
```

Yoneda confirms that this proposition is logically equivalent to `(y <= x)`.  That is,

$$
(y \leq x) \iff
\big[ \forall z \in P, (x \leq z) \implies (y \leq z) \big]
$$
:::

::: {.container data-name=corollary}
([@riehl2017:category], Cor. 2.2.9)  Every row operation on matrices with $n$ rows is defined by left multiplication by some $n \times n$ matrix, namely the matrix obtained by performing the row operation on the identity matrix.
:::

::: {.container data-name=corollary}
(Cayley's Theorem / [@riehl2017:category], Cor. 2.2.10) Every group is isomorphic to a subgroup of a permutation group.
:::

### Yoneda in Haskell

::: {.container data-name=example}
In the category [[hask]], of types and Haskell functions between them,

* a natural transformation is nothing more than a [[polymorphic]] function, and
* the (covariant) [[hom-functor]] $\Hom_C(c,-)$ is expressed by the signature `c ->`.

Presuming `Hask ⊆ Set`, the Yoneda Lemma for a functor `F : Hask -> Hask` reads:

$$
[\mathtt{Hask}, \mathtt{Hask}]\left( \code{c ->}, \code{F} \right) \cong \code{F c}
$$

In the case of the [[list-functor]], written `[ ]`, we see that a polymorphic function `η :: forall x. (c -> x) -> [x]` is the same as a list `[c]`.  This makes sense -- if we can produce a list of `x`'s when all we have to work with is a function mapping `c -> x`, we must have a list of `c`'s stashed away somewhere!  Applying `η` to the identity map `id :: c -> c` reveals the original list.

> Note:  We can also use the [[reader-monad]], whose functor instance `Reader c` is (covariantly) represented by `c`.  The reader monad gives another way to make use of hidden data inside a function!

The signature for `η` reads like a partially-applied `fmap`, and this is no coincidence!  Given data `p :: [c]`, the Yoneda bijection gives the following implementation for `η`,

```haskell
η :: forall x. (c -> x) -> [x]
η f = (fmap f) p 
```

The Yoneda Lemma tells us that *every* implementation of this function signature must have the form above, for some specific value of `p`.
:::

::: {.container data-name=example}
In the category [[hask]], the coYoneda Lemma on the list functor `[ ]` reads

$$
[\mathtt{Hask}, \mathtt{Hask}]\left( \code{-> c}, \code{[ ]} \right) \cong \code{[c]}
$$

So a polymorphic function `η :: forall x. (x -> c) -> [x]` is the same as a list `[c]`, but how?  In `Hask`, naturality means that `η` is [[parametrically-polymorphic]], in the sense that the formula for `η` cannot use any specific information about the type `x`.

The Yoneda bijection tells us how to extract this hidden data from a particular `η`,

```haskell
id :: c -> c
id x = x

η(id) :: [c]
```

In the other direction, each `[c]` gives rise to an `η :: forall x. (x -> c) -> [x]`,

```haskell
η :: forall x. (x -> c) -> [x]
η = ... TODO
```

[[todo]] : explain this example better with the writer monad

> List is not a contravariant functor!!!
:::

::: {.container data-name=example}
In the category [[hask]], the Yoneda Embedding reads

$$
[\mathtt{Hask}, \mathtt{Hask}]\left( \code{a->}, \code{b->} \right) \cong \code{b->a}
$$

meaning that a polymorphic function `η :: forall x. (a→x) → (b→x)` is equivalent to a function `b→a`.  That is, if we can convert any `(a→x)` to a `(b→x)`, we must have a function `(b→a)` stashed away somewhere that we can use before applying the `(a→x)`. Surely enough, applying `η` to the `id :: a → a` yields the hidden `(b→a)`! 

Likewise, every polymorphic function `η :: forall x. (a→x) → (b→x)` has the form

```haskell
p :: b -> a
p = ...

η :: forall x. (a -> x) -> (b -> x)
η f = p ; f
```
:::

### Continuation-Passing Style

::: {.container data-name=example}
Following [@milewski:ct4p-yoneda], Yoneda applied to the identity functor on `Hask` says that a polymorphic function `η :: forall x. (c -> x) -> x` is the same as `c`.  In other words, any type `c` can be replaced by a function that takes a **handler** for `c`.

A **handler** is a function that accepts `a` and afterwards performs the rest of some computation -- akin to the [[continuation-passing-style]] used by compilers.  In fact,

```haskell
newtype Cont r a = Cont { runCont :: (a -> r) -> r }
```
:::

### Category of Elements

## Enriched Yoneda Lemma

The plain Yoneda Lemma deals only with the category of sets.  What if we have not Hom-Sets, but Hom-Vector-Spaces or Hom-Lattices?  We will use [@hinich2016:enriched-yoneda] as a guide to present the **Enriched Yoneda Lemma*.

## References

* [@riehl2017:category] for the proof structure

* [@milewski:ct4p-yoneda] for intuition

* [@hinich2016:enriched-yoneda] for the enriched Yoneda Lemma
