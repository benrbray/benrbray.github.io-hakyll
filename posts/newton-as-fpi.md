---
title:  Newton's Method is Newton's Method
date:  2019-08-21
unpublished: True
tags:  calculus, optimization, numerical-methods
summary:  There are two versions of Newton's method, one for root-finding, $f(x) = 0$, and one for optimization, $min_{x \in \R^n} f(x)$.  In this post, I show explicitly that Newton's method for optimization is simply Newton's method applied to finding fixed points of the gradient map $x \mapsto \nabla x f$.
---

# Newton's Method for Root-finding

$$
x_{t+1} \equiv x_t - \frac{f(x_t)}{f'(x_t)}
$$

# Newton's Method for Optimization

Now, suppose we wish to minimize a function $f : \R \rightarrow \R$.  The standard approach looks for **stationary points** satisfying the first-order condition $f'(x) = 0$.  If $f$ is convex (for example), then there is a unique stationary point at the global minimum of $f$.

To find a stationary point, we can apply Newton's method to find roots of the derivative $f' : \R \rightarrow \R$ mapping $x \mapsto f'(x)$.

$$
x_{t+1} \equiv x_t - \frac{f'(x_t)}{f''(x_t)}
$$

So, the connection between Newton's method for optimization and root finding in one dimension is clear.  However, in two dimensions, Newton's method for optimization looks like

$$
x_{t+1} \equiv x_t - (\nabla^2_{x_t} f)^{-1} (\nabla_{x_t} f) 
$$

# Multivariate Newton's Method for Optimization

Now, suppose we want to minimize the multivariate function $f : \R^n \rightarrow \R$.

* The derivative evaluated at any $x \in \R^n$ is a linear transformation $\nabla_x f : \R^n \rightarrow \R$
    * Can be represented by a row vector.
* At a critical point, the function $\nabla_x f$ should map every input to zero.
    * i.e. at a critical point $\nabla_x f$ is represented by the zero vector.
    
<div style="border:1px solid black; padding:20px; margin:20px">
<b>Problem:</b>  Derive a multivariable version of Newton's method for finding critical points of $f : \R^n \rightarrow \R$.
<ul>
    <li>(Use the linear approximation interpretation of Newton's root-finding method.)</li>
    <li>What assumptions are needed about the function $f$ for this method to work?</li>
</ul>
</div>

## Solution

Essentially, we want to find zeros of the map $\varphi : \R^n \rightarrow \R^n$ mapping $x \mapsto \nabla_x f$.  The linear approximation to $\varphi$ at a point $x_t \in \R^n$ is
$$
\psi(y) = \varphi(x_t) + (\nabla_{x_t} \varphi) (y-x_t)
$$

Since $\varphi : \R^n \rightarrow \R^n$, its derivative $\varphi \in L(\R^n \rightarrow \R^n)$ can be represented by an $(n \times n)$ matrix.  Assume this matrix is invertible.  Choose $x_{t+1}$ to be a root of $\psi$,

$$
\begin{aligned}
\psi(x_{t+1}) = 0 &\implies (\nabla_{x_t} \varphi) (x_{t+1}-x_t) = -\varphi(x_t) \\
&\implies x_{t+1} - x_t = - (\nabla_{x_t} \varphi)^{-1} \varphi(x_t) \\
\end{aligned}
$$

Notice that $\nabla_{x_t} \varphi$ is the Hessian of $f$, and $\varphi(x_t)$ was defined to be the gradient.  Therefore, multivariate Newton's method for optimization has the form

$$
x_{t+1} = x_t - (\nabla^2_{x_t} f)^{-1} (\nabla_{x_t} f)
$$

# Bonus: Newton's Method for Vector-valued Functions

TODO