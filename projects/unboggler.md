---
title:  Unboggler
date: January 18, 2020
tags: algorithms
thumb_url: images/thumbnails/boggle_thumb.jpg
priority: 1
summary: Generate a boggle board containing your custom list of words!
---

<style>

/* ==== BOGGLE ============================================================== */

#boggle-game {
	display: grid;
	position: relative;
	
	grid-gap: 1rem;
	grid: "controls words" auto
	      "board words" 1fr
		  "solve words" auto
		  / auto 1fr;
}

grid-game {
  font-family: var(--sans-font);
}

#boggle-controls { grid-area: controls; }
#boggle-solve    { grid-area: solve;    }
#boggle-board    { grid-area: board;    }
#boggle-list     { grid-area: words;    }

#boggle-list {
	position: absolute;
	max-height: 100%;
	overflow-y: auto;
  font-family: var(--sans-font);
}

.wordList {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}

.wordList span {
	flex: 1;
	/*padding: 4px 0.5em 2px 0.5em;*/
  padding: 2px 0.5em;
	margin: 0.2em;

  /* display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column; */

	text-align: center;
	color: darkblue;
	background-color: lightblue;
	border: 1px solid darkblue;
	border-radius: 4px;
	user-select: none;
}

.wordList span:hover {
	background-color: #89bed0;
}

#boggle-controls {
	display: grid;
	grid: auto / 1fr 1fr;
	grid-auto-flow: row;
	grid-gap: 1em;
}

#boggle-solve button {
	font-size: 1.2em;
  font-family: var(--serif-font);
	color: white;
	background-color: #52b955;
	border: none;
}

#boggle-solve button:hover {
	background-color: #479c4a;
}

#boggle-game .controls button {
	display: block;
	width: 100%;
	height: 2em;
}

/* ==== UNBOGGLE ============================================================ */

#unboggle-game {
	display: grid;
	position: relative;
	
	grid-gap: 1rem;
	grid: "board words" 1fr
		  "solve words" auto
		  / auto 1fr;
}

#unboggle-solve { grid-area: solve; }
#unboggle-board { grid-area: board; }
#unboggle-words { grid-area: words; }

#unboggle-board {
	--cell-background-rgb: 0,0,0;
	background-color: black;
	color: white;
}

#unboggle-input {
	width: 100%;
	height: 100%;
	font-size: 1.2em;
}

#unboggle-solve button {
	font-size: 1.2em;
	color: #52b955;
	width: 100%;
	height: 2em;
	background-color: white;
	border: 2px solid #52b955;
}

#unboggle-solve button:hover {
	background-color: #eee;
}

#unboggle-button.stop {
	border-color: red;
	color: red;
	background-color: white;
}

#unboggle-container {
	position: relative;
}

#unboggle-overlay {
	display: none;
	position: relative;
	grid-area: board;
	background-color: rgba(255,255,255,0.5);
	z-index: 1;
}

#crossword {
	display: block;
	font-size: 1rem;
	margin: 1em auto;
}

.checkboxes {
	display: grid;
	grid: 1fr / 1fr 1fr;
	grid-gap: 1px;
	background-color: #999;
	border: 1px solid #999;
}

.checkboxes input {
	display: none;
	position: absolute;
	pointer-events: none;

	background: transparent;
	border-radius: 0px;
	padding: 5px;
	box-shadow: none!important;
}
.checkboxes input[type="radio"] + span:hover {
	background-color: #e0e0e0;
}
.checkboxes input[type="radio"]:checked + span {
	background-color: lightblue;
	color: darkblue;
}.checkboxes input[type="radio"]:checked + span:hover {
	background-color: #89bed0;
}

.checkboxes label {
	background-color: white;
	text-align: center;
	user-select: none;
}
.checkboxes input[type="radio"] + span {
  display: block;
  padding: 5px 10px;
}
</style>

<!-- Scripts -->
<script src="/static/boggle/dictionary.js"></script>
<script src="/static/boggle/WordTrie.js"></script>
<script src="/static/boggle/minisat.js"></script>
<script src="/static/boggle/boggle.js" defer></script>
<script src="/static/boggle/unboggle.js" defer></script>
<script src="/static/boggle/GridGame.js" type="module"></script>

