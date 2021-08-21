---
title:  Algorithms for Random Discrete Structures
date:  2018-05-02
category:  Mathematics
summary:  Many applications require the random sampling of matrices with prescribed structure for modeling, statistical, or aesthetic purposes.  What does it mean for a random variable to be matrix-valued?  What can we say about the eigenvalues of a random matrix?  How can we design algorithms to sample from a target distribution on a group or manifold?  More generally, what can we say deterministic algorithms with random inputs?  Our study of random matrices will lead us to the *subgroup algorithm* (Diaconis 1987), which subsumes many familiar random sampling procedures.
---

# Introduction

Randomness plays a critical role in computer science and applied mathematics.  In the sciences, randomness allows researchers to study average-case behavior of physical models which would otherwise be too complex or time-consuming to simulate exactly.  In computing, randomized algorithms have become essential tools for approximating NP-Hard problems.

In this post, we will survey strategies for designing algorithms to randomly generate objects with nontrivial structure from a prescribed distribution.  For example, we may wish to choose elements uniformly at random from a group or generate a set of random unitary matrices whose behavior is somehow representative of the class of unitary matrices generally.  The samples are intended for use as input to a known model or algorithm.

It is useful to distinguish between three different kinds of random sampling:  Genuine *uniformly random* samples are easiest to generate, due to independence, but individual realizations will naturally have regions of low and high density.  Our intuitive understanding of uniformity is more like *uniformly spaced* samples, where the goal is to maximize coverage and avoid redundancy.  In the extreme, we may want to sample *rare events* to study the worst-case behavior of a system.  These differences are shown informally in Figure \ref{fig:kinds-of-randomness}.

It also helps to keep the reverse problem in mind:  how does a deterministic algorithm behave when fed random inputs?

# Preliminaries

In this section, we briefly review the necessary mathematical background and introduce notation.

**Unitary Matrices.**  A matrix $U \in \mathbb{C}^{n \times n}$ with orthonormal columns is called *unitary*.  Equivalently, $U U^* = I$, where $U^*$ denotes the conjugate transpose.  The eigenvalues of a unitary matrix have unit modulus, and accordingly $|\det U| = 1$.  Real matrices $M \in \mathbb{R}^{n \times n}$ satisfying these conditions are called *orthogonal*.

**Groups.**  A group $(G,*)$ consists of an associative operation $* : G \times G \rightarrow G$ over a set $G$ which contains a (unique) identity element $1_G$ and a (unique) inverse $a^{-1}$ for each element $a \in G$, with $a^{-1} a = a a^{-1} = 1_G$.  For convenience, we call $a * b$ multiplication and occasionally write $ab$ instead.  Additive notation $a +b$ is used for commutative groups.  A set $S \subset G$ is a *subgroup* if it is closed under multiplication and inverses with respect to the group operation. 

Familiar commutative groups are $(\mathbb{Z}, +)$, $(\mathbb{Q}, +)$, and $(\mathbb{R}_{\neq 0}, \cdot)$.  The invertible matrices over a field $F$ form a non-commutative group $\mathrm{GL}_n(F)$ with respect to matrix multiplication, known as the *general linear group*.  The orthogonal matrices $\mathrm{O}_n(\mathbb{R})$ and unitary matrices $\mathrm{U}_n(\mathbb{C})$ both form subgroups of $\mathrm{GL}_n(\mathbb{C})$. The *special linear group* $\mathrm{SL}_n(\mathbb{C})$ is the set of matrices with determinant one.

Groups of transformations are useful for understanding the *invariants* of an object.  The set of all permutations on $n$ elements forms the *symmetric group* $S_n$ with respect to function composition.  An important subgroup is the *alternating group* $A_n$ consisting of only even permutations.  For a full treatment of group theory, see (Pinter 2010).

**Topological Groups.** Of particular interest are groups whose underlying set possesses additional topological or geometric structure.  Studying transformations on such spaces, e.g. homotopy groups in algebraic topology, can reveal important invariant structure which does not readily present itself through other methods.  In this report, we favor intuition at the expense of rigor, so be warned that statements below may require slight modifications to be technically correct.

A *Lie group* is a smooth manifold $G$ with group structure such that the multiplication and inverse maps are smooth. A *Haar measure* on a compact topological group $G$ is a Borel measure (defined on a $\sigma$-algebra containing the open sets) which is invariant under the group operation, that is, $\mu(gE) = \mu(E)$ for any $g \in G$ and measurable $E \subset G$.  We sometimes describe this as "translation" or "rotation" invariance depending on the context.  Every compact Lie group has a unique Haar measure $\mu$, which can easily be normalized to a probability measure since $\mu(G) < +\infty$.  For a proof, see (Tao 2011).  The general linear group $GL_n(\mathbb{C})$ is not compact, but the groups $\mathrm{O}_n(\mathbb{R})$, $\mathrm{U}_n(\mathbb{C})$, and $SL_n(\mathbb{C})$ are compact.  For this reason, they are sometimes called the *classical compact groups*.  Our goal is to generate random samples from these groups according to the Haar measure, which can be thought of as a generalization of the uniform distribution.

