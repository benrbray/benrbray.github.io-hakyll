let unboggle = null;
let unboggleInput = null;
let unboggleButton = null;

// worker
let worker = null;
let workerIsWorking = false;

window.addEventListener("load", function(){
	unboggle = document.getElementById("unboggle-board");

	// unboggle button
	unboggleButton = document.getElementById("unboggle-button");
	unboggleButton.addEventListener("click", function(evt){
		if(workerIsWorking){ stopUnboggler(); }
		else               { runUnboggler();  }
	});

	// restrict input
	unboggleInput = document.getElementById("unboggle-input");
	unboggleInput.addEventListener("input", function(evt){
		let text = unboggleInput.value;
		unboggleInput.value = text.replace(/[^a-zA-Z\n\r]/g, "");
		unboggleInput.value = text.replace(/[^a-zA-Z\n\r]/g, "");
	});
});

function createWorker(){
	console.log("unboggle :: creating worker");

	worker = new Worker("/static/boggle/unboggle.worker.js");
	worker.onmessage = function(evt){
		// loading animation
		stopLoadAnimation();
		workerIsWorking = false;

		// handle no solution
		if(evt.data == null){
			console.error("unboggle :: could not find solution!");
			return;
		}

		// populate board with solution
		unboggle.fillBoard(evt.data);
	}
}

function startLoadAnimation(){
	unboggle.classList.add("loading");
	unboggleButton.classList.add("stop");
	unboggleButton.innerText = "GIVE UP?";
}

function stopLoadAnimation(){
	unboggle.classList.remove("loading");
	unboggleButton.classList.remove("stop");
	unboggleButton.innerText = "UNSOLVE?";
}

function stopUnboggler(){
	console.log("unboggle :: stop");
	stopLoadAnimation();
	worker.terminate();
	console.log(worker);
	workerIsWorking = false;
}

function runUnboggler(){
	console.log("unboggle :: start");

	// if worker already working, restart
	if(workerIsWorking){ stopUnboggler(); }
	// ensure worker exists
	if(worker == null){ createWorker(); }

	// validate dimensions
	let numRows = boggle.numRows;
	let numCols = boggle.numCols; 

	if(numRows != 4 || numCols != 4){
		console.log("sorry! unboggler only works with 4x4");
	}

	// get valid words from textarea
	let words = unboggleInput.value.toUpperCase().split("\n");
	let validWords = [];
	for(let k = 0; k < words.length; k++){
		let word = words[k].replace(/\s/g,'');
		if(word.length == 0){ continue; }
		validWords.push(word);
	}

	// replace textarea with valid words
	unboggleInput.value = validWords.join("\n");

	// run unboggler as web worker
	worker.postMessage({
		numRows: numRows,
		numCols: numCols,
		words: validWords
	});

	workerIsWorking = true;

	// loading animation
	startLoadAnimation();
}