<script type="module">
import { init, GridGameElement } from "/static/boggle/GridGame.js";

console.log("module code!!!");
window.customElements.define("grid-game", GridGameElement);
</script>

# Boggle

Boggle is a classic board game in which players search for words constructed by connecting adjacent tiles in a grid of letters.  Letters can be used at most once, and are allowed to connect horizontally, vertically, or diagonally.  Listing all words in a Boggle board is a common interview question, easily achieved by querying a <a href="https://en.wikipedia.org/wiki/Trie">trie</a> data structure assembled from a list of dictionary words.  Use the widget below to see it in action!

<div id="boggle-game">
<div id="boggle-controls" class="controls"><button style="grid-column-end:span 2;" onclick="boggleRandomize()" type="button">Randomize</button><div class="checkboxes" style="grid-column-end:span 2"><label><input type="radio" onclick="randomDice()"  name="randomize" value="boggle-dice" required checked="checked"><span>Boggle Dice</span></label><label><input type="radio" onclick="randomFreq()"  name="randomize" value="frequency" required><span>Frequency</span></label><label><input type="radio" onclick="randomUniform()"  name="randomize" value="uniform" required><span>Uniform</span></label><label><input type="radio" onclick="randomWord()" name="randomize" value="long-word" required><span>Long Word</span></label></div></div>
<grid-game id="boggle-board" type="boggle" data-rows="4" data-cols="4">
PYBO
ALGG
MELW
HTIE
</grid-game>
<div id="boggle-list">
<div class="wordList"></div>
</div>
<div id="boggle-solve" class="controls">
<button onclick="solveBoggle()" type="button">SOLVE!</button>
</div>
</div>

<!-- UNBOGGLE ----------------------------------------------------------------->
# Unboggle

Boggle was easy enough, so let's try <b>Unboggle</b>, or reverse boggle, where the goal is to reconstruct a Boggle board from a given list of words.  There is no obvious way to divide-and-conquer the problem and no obvious greedy algorithm guaranteed to use all the words in the list.  Instead, I encode Unboggle as a **boolean satisfiability** problem using [`logic-solver.js`](https://github.com/meteor/logic-solver), a convenient wrapper around the general-purpose [`minisat`](http://minisat.se/) solver, which has been compiled to JavaScript using [`emscripten`](https://emscripten.org/).  

## The Unboggler

Try it out below!  For a 4x4 grid and about 10 words, you can expect the Unboggle search to take about 30 seconds.  Since the solver isn't designed to detect unsatisfiability, the Unboggler may hang for much longer if no satisfying board exists!

<div id="unboggle-game">
<!-- Board -->
<grid-game id="unboggle-board" type="boggle" data-rows="4" data-cols="4">
THE-
UN--
BOGG
LER-
</grid-game>
<!-- Spinner -->
<div id="unboggle-overlay">
	<div class="spinner"></div>
</div>
<!-- Word List -->
<div id="unboggle-words">
<textarea id="unboggle-input" type="text" style="box-sizing:border-box">
ANTIQUE
EQUITY
QUALITY
EQUIVALENT
ANTIQUITY
DIVIDE
QUILT
</textarea>
</div>
<!-- Controls -->
<div id="unboggle-solve" class="controls"><button id="unboggle-button" type="button">UNSOLVE?</button></div>
</div>

## SAT Solvers

SAT solvers search for a satisfying assignment of `true` and `false` values to a boolean formula containing literals, conjunction, disjunction, and negation.  For example, the formula

$$
(x_1 \vee x_2 \vee \neg x_3)
\wedge (\neg x_1 \vee x_2 \vee \neg x_4)
\wedge (\neg x_3 \vee \neg x_4 \vee x_5)
$$

is satisfied by the assignment $x_1 = x_2 = \mathtt{true}$ and $x_3 = x_4 = \mathtt{false}$.  Integer constraints like $y=11$ can be encoded as binary constraints on the individual binary digits $y = y_4 y_3 y_2 y_1$, like so:

