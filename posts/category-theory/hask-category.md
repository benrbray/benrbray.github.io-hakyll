---
tags: math, category-theory, functional-programming
tools: haskell
katex_macros: category-theory.katex
title: The Hask Category
date: 2021-06-01
summary: "A quick reference for understanding the <b>Hask</b> category of Haskell functions between data types."
---

## The Category `Hask`

> (note:  this page is not original research, but rather a synthesis of the best explanations I could find online for each of these topics individually)
>
> The Haskell Wikibook is written from the perspective of someone who knows a bit of Haskell and wants to know how it connects to category theory.  Instead, I'm someone who knows a bit of category theory and wants to know how it connects to Haskell.

Functional programming concepts like `Functor` and `Monad` do not always correspond in an obvious way to their category theory counterparts.  These notes aim to clarify the relationship between Haskell syntax and category theory.


Haskellers like to imagine that there is a category `Hask` such that:

* objects in `Hask` are concrete data **types** of kind `*`.

* morphisms in `Hask` are Haskell functions (which are **values**).  For two concrete types `A` and `B`, the hom-set `Hom(A,B)` is the set of functions with signature `A -> B`.

* function composition is given by `f . g`

* the [[polymorphic]] function `id` provides an identity morphism `id :: A -> A` for every data type `A`

The rest of this section explains why `Hask` is not actually a category.

### (`Hask` is Not a Category)

