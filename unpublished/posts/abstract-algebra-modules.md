---
title:  "Abstract Algebra:  Modules"
date:  2020-05-13
unpublished: True
category:  math
katex_macros: abstract-algebra.katex
tags: abstract-algebra, linear-algebra
pdf_url: /static/notes/abstract-algebra_modules_13may2020.pdf
summary:  Vector spaces over a field are a special case of the more general notion of modules over a ring.  Rather than the long list of axioms normally presented in textbooks, we see how an algebraic view of vector spaces helps to motivate the definition of modules.
---

## Vector Space over a Field

Vector spaces over a field are a special case of the more general notion of modules over a ring.  Normally, textbooks define a vector space as a set equipped with two operations which obey a long list of axioms:

::: {.container data-name=definition} :::
An <dfn>(abstract) vector space</dfn> $(V,\mathbb{F},+,\cdot)$ consists of

1. A field $\mathbb{F}$, whose elements are called <dfn>scalars</dfn>
2. A set $V$, whose elements are called <dfn>(abstract) vectors</dfn>
3. A rule $(+) : V \times V \rightarrow V$ for *vector addition*,
satisfying
   a. (associativity) $u+(v+w)=(u+v)+w$
   b. (commutativity) $u+v = v+u$
   c. (additive identity) exists $0 \in V$ with $v + 0 = v$ for all $v \in V$
   d. (additive inverse) for all $v \in V$, exists $(-v) \in V$ with $v + (-v) = 0$
4. A rule $(\cdot) : \mathbb{F} \times V \rightarrow V$ for *scalar
multiplication*, satisfying
   a. (scalar identity) $1_F \cdot v = v$ for all $v \in V$
   b. (compatibility) $(\alpha \beta) v = \alpha(\beta(v))$
   c. (distributes over vector addition) $\alpha (v + w) = \alpha v + \alpha w$
   d. (distributes over field addition) $(\alpha + \beta) v = \alpha v + \beta v$
:::::::::::::::::::::::::::::::::::::::::

We can state these properties more concisely by noticing that Property III is equivalent to the requirement that $(V,+)$ forms a commutative group.

::: {.container data-name=definition} :::
An <dfn>(abstract) vector space</dfn> over the field $\FF$ is a commutative group $(V,+)$ together with a rule $(\cdot) : \FF \times V \rightarrow V$ satisfying

1. (scalar identity) $1_F \cdot v = v$ for all $v \in V$
2. (compatibility) $(\alpha \beta) v = \alpha(\beta(v))$
3. (distributes over addition) $\alpha (v + w) = \alpha v + \alpha w$
4. (distributes over field addition) $(\alpha + \beta) v = \alpha v + \beta v$
:::::::::::::::::::::::::::::::::::::::::

Definitions 1a and 1b seem to present the set $V$ as the primary object of interest, relegating the scalars $\FF$ to the sidelines.  The key to understanding modules is to turn this presumption on its head by treating $\FF$ as the distinguished object instead.

By partial application of the scaling operator $(\cdot) : \FF \times V \rightarrow V$, each scalar $\alpha \in \FF$ corresponds to a linear map $\varphi_a : v \mapsto \alpha v$ from $V$ to itself.  Linear self-maps on $V$ constitute the endomorphism ring $(\End(V), +, \circ)$, whose operations are pointwise addition and function composition.  The vector space axioms ensure that the map $\varphi_\boxdot : \FF \rightarrow (V \rightarrow V)$ from field elements to linear self-maps is a ring homomorphism.  We arrive at our third and final definition,

::: {.container data-name=definition} :::
An <dfn>(abstract) vector space</dfn> over the field $\FF$ is a commutative group $(V,+)$ together with a ring homomorphism $\varphi : \FF \rightarrow \mathrm{End}(V)$.
:::::::::::::::::::::::::::::::::::::::::

The ring homomorphism defines the additive and multiplicative group actions on $V$ by scalars from the field $\FF$.

## Module over a Ring

For modules, we require only that the set acting on $V$ be a ring, rather than a field.

