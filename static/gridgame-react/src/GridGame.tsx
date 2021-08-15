import * as React from "react";
import * as ReactDOM from "react-dom";

// Fix React events inside shadow DOM
// https://github.com/spring-media/react-shadow-dom-retarget-events
import retargetEvents from "react-shadow-dom-retarget-events";

// fake console (for mobile debugging) -------------------------------

let enableFakeConsole = false;
if (enableFakeConsole) {
	let fakeConsole = document.getElementById("console");

	let old_log = console.log;

	console.log = function (...args: any[]) {
		old_log(...args);
		let elt = document.createElement("div");
		elt.innerText = args.map((v, k) => String(v)).join(" ");
		if (fakeConsole) {
			fakeConsole.appendChild(elt);
			fakeConsole.scrollTop = fakeConsole.scrollHeight;
		}
	};
	console.error = console.debug = console.info = console.log;
}

// helper functions --------------------------------------------------

// range(1,5) returns [1,2,3,4]
const range = (a: number, b?: number): number[] => {
	if (b === undefined) { return Array.from({ length: a }, (v, k) => k); }
	else { return Array.from({ length: b - a }, (v: any, k: number) => k + a); }
};

function clone2dArray<T>(arr: Array<Array<T>>): Array<Array<T>> {
	return arr.map((row, idx) => row.slice());
};

function mod(a: number, b: number): number {
	return ((a % b) + b) % b;
};

// enums -------------------------------------------------------------

enum Key {
	BACKSPACE = 8, TAB = 9,
	LEFT = 37, RIGHT = 39, UP = 38, DOWN = 40,
	DELETE = 46,
	PERIOD = 190
};

enum HighlightMode {
	NONE, ROW, COLUMN, ROW_CONTIGUOUS, COLUMN_CONTIGUOUS
}

interface Highlight {
	mode: HighlightMode;
	modeIdx?: number;
	coords: GridCoord[];
	focusIdx: number | null;
}

// init --------------------------------------------------------------

export function init() {
	// define web component; usable as <grid-game></grid-game>
	customElements.define("grid-game", GridGameElement);
}

// <style> -----------------------------------------------------------
let gridStyle = /*css*/`
	grid-game {
		display: inline-block;
		contain: content;
		margin: 0 auto;
		font-size: 2rem;

		--cell-size: 2em;
		--cell-background-rgb: 255,255,255;
		--cell-background-alpha: 1.0;
		--fade-color: white;
	}
	#board {
		display: table;
		margin: auto;
		border: 2px solid black;
		user-select: none;
		border-collapse: collapse;
	}
	.board-row {display: table-row; }

	@keyframes flicker {
		0 % { opacity: 1.0; background- color: #aaa; }
		100% {opacity: 1.0; background-color: black;}
	}

	.cell                {--fadex: 1.10; }
	.cell:nth-child(2n)  {--fadex: 0.90; }
	.cell:nth-child(3n)  {--fadex: 1.32; }
	.cell:nth-child(4)   {--fadex: 0.82; }
	.cell:nth-child(5n)  {--fadex: 1.06; }
	.cell:nth-child(7n)  {--fadex: 1.14; }

	.board-row               {--fadey:  1.03; }
	.board-row:nth-child(2n) {--fadey:  1.11; }
	.board-row:nth-child(3n) {--fadey:  0.87; }
	.board-row:nth-child(4)  {--fadey:  1.00; }
	.board-row:nth-child(5n) {--fadey:  1.20; }
	.board-row:nth-child(7n) {--fadey:  1.03; }

	grid-game.loading .cell {
		/* loading animation */
		animation: flicker calc(1.4s*var(--fadex)*var(--fadey)) ease alternate infinite;
		animation-delay: calc(-1s * (var(--fadex) + var(--fadey)));
	}

	.cell {
		display: table-cell;
		position: relative;
		width: var(--cell-size);
		height: var(--cell-size);
		text-align: center;
		vertical-align: middle;
		border: 1px solid #aaa;
		user-select: none;

		background-color: rgba(var(--cell-background-rgb), var(--cell-background-alpha));

		/* Fix Firefox Render Issue (https://stackoverflow.com/a/16337203) */
		background-clip: padding-box;
	}

	.cell input {
		position: absolute;
		box-sizing: border-box;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;

		font-size: inherit;

		text-align: center;
		border: none;

		caret-color: transparent;
		user-select: none;
		cursor: default;
	}
	.cell input::selection {
		color: inherit;
		background-color: inherit;
	}

	.cell.void {
		background-color: black;
		border: none;
	}
	.cell.disabled input {
		background-color: gray;
	}
	.cell.highlight input:not([disabled]) {
		background-color: lightblue;
	}
	.cell input:focus, .cell.highlight input:focus {
		background-color: #8cbaca;
	}`;
