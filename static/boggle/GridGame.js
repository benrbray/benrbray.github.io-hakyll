function mod(a,b) {
	return ((a%b)+b)%b;
};

const Highlight = {
	NONE : null,
	ROW  : 1,
	COL  : 2
}

//// TEMPLATE //////////////////////////////////////////////////////////////////

let gridGameTemplate = (()=>{
	let template = document.createElement("template");
	template.innerHTML = /*html*/`
		<style>
		:host {
			display: inline-block;
			contain: content;
			margin: 0 auto;
			font-size: 2rem;

			--cell-size: 2em;
			--cell-background-rgb: 255,255,255;
			--cell-background-alpha: 1.0;
			--fade-color: white;
		}
		table {
			margin: auto;
			border: 2px solid black;
			user-select: none;
			border-collapse: collapse;
		}

		@keyframes flicker {
			0%   { opacity: 0.5; background-color: white; }
			100% { opacity: 1.0; background-color: black;}
		}
		
		td                { --fadex: 1.10; }
		td:nth-child(2n)  { --fadex: 0.95; }
		td:nth-child(3n)  { --fadex: 1.06; }
		td:nth-child(4)   { --fadex: 0.82; }
		td:nth-child(5n)  { --fadex: 0.90; }
		td:nth-child(7n)  { --fadex: 1.14; }

		tr               { --fadey:  1.15; }
		tr:nth-child(2n) { --fadey:  0.95; }
		tr:nth-child(3n) { --fadey:  1.06; }
		tr:nth-child(4)  { --fadey:  1.00; }
		tr:nth-child(5n) { --fadey:  1.20; }
		tr:nth-child(7n) { --fadey:  1.03; }

		:host(.loading) td {
			/* loading animation */
			animation: flicker calc(1.0s*var(--fadex)*var(--fadey)) ease alternate infinite;
			animation-delay: calc(-1s * (var(--fadex) + var(--fadey)));
		}

		td {
			position: relative;
			box-sizing: border-box;
			width: var(--cell-size);
			height: var(--cell-size);
			text-align: center;
			vertical-align: middle;
			border: 1px solid #aaa;

			background-color: rgba(var(--cell-background-rgb), var(--cell-background-alpha));

			/* Fix Firefox Render Issue (https://stackoverflow.com/a/16337203) */
			background-clip: padding-box;
		}
		td.void {
			background-color: black;
			border: none;
		}
		td.disabled {
			background-color: gray;
		}
		td.highlight:not([disabled]) {
			background-color: lightblue;
		}
		td:focus, td.highlight:focus {
			background-color: #8cbaca;
		}
		td.circled::before {
			content: "";
			box-sizing: border-box;
			display: block;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
			border: 1px solid black;
			border-radius: 50%;
		}
		</style>
		<table id="board" tabindex="0">
			<tbody id="boardBody">
			</tbody>
		</table>`;
	return template;
})();

export function init(){
	window.customElements.define("grid-game", GridGameElement);
}

//// CUSTOM ELEMENT CLASS //////////////////////////////////////////////////////

export class GridGameElement extends HTMLElement {

	constructor(){
		console.log("boggle :: constructor");
		// required call to base constructor
		super();

		// attach template as shadow dom
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(gridGameTemplate.content.cloneNode(true));

		// get named elements
		this.boardElement = this.shadowRoot.getElementById("board");
		this.boardBody = this.shadowRoot.getElementById("boardBody");

		// focus / highlight
		this.focusedCell = null;
		this.highlightCells = null;
		this.highlightFocusIdx = -1;
		this.highlightMode = null;
		this.highlightModeIdx = -1;
		
		// game info
		this.gameType = null;

		// events
		// TODO: oninput event
		this.addEventListener("keydown", this.handleKeyDown);
		this.addEventListener("blur", this.handleBlur);
	}

	//// DATA ////////////////////////////////////////////////////////

	getArray(){
		let result = [];

		for(let r = 0; r < this.numRows; r++){
			let row = [];
			for(let c = 0; c < this.numCols; c++){
				let cell = this.getCell(r, c);
				let isVoid = cell.classList.contains("void");
				row.push( isVoid ? null : cell.textContent );
			}
			result.push(row);
		}

		return result;
	}
	
	//// EVENTS //////////////////////////////////////////////////////