::: {.container data-name=definition} :::
A <dfn>module</dfn> over the ring $R$ is a commutative group $(M,+)$ together with a ring homomorphism $\varphi : R \rightarrow \End(M)$ defining an action of $R$ on $M$, where $\End(M)$ is the set of group homomorphisms $M \rightarrow M$.
:::::::::::::::::::::::::::::::::::::::::

Modules over a ring $R$ are called <dfn>$R$-modules</dfn>, for short.  An $R$-module is called *left* if it arises from a left action, and *right* otherwise.  As for vector spaces, we could unfold this definition into a list of axioms, but this would obfuscate the real purpose of modules:  Many mathematical objects happen to be rings, and modules allow us to study rings by their action on a set (much like we can study groups via their representations).

::: {.container data-name=definition } :::
Let $M$ be an $R$-module.  An \defn{$R$-submodule} of $M$ is a subgroup $N \subgroup (M,+)$ closed under the ring action, $rn \in N$ for $r \in R$, $n \in N$.
::::::::::::::::::::::::::::::::::::::::::


::: {.container data-name=example} :::
Several important examples of modules are listed below.

* If $\FF$ is a field, then $\FF$-modules and $\FF$-vector spaces are identical.
* Every ring $R$ is an $R$-module over itself.  In particular, every field $\FF$ is an $\FF$-vector space.  Submodules of $R$ as a field over itself are ideals.
* If $S$ is a subring of $R$ with $1_S = 1_R$, every $R$-module is an $S$-module.
* If $G$ is a commutative group of finite order $m$, then $m \cdot g=0$ for all $g \in G$, and $G$ is a $(\ZZ / m \ZZ)$-module.  In particular, if $G$ has prime order $p$, then $G$ is a vector space over the field $(\ZZ/ p \ZZ)$.
* The smooth real-valued functions $\mathscr{C}^\infty(\mathcal{M})$ on a smooth manifold form a ring.  The smooth vector fields on $\mathcal{M}$ form a $\mathscr{C}^\infty(\mathcal{M})$-module.
* For a ring $R$, every $R$-algebra has natural (left/right) $R$-module structure given by the (left/right) ring action of $R$ on $A$.
::::::::::::::::::::::::::::::::::::::

::: {.container data-name=example} :::
($\ZZ$-modules)  By definition, every $\ZZ$-module is a commutative group.  Likewise, every commutative group $(G,+)$ becomes a $\ZZ$-module under the ring action defined for $n \in \ZZ$, $g \in G$ by
    $$
    n \cdot g = \begin{cases}
        \hphantom{-}a + a + \cdots + a \quad \hphantom{-}\text{(} n \text{ times)}
            & \text{if } n > 0 \\
        \hphantom{-}0   & \text{if } n = 0 \\
        -a - a - \cdots - a \quad \text{(} {-}n \text{ times)}
            & \text{if } n < 0
    \end{cases}
    $$
We conclude that $\ZZ$-modules and commutative groups are *one in the same.*
:::

## Modules over a Polynomial Ring $\FF[x]$

The polynomial ring $\FF[x]$ is the space of formal linear combinations of powers of an indeterminate $x$, with coefficients drawn from an underlying field $\FF$.
    $$
    p(x)
    = p_0 + p_1 x + p_2 x^2 + \cdots + p_d x^m \quad (m \in \NN)
    $$

Polynomials form a ring\footnote{the polynomial ring $\FF[x]$ actually has the additional property of being an algebra, since $\FF$ embeds into the center of $\FF[x]$ via the ring homomorphism $(\alpha \in \FF) \mapsto (\alpha \cdot 1 \in \FF[x])$.} under entrywise addition and discrete convolution of coefficient sequences.  The sum and product of $p, q \in \FF[x]$ have coefficients
    $$
    \begin{aligned}
    [p+q]_k &= p_k + q_k &
    [p\cdot q]_k &= \sum_{j=0}^{\max(n,m)} p_j q_{k-j}
    \end{aligned}
    $$