# Random Matrix Theory

A *matrix ensemble* is a family of matrices together with a probability distribution.  The most well-studied examples are:

* *Gaussian Orthogonal Ensemble*, with i.i.d. real entries $\mathcal{N}(0,1)$
* *Gaussian Unitary Ensemble*, with i.i.d. complex entries $\mathcal{N}(0,1) + i \mathcal{N}(0,1)$
* *Gaussian Symplectic Ensemble*, with i.i.d. quaternion entries $\mathcal{N} + i \mathcal{N} + j \mathcal{N} + k \mathcal{N}$

Note that these processes do not necessarily produce orthogonal or unitary matrices; the name comes from the orthogonal / unitary invariance of the corresponding probability measures, as in the following lemma:

<!-- Lemma -->
::: { .container data-name=lemma }
(c.f. Mezzadri 2006)
The measure $d\mu_G$ of the Gaussian Unitary Ensemble is invariant under left and right multiplication of $Z$ by arbitrary unitary matrices,
    $$
    d\mu_G(UZ) = d\mu_G(ZV) = d\mu_G(Z) \text{ for all } U,V \in \mathrm{U}_n(\mathbb{C})
    $$
:::

## Eigenvalues and The Circular Law

The eigenvalues of a random matrix are themselves random, and it is natural to ask with what distribution.  One might suspect that the particular choice of distribution for the matrix entries would determine the asymptotic behavior; however, the *universality principle* (Tao 2010) states that the choice does not matter in the limit, effectively absolving us of our guilt for not choosing a more complicated distribution than the standard normal.  The eigenvalue distribution of matrices with independent Gaussian entries has long been known to obey the *circular law*, and universality immediately gives the following theorem.  A related *semicircular law* is known for random Hermitian matrices. 

<!-- Theorem: Circular Law -->
:::: {.container data-name=theorem} ::::
(Tao 2008) Let $x$ be a complex random variable of mean zero and unit variance.  Let $M_n \in \mathbb{C}^{n \times n}$ be a random matrix whose entries are i.i.d. copies of $x$.  In the limit $n \rightarrow \infty$, the empirical distribution of the eigenvalues of $\frac{1}{\sigma \sqrt{n}} M_n$ converges (both in probability almost surely) to the uniform distribution over the complex unit disk.
::::::::::::::::::::::::::::::::::::::::

The circular law is verified empirically in Figure \ref{fig:goe-gue-eigs} for the Gaussian ensembles.  For the real case on the right, there is an unexpected concentration of eigenvalues exactly on the real line, suggesting that the eigenvalue distribution is *not absolutely continuous* with respect to Lebesgue measure.  The joint eigenvalue density for the GOE was worked out explicitly by (Edelman 1997) and integrated, leading to the following computation:

<!-- Theorem:  Probability that GOE has real eigenvalues -->
:::: {.container data-name=theorem} ::::
(Edelman 1997)
Let $M \in \mathbb{R}^{n \times n}$ have independent standard normal entries.  The probability that $M$ has $k$ eigenvalues has the form $r + s\sqrt{2}$ for some rational $r,s \in \mathbb{Q}$.  In particular, the probability that a random matrix has all real eigenvalues is $1 / 2^{n(n-1)/4}$.
::::::::::::::::::::::::::::::::::::::::

## Random Structured Matrices

Some applications call for matrices with additional structure.  For example, it may be desirable to generate random diagonal, symmetric, orthogonal, or upper-triangular matrices.  One might think of several clever ways to accomplish this in Python:

<style>
#clever-table {
    border-spacing: 20px 0;
}
#clever-table td:nth-child(1) {
    text-align: right;
    margin-right: 10px;
}
#clever-table td:nth-child(2) {
    font-family: monospace;
    font-size: 14px;
}
</style>

<table id="clever-table"style="margin: 0 auto;">
<colgroup>
<col style="width: 50%">
<col style="width: 50%">
</colgroup>
<tr><td>Real</td><td>A = randn(n,n)<td></tr>
<tr><td>Complex</td><td>B = randn(n,n) + 1j * randn(n,n)<td></tr>
<tr><td>Diagonal</td><td>D = diag(diag(A))<td></tr>
<tr><td>Symmetric</td><td>S = A + A.T<td></tr>
<tr><td>Orthogonal</td><td>Q,_ = qr(A)<td></tr>
<tr><td>Upper-triangular</td><td>_,R = qr(A)<td></tr>
<tr><td>Lower-triangular</td><td>L = chol(A)<td></tr>
</table>


These methods certainly produce matrices of the desired type, but for serious applications it is important to understand the resulting distributions.  Furthermore, the general problem of understanding how deterministic algorithms (such as the `numpy`} implementation of QR factorization) is useful for algorithm design.  In the next section, we show that the naive method for generating random unitary matrices is biased and suggest a correction.

# Random Unitary Matrices