// </style> ----------------------------------------------------------

interface BoardData {
	board: (string | null)[][];
	numRows: number;
	numCols: number;
};

//// WEB COMPONENT ///////////////////////////////////////////////////

export class GridGameElement extends HTMLElement {

	rootElt: HTMLElement | null;

	constructor() {
		super();
		console.log("gridgame :: constructor");

		this.rootElt = null;

		// workaround for react event issues inside shadow dom
		//retargetEvents(shadowRoot);
	}

	// Dimensions ----------------------------------------------------

	get numRows() { return Number(this.getAttribute("rows")) || 4; }
	get numCols() { return Number(this.getAttribute("cols")) || 4; }
	set numRows(count: number) {
		if (count == this.numRows) { return; }
		this.setAttribute("rows", String(Math.max(count | 0, 0)));
		this.resetBoard();
	}
	set numCols(count: number) {
		if (count == this.numCols) { return; }
		this.setAttribute("cols", String(Math.max(count | 0, 0)));
		this.resetBoard();
	}

	// Disabled / Enabled State --------------------------------------

	get disabled() {
		return this.hasAttribute("disabled");
	}

	set disabled(val) {
		if (val) { this.setAttribute("disabled", ""); }
		else { this.removeAttribute("disabled"); }
	}

	// Render --------------------------------------------------------

	resetBoard(board?: BoardData) {
		console.log("gridGameElement :: resetBoard");
		let component = (<GridGame
			numRows={board?.numRows || 4}
			numCols={board?.numCols || 4}
			board={board?.board || undefined}
		/>);

		ReactDOM.render(component, this.rootElt);
	}


	// Callbacks -----------------------------------------------------

	connectedCallback() {
		console.log("gridGameElement :: connectedCallback");

		// ISSUE: TextContent may not always exist at the point in time
		// when `connectedCallback()` is called.  See for example:
		//    > https://github.com/WebReflection/html-parsed-element
		//    > https://stackoverflow.com/questions/48498581/textcontent-empty-in-connectedcallback-of-a-custom-htmlelement
		let boardData: (BoardData | null) = null;
		if (this.textContent) {
			boardData = GridGameElement.boardFromString(this.textContent);
			this.textContent = "";
			console.log(boardData);
		}

		// render component
		// build template
		let template = document.createElement("div");

		// TODO: less hacky CSS solution?
		let styleElt = document.createElement("style");
		styleElt.innerHTML = gridStyle;
		template.appendChild(styleElt);

		// react root
		this.rootElt = document.createElement("div");
		template.appendChild(this.rootElt);

		// attach template as shadow dom
		//let shadowRoot = this.attachShadow({mode: "open" });
		this.appendChild(template);

		// render board
		this.resetBoard(boardData || undefined);
	}

	// GridGame API --------------------------------------------------

