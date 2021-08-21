---
title:  Expectation Maximization
date:  2015-11-26
category:  Machine Learning
tags: machine-learning, statistics
katex_macros: probability.katex
pdf_url: /static/notes/eecs445-f16-em-notes.pdf
summary: <b>Expectation Maximization</b> is an iterative algorithm used for maximum likelihood estimation on latent variable models.  Following (Neal &amp; Hinton 1998), we present expectation-maximization as coordinate ascent on the <b>Evidence Lower Bound</b>.  This perspective takes much of the mystery out of the algorithm and allows us to easily derive variants like <b>Hard EM</b> and <b>Variational Inference</b>.
---

<style>
.post-framed {
    border: 1px solid black;
    padding: 20px;
}

.post-framed h3:nth-child(1) {
    margin-top: 0;
}

.post-remark {
    background-color: #eee;
}
</style>

# Introduction

These notes provide a theoretical treatment of **Expectation Maximization**, an iterative parameter estimation algorithm used to find local maxima of the likelihood function in the presence of hidden variables.  Introductory textbooks [murphy:mlapp, bishop:prml] typically state the algorithm without explanation and expect students to work blindly through derivations.  We find this approach to be unsatisfying, and instead choose to tackle the theory head-on, followed by plenty of examples.  Following [neal1998:em], we view expectation-maximization as coordinate ascent on the **Evidence Lower Bound**.  This perspective takes much of the mystery out of the algorithm and allows us to easily derive variants like **Hard EM** and **Variational EM**.

# Problem Setting

Suppose we observe data $\X$ generated from a model $p$ with true parameters $\theta^*$ in the presence of hidden variables $Z$.  As usual, we wish to compute the maximum likelihood estimate
    $$
    \hat\theta_{ML}
    = \arg\max_\theta \ell(\theta|\X)
    = \arg\max_\theta \log p(\X | \theta)
    $$

of the parameters given our observed data.  In some cases, we also seek to *infer* the values $\mathcal{Z}$ of the hidden variables $Z$.  In the Bayesian spirit, we will treat the parameter $\theta^*$ as a realization of some random variable $\Theta$.

The observed data log-likelihood $\ell(\theta|\X) = \log p(\X | \theta)$ of the parameters given the observed data is useful for both inference and parameter estimation, in which we must grapple with uncertainty about the hidden variables.  Working directly with this quantity is often difficult in latent variable models because the inner sum cannot be brought out of the logarithm when we marginalize over the latent variables:

$$
\ell(\theta|\X)
= \log p(\X | \theta)
= \log \sum_z p(\X, z | \theta)
$$

In general, this likelihood is non-convex with many local maxima.  In contrast, [murphy:mlapp] shows that when $p(x_n, z_n | \theta)$ are exponential family distributions, the likelihood is convex, so learning is much easier.  Expectation maximization exploits the fact that learning is easy when we observe all variables.  We will alternate between inferring the values of the latent variables and re-estimating the parameters, assuming we have complete data.

# Evidence Lower Bound

Our general approach will be to reason about the hidden variables through a proxy distribution $q$, which we use to compute a lower-bound on the log-likelihood.  This section is devoted to deriving one such bound, called the **Evidence Lower Bound (ELBO)**.

We can expand the data log-likelihood by marginalizing over the hidden variables:

$$
\ell(\theta|\X)
= \log p(\X|\theta)
= \log \sum_z p(\X, z | \theta)
$$

Through Jensen's inequality, we obtain the following bound, valid for any $q$:

$$\begin{aligned}
\ell(\theta|\X)
&=    \log \sum_z p(\X, z | \theta) \\
&=    \log \sum_z q(z) \frac{p(\X, z | \theta)}{q(z)} \\
&\geq \sum_z q(z) \log \frac{p(\X, z | \theta)}{q(z)}
\equiv \mathcal{L}(q,\theta)
\end{aligned}$$

The lower bound $\mathcal{L}(q,\theta)$ can be rewritten as follows:

$$\begin{aligned}
\ell(\theta|\X)
\geq \mathcal{L}(q,\theta)
&= \sum_z q(z) \log \frac{p(\X, z | \theta)}{q(z)} \\
&= \sum_z q(z) \log p(\X, z | \theta)
    -\sum_z q(z) \log q(z) \\
&= E_q[ \log p(\X, Z | \theta)]
    -E_q[ \log q(z) ] \\
&= E_q[ \log p(\X, Z | \theta)]
    + H(q)
\end{aligned}$$

## Relationship to Relative Entropy

The first term in the last line above closely resembles the cross entropy between $q(Z)$ and the joint distribution $p(X, Z)$ of the observed and hidden variables.  However, the variables $X$ are fixed to our observations $X=\X$ and so $p(\X,Z)$ is an *unnormalized* [ref]In this case, $\int p(\X, z)\, dz \neq 1$.[/ref] distribution over $Z$.  It is easy to see that this does not set us back too far; in fact, the lower bound $\mathcal{L}(q,\theta)$ differs from a Kullback-Liebler divergence only by a constant with respect to $Z$:

$$\begin{aligned}
D_{KL}(q || p(Z|\X,\theta))
&= H(q, p(Z|\X,\theta)) - H(q) \\
&= E_q[ -\log p(Z|\X,\theta) ] - H(q) \\
&= E_q[ -\log p(\X,Z | \theta) ] - E_q[ -\log p(\X|\theta) ] - H(q) \\
&= E_q[ -\log p(\X,Z | \theta) ] + \log p(\X|\theta) - H(q) \\
&= -\mathcal{L}(q,\theta) + \mathrm{const.}
\end{aligned}$$

This yields a second proof of the evidence lower bound, following from the nonnegativity of relative entropy.  In fact, this is the proof given in [tzikas2008:variational] and [murphy:mlapp].

$$
\log p(\X | \theta)
= D_{KL}(q || p(Z|\X, \theta)) + \mathcal{L}(q,\theta)
\geq \mathcal{L}(q,\theta)
$$

## Selecting a Proxy Distribution

The quality of our lower bound $\mathcal{L}(q,\theta)$ depends heavily on the choice of proxy distribution $q(Z)$.  We now show that the evidence lower bound is *tight* in the sense that equality holds when the proxy distribution $q(Z)$ is chosen to be the hidden posterior $p(Z|\X,\theta)$.  This will be useful later for proving that the Expectation Maximization algorithm converges.

<div class="post-remark">
Maximizing $\mathcal{L}(q,\theta)$ with respect to $q$ is equivalent to minimizing the relative entropy between $q$ and the hidden posterior $p(Z|\X,\theta)$.  Hence, the optimal choice for $q$ is exactly the hidden posterior, for which $D_{KL}(q || p(Z|\X,\theta)) = 0$, and
    $$
    \log p(\X | \theta) = E_q[ \log p(\X,Z | \theta) ] + H(q) = \mathcal{L}(q,\theta)
    $$
</div>

In cases where the hidden posterior is intractable to compute, we choo

# Expectation Maximization

Recall that the maximum likelihood estimate of the parameters $\theta$ given observed data $\X$ in the presence of hidden variables $Z$ is
    $$
    \hat\theta_{ML}
    = \arg\max_\theta \ell(\theta|\X)
    = \arg\max_\theta \log p(\X | \theta)
    $$

Unfortunately, when reasoning about hidden variables, finding a global maximum is difficult.  Instead, the **Expectation Maximization** algorithm is an iterative procedure for computing a local maximum of the likelihood function, under the assumption that the hidden posterior $p(Z|\X,\theta)$ is tractable.  We will take advantage of the evidence lower bound
    $$
    \ell(\theta|\X) \geq \mathcal{L}(q,\theta)
    $$

