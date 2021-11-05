///// BACKBITE DEMO //////////////////////////////////////////////////

let examplePath = 
	[{"prev":9,"next":8},{"prev":8,"next":2},{"prev":1,"next":11},{"prev":10,"next":12},{"prev":11,"next":5},{"prev":4,"next":13},{"prev":13,"next":7},{"prev":6,"next":14},{"prev":0,"next":1},{"prev":16,"next":0},{"prev":19,"next":3},{"prev":2,"next":4},{"prev":3,"next":21},{"prev":5,"next":6},{"prev":7,"next":22},{"prev":22,"next":23},{"prev":17,"next":9},{"prev":24,"next":16},{"prev":26,"next":25},{"prev":27,"next":10},{"prev":null,"next":27},{"prev":12,"next":28},{"prev":14,"next":15},{"prev":15,"next":30},{"prev":32,"next":17},{"prev":18,"next":34},{"prev":35,"next":18},{"prev":20,"next":19},{"prev":21,"next":36},{"prev":37,"next":null},{"prev":23,"next":39},{"prev":39,"next":38},{"prev":33,"next":24},{"prev":34,"next":32},{"prev":25,"next":33},{"prev":36,"next":26},{"prev":28,"next":35},{"prev":38,"next":29},{"prev":31,"next":37},{"prev":30,"next":31}];
let exampleEndA = 20;
let exampleEndB = 29;

window.addEventListener("load", function(){
	demoBackbite("#backbite-demo", 10, 16);
	demoExamples();
});

function pathListToPoints(pathList, startIdx){
	let order = [];
	let idx = startIdx;
	while(idx !== null){
		order.push(idx);
		idx = pathList[idx].next;
	}
	return order;
}

function demoBackbite(demoId, numRows, numCols){
	// dimensions
	let demoWidth = 800;
	let demoHeight = 500;
	let demoMargin = 20;

	// generate empty path
	let path = [];
	for(let idx = 0; idx < numRows*numCols; idx++){
		path.push({ prev: null, next: null });
	}

	// generate zigzag
	let zig = true;
	let prev = null;

	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			let idx = r*numCols + ( zig ? c : (numCols-c-1) );

			path[idx].prev = prev;
			if(prev != null){ path[prev].next = idx; }

			prev = idx;
		}
		zig = !zig;
	}

	// path start/end
	let endA = 0;
	let endB = prev;

	// convert path
	let pathPoints = pathListToPoints(path, endA);

	// set up svg
	let demo = d3.select(demoId);
	demo.attr("viewBox", `${-demoMargin} ${-demoMargin} ${demoWidth+2*demoMargin} ${demoHeight+2*demoMargin}`)
		.attr("height", "250");

	
	// draw grid
	demoGrid(demo, demoWidth, demoHeight, numRows, numCols);
	
	let points = [];
	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			points.push({ x:(c+0.5)*demoWidth/numCols, y:(r+0.5)*demoHeight/numRows });
		}
	}

	let lineFunction = d3.line()
		.x(function(d,i){ return points[d].x })
		.y(function(d,i){ return points[d].y })
		.curve(d3.curveNatural)
	//	.curve(d3.curveCatmullRom.alpha(0.5))
	//	.curve(d3.curveCardinal.tension(0.5))

	// path
	let line = demo.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("d", lineFunction(pathPoints))

	// animate
	window.setInterval(function(){
		({path, endA, endB} = backbiteIter(path, numRows, numCols, endA, endB));
		let pathPoints = pathListToPoints(path, endA);
		line.attr("d", lineFunction(pathPoints))
	}, 40);
}

function demoGrid(svg, width, height, numRows, numCols){
	let gridv = svg.append("g")
		.selectAll("line")
		.data(Array(numCols+1))
		.enter()
			.append("line")
			.attr("x1", (d,k) => k*width/numCols)
			.attr("y1", (d,k) => 0)
			.attr("x2", (d,k) => k*width/numCols)
			.attr("y2", (d,k) => height)
			.attr("stroke", "#999")
			.attr("stroke-width", 2);
	let gridh = svg.append("g")
		.selectAll("line")
		.data(Array(numRows+1))
		.enter()
			.append("line")
			.attr("x1", (d,k) => 0)
			.attr("y1", (d,k) => k*height/numRows)
			.attr("x2", (d,k) => width)
			.attr("y2", (d,k) => k*height/numRows)
			.attr("stroke", "#999")
			.attr("stroke-width", 2);
}