We follow the [explanation](https://stackoverflow.com/a/48490015/1444650) by user K. A. Buhr on StackOverflow.  According to [HaskellWiki/Hask](https://wiki.haskell.org/Hask), the magically-strict [`seq`](https://wiki.haskell.org/Seq)[ function ](https://wiki.haskell.org/Seq)allows us to construct morphisms which violate the category laws.

```haskell
undef1 = undefined :: a -> b
undef2 = \_ -> undefined
```

Consider their monomorphic specializations to the type `() -> ()`,

```haskell
undef1, undef2 :: () -> ()
undef1 = undefined
undef2 = \_ -> undefined
```

It turns out that `undef1 . id = undef2`, so if the morphisms `Hask` are to be Haskell functions, the category laws mandate that `undef1` and `undef2` should refer to the same Haskell function.  How can we check?

In Haskell, primitives like `Integer` can be directly compared.  For compound types, we normally think of two values as being different if we can construct an expression that ***witnesses*** a difference in directly comparable values:

```haskell
-- 4 is a witness to the fact that sqrt =/= id, allowing
-- us to conclude `sqrt` and `id` are different values
sqrt 4 = 2
id   4 = 4
```

Similarly, `seq` witnesses the difference between `undef1` and `undef2`:

```haskell
seq undef1 ()
-- use defn of undef1
= seq undefined ()
-- seq semantics:  WHNF of undefined is _|_, so value is _|_
= _|_

seq undef2 ()
-- use defn of undef2
= seq (\_ -> undefined) ()
-- seq semantics: (\_ -> undefined) is already in WHNF
-- and is not _|_, so value is second arg ()
= ()
```

Since `undef1 . id = undef2`, but `undef1 ≠ undef2`, our category law is violated.

### (Towards a Solution)

So, the wiki proposes instead that morphisms in `Hask` should be equivalence classes of Haskell functions, where `f` and `g` equivalent iff `f x = g x` for all inputs `x`.

However, [Andrej Bauer points out](http://math.andrej.com/2016/08/06/hask-is-not-a-category/) that due to the lack of a formal [[operational-semantics]] for Haskell, there is no rigorous way to determine if two expressions (therefore two morphisms) are equal.  This idea is [explained further](https://stackoverflow.com/a/48490015/1444650) by user K. A. Buhr on StackOverflow.

The [Haskell Wikibook](https://en.wikibooks.org/wiki/Haskell/Category_theory#cite_note-1) proposes a different solution, which involves redefining function composition to be strict:

> We can define a new strict composition function, `f .! g = ((.) $! f) $! g`, that makes **Hask** a category. We proceed by using the normal `(.)`, though, and attribute any discrepancies to the fact that `seq` breaks an awful lot of the nice language properties anyway.

A [reddit comment](https://www.reddit.com/r/haskell/comments/4wk0gs/hask_is_not_a_category/d69j1de/) in response to Andrej Bauer's post proposes this:

> **Hask** is this category:
>
> * The objects are types of kind `*`.
>
> * For objects `A`, `B`, the hom-set `hom(A,B)` is the quotient `(A -> B) / equal3{A,B}`, where `A -> B` is the set of values of that type.
>
> * For object `A`, the identity morphism is the `equal3{A,A}` equivalence class containing `(\a -> a) :: A -> A`.
>
> * For objects `A`, `B`, `C`, and morphisms `F ∈ hom(A,B)`, `G ∈ hom(B,C)`, the composition `G . F` is the `equal3{A,C}` equivalence class containing `\a -> g (f a)`, where `f ∈ F`, `g ∈ G`.

### (Truth from Lies)

For the above reasons, among others, we cannot confidently say that `Hask` is a genuine category.  Nevertheless, many constructs in Haskell are inspired by category theory, and treating `Hask` like a genuine category can lend some clarity to their definitions.

Moreover, **fast and loose reasoning is morally correct**:

* @[danielsson2006_fast-loose-morally-correct]

### (Hask is Not Cartesian Closed)

Putting aside that `Hask` isn't even a category, the wiki points out a number of technical limitations prevent `Hask` from being a [[cartesian-closed-category]] as well.

* it does not have sums, products, or an initial object

* `()` is not a terminal object

* the monad identities fail for almost all instances of `Monad`

Because of these difficulties, Haskell developers tend to think in some subset of Haskell (`PlatonicHask`) where types do not have [[bottom]] values.

* `PlatonicHask` only includes functions that terminate, and typically only finite values

* the corresponding category has the expected initial and terminal objects, sums and products, and instances of `Functor` and `Monad` really are endofunctors and monads

## Endofunctors in `Hask`

A [[functor]] is a map between categories that preserves categorical structure.  In Haskell, we care most about [[endofunctors]], from the category `Hask` to itself.

### Endofunctors, Categorically

An endofunctor `F : Hask -> Hask` in the category `Hask` assigns

* to each type `A` in `Hask` a type `F A` in `Hask`.

* to each Haskell function `f : A -> B` a function `F f : F A -> F B`

* such that `F (id :: A) = (id :: F A)`

* such that `F ( g . f ) = (Fg) . (Ff)` for `f : x -> y`, `g : y -> z`

### Expressing Functors in Haskell

> paraphrased from [leftaroundabout on StackOverflow](https://stackoverflow.com/a/67192985/1444650)

Mathematically speaking, a functor is a [[dependent]] pair, where

* the object map `Type -> Type` lives in Haskell's type-level world

* the morphism map `(a -> b) -> f a -> f b` lives in the value world

Haskell doesn't have a way of specifying such dependent pairs.  The `Functor` typeclass tricks its way around this limitation by allowing the use of *type constructors* as the `Type -> Type` object mapping.

* This helps, because type constructors are unique.  Every one of them can be assigned a well-defined morphism-mapping through Haskell's typeclass mechanism.

* However, the image of a `Functor` is always the proper (full?) subcategory of types in the image of the type constructor, which prevents us from specifying arbitrary object mappings, as we might with a `type` synonym.

IThe takeaway is that there are some (endo)functors in `Hask` which cannot be captured by a `Functor` instance.

**Example.** (Identity Functor) For example, the [identity ](https://hackage.haskell.org/package/transformers-0.2.1.0/docs/src/Data-Functor-Identity.html#Identity)[`Functor`](https://hackage.haskell.org/package/transformers-0.2.1.0/docs/src/Data-Functor-Identity.html#Identity) cannot map a type directly to itself.  Instead, it sends each type to a wrapped, isomorphic copy:

```haskell
newtype Identity a = Identity { unwrap :: a }

instance Functor Identity where
    fmap f (Identity x) = Identity (f x)
```

So, `Identity` isn't, strictly speaking, the identity functor.  Instead, the accessor `unwrap :: Identity a -> a` is a natural isomorphism from `Identity` to the true, category-theoretic identity functor, which is expressible in Haskell as a type alias:

```haskell
type Id a = a
```

Type aliases in Haskell can't be [[typeclass]] instances, so we have to work with the naturally isomorphic `Identity` functor instead.

**Remark.**  Haskell does have a `TypeSynonymInstances` extension, which might not work as expected without also enabling `FlexibleInstances` and `OverlappingInstances`.  See an [answer by mb14 on StackOverflow](https://stackoverflow.com/a/42892551/1444650).

**Example.**  (Const Functor) Similarly, a [[const-functor]] is naturally isomorphic to the constant functor we normally think of in category theory.

```haskell
type CF m a = m

-- we have a constant functor
--     with object mapping     CF m
--     with morphism mapping   id @m  (type application syntax)
-- but no way to pair them together!
```

Due to Haskell's limitations, though, we end up in a situation where `Const Int Char` and `Const Int Bool` are technically speaking different, albeit isomorphic, types.

### The `Functor` Typeclass

Every `Functor` in Haskell is an endofunctors from `Hask` to `Hask`.

```haskell
class Functor (F :: * -> *) where
    fmap :: (a -> b) -> F a -> F b
```

If you're wondering why we specify an `fmap` for morphisms but apparently no corresponding omap for objects, you're not alone!

* SO, ["Why Functor class has no return function?"](https://stackoverflow.com/questions/21647659/why-functor-class-has-no-return-function)

* SO, ["Why is pure required for Applicative and not for Functor?"](https://stackoverflow.com/questions/33441140/why-is-pure-only-required-for-applicative-and-not-already-for-functor?noredirect=1\&lq=1)

* SO, ["Why does the Functor class in Haskell not include a function on objects?  Is pure that function?"](https://stackoverflow.com/questions/52219614/why-does-the-functor-class-in-haskell-not-include-a-function-on-objects-is-pur?noredirect=1\&lq=1)

* SO, ["How are functors in Haskell related to functors in category theory?"](https://stackoverflow.com/questions/14820139/how-are-functors-in-haskell-related-to-functors-in-category-theory)

Here are two example instances of `Functor`:

```haskell
instance Functor [] where
    fmap [] = []
    fmap f (x:xs) = (f x) : (fmap xs)

-- Maybe sends type T to (Maybe T) 
data Maybe a = Nothing | Just a

instance Functor Maybe where
  fmap f (Just x) = Just (f x)
  fmap _ Nothing  = Nothing
```

Notice that the type constructor `Maybe` sends each type `T` to a new type `Maybe T`.   **Hence the object map for the ********************`Maybe`******************** functor is the type constructor itself!**

```haskell
-- this isn't a real signature
Maybe :: T -> Maybe T
```

### Aside: Endofunctors Enriched in `Hask`

From [an answer by Eduardo Pareja Tobes](https://stackoverflow.com/a/14851700/1444650) on StackOverflow:

> One important point about this is that what you really want is functors [[enriched]] in **Hask**, not just plain old functors. **Hask** is cartesian closed ([<u>](http://blog.sigfpe.com/2009/10/what-category-do-haskell-types-and.html?showComment=1255861175804#c3365363734200015962)[not really](http://blog.sigfpe.com/2009/10/what-category-do-haskell-types-and.html?showComment=1255861175804#c3365363734200015962)[</u>](http://blog.sigfpe.com/2009/10/what-category-do-haskell-types-and.html?showComment=1255861175804#c3365363734200015962), but it tries hard to be onesuch), and so it is naturally enriched in itself.
>
> Now, [[enriched-endofunctors]] give you a way of restricting to those ***implementable within the language***:
>
> an enriched functor **Hask -> Hask** is a function at the level of objects (types) `f a` and for each pair of objects `a, b` a morphism in **Hask** going *f : ************Hask************(a,b) -> ************Hask************(fa,fb)*. Of course, this is just `fmap :: (a -> b) -> f a -> f b`

### Aside: Desugaring `Functor`

We can desugar the typeclass syntax according to the rules described in @[peyton-jones2011_classes-not-as-we-know-them], giving

```haskell
-- to make a functor instance, we just need an fmap
data Functor f
  = MkFunctor ((a -> b) -> f a -> f b)

-- given a Functor, selects the correct fmap function
fmap :: Num a -> ((a -> b) -> f a -> f b)
fmap (MkFunctor m) = m

-- an instance declaration
dFunctorList :: Functor []
dFunctorList = MkFunctor map where
    map [] = []
    map f (x:xs) = (f x) : (fmap xs)
```

## Natural Transformations in `Hask`

> Following Milewski, "[CTfP, Natural Transformations](https://bartoszmilewski.com/2015/04/07/natural-transformations/)"
>
> @[fong2020_cats4progs] Chapter 3
>
> Milewski, ["Parametricity: Money for Nothing and Theorems for Free"](https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/)

Given functors $F$ and $G$, a natural transformation $\alpha : F \Rightarrow G$ assigns

* to each datatype $x \in \Hask$ a Haskell funcion $\alpha_x : Fx \rightarrow Gx$

* such that $\alpha_y \circ Ff = Gf \circ \alpha_x$ for all functions $f : x \rightarrow y$

In Haskell, a [[natural transformation]] between functors `f` and `g` is just a [[polymorphic]] function:

```haskell
type Nat f g = forall a. f a -> g a
```

Every polymorphic function already gives a map between datatypes.  As a consequence of [[parametric polymorphism]], a Haskell function of the type below automatically obeys the natural transformation law!

```haskell
-- a family of functions parameterized by `a`
alpha :: forall a. F a -> G a
```

To see why, recall that the action of a Haskell `Functor` `F` on a function `f` is implemented with `fmap :: (a -> b) -> (F a -> F b)`.  So, the natural transformation law above can be rewritten as

```haskell
-- given functors F, G from Hask => Hask
-- for any f :: x -> y, we require that
alpha . (fmap f) = (fmap f) . alpha

-- (both sides of the equation have type Fx -> Gy)
```

Where parametric polymorphism allows us to omit subscripts.

> [[TODO]]: Finish this explanation of why parametrically polymorphic functions are automatically natural transformations.  See @[reynolds1972-definitional-interpreters-higher-order-pl], @[wadler1989-theorems-for-free], and a [post by Milewski](https://bartoszmilewski.com/2015/04/07/natural-transformations/).
>
> **Q:** is parametric polymorphism related to a universal property?  see e.g. @[ghani2015_parametric-polymorphism-universally]

### Examples of Natural Transformations in `Hask`

**Example.**  The parametrically polymorphic function `safeHead` is a natural transformation from the `List` functor to the `Maybe` functor.

```haskell
safeHead :: [a] -> Maybe a
safeHead []     = Nothing
safeHead (x:xs) = Just x

-- naturality condition
fmap f . safeHead = safeHead . fmap f
```

**Example.**  A natural transformation from or to a [[const-functor]] looks just like a function that's either polymorphic in its return type or in its argument type.

```haskell
newtype Const a b = Const a

instance Functor (Const m) where
    fmap :: (a -> b) -> Const a -> Const b
    fmap _ (Const a) = Const (f b)
```

### Yoneda Lemma in `Hask`

> see [[yoneda-lemma]] for examples of Yoneda and coYoneda in `Hask`

## Monads in `Hask`

Following the  [Haskell Wikibook](https://en.wikibooks.org/wiki/Haskell/Category_theory#Monads), a [[monad]] in the category $C$ is an endofunctor $M : C \rightarrow C$ together with two natural transformations

$$
\begin{aligned}
\mathrm{unit}^M &: 1_C       \rightarrow M \\
\mathrm{join}^M &: M \circ M \rightarrow M
\end{aligned}
$$

This translates to the following Haskell typeclass:

```haskell
class Functor m => Monad m where
  return :: a -> m a
  (>>=)  :: m a -> (a -> m b) -> m b
```

`Hask` is an endofunctor together with two morphisms for each

see [[monoid-in-the-category-of-endofunctors]]

## Kleisli Category

## Exponentials in `Hask`

An [[exponential]] is a universal function object.

* see Milewski, ["CTfP:  Function Types"](https://bartoszmilewski.com/2015/03/13/function-types/)

### Misc

coends?

## References

Category `Hask`

* [Haskell/CategoryTheory](https://en.wikibooks.org/wiki/Haskell/Category_theory#Hask.2C_the_Haskell_category)

* Haskell Wiki, ["Hask"](https://wiki.haskell.org/Hask)

* Andrej Bauer 2016, ["Hask is not a Category"](http://math.andrej.com/2016/08/06/hask-is-not-a-category/)

* StackOverflow, [Is Hask Even a Category?](https://stackoverflow.com/questions/48485660/is-hask-even-a-category)

* Makoto Hamana 2007, ["What is the Category for Haskell?"](http://www.cs.gunma-u.ac.jp/\~hamana/Papers/cpo.pdf)

* Fong, ["C4P: Is Haskell a Category?"](http://brendanfong.com/programmingcats_files/C4P-chapter1.pdf)

* StackOverflow, ["Do all Type Classes in Haskell Have a Category-Theoretic Analogue?"](https://stackoverflow.com/questions/37367390/do-all-type-classes-in-haskell-have-a-category-theoretic-analogue)

* StackOverflow, ["Where to values fit in Category of Hask?"](https://stackoverflow.com/questions/17380379/where-do-values-fit-in-category-of-hask)
  * talks about a different category where values are objects and functions are either morphisms or functors

* \[my question] StackOverflow, ["Is Haskell's ](https://stackoverflow.com/questions/67189886/is-haskells-const-functor-analogous-to-the-constant-functor-from-category-the)[`Const`](https://stackoverflow.com/questions/67189886/is-haskells-const-functor-analogous-to-the-constant-functor-from-category-the)[ Functor analogous to the constant functor from category theory?"](https://stackoverflow.com/questions/67189886/is-haskells-const-functor-analogous-to-the-constant-functor-from-category-the)

Functors

* StackOverflow, ["Why Functor class has no return function?"](https://stackoverflow.com/questions/21647659/why-functor-class-has-no-return-function)

Natural Transformations

* StackOverflow, ["What is a natural transformation in Haskell?"](https://stackoverflow.com/questions/58363868/what-is-a-natural-transformation-in-haskell)

Monads

* Wikipedia, ["Monad (Category Theory)"](https://en.wikipedia.org/wiki/Monad_\(category_theory\))