on the data likelihood.  Consider only proxy distributions of the form $q_\vartheta(Z) = p(Z|\X,\vartheta)$, where $\vartheta$ is some fixed configuration of the variables $\Theta$, possibly different from our estimate $\theta$.  The optimal value for $\vartheta$, in the sense that $\mathcal{L}(q_\vartheta, \theta)$ is maximum, depends on the particular choice of $\theta$.  Similarly, the optimal value for $\theta$ depends on the choice of $\vartheta$.  This suggests an iterative scheme in which we alternate between maximizing with respect to $\vartheta$ and with respect to $\theta$, gradually improving the log-likelihood.

## Iterative Procedure

Suppose at time $t$ we have an estimate $\theta_t$ of the parameters.  To improve our estimate, we perform two steps of coordinate ascent on $\L(\vartheta, \theta) \equiv \L(q_\vartheta, \theta)$, as described in [neal1998:em],

<div class="post-framed">
<h3>E-Step</h3>
Compute a new lower bound on the observed log-likelihood, with
$$
\vartheta_{t+1}
= \arg\max_\vartheta \mathcal{L}(\vartheta, \theta_t)
= \theta_t
$$

<h3>M-Step</h3>
Estimate new parameters by optimizing over the lower bound,
$$
\theta_{t+1}
= \arg\max_\theta \mathcal{L}(\vartheta_{t+1}, \theta)
= \arg\max_\theta E_q[ \log p(\X,Z|\theta) ]
$$
</div>

In the M-Step, the expectation is taken with respect to $q_{\vartheta_{t+1}}$.

### Alternate Formulation

In the M-Step, the entropy term of the evidence lower bound $\mathcal{L}(\vartheta_{t+1}, \theta)$ does not depend on $\theta$.  The remaining term $Q(\theta_t, \theta)=E_q[\log p(\X,Z|\theta)]$ is sometimes called the **auxiliary function** or **Q-function**.  To us, this is the **expected complete-data log-likelihood**.


## Proof of Convergence

To prove convergence of this algorithm, we show that the data likelihood $\ell(\theta|\X)$ increases after each update.

<!-- Theorem:  Data likelihood increases with each update -->
:::: {.container data-name=theorem} 
After a single iteration of Expectation Maximization, the observed data likelihood of the estimated parameters has not decreased, that is,
    $$
    \ell(\theta_t | \X) \leq \ell(\theta_{t+1} | \X)
    $$
::::

This result is a simple consequence of all the hard work we have put in so far:

$$\begin{aligned}
\ell(\theta_t | \X)
&= \mathcal{L}(q_{\vartheta_{t+1}}, \theta_t)           
    & \text{(tightness)} \\
&\leq \mathcal{L}(q_{\vartheta_{t+1}}, \theta_{t+1})  
    & \text{(M-Step)} \\
&\leq \ell(\theta_{t+1} | \X)                         
    & \text{(ELBO)}
\end{aligned}$$

It is also possible to show that Expectation-Maximization converges to something *useful*.  

<!-- Theorem: Local Maximum of ELBO is Local Maximum of Likelihood -->
:::: {.container data-name=theorem}
(Neal \& Hinton 1998, Thm. 2) Every local maximum of the evidence lower bound $\mathcal{L}(q, \theta)$ is a local maximum of the data likelihood $\ell(\theta | \X)$.
::::

Starting from an initial guess $\theta_0$, We run this procedure until some stopping criterion is met and obtain a sequence $\{ (\vartheta_t, \theta_t) \}_{t=1}^T$ of parameter estimates.

# Example: Coin Flips

Now that we have a good grasp on the theory behind Expectation Maximization, let's get some intuition by means of a simple example.  As usual, the simplest possible example involves coin flips!

## Probabilistic Model

Suppose we have two coins, each with a different probability of heads, $\theta_A$ and $\theta_B$, unknown to us.  We collect data from a series of $N$ trials in order to estimate the bias of each coin.  Each trial $k$ consists of flipping the same random coin $Z_k$ a total of $M$ times and recording only the total number $X_k$ of heads.  