// Example 1 ---------------------------------------------------------

function demoExamples(){
	// dimensions
	let demoWidth = 800;
	let demoHeight = 500;
	let demoMargin = 20;
	let numRows = 5;
	let numCols = 8;

	// Path Info -----------------------------------------------------

	// generate empty path
	let pathList = examplePath;
	let endA = exampleEndA;
	let endB = exampleEndB;

	// convert path from linked list --> vertex ids
	let pathPoints = [];
	let idx = endA;
	while(idx !== null){
		pathPoints.push(idx);
		idx = pathList[idx].next;
	}

	// path modifications
	let backbiteIdx = endA + 1;

	let pathExtended = pathPoints.slice();
	pathExtended.splice(0, 0, backbiteIdx);

	let pathFront = pathPoints.slice(0, pathPoints.indexOf(backbiteIdx)+1);
	let pathBack  = pathPoints.slice(pathPoints.indexOf(backbiteIdx)+1);

	let pathFrontLoop = pathFront.slice();
	pathFrontLoop.push(pathPoints[0]);

	let pathResult = pathFront.slice(0, -1).reverse();
	pathResult.push(backbiteIdx);
	pathResult.push(...pathBack);

	// Common --------------------------------------------------------

	// create svg for all examples
	let demoSvgs = d3.select("#backbite-example")
		.selectAll("figure")
		.select("svg")
			.attr("id", (d,k)=>`backbite-example${k+1}`)
			.attr("viewBox", `${-demoMargin} ${-demoMargin} ${demoWidth+2*demoMargin} ${demoHeight+2*demoMargin}`)

	// set up grid for all examples
	demoSvgs.each(function(){
		demoGrid(d3.select(this), demoWidth, demoHeight, numRows, numCols);
	});

	// grid points
	let points = [];
	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			points.push({
				x:(c+0.5)*demoWidth/numCols,
				y:(r+0.5)*demoHeight/numRows
			});
		}
	}

	// line function
	let lineFunction = d3.line()
		.x(function(d,i){ return points[d].x })
		.y(function(d,i){ return points[d].y })
		.curve(d3.curveCardinal.tension(0.3))
	
	// select demos
	let demo1 = d3.select("#backbite-example1");
	let demo2 = d3.select("#backbite-example2");
	let demo3 = d3.select("#backbite-example3");
	let demo4 = d3.select("#backbite-example4");

	// Example 1 -----------------------------------------------------
	
	// original path
	let path = demo1.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("marker-mid", "url(#head)")
		.attr("d", lineFunction(pathPoints))

	d3.select(makeArrows(path.node(), 14))
		.style("fill", "blue");
	
	// Example 2 -----------------------------------------------------

	// original path
	path = demo2.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("id", "path1")
		.attr("d", lineFunction(pathPoints))
	
	d3.select(makeArrows(path.node(), 14))
		.style("fill", "blue");

	// extension
	demo2.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "green")
		.attr("d", lineFunction([backbiteIdx, endA]))

	// Example 3 -----------------------------------------------------

	// original path
	path = demo3.append("svg:path")
		.attr("id", "pathLoop")
		.classed("hampath", true)
		.attr("stroke", "red")
		.attr("d", lineFunction(pathFrontLoop))
	
	d3.select(makeArrows(path.node(), 5))
		.style("fill", "red");

	// extension
	demo3.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("d", lineFunction(pathBack));

	// Example 4 -----------------------------------------------------

	// path
	demo4.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "green")
		.attr("d", lineFunction(pathResult))

}

function makeArrows(pathElt, numArrows=10){
	// assign id to path if none exists
	let id = pathElt.getAttribute("id");
	if(id == null){
		id = Math.random().toString(36).replace('0.','path_');
		pathElt.setAttribute("id", id);
	}

	/* (see https://stackoverflow.com/a/6598786/1444650) */
	let textElt = document.createElementNS("http://www.w3.org/2000/svg", "text")
	pathElt.parentNode.insertBefore(textElt, pathElt);

	d3.select(textElt).classed("pathArrows", true)
		.selectAll("textPath")
		.data(Array(numArrows))
		.enter().append("svg:textPath")
			.attr("xlink:href", `#${id}`)
			.attr("startOffset", (d,k)=>`${((k+1)*100/(numArrows+1)).toFixed(1)}%`)
			.text("\u227B");
	
	return textElt;
}