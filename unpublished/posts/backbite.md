---
title:  Backbite Algorithm for Sampling Hamiltonian Paths
date: 2020-01-18
summary: todo
---

<script src="/static/boggle/dictionary.js"></script>
<script src="/static/boggle/WordTrie.js"></script>
<script src="/static/boggle/boggle.js" defer></script>
<script src="/static/boggle/backbite.js" defer></script>
<script src="https://d3js.org/d3.v5.min.js"></script>

<style>
line {
    shape-rendering: crispEdges;
}

.hampath {
    stroke-width: 5;
    fill: none;
}

/*#backbite-example {
    display: grid;
    grid: 1fr 1fr / 1fr 1fr;
    grid-gap: 1em 0;
    grid-auto-flow: row;
    max-width: 100%;
    counter-reset: fignum;
}
@media (max-width: 600px) {
    #backbite-example {
        grid: 1fr / 1fr;
    }
}*/

figure svg {
    display: block;
    margin: 0 auto;
    max-width: min(100%, 80vw);
}

tt {
    background-color: #ccc;
}


text.pathArrows {
    font-size: 48px;
    dominant-baseline: central;
    user-select: none;
}
</style>

### Hamiltonian Paths

<p>A <a href="https://en.wikipedia.org/wiki/Hamiltonian_path"><dfn>Hamiltonian path</dfn></a> in a graph $G=(V,E)$ is a path $p$ which visits each vertex exactly once.  Determining whether a Hamiltonian path <a href="https://en.wikipedia.org/wiki/Hamiltonian_path_problem">exists</a> is an NP-complete decision problem, even if we restrict our attention to graphs with special structure, such as <a href="http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.383.1078">subsets of grid graphs</a>.

A Hamiltonian graph may have more than one Hamiltonian path.  Suppose we have a graph $G=(V,E)$ that we <b>know</b> is Hamiltonian, perhaps because we already have a Hamiltonian path $p$.  Is it possible to sample a random Hamiltonian path uniformly at random from $G$?

### Animated Visualization

<figure>
    <svg id="backbite-demo"></svg>
</figure>

*Minor Implementation Detail:*  Although I use the backbite algorithm for <em>Long Word</em> randomization, I don't run the algorithm long enough to achieve a uniformly random Hamiltonian path.

### Algorithm Overview

<figure role="group">
<div id="backbite-example" class="img-gallery col-2">
<figure>
<svg></svg>
<figcaption>The backbite algorithm starts by randomly choosing one endpoint of a valid <span style="color:blue">hamiltonian path</span>.</figcaption>
</figure>
<figure>
<svg></svg>
<figcaption>Next, we <span style="color:green">connect</span> the endpoint to a random neighbor <tt>v</tt>.  To maintain the Hamiltonian path, one of <tt>v</tt>'s two incident edges must be removed.  </figcaption>
</figure>
<figure>
<svg></svg>
<figcaption>One choice will always disconnect the path, creating a <span style="color:red">loop</span>.  So, we should choose the other edge!</figcaption>
</figure>
<figure>
<svg></svg>
<figcaption>Deleting the other edge results in a <span style="color:green">new hamiltonian path</span>, as desired.  Notice that one endpoint has changed!</figcaption>
</figure>
</div>
</figure>

### Implementation:  Linked List Path

<p>There are a number of different possible implementations, depending on how we choose to represent the graph <span class="math">\(G\)</span> and the path <span class="math">\(h\)</span>.</p>
<dl>
<dt>Adjacency Matrix</dt>
<dd>asdfasdf</dd>
<dt>Adjacency List</dt>
<dd>asdfasdf</dd>
<dt>Implicit Graph</dt>
<dd>asdfasdf</dd>
</dl>

### Detail:  Cycle Detection
### Detail:  Path Reversal

As an aside, the problem of determining whether a graph $G$ contains a Hamiltonian path (or cycle) is <a href="https://en.wikipedia.org/wiki/NP-completeness">NP-complete</a>.  The standard proof involves a reduction from 3-SAT!  By encoding the Hamiltonian path problem as a satisfiability problem, we can again use <tt>minisat.js</tt> to search for a solution.