This situation is best described by the following **generative probabilistic model**, which precisely describes our assumptions about how the data was generated.  The corresponding graphical model and a set of sample data are shown in Figure \ref{fig:coinflip-pgm-data}.\\
    $$
    \begin{aligned}
    \theta &= (\theta_A, \theta_B)  &                       
        &&\text{fixed coin biases} \\
    Z_n &\sim \mathrm{Uniform}\{A, B\}    & \forall\, n=1,\dots,N
        &&\text{coin indicators} \\
    X_n | Z_n, \theta &\sim \mathrm{Bin}[\theta_{Z_n}, M] & \forall\, n=1,\dots,N
        &&\text{head count}
    \end{aligned}
    $$

## Complete Data Log-Likelihood

The complete data log-likelihood for a single trial $(x_n, z_n)$ is
    $$
    \log p(x_n, z_n | \theta) = \log p(z_n) + \log p(x_n | z_n, \theta)
    $$
In this model, $P(z_n) = \frac{1}{2}$ is uniform.  The remaining term is
    $$\begin{aligned}
    \log p(x_n | z_n, \theta)
    &= \log \binom{M}{x_n} \theta_{z_n}^{x_n} (1-\theta_{z_n})^{M-x_n} \\
    &= \log \binom{M}{x_n} + x_n \log\theta_{z_n} + (M-x_n)\log(1-\theta_{z_n})
    \end{aligned}$$

## Expectation Maximization

Now that we have specified the probabilistic model and worked out all relevant probabilities, we are ready to derive an Expectation Maximization algorithm.

The **E-Step** is straightforward.  The **M-Step** computes a new parameter estimate $\theta_{t+1}$ by optimizing over the lower bound found in the E-Step.  Let $\vartheta = \vartheta_{t+1} = \theta_t$.  Then,
    $$\begin{aligned}
    \theta_{t+1}
    = \arg\max_\theta \L(\theta, q_\vartheta)
    &= \arg\max_\theta E_q[\log p(\X, Z | \theta )]                  \\
    &= \arg\max_\theta E_q[\log p(\X | Z, \theta) p(Z)]              \\
    &= \arg\max_\theta E_q[\log p(\X | Z, \theta)] + \log p(Z)        \\
    &= \arg\max_\theta E_q[\log p(\X | Z, \theta)]
    \end{aligned}$$

Now, because each trial is conditionally independent of the others, given the parameters,
    $$\begin{aligned}
    E_q[\log p(\X | Z, \theta)]                      
    &= E_q\left[ \log \prod_{n=1}^N p(x_n | Z_n, \theta) \right]     
     = \sum_{n=1}^N E_q[\log p(x_n | Z_n , \theta)]
    \\
    &= \sum_{n=1}^N E_q \bigg[
            x_n \log \theta_{z_n} + (M-x_n) \log (1-\theta_{z_n})
        \bigg] + \sum_{n=1}^N \log \binom{M}{x_n}
    \\
    &= \sum_{n=1}^N E_q \bigg[
            x_n \log \theta_{z_n} + (M-x_n) \log (1-\theta_{z_n})
        \bigg] + \text{const. w.r.t. } \theta
    \\
    &= \sum_{n=1}^N q_\vartheta(z_n=A)
        \bigg[ x_n \log \theta_A + (M-x_n) \log \theta_A \bigg] \\
    &+ \sum_{n=1}^N q_\vartheta(z_n=B)
        \bigg[ x_n \log \theta_B + (M-x_n) \log \theta_B \bigg]
     + \text{const. w.r.t. } \theta
    \end{aligned}$$