	handleClick(row, col){
		// ignore click when disabled
		if(this.disabled){ return; }
		console.log(`boggle :: click (r=${row}, c=${col})`);

		if(this.gameType == "crossword"){
			// clicking highlighted col?
			if(this.highlightMode == Highlight.ROW && row == this.highlightModeIdx){
				this.highlightMode = Highlight.COL;
				this.highlightModeIdx = -1;
			} else if(this.highlightMode == Highlight.COL && col == this.highlightModeIdx){
				this.highlightMode = Highlight.ROW;
				this.highlightModeIdx = -1;
			}

			// highlight rows by default
			if(this.highlightMode == Highlight.COL){
				this.highlightColAt(row, col, true);
				this.highlightMode = Highlight.COL;
				this.highlightModeIdx = col;
			} else {
				this.highlightRowAt(row, col, true);
				this.highlightMode = Highlight.ROW;
				this.highlightModeIdx = row;
			}
		}
	}

	// when a single cell gains focus
	handleFocus(row, col){
		console.log(`boggle :: focus (r=${row}, c=${col})`);
		this.focusedCell = [row, col];
	}

	// when the entire board loses focus
	handleBlur(){
		console.log("boggle :: blur");
		this.focusedCell = null;
		this.unhighlight();
	}

	handleKeyDown(evt){
		const Key = {
			BACKSPACE : 8,
			TAB : 9,
			LEFT : 37,
			RIGHT: 39,
			UP : 38,
			DOWN : 40,
			DELETE : 46,
			PERIOD: 190
		}

		const FocusAction = {
			NONE : 0,
			NEXT : 1,
			PREV : 2,
			UP : 3,
			DOWN : 4
		}

		// ignore when inactive or disabled
		if(this != document.activeElement){ return; }
		if(this.disabled){ return; }
		if(this.focusedCell == null){ return; };

		let focusedCell = this.getCell(this.focusedCell[0], this.focusedCell[1]);

		evt.preventDefault();
		console.log("boggle :: pressed " + evt.keyCode);

		let focusAction = FocusAction.NONE;

		// handle alpha input
		if(evt.keyCode >= 65 && evt.keyCode <= 90){
			console.log("boggle :: alpha input");
			let char = String.fromCharCode(evt.keyCode);
			focusedCell.textContent = char;
			focusAction = FocusAction.NEXT;
		}
		// handle numeric input
		if(evt.keyCode >= 48 && evt.keyCode <= 57){
			console.log("boggle :: numeric input");
			let char = String.fromCharCode(evt.keyCode);
			focusedCell.textContent = char;
			focusAction = FocusAction.NEXT;
		}
		// handle deletion
		if(evt.keyCode == Key.BACKSPACE){
			focusedCell.textContent = "";
			focusAction = FocusAction.PREV;
		}
		if(evt.keyCode == Key.DELETE){
			focusedCell.textContent = "";
			focusAction = FocusAction.NONE;
		}

		// handle direction keys
		if(evt.keyCode == Key.LEFT){ focusAction = FocusAction.PREV; }
		if(evt.keyCode == Key.RIGHT){ focusAction = FocusAction.NEXT; }
		if(evt.keyCode == Key.UP){ focusAction = FocusAction.UP; }
		if(evt.keyCode == Key.DOWN){ focusAction = FocusAction.DOWN; }

		if(focusAction == FocusAction.NONE){ return; }
		
		if(this.highlightCells == null){
			let row = this.focusedCell[0];
			let col = this.focusedCell[1];
			let disabled = true;
			let cell = this.getCell(row, col);

			//TODO:  what if entire row/col is disabled?
			while(disabled && focusAction != FocusAction.NONE){

				if(focusAction == FocusAction.PREV){
					[row, col] = this.cellPosPrev(row, col);
				}
				if(focusAction == FocusAction.NEXT){
					[row, col] = this.cellPosNext(row, col);
				}
				if(focusAction == FocusAction.UP){
					row = mod( (row - 1), this.numRows);
				}
				if(focusAction == FocusAction.DOWN){
					row = mod( (row + 1), this.numRows);
				}

				cell = this.getCell(row, col);
				disabled = cell.hasAttribute("disabled") && cell.getAttribute("disabled") != "false";
			}

			cell.focus();
		} else {
			let disabled = true;
			let cell = this.highlightCells[this.highlightFocusIdx];

			//TODO:  what if entire row/col is disabled?
			while(disabled && focusAction != FocusAction.NONE){

				if(focusAction == FocusAction.PREV){
					this.highlightFocusIdx = mod(this.highlightFocusIdx - 1, this.highlightCells.length);
				}
				if(focusAction == FocusAction.NEXT){
					this.highlightFocusIdx = mod(this.highlightFocusIdx + 1, this.highlightCells.length);
				}
				if(focusAction == FocusAction.UP){
					// TODO (up row/col)
				}
				if(focusAction == FocusAction.DOWN){
					// TODO (down row/col)
				}

				cell = this.highlightCells[this.highlightFocusIdx];
				disabled = cell.hasAttribute("disabled") && cell.getAttribute("disabled") != "false";
			}

			cell.focus();
		}
	}