Consider what it would mean for an $\FF$-vector space $V$ to be an $\FF[x]$-module.  We need a ring homomorphism $\varphi : \FF[x] \rightarrow \End(V)$ describing the action of polynomials on vectors.  Since $\varphi$ preserves sums and products between $\FF[x]$ and $(\End(V),+,\circ)$ as rings\footnote{We take some notational shortcuts.  For instance, $\phi(x)^k$ is $\phi(x)$ composed with itself $k$ times, and $p_k$ refers to both the element of $\FF$ and to the map $(v \mapsto p_k v) \in \End(V)$.}, we find that the choice of a single linear map $\varphi(x) \in \End(V)$ determines the value of $\varphi$ on arbitrary polynomials~$p \in \FF[x]$,
    $$
    \begin{aligned}
    \varphi(p) v 
    = \varphi\left( \sum_{k=1}^m p_k x^k \right) v
    = \sum_{k=1}^m p_k \varphi(x)^k v
    \end{aligned}
    $$
Similarly, any choice of $\phi(x) \in \End(V)$ yields a valid ring homomorphism, exposing a bijection between $\FF[x]$-modules and pairs $(V, T \in \End(V))$.
    $$
    \bigg\{ \;\mathbb{F}[x]\text{-modules } V\; \bigg\}
    \longleftrightarrow
    \bigg\{ \substack{\small\text{$\mathbb{F}$-vector spaces $V$ with a}\\\small \text{linear map $T : V \rightarrow V$}} \bigg\}
    $$
In general, there are many different $\FF[x]$-module structures a given $\FF$-vector space $V$, each corresponding to a choice of linear $T : V \rightarrow V$.

::: {.container data-name=proposition} :::
The $\FF[x]$-submodules of an $\FF[x]$-module~$V$ are precisely the $T$-invariant subspaces of $V$, where $T \in \End(V)$ denotes the action of $x$. 
::::::::::::::::::::::::::::::::::::::::::

::: {.container data-name=proof} :::
Each $\FF[x]$-submodule of $V$ is closed under actions by ring elements, including $T$.  Likewise, every $T$-invariant subspace is closed under ring actions, which are all polynomials in $T$.
::::::::::::::::::::::::::::::::::::

## Module Homomorphisms

::: {.container data-name=definition} :::
An <dfn>$R$-module homomorphism</dfn> is a map $\phi : M \rightarrow N$ between modules which respects the $R$-module structure, by preserving addition and commuting with the ring action on $M$,
    $$
    \begin{aligned}
    \phi(x + y) &= \phi(x) + \phi(y) & \forall\, x,y \in M \\
    \phi(r \cdot x) &= r \cdot \phi(x) & \forall\, x \in M, r \in R
    \end{aligned}
    $$
:::::::::::::::::::::::::::::::::::::::::

The <dfn>kernel</dfn> of a module homomorphism is its kernel $\ker \phi = \phi^{-1}\{0_S\}$ as an additive group homomorphism.  A bijective $R$-module homomorphism is an <dfn>isomorphism</dfn>.  For any ring $R$, the set $\Hom_R(M,N)$ of homomorphisms between two $R$-modules forms a commutative group under pointwise addition, $(\phi + \psi)(m) = \phi(m) + \psi(m)$ for $\phi, \psi \in \Hom_R(M,N)$.  Moreover,

::: {.container data-name=proposition} :::
For a commutative ring $R$, the group $\Hom_R(M,N)$ forms an $R$-module under the ring action $R \rightarrow \End(\Hom_R(M,N))$ given by
    $$
    \begin{aligned}
    (r \cdot \phi)(m)
    &\equiv r \cdot \phi(m)
    &\forall\, r \in R, m \in M, \phi \in \Hom_R(M,N)
    \end{aligned}
    $$
:::::::::::::::::::::::::::::::::::::::::

::: {.container data-name=proof} :::
Commutativity of $R$ guarantees that $(r\cdot \phi) \in \Hom_R(M,N)$, since
    $$
    \begin{aligned}
    (r \cdot \phi)(s \cdot m)
    &= r \cdot \phi(s \cdot m) & \text{(by definition)} \\
    &= rs \cdot \phi(m) & \text{(} \phi \text{ is a homomorphism)} \\
    &= sr \cdot \phi(m) & \text{(commutativity)} \\
    &= s \cdot (r \cdot \phi(m)) & \text{(by definition)}
    \end{aligned}
    $$