	static boardFromString(content: string): (BoardData | null) {
		// fail gracefully if content invalid
		content = content.trim();
		if (!content) { return null; }

		// parse input and validate dimensions
		let lines = content.split(/\s+/);
		let numRows = lines.length;
		let numCols = lines[0].length;
		let board = [];

		for (let r = 0; r < numRows; r++) {
			let line: (string | null)[] = lines[r].split("");
			// first row determines numCols
			if (line.length != numCols) {
				throw new Error("invalid board string");
			}
			// handle blank / disabled cells
			for (let c = 0; c < numCols; c++) {
				if (line[c] == "_") { line[c] = ""; }
				else if (line[c] == "@") { line[c] = null; }
			}

			board.push(line);
		}

		return { numRows, numCols, board };
	}
}

//// REACT COMPONENTS ////////////////////////////////////////////////

// <GridGame /> ------------------------------------------------------

interface IGridGameProps {
	numRows: number;
	numCols: number;
	board?: (string | null)[][];
}

interface IGridGameState {
	numRows: number;
	numCols: number;
	board: (string | null)[][];
	disabled: boolean;
	focusCoords: { row: number, col: number; } | null;
	highlight: (Highlight | null);
}

interface GridCoord { row: number, col: number; }

export class GridGame extends React.Component<IGridGameProps, IGridGameState> {

	static defaultProps: IGridGameProps = {
		numRows: 4,
		numCols: 4
	};

	/* ---- Constructor ---- */
	constructor(props: IGridGameProps) {
		super(props);

		// TODO: bind event handlers
		this.handleBeforeInput = this.handleBeforeInput.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleClick = this.handleClick.bind(this);

		// default to empty board
		let board = props.board || range(props.numRows).map((v, k) =>
			range(props.numCols).map((v, k) => "")
		);

		// set state
		this.state = {
			numRows: props.numRows,
			numCols: props.numCols,
			board: board,
			disabled: false,
			focusCoords: null,
			highlight: null
		};
	}

	/* ---- Cell Info ---- */

	cellDisabled(row: number, col: number): boolean;
	cellDisabled(coord: GridCoord): boolean;
	cellDisabled(first: any, second?: number): boolean {
		if (second !== undefined) {
			return (this.state.board[first][second] === null);
		} else {
			return (this.state.board[first.row][first.col] === null);
		}
	}

	/* ---- Render ---- */

	render() {
		// determine highlighted cells
		let highlights: boolean[][] = range(this.state.numRows).map((v, k) =>
			range(this.state.numCols).map((v, k) => false)
		);

		if (this.state.highlight?.coords) {
			for (let { row, col } of this.state.highlight.coords) {
				if (row < 0 || row > this.state.numRows) { continue; }
				if (col < 0 || col > this.state.numCols) { continue; }
				highlights[row][col] = true;
			}
		}

		// render grid cells
		return (<div id="board" tabIndex={0}>
			{range(this.state.numRows).map((v, row) =>
				<div className="board-row">
					{range(this.state.numCols).map((v, col) => {
						let shouldFocus: boolean =
							(row == this.state.focusCoords?.row)
							&& (col == this.state.focusCoords?.col);
						return (<GridCell
							value={this.state.board[row][col]}
							handleInput={(evt: React.ChangeEvent<HTMLInputElement>) => this.handleInput(evt, row, col)}
							handleBeforeInput={(evt: React.ChangeEvent<HTMLInputElement>) => this.handleBeforeInput(evt, row, col)}
							handleKeyDown={(evt) => this.handleKeyDown(evt, row, col)}
							handleFocus={(evt) => this.handleFocus(evt, row, col)}
							handleClick={(evt) => this.handleClick(evt, row, col)}
							focus={shouldFocus}
							highlight={highlights[row][col]}
						/>);
					})}
				</div>
			)}
		</div>);
	}

	//// ACTIONS /////////////////////////////////////////////////////

	boardDelete(row: number, col: number) {
		let newBoard = clone2dArray(this.state.board);
		newBoard[row][col] = "";
		this.setState({
			board: newBoard
		});
	}