Assume we wish to generate random unitary matrices according to the Haar measure on $U_n(\mathbb{C})$.  The eigenvalues $e^{i\theta}$ of a unitary matrix have unit modulus, so we are effectively choosing random arguments <span style="white-space: pre;">$\theta$,</span> which we would like to be uniform on the complex unit circle.  As shown in Figure \ref{fig:random-unitary-histogram}, the naive method `U,_ = qr(B)` applied to a random `B` with compex Gaussian entries fails to have a uniform eigenvalue distribution.

As described by (Mezzadri 2006), this sampling bias arises from the fact that the QR factorization is not unique.  If $Z \in \mathrm{GL}_n(\mathbb{C})$ factorizes as $Z = QR$ and $\Lambda = \mathrm{diag}(e^{i\theta_1}, \dots, e^{i\theta_n})$ is any diagonal unitary matrix, then $Z = (Q \Lambda) (\Lambda^{-1}R)$ is also a valid QR factorization.  In effect, the QR factorization is a *multi-valued map*
    $$
    \mathrm{QR} : \mathrm{GL}_n(\mathbb{C}) \rightarrow \mathrm{U}_n(\mathbb{C}) \times T_n(\mathbb{C})
    $$
where $T_n(\mathbb{C})$ is the group of invertible upper triangular matrices.  Different QR factorization algorithms choose different principal values, often in an inconsistent way, which is the source of our error.

## The Corrected Algorithm

To ensure that the QR decomposition with random input produces a unitary matrix distributed according to the Haar measure, we must choose a variation of the map above which is not only single valued but also one-to-one.  We need the following lemma.  Let $\Lambda_n(\mathbb{C})$ denote the group of unitary diagonal matrices.

<!-- Lemma -->
:::: {.container data-name=lemma} ::::
Let $Z \in \mathbb{C}^{n \times n}$ have two valid QR decompositions $Z = Q_1 R_1 = Q_2 R_2$.  Then, there is $\Lambda \in \Lambda_n(\mathbb{C})$ such that $Q_2 = Q_2 \Lambda^{-1}$ and $R_2 = \Lambda R_1$.
::::::::::::::::::::::::::::::::::::::

Consider the quotient group $\Gamma_n(\mathbb{C}) = T_n(\mathbb{C}) / \Lambda_n(\mathbb{C})$.  Our corrected algorithm will be a one-to-one map
    $$
    \widehat{\mathrm{QR}} : \mathrm{GL}_n(\mathbb{C}) \rightarrow \mathrm{U}_n(\mathbb{C}) \times \Gamma_n(C)
    $$
The upper-rectangular matrix returned by the corrected algorithm will be a representative $\gamma$ of $\Gamma_n(\mathbb{C})$.  If we choose the map $\widehat{\mathrm{QR}}$ to be unitarily invariant with respect to $\gamma$, that is,
    $$
    Z \mapsto (Q, \gamma) \implies UZ \mapsto (UQ, \gamma) \text{ for all } U \in \mathrm{U}_n(\mathbb{C})
    $$
then by Lemma \ref{lemma:gue-invariance}, the algorithm $\widehat{\mathrm{QR}}$ with input from a Gaussian Unitary Ensemble will be distributed according to the Haar measure on $U_n(\mathbb{C})$.  It can be shown that the unitary invariance property holds when representatives for $\Gamma_n(\mathbb{C})$ are chosen from the set of upper triangular matrices with real, positive entries.  This suggests the following correction to the naive algorithm.  The results are shown on the right in Figure \ref{fig:random-unitary-histogram}.

```python3
def haar_measure(n):
    # naive method
    Z = randn(n,n) + 1j*randn(n,n) / np.sqrt(2);
    Q,R = np.linalg.qr(Z);
    # correction
    d = np.diag(R);
    PH = np.diag(d) / np.absolute(d);
    return Q @ PH;
```



# Discussion

We have described several basic results in random matrix theory and developed an algorithm for sampling unitary matrices in a uniform way.  The corrected algorithm in the previous section is a special case of the remarkably general *subgroup algorithm* (Diaconis 1987), in which uniform random samples from a group $G_n$ are built up from successive uniform samples from a chain of subgroups $G_1 \subset G_2 \subset \cdots G_n$.  The Fisher-Yates shuffle is a well-known realization of the subgroup algorithm.  The algorithm is very general, but the main difficulty is generating samples from the quotient groups $G_{k} / G_{k-1}$.

For our specific problem of generating random unitary matrices, we were able to prove that the corrected method produces a result distributed according to Haar measure.  When designing sampling procedures for more complicated structures, this may not be possible, and there has been some work on developing statistical tests on manifolds to determine whether the target distribution has been met (Sepheri 2016).

I am aware that Lie groups are commonly used in motion planning; the valid orientations of a robot or vehicle form a manifold in configuration space, and there is a group of transformations which describe the allowed behavior.  I strongly suspect that the strategies used in this report could be used to randomly sample valid configurations, which could be useful in simulation or gaming applications.