$$
y_4 \wedge \neg y_3 \wedge y_2 \wedge y_1
$$

Thankfully, `logic-solver.js` takes care of binary encodings for us and supports basic arithmetic constraints like $(=, <, >, \leq, \geq)$, together with addition and subtraction.

## SAT Encoding

To encode Unboggle as a satisfiability problem, suppose we wish to fit $m$ words on an $n \times n$ board.  Assume an average word length $\ell$.

* For each letter of every word on the list, we use two integer variables to represent the letter's grid coordinates, requiring $L = 2 m \ell \lceil \log_2 n \rceil$ binary literals.
* When the board size is not a power of two, each coordinate needs an upper bound.
* Adjacent letters within the same word must be adjacent on the board.
* A word cannot overlap itself; its coordinate pairs must all be distinct.
* Two different words can only intersect at a common letter; that is, two different letters from distinct words cannot occupy the same space.

The number of constraints increases roughly quadratically with the number of words, so Unboggling more than ten words may take quite a while!  The code below uses `logic-solver.js` to represent these constraints:

```javascript
function encode(numRows, numCols, words){
	let solver = new Logic.Solver();

	// dimensions
	let numWords = words.length;
	let numRowBits = Math.ceil(Math.log2(numRows));
	let numColBits = Math.ceil(Math.log2(numCols));

	// bit constants
	let const_1  = Logic.constantBits(1);
	let const_numRows = Logic.constantBits(numRows);
	let const_numCols = Logic.constantBits(numCols);

	// word constraints
	let wordPaths = [];

	for(let w = 0; w < numWords; w++){
		// translate word
		let word = words[w];
		let wordPath = [];

		for(let i = 0; i < word.length; i++){
			// location of ith letter stored in variables:
			//     p_(w)_(i)_r and p_(w)_(i)_c
			let pr = Logic.variableBits(`p_${w}_${i}_r`, numRowBits);
			let pc = Logic.variableBits(`p_${w}_${i}_c`, numColBits);
			wordPath.push([pr,pc]);

			// enforce board boundaries on paths (coordinates zero-indexed)
			solver.require(Logic.lessThan(pr, const_numRows));
			solver.require(Logic.lessThan(pc, const_numCols));

			// adjacent letters in word must be adjacent on board
			if(i > 0){
				// x difference
				solver.require(Logic.lessThanOrEqual(wordPath[i-1][0], Logic.sum(wordPath[i][0],   const_1)));
				solver.require(Logic.lessThanOrEqual(wordPath[i][0],   Logic.sum(wordPath[i-1][0], const_1)));
				// y difference
				solver.require(Logic.lessThanOrEqual(wordPath[i-1][1], Logic.sum(wordPath[i][1],   const_1)));
				solver.require(Logic.lessThanOrEqual(wordPath[i][1],   Logic.sum(wordPath[i-1][1], const_1)));
			}
		}

		// path cannot overlap itself
		for(let i = 0; i < word.length; i++){
			for(let j = i+1; j < word.length; j++){
				solver.require(Logic.atMostOne(
					Logic.equalBits(wordPath[i][0],wordPath[j][0]),
					Logic.equalBits(wordPath[i][1],wordPath[j][1])
				));
			}
		}

		wordPaths.push(wordPath);
	}

	// now, ensure word paths are all compatible
	for(let w1 = 0; w1 < numWords; w1++){
		for(let w2 = w1+1; w2 < numWords; w2++){
			let word1 = words[w1];
			let word2 = words[w2];

			for(let i = 0; i < word1.length; i++){
				for(let j = 0; j < word2.length; j++){
					// no constraint if words have letter in common
					if(word1[i] == word2[j]){ continue; }

					// prevent different letters from occupying same space
					solver.require(Logic.atMostOne(
						Logic.equalBits( wordPaths[w1][i][0], wordPaths[w2][j][0] ),
						Logic.equalBits( wordPaths[w1][i][1], wordPaths[w2][j][1] )
					));
				}
			}
		}
	}

	// find solution
	return {
		solution: solver.solve(),
		wordPaths: wordPaths
	};
}
```