Let $a_k = q(z_k = A)$ and $b_k = q(z_k = B)$.  Note $\sum_{k=1}^N a_k = \sum_{k=1}^N b_k = 1$.  To maximize the above expression with respect to the parameters, we take derivatives with respect to $\theta_A$ and $\theta_B$ and set to zero:
    $$\begin{aligned}
    \frac{\partial}{\partial \theta_A} \bigg[ E_q[\log p(\X | Z, \theta)] \bigg]
    &= \frac{1}{\theta_A} \sum_{n=1}^N a_n x_n
     + \frac{1}{1-\theta_A} \sum_{n=1}^N a_n (M-x_n) = 0 \\
    %
    \frac{\partial}{\partial \theta_B} \bigg[ E_q[\log p(\X | Z, \theta)] \bigg]
    &= \frac{1}{\theta_B} \sum_{n=1}^N b_n x_n
     + \frac{1}{1-\theta_B} \sum_{n=1}^N b_n (M-x_n) = 0 \\
    \end{aligned}$$

Solving for $\theta_A$ and $\theta_B$, we obtain
    $$
    \theta_A = \frac{\sum_{n=1}^N a_n x_n}{\sum_{n=1}^N a_n M}
    \qquad
    \theta_B = \frac{\sum_{n=1}^N b_n x_n}{\sum_{n=1}^N b_n M}
    $$
    
# Example:  Gaussian Mixture Model

## Probabilistic Model

In a Gaussian Mixture Model, samples are drawn from a random *cluster*, each normally distributed with its own mean and variance.  Our goal will be to estimate the following parameters:
    $$
    \begin{aligned}
    \vec\pi &= (\pi_1, \dots, \pi_K) && \text{mixing weights} \\
    \vec\mu &= (\mu_1, \dots, \mu_K) && \text{cluster centers} \\
    \vec\Sigma &= (\Sigma_1, \dots, \Sigma_K) && \text{cluster variance}
    \end{aligned}
    $$
The full model specification is below.  A graphical model is shown in Figure \ref{fig:gmm-pgm}.
    $$
    \begin{aligned}
    \theta &= (\vec\pi, \vec\mu, \vec\Sigma) && \text{model parameters} \\
    z_n &\sim \mathrm{Cat}[\pi]  && \text{cluster indicators} \\
    x_n | z_n, \theta &\sim \mathcal{N}(\mu_{z_n}, \Sigma_{z_n}) && \text{base distribution}
    \end{aligned}
    $$

### Complete Data Log-Likelihood

The complete data log-likelihood for a single datapoint $(x_n, z_n)$ is
    $$\begin{aligned}
    \log p(x_n, z_n | \theta)
    &= \log \prod_{k=1}^K \pi_k \mathcal{N}(x_n \mid \mu_k, \Sigma_k)^{\mathbb{I}(z_n = k)} \\
    &= \sum_{k=1}^K \mathbb{I}(z_n = k) \log \pi_k \mathcal{N}(x_n \mid \mu_k, \Sigma_k)
    \end{aligned}$$
Similarly, the complete data log-likelihood over all points $\{ (x_n, z_n) \}_{n=1}^N$ is
    $$
    \log p(X,Z | \theta)
    = \sum_{n=1}^N \log p(x_n, z_n | \theta)
    = \sum_{n=1}^N \sum_{k=1}^K \mathbb{I}(z_n = k) \log \pi_k \mathcal{N}(x_n \mid \mu_k, \Sigma_k)
    $$

### Hidden Posterior

The hidden posterior for a single point $(x_n, z_n)$ can be found using Bayes' rule:
    $$\begin{aligned}
    p(z_n = k | x_n, \theta)
    &= \frac{P(z_n=k | \theta) p(x_n | z_n=k, \theta)}{p(x_N | \theta)} \\
    &= \frac{\pi_k \mathcal{N}(x_n | \mu_k, \Sigma_k)}{\sum_{k'=1}^K \pi_{k'} \mathcal{N}(x_n | \mu_{k'}, \Sigma_{k'})}
    \end{aligned}$$

## Expectation Maximization

Our derivation will follow that of [murphy:mlapp], adapted to our notation.

### E-Step