	boardInsert(value: string, row?: number, col?: number, focus: boolean = true) {
		// default to currently focused cell
		if (row === undefined || col === undefined) {
			if (this.state.focusCoords) {
				if (row === undefined) { row = this.state.focusCoords.row; }
				if (col === undefined) { col = this.state.focusCoords.col; }
			} else {
				return;
			}
		}

		// normalize input
		// TODO: support for input restrictions (A-Z, 0-9, etc.)
		value = value.toUpperCase();

		// insert into board, as if typing
		let board = clone2dArray(this.state.board);
		let [nextRow, nextCol] = [row, col];
		for (let k = 0; k < value.length; k++) {
			board[nextRow][nextCol] = value[k];
			// get next cell, as if typing
			let nextCoord = this.coordAction({ row: nextRow, col: nextCol }, this.coordNext);

			// nextCoord may be null if e.g. a large section of the board is disabled,
			// in which case we exit early and focus on the most recent non-null cell.
			if (nextCoord == null) { break; }
			nextRow = nextCoord.row;
			nextCol = nextCoord.col;
		}

		// optionally set focus
		if (focus) {
			this.setState({
				board: board,
				focusCoords: { row: nextRow, col: nextCol }
			});
		} else {
			this.setState({ board });
		}
	}

	/* ---- Coordinate Computations ---- */

	coordUp = (coord: GridCoord) => this.coordAddWrap(coord, -1, 0);
	coordDown = (coord: GridCoord) => this.coordAddWrap(coord, +1, 0);
	coordLeft = (coord: GridCoord) => this.coordAddWrap(coord, 0, -1);
	coordRight = (coord: GridCoord) => this.coordAddWrap(coord, 0, +1);

	coordAddWrap(coord: GridCoord, dx: number, dy: number): GridCoord {
		return {
			row: mod(coord.row + dx, this.state.numRows),
			col: mod(coord.col + dy, this.state.numCols)
		};
	}

	coordNext(coord: GridCoord): GridCoord {
		let { row, col } = coord;
		if (col + 1 >= this.state.numCols) {
			return { row: mod(row + 1, this.state.numRows), col: mod(col + 1, this.state.numCols) };
		} else {
			return { row: row, col: col + 1 };
		}
	}

	coordPrev(coord: GridCoord): GridCoord {
		let { row, col } = coord;
		if (col - 1 < 0) {
			return { row: mod(row - 1, this.state.numRows), col: mod(col - 1, this.state.numCols) };
		} else {
			return { row: row, col: col - 1 };
		}
	}

	/* COORDACTION
	 * Repeatedly apply `action` until a non-disabled grid cell is found.
	 * To avoid infinite loops, will only retry (numRows*numCols) times.
	 * @param (start) The starting cell.
	 * @param (action) Any function mapping GridCoord --> GridCoord.
	 */
	coordAction(start: GridCoord, action: (c: GridCoord) => GridCoord): (GridCoord | null) {
		let { row, col } = start;
		let coord: GridCoord = action.call(this, { row, col });
		let iter = 0, maxIter = (this.state.numRows * this.state.numCols);

		let disabled = true;
		while ((iter++) < maxIter) {
			disabled = (this.state.board[coord.row][coord.col] == null);

			// stop at first enabled cell, or on reaching start again
			if (!disabled) { break; }
			if (coord.row == row && coord.col == col) { break; }
			// repeatedly apply action until non-void cell is found
			coord = action.call(this, coord);
		}

		return (disabled ? null : coord);
	}

	/* ---- Focus Management ---- */

	focusUp = () => this.focusAction(this.coordUp);
	focusDown = () => this.focusAction(this.coordDown);
	focusLeft = () => this.focusAction(this.coordLeft);
	focusRight = () => this.focusAction(this.coordRight);
	focusNext = () => this.focusAction(this.coordNext);
	focusPrev = () => this.focusAction(this.coordPrev);