::::::::::::::::::::::::::::::::::::

## Ring of Module Endomorphisms

::: {.container data-name=proposition} :::
Endomorphisms $\Hom_R(M,M)$ form a unital ring, where
    $$
    \begin{aligned}
    (\phi + \psi)(m) &= \phi(m) + \psi(m) & \text{(pointwise addition)} \\
    (\phi \psi)(m) &= (\phi \circ \psi)(m) & \text{(composition)} \\
    1_{\Hom_R(M,M)} &= \mathrm{Id}_M & \text{(multiplicative identity)}
    \end{aligned}
    $$
We write $\End_R(M) = \Hom_R(M,M)$ for the <dfn>endomorphism ring</dfn> of $M$.
::::::::::::::::::::::::::::::::::::::::::

::: {.container data-name=proposition} :::
Let $M$ be a module over a commutative ring $R$.  The endomorphism ring $\End_R(M)$ forms an $R$-algebra, under the same ring action $r \stackrel{\varphi}{\mapsto} ( \varphi_r : m \mapsto rm)$ which defines $M$ as an $R$-module.
::::::::::::::::::::::::::::::::::::::::::

This property is normally stated without reference to ring homomorphisms, but in these notes we wish to emphasize that the study of modules is really the study of \emph{ring actions}.  There is at least one subtlety, though:  When defining $M$ as an $R$-module, we required that $\varphi_\boxdot : R \rightarrow \End(M,+)$ be a ring homomorphism from $R$ to the additive group endomorphisms on $(M,+)$.  Now, we are asking whether each $\varphi_r$ is also an $R$-module homomorphism.

::: {.container data-name=proof} :::
First, the additive group homomorphism $\varphi_r \in \End(M,+)$ is also a module homomorphism, since for $r,s \in R$ and $m \in M$,
    $$
    \begin{aligned}
    \varphi_r(s \cdot m)
    &= r \cdot (s \cdot m) &\text{(by definition)} \\
    &= (rs) \cdot m_1 &\hspace{4em}\text{(associativity of scalars)}\\
    &= s \cdot (r \cdot m) &\text{(associativity of scalars)}\\
    &= s \cdot \varphi_r(m) &\text{(by definition)}
    \end{aligned}
    $$
Futher, $\varphi_\boxdot : R \mapsto \End_R(M)$ sending $r \mapsto \varphi_r$ is a ring homomorphism.
    $$
    \begin{aligned}
    \varphi_{r_1 + r_2}(m)
    &= (r_1 + r_2) \cdot m &\text{(by definition)} \\
    &= r_1 \cdot m + r_2 \cdot m &\text{(distributivity of scalars)} \\
    &= \varphi_{r_1}(m) + \varphi_{r_2}(m) &\text{(by definition)} \\
    \varphi_{r_1 r_2}(m)
    &= (r_1 r_2) \cdot m & \text{(by definition)} \\
    &= r_2 \cdot (r_1 \cdot m) &\text{($R$ commutative)} \\
    &= (\varphi_{r_2} \circ \varphi_{r_1})(m) &\text{(by definition)}
    \end{aligned}
    $$
Finally, each $\varphi_r$ commutes with every element $\phi \in \End_R(M)$,
    $$
    \begin{aligned}
    (\varphi_r \circ \phi)(m)
    &= \varphi_r (\phi(m)) &\text{(composition)} \\
    &= r \cdot \phi(m) &\text{(by definition)}\\
    &= \phi(r \cdot m) &\text{(module homomorphism)}\\
    &= \phi( \varphi_r(m)) &\text{(by definition)}
    \end{aligned}
    $$
::::::::::::::::::::::::::::::::::::

::: {.container data-name=corollary} :::
By definition, every field $\FF$ is a commutative ring.  Therefore, the endomorphisms $\End_\FF(V)$ of any $\FF$-vector space form an $\FF$-algebra.
::::::::::::::::::::::::::::::::::::::::

## Quotient Modules

For groups and rings, recall that quotients are well-defined only for \emph{normal} subgroups and \emph{multiplication-absorbing} subrings (ideals), respectively.  For modules $M$, it turns out that \emph{any} submodule $N \subspace M$ has a quotient $M / N$, and the natural projection map $\pi : M \rightarrow M/N$ is a ring homomorphism with kernel $\ker \pi = N$.  Similarly, each $\FF$-vector subspace has a quotient $\FF$-vector space arising as the kernel of some linear map.

::: {.container data-name=proposition} :::
Let $R$ be a ring.  Let $N \subspace M$ be a submodule of the $R$-module $M$.  The (additive, commutative) quotient group $M / N$ can be made into an $R$-module under the ring action $R \rightarrow \End(M/N)$ given by
    $$
    \begin{aligned}
    r \cdot (x + N)
    &= (r \cdot x) + N
    &\forall\, r \in R, x + N \in M/N
    \end{aligned}
    $$
The natural projection $\pi : M \rightarrow M/N$ mapping $x \mapsto x+N$ is an $R$-module homomorphism with kernel $\ker\pi = N$.
::::::::::::::::::::::::::::::::::::::::::

::: {.container data-name=theorem} :::
(First Isomorphism Theorem) Let $M,N$ be $R$-modules.  The kernel of any module homomorphism $\phi : M \rightarrow N$ is a submodule of $M$, and
    $$
    M / \ker\phi \cong \phi(M)
    $$
::::::::::::::::::::::::::::::::::::::

## Free Modules

The vector space concepts of linear combinations, bases, and span all have analogues in $R$-module theory.  We normally assume $R$ is a ring with identity.

::: {.container data-name=definition} :::
Let $M$ be an $R$-module.  The submodule of $M$ <dfn>generated</dfn> by a subset $A \subset M$ is the set of finite <dfn>$R$-linear combinations</dfn>
    $$
    RA =
    \{ r_1 a_1 + \cdots + r_m a_m \mid r_k \in R, a_k \in A, m \in \NN \} \subspace M
    $$
A submodule $N = RA \subspace M$ is \defn{finitely generated} if $A \subset M$ is finite.  A <dfn>cyclic submodule</dfn> $N = Ra$ is generated by a single element $a \in M$.
:::::::::::::::::::::::::::::::::::::::::

::: {.container data-name=definition} :::
An $R$-module $F$ is <dfn>free</dfn> on the subset $A \subset F$ if each nonzero $x \in F$ expands uniquely as an $R$-linear combination of elements from $A$, in which case $A$ is called a <dfn>basis</dfn> for $F$.
    $$
    \begin{aligned}
    x &= r_1 a_1 + \cdots + r_m a_m 
    & \exists!\, r_k \in R, a_k \in A, \forall\, x \in F
    \end{aligned}
    $$
:::::::::::::::::::::::::::::::::::::::::

In general, more than one basis may exist.  If $R$ is commutative, every basis has the same cardinality, called the \defn{module rank} of $F$.  Unlike for vector spaces, not every module has a basis (not every module is free).

## Universal Property of Free Modules

Recall that every linear map $T \in \Hom_\FF(V,W)$ between $\FF$-vector spaces is uniquely determined by its value on $n=\dim V$ points.  $R$-linear maps between free modules enjoy the same property, which is normally stated in the following way:

::: {.container data-name=theorem} :::
(Universal Property) For any set $A$, there is a unique (up to isomorphism) free $R$-module $\mathrm{Free}(A)$ satisfying the following universal property:  for any $R$-module $M$ and any function $\varphi : A \rightarrow M$, there is a unique $R$-module homomorphism $\Phi : \mathrm{Free}(A) \rightarrow M$ such that $\Phi(a) = \varphi(a)$,
    \begin{figure}[h!tb]
        \centering
        \begin{tikzcd}
        A \arrow[r, "\iota", hook] \arrow[rd, "\varphi"']
        & \mathrm{Free}(A) \arrow[d, "{\exists!\,\Phi}", dashed] \\ & M
        \end{tikzcd}
    \end{figure}
:::::::::::::::::::::::::::::::::::::