Before the E-step, we have an estimate $\theta_t$ of the parameters, and seek to compute a new lower bound on the observed log-likelihood.  Earlier, we showed that the optimal lower bound is
    $$
    \L(q_{\theta_t}, \theta) = E_q[ \log p(\X,Z|\theta)] + \text{const.}
    $$
where $q_{\theta_t}(z) \equiv p(z|\X,\theta_t)$ and the second term is constant with respect to $\theta$.  The E-Step requires us to derive an expression for the first term.  Using \autoref{gmm:complete-log-likelihood}, the expected complete data log-likelihood is given by
    $$\begin{aligned}
    Q(\theta_t, \theta) = E_q[ \log p(\X,Z|\theta)]
    &= \sum_{n=1}^N \sum_{k=1}^K
            E_q\big[ \mathbb{I}(z_n = k) \log \pi_k \mathcal{N}(x_n \mid \mu_k, \Sigma_k) \big] \\
    &= \sum_{n=1}^N \sum_{k=1}^K
            E_q\big[ \mathbb{I}(z_n = k) \big]
            \log \pi_k \mathcal{N}(x_n \mid \mu_k, \Sigma_k) \\
    &= \sum_{n=1}^N \sum_{k=1}^K
            p(z_n=k \mid x_n, \theta_t)
            \log \pi_k \mathcal{N}(x_n \mid \mu_k, \Sigma_k) \\
    &= \sum_{n=1}^N \sum_{k=1}^K
            r_{nk} \log \pi_k
     + \sum_{n=1}^N \sum_{k=1}^K
            r_{nk} \log \mathcal{N}(x_n \mid \mu_k, \Sigma_k)
    \end{aligned}$$
where $r_{nk} \equiv p(z_n = k \mid x_n, \theta_t)$ is the **responsibility** that cluster $k$ takes for data point $x_n$ after step $t$.  During the E-Step, we compute these values explicitly with \autoref{gmm:hidden-posterior}.

### M-Step

During the M-Step, we optimize our lower bound with respect to the parameters $\theta = (\vec\pi, \vec\mu, \vec\Sigma)$.  For the mixing weights $\vec\pi$, we use Lagrange multipliers to maximize the ELBO subject to the constraint $\sum_{k=1}^K \pi_k = 1$.  The Lagrangian is
    $$
    \Lambda(\pi, \lambda) = Q(\theta_t, \theta) + \lambda \left( \sum_{k=1}^K \pi_k - 1 \right)
    $$
Carrying out the optimization, we find that $\lambda = -N$.  The correct update for the mixing weights is
    $$
    \boxed{ \pi_k = \frac{1}{N} \sum_{n=1}^N r_{nk} = \frac{r_k}{N} }
    $$
where $r_k \equiv \sum_{n=1}^n r_{nk}$ is the *effective* number of points assigned to cluster $k$.  For the cluster centers $\vec\mu$ and variance $\vec\Sigma$, you should verify that the correct updates are
    $$
    \boxed{ \mu_k = \frac{\sum_{n=1}^N r_{nk} x_n}{r_k} }
    \qquad
    \boxed{ \Sigma_k = \frac{\sum_{n=1}^N r_{nk} x_n x_n^T}{r_k} - \mu_k \mu_k^T }
    $$

# Advice for Deriving EM Algorithms

The previous two examples suggest a general approach for deriving a new algorithm.

* **Specify the probabilistic model.**  Identify the observed variables, hidden variables, and parameters.  Draw the corresponding graphical model to help determine the underlying independence structure.
* **Identify the complete-data likelihood $P(X,Z|\theta)$.**  For exponential family models, the complete-data likelihood will be convex and easy to optimize.  In other models, other work may be required.
* **Identify the hidden posterior $P(Z|X,\theta)$.**  If this distribution is not tractable, you may want to consider variational inference, which we will discuss later.
* **Derive the E-Step.**  Write down an expression for $E_q[ \log p(\X | Z,\theta)]$.
* **Derive the M-Step.**  Try taking derivatives and setting to zero.  If this doesn't work, you may need to resort to gradient-based methods or variational inference.