	focusAction(action: (coord: GridCoord) => GridCoord): void {
		if (this.state.focusCoords == null) { return; }

		// repeatedly apply `action` until non-void cell is found
		let { row, col } = this.state.focusCoords;
		let coord = this.coordAction(this.state.focusCoords, action);

		// focus on the cell we found
		this.setState({
			focusCoords: coord
		});
	}

	/* ---- Highlight ---- */

	unhighlight() {
		this.setState({ highlight: null });
	}

	highightCoords(coords: (GridCoord[] | null), focusIdx: number = 0) {
		// TODO:  only include valid coords?
		// unhighlight if no coords provided
		if (!coords) { this.unhighlight(); return; }

		this.setState({
			highlight: {
				mode: HighlightMode.NONE,
				modeIdx: -1,
				coords: coords,
				focusIdx: (focusIdx > 0 && focusIdx < coords.length) ? focusIdx : null
			}
		});
	}

	highlightRowAt(row: number, col: number, contiguous: boolean = false) {
		// validate arguments
		let abort = false;
		abort = abort || (row < 0 || row > this.state.numRows);
		abort = abort || (contiguous && (col < 0 || col >= this.state.numCols));
		abort = abort || (contiguous && this.state.board[row][col] == null);
		if (abort) { this.unhighlight(); return; }

		// highlight cols [a, b) of this row
		let a = 0;
		let b = this.state.numCols;

		// expand outwards from (row,col) horizontally
		// until a disabled cell is encountered
		if (contiguous) {
			a = col;
			b = col + 1;
			while (a > 0 && !this.cellDisabled(row, a - 1)) { a--; }
			while (b < this.state.numCols && !this.cellDisabled(row, b)) { b++; }
		}

		// return highlighted coordinates
		let coords: GridCoord[] = [];
		for (let c = a; c < b; c++) {
			coords.push({ row: row, col: c });
		}

		// choose focused cell
		this.setState({
			highlight: {
				mode: HighlightMode.ROW,
				modeIdx: row,
				focusIdx: Math.max(0, Math.min(coords.length - 1, col - a)),
				coords: coords
			}
		});
	}

	highlightColAt(row: number, col: number, contiguous: boolean = false) {
		// validate arguments
		let abort = false;
		abort = abort || (col < 0 || col >= this.state.numCols);
		abort = abort || (contiguous && (row < 0 || row >= this.state.numRows));
		abort = abort || (contiguous && this.cellDisabled(row, col));
		if (abort) { this.unhighlight(); return; }

		// highlight rows [a, b) of this column
		let a = 0;
		let b = this.state.numRows;

		// expand outwards from (row,col) vertically
		// until a disabled cell is encountered
		if (contiguous) {
			a = row;
			b = row + 1;
			while (a > 0 && !this.cellDisabled(a - 1, col)) { a--; }
			while (b < this.state.numRows && !this.cellDisabled(b, col)) { b++; }
		}

		// return highlighted coordinates
		let coords = [];
		for (let r = a; r < b; r++) {
			coords.push({ row: r, col: col });
		}

		// choose focused cell
		this.setState({
			highlight: {
				mode: HighlightMode.COLUMN,
				modeIdx: col,
				focusIdx: Math.max(0, Math.min(coords.length - 1, row - a)),
				coords: coords
			}
		});
	}

	//// EVENT HANDLERS //////////////////////////////////////////////

	/* ---- Event Handlers ---- */

	handleBeforeInput(evt: React.ChangeEvent<HTMLInputElement>, row: number, col: number) {
		// InputEvents don't consistently provide information about the
		// exact changes made, so always clear the input field first
		let target = (evt.target as HTMLInputElement);
		if (target) { target.value = ""; }
	}

	handleInput(evt: React.ChangeEvent<HTMLInputElement>, row: number, col: number) {
		// TODO: should we always prevent default?
		evt.preventDefault();

		// cast, since we know what type of event to expect
		// TODO: handle browsers like Safari/IE which don't have InputEvents
		let target = (evt.target as HTMLInputElement);
		let inputEvent = (evt.nativeEvent as InputEvent);

		// handle delete input types
		switch (inputEvent.inputType) {
			case "deleteContentBackward":
				this.boardDelete(row, col);
				this.focusPrev();
				return;
			case "deleteContentForward":
				this.boardDelete(row, col);
				this.focusNext();
				return;
		}

		// get new value
		let newValue = inputEvent.data || target.value;
		if (!newValue || newValue.length == 0) { return; }
		this.boardInsert(newValue, row, col);
	}

	handleFocus(evt: React.FocusEvent, row: number, col: number) {
		console.log("handleFocus");
		this.setState({ focusCoords: { row, col } });
	}

	handleKeyDown(evt: React.KeyboardEvent, row: number, col: number) {
		// TODO: preventDefault() will prevent cells from firing
		//       an oninput event! make decision later
		//evt.preventDefault();

		// ignore when inactive or disabled
		if (this.state.disabled) { return; }
		if (this.state.focusCoords == null) { return; }
		// TODO: won't this cell automatically be the one focused?
		// assert(this.state.focusCoords == (row, col))

		// TODO: alphanumeric?
		if (evt.keyCode == Key.BACKSPACE) {
			this.boardDelete(row, col);
			this.focusPrev();
			evt.preventDefault();
		}
		if (evt.keyCode == Key.DELETE) {
			this.boardDelete(row, col);
			this.focusNext();
			evt.preventDefault();
		}

		// handle arrow keys
		if (evt.keyCode == Key.LEFT) { this.focusPrev(); }
		if (evt.keyCode == Key.RIGHT) { this.focusNext(); }
		if (evt.keyCode == Key.UP) { this.focusUp(); }
		if (evt.keyCode == Key.DOWN) { this.focusDown(); }
	}

	handleClick(evt: React.MouseEvent, row: number, col: number) {
		// ignore click when disabled
		if (this.state.disabled) { return; }
		console.log(`boggle :: click (r=${row}, c=${col})`);

		let highlight = this.state.highlight;
		let mode = highlight?.mode;

		// clicking highlighted col?
		if (highlight !== null) {
			if (highlight.mode == HighlightMode.ROW && row == highlight?.modeIdx) {
				mode = HighlightMode.COLUMN;
			} else if (highlight.mode == HighlightMode.COLUMN && col == highlight.modeIdx) {
				mode = HighlightMode.ROW;
			}
		}

		// highlight rows by default
		if (mode == HighlightMode.COLUMN) {
			this.highlightColAt(row, col, true);
		} else {
			this.highlightRowAt(row, col, true);
		}
	}
}

// <GridCell /> ------------------------------------------------------

interface IGridCellProps {
	value: (string | null);
	focus?: boolean;
	highlight?: boolean;
	handleInput: React.ChangeEventHandler<HTMLInputElement>;
	handleBeforeInput: React.ChangeEventHandler<HTMLInputElement>;
	handleKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
	handleFocus: React.FocusEventHandler<HTMLInputElement>;
	handleClick: React.MouseEventHandler<HTMLInputElement>;
}

function GridCell(props: IGridCellProps) {
	const inputElt = React.useRef<HTMLInputElement>(null);

	// focus <input> whenever `focus` prop present
	React.useEffect(() => {
		if (props.focus) { inputElt.current?.focus(); }
	}, [props.focus]);

	// handle null cell
	if (props.value == null) {
		return (<div className="cell void"></div>);
	}

	let className = "cell" + (props.highlight ? " highlight" : "");

	return (<div className={className}>
		<input
			type="text"
			autoComplete="plz-dont-autofill"
			onInput={props.handleInput}
			onBeforeInput={props.handleBeforeInput}
			onKeyDown={props.handleKeyDown}
			onFocus={props.handleFocus}
			onClick={props.handleClick}
			value={props.value}
			ref={inputElt}
		/>
	</div>);
};