	cellPosNext(row, col){
		if(col + 1 >= this.numCols){
			return [ mod(row + 1, this.numRows), 
			         mod(col + 1, this.numCols) ];
		} else {
			return [ row, col + 1];
		}
	}
	
	cellPosPrev(row, col){
		if(col - 1 < 0){
			return [ mod(row - 1, this.numRows), mod(col - 1, this.numCols) ];
		} else {
			return [ row, col - 1];
		}
	}

	//////////////////////////////////////////////////////////////////

	/* RESETBOARD
	 * Modifies the board to match the current dimensions (numRows/numCols).
	 */
	resetBoard(){
		console.log("boggle :: resetBoard()");

		// unhighlight
		this.unhighlight();

		// remove rows as needed
		while(this.boardBody.children.length > this.numRows){
			this.boardBody.removeChild(this.boardBody.lastChild);
		}
		// create rows as needed
		while(this.boardBody.children.length < this.numRows){
			let tr = document.createElement("tr");
			this.boardBody.appendChild(tr);
		}

		// modify existing rows add/remove cols as needed
		for(let rowIdx = 0; rowIdx < this.numRows; rowIdx++){
			let rowElement = this.boardBody.children[rowIdx];
			// remove cols as needed
			while(rowElement.children.length > this.numCols){
				rowElement.removeChild(rowElement.lastChild);
			}
			// create cols as needed
			while(rowElement.children.length < this.numCols){
				let td = document.createElement("td");
				let colIdx = rowElement.children.length;
				td.setAttribute("tabindex", -1);
				td.addEventListener("mousedown", 
					evt => this.handleClick(rowIdx, colIdx)
				);
				td.addEventListener("focus", 
					evt => this.handleFocus(rowIdx, colIdx)
				);
				rowElement.appendChild(td);
			}
		}
	}

	//////////////////////////////////////////////////////////////////

	fromString(input){
		// if input empty, fail gracefully
		if(!input){ return null; }
		input = input.trim();
		if(input.length == 0){ return null; }
		
		// parse input and validate dimensions
		let lines = input.split("\n");
		let numRows = lines.length;
		if(numRows < 1){ return null; }
		
		let numCols = 0;
		let data = [];

		for(let r = 0; r < numRows; r++){
			let line = lines[r].split("");

			// first row determines numCols
			if(r == 0){ numCols = line.length; }
			else if(line.length != numCols){ return null; }

			// handle blank / disabled cells
			for(let c = 0; c < numCols; c++){
				if(line[c] == "_"){
					line[c] = "";
				} else if(line[c] == "@"){
					line[c] = null;
				}
			}

			data.push(line);
		}
		
		return {
			numRows : numRows,
			numCols : numCols,
			data : data
		};
	}

	//// CALLBACKS ///////////////////////////////////////////////////

	connectedCallback(){
		console.log("boggle :: connectedCallback");

		// ISSUE: TextContent may not always exist when `connectedCallback()`
		// is called.  See for example:
		//    > https://github.com/WebReflection/html-parsed-element
		//    > https://stackoverflow.com/questions/48498581/textcontent-empty-in-connectedcallback-of-a-custom-htmlelement
		if(this.textContent){
			let boardData = this.fromString(this.textContent);

			if(boardData){
				this.fillBoard(boardData);
			}
		}

		this.resetBoard();
	}

	fillBoard(boardData){
		this.numRows = boardData.numRows;
		this.numCols = boardData.numCols;

		for(let r = 0; r < this.numRows; r++){
			for(let c = 0; c < this.numCols; c++){
				// TODO: make it easier to iterate over cells without
				// depending on specific structure as a table
				let data = boardData.data[r][c];
				let cell = this.getCell(r,c);

				if(data)          { cell.textContent = data; }
				if(data === null) {
					cell.classList.add("void");
					cell.setAttribute("disabled","");
					cell.removeAttribute("tabindex","");
				}
			}
		}
	}

	attributeChangedCallback(name, oldValue, newValue){
		if(oldValue == newValue) return;
		console.log(`boggle :: attribute changed (${name}, ${oldValue}, ${newValue})`);
		
		switch(name){
			case "rows": this.numRows = newValue; break;
			case "cols": this.numCols = newValue; break;
			case "type":
				this.gameType = newValue;
		}

		// when disabled, remove from tab order
		if (this.disabled) {
			this.boardElement.setAttribute('tabindex', '-1');
			this.setAttribute('aria-disabled', 'true');
		} else {
			this.boardElement.setAttribute('tabindex', '0');
			this.setAttribute('aria-disabled', 'false');
		}
	}

	//// PROPERTIES //////////////////////////////////////////////////

	// observed attributes

	static get observedAttributes(){
		return ["disabled", "cols", "rows", "type"];
	}

	// disabled

	get disabled() {
		return this.hasAttribute("disabled");
	}

	set disabled(val) {
		if(val){ this.setAttribute("disabled", ""); }
		else   { this.removeAttribute("disabled");  }
	}

	// dimensions

	get numRows() { return Number(this.getAttribute("rows")) || 4; }
	get numCols() { return Number(this.getAttribute("cols")) || 4; }
	set numRows(count) { 
		this.setAttribute("rows", (count > 0) ? count : 0 );
		this.resetBoard();
	}
	set numCols(count) {
		this.setAttribute("cols", (count > 0) ? count : 0 );
		this.resetBoard();
	}

	getCell(row, col){
		return this.boardBody.children[row].children[col];
	}

	// Selection -----------------------------------------------------

	unhighlight(){
		if(!this.highlightCells) { return; }

		for(let k = 0; k < this.highlightCells.length; k++){
			// possibly undefined if board has been resized
			if(this.highlightCells[k]){
				this.highlightCells[k].classList.remove("highlight");
			}
		}
		
		this.highlightCells = null;
	}

	// selection

	cellDisabled(row, col){
		let cell = this.getCell(row,col);
		return (cell.hasAttribute("disabled") && cell.getAttribute("disabled") != "false");
	}

	highlight(coords, focusIdx=0){
		if(!coords){ this.unselect(); return; }

		this.unhighlight();
		this.highlightCells = [];
		for(let k = 0; k < coords.length; k++){
			let pos = coords[k];
			let cell = this.getCell(pos[0], pos[1]);
			this.highlightCells.push(cell);
			cell.classList.add("highlight");
		}

		// handle empty highlight
		if(this.highlightCells.length == 0){
			this.highlightCells = null;
			this.highlightFocusIdx = -1;
		}

		// determine focus within highlight
		if(focusIdx < 0 || focusIdx > this.highlightCells.length){
			if(this.focusedCell){
				this.getCell(this.focusedCell[0], this.focusedCell[1]).blur();
			}
			this.highlightFocusIdx = -1;
		} else {
			this.highlightFocusIdx = focusIdx;
			this.highlightCells[focusIdx].focus();
		}
	}

	highlightRowAt(row, col, contiguous=false){
		// validate arguments
		let abort = false;
		abort = abort || (row < 0 || row > this.numRows);
		abort = abort || (contiguous && (col < 0 || col >= this.numCols));
		abort = abort || (contiguous && this.cellDisabled(row, col));
		if(abort){ this.unhighlight(); return; }

		// highlight cols [a, b) of this row
		let a = 0;
		let b = this.numCols;

		// expand outwards from (row,col) horizontally
		// until a disabled cell is encountered
		if(contiguous){
			a = col;
			b = col+1;
			while(a > 0            && !this.cellDisabled(row, a-1)) { a--; }
			while(b < this.numCols && !this.cellDisabled(row, b))   { b++; }
		}

		// return highlighted coordinates
		let coords = [];
		for(let c = a; c < b; c++){
			coords.push([row, c]);
		}
		
		// choose focused cell
		let focusCol = col - a;
		if(focusCol < 0) { focusCol = 0; }
		if(focusCol > coords.length) { focusCol = coords.length; }
		this.highlight(coords, focusCol);
	}

	highlightColAt(row, col, contiguous=false){
		// validate arguments
		let abort = false;
		abort = abort || (col < 0 || col >= this.numCols);
		abort = abort || (contiguous && (row < 0 || row >= this.numRows));
		if(abort){ this.unhighlight(); return; }
		
		// highlight rows [a, b) of this column
		let a = 0;
		let b = this.numRows;
		
		// expand outwards from (row,col) vertically
		// until a disabled cell is encountered
		if(contiguous){
			a = row;
			b = row+1;
			while(a > 0            && !this.cellDisabled(a-1, col)) { a--; }
			while(b < this.numRows && !this.cellDisabled(b,   col)) { b++; }
		}

		// return highlighted coordinates
		let coords = [];
		for(let r = a; r < b; r++){
			coords.push([r,col]);
		}

		// choose focused cell
		let focusRow = row - a;
		if(focusRow < 0) { focusCol = 0; }
		if(focusRow > coords.length) { focusRow = coords.length; }
		this.highlight(coords, focusRow);
	}
}