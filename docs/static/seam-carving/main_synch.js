"use strict";

/* SEAM CARVING
 * Interactive, content-aware image resizing based on the following paper:
 *    
 *    Avidan, Shai, and Ariel Shamir. "Seam carving for content-aware image 
 *    resizing." ACM Transactions on graphics (TOG). Vol. 26. No. 3. ACM, 2007.
 *
 * The following terminology may be used frequently in code and comments:
 *    
 *    MATRIX: A 2D JavaScript array accessed as [row][column] or [y][x].
 *    ARRAY:  When two-dimensional, always accessed as [x][y] or [column][row].
 *    SEAM:   A single horizontal or vertical slice all the way across an image.
 *    MAP:    A 2D array whose indices correspond to coordinates in a processed
 *            image, and whose elements point to indeces in the ImageData.data
 *            array of a source image.  This enables convolution and seam
 *            removal to be performed via the map, rather than attempting to
 *            work with images directly.
 */

//// Constants -----------------------------------------------------------------

// Elements
var container;
var image;

// Color Channels
var RED = 0;
var GREEN = 1;
var BLUE = 2;
var ALPHA = 3;

// Display Modes
var DISPLAY_RESULT = 0;
var DISPLAY_GRADIENT= 1;
var DISPLAY_ENERGY = 2;
var displayMode = DISPLAY_RESULT;

// Images
var IMAGE_OPTIONS = {
	"Balloons" : "img/balloons.png",
	"Book" : "img/book.png",
	"Castle" : "img/castle.jpg",
	"Cattle" : "img/cattle.jpg",
	"Clouds" : "img/clouds.jpg",
	"Flower" : "img/flower.png",
	"Lena" : "img/lena.png",
	"Mandril" : "img/mandril.png",
	"Peppers" : "img/peppers.png",
	"Waterfall" : "img/waterfall.jpg"
};
var DEFAULT_IMAGE = "Castle";

//// Interface -----------------------------------------------------------------

var seamSlider;

// raw image
var currentImage, currentData;
var currentLocalSeams, currentGlobalSeams;

// canvas
var canvas = [];
var context = [];

var imageCanvas, imageContext;
var resultCanvas, resultContext;

//// INITIALIZATION ////////////////////////////////////////////////////////////

// initial config, then wait for image to load
function init(){
	// elements
	container = document.getElementById("container");
	
	// create several canvas elements
	for(var k = 0; k < 5; k++){
		canvas[k] = document.createElement("canvas");
		context[k] = canvas[k].getContext("2d");
		container.appendChild(canvas[k]);
	}
	
	imageCanvas = canvas[0];
	imageContext = context[0];
	resultCanvas = canvas[canvas.length-1];
	resultContext = context[canvas.length-1];
	
	// Controls ----------------------------------------------------------------
	
	// image select
	var imageSelect = document.getElementById("imageSelect");
	Object.keys(IMAGE_OPTIONS).forEach(function(k){
		var opt = document.createElement("option");
		opt.setAttribute("value", k);
		opt.innerHTML = k;
		imageSelect.appendChild(opt);
	})
	
	// image onchange
	imageSelect.onchange = function(evt){
		var key = evt.target.value;
		key = IMAGE_OPTIONS.hasOwnProperty(key) ? key : DEFAULT_IMAGE;
		var path = IMAGE_OPTIONS[key];
		loadImage(path, setImage);
	}
	
	// seam slider
	seamSlider = document.getElementById("seamSlider");
	seamSlider.oninput = function(evt){
		updateInterface(-parseInt(evt.target.value));
	}
	
	// wait for image to load
	imageSelect.value = DEFAULT_IMAGE;
	loadImage(IMAGE_OPTIONS[imageSelect.value], setImage);
}

// image loaded, continue to main
function setImage(img){
	currentImage = img;
	// draw to canvas
	imageCanvas.width = img.width;
	imageCanvas.height = img.height;
	imageContext.drawImage(img, 0, 0);
	// seam carve
	process();
}

//// PROCESSING ////////////////////////////////////////////////////////////////

// perform seam carving & display result
function process(){
	// image dimensions
	var width = currentImage.width;
	var height = currentImage.height;
	
	// get image data
	currentData = imageContext.getImageData(0, 0, width, height);
	
	// intermediate image data
	var initialGrad, initialEnergy;
	
	// seam carve
	var map = getIndexMap(width, height);
	var carvePixels = width-1;
	var curWidth = width;
	currentLocalSeams = [];
	currentGlobalSeams = [];
	
	for(var i = 0; i < carvePixels; i++){
		console.log("ITERATION", i);
		
		// compute gradient
		var energy = computeVerticalGradient(currentData, map, curWidth);
		if(i==0) initialGrad = copy2d(energy);
		
		// accumulate downwards, storing backpointers
		var bp = accumulateEnergy(energy);
		if(i==0) initialEnergy = copy2d(energy);
		
		// follow backpointers to find vertical seam in local coordinates
		var seam = computeSeam(energy, bp);
		currentLocalSeams.push(seam);
		
		// transform seam to source image coordinates
		var globalSeam = new Array(seam.length);
		for(var y = 0; y < seam.length; y++) globalSeam[y] = map[seam[y]][y];
		currentGlobalSeams.push(globalSeam);
		
		// remove seam from map, reducing active width by one
		carve(map, curWidth, seam);
		curWidth--;
	};
	
	// display gradient
	displayGrayArray(canvas[1], initialGrad,   false);
	displayGrayArray(canvas[2], initialEnergy, true);
	
	// prepare interface for interaction
	resetInterface();
}

/* COMPUTEVERTICALGRADIENT
 * Computes a vertical central difference on an ImageData object.
 * @returns A two-dimensional array of integers, accessed as `grad[x][y]`.
 */
function computeVerticalGradient(imgData, map, curWidth){
	var data = imgData.data;
	// compute weighted average difference of neighbors via convolution
	var grad = convolve(imgData, map, curWidth, KERNEL_EDGE, true);
	// take absolute value
	for(var x = 0; x < grad.length; x++){
		for(var y = 0; y < grad[0].length; y++){
			var weight = grad[x][y];
			grad[x][y] = (weight < 0) ? -weight : weight;
		}
	}
	return grad;
}

/* ACCUMULATEENERGY
 * Given an array of energy values (gradients) across an image, propagate low-
 * energy paths downards, in place, storing backpointers at each pixel 
 * indicating the upwards direction of least energy.
 * @param (energy) 2D array of width (energy.length), height (energy[0].length)
 * @returns A matrix of backpointers.
 */
function accumulateEnergy(energy){
	// Backpointer matrix (access [row][column] or [y][x])
	var bp = [[]];
	// Dimensions
	var width = energy.length;
	var height = energy[0].length;
	
	// Dynamic Programming:  Propagate low-energy paths downwards
	for(var y = 1; y < height; y++){
		bp[y] = [];
		for(var x = 0; x < width; x++){
			// find lowest-energy neighbor above
			var above = energy[x][y-1]
			var left  = (x-1 >= 0)    ? energy[x-1][y-1] : false;
			var right = (x+1 < width) ? energy[x+1][y-1] : false;
			
			var low = above;
			var lowIndex = 0;
			if(left!==false  && left < low){  lowIndex = -1; low = left; }
			if(right!==false && right < low){ lowIndex = +1; low = right; }
			
			energy[x][y] += low;
			bp[y][x] = lowIndex; 
		}
	}
	
	return bp;
}

/* COMPUTESEAM
 * Follow backpointers upwards in the image along the lowest-energy path,
 * starting from the pixel of minimum energy in the bottom row.
 * @param (energy) A 2D array of accumulated energy values.
 * @param (bp) A matrix of the same dimensions as `energy` with backpointers,
 *     one per pixel, indicating whether the direction of least energy is
 *     up (0), up-left (-1) or up-right (1).
 * @returns A single vertical seam, or an array mapping y- to x-values.
 */
function computeSeam(energy, bp){
	// dimensions
	var width = energy.length;
	var height = energy[0].length;
	
	// Find lowest-energy accumulated pixel at bottom row of grid
	var curY = height-1;
	var min = energy[0][curY];
	var minIndex = 0;
	for(var x = 1; x < width; x++){
		if(energy[x][curY] < min){
			min = energy[x][curY];
			minIndex = x;
		}
	}
	
	// Follow backpointers to find seam path
	var seam = new Array(height);
	while(curY >= 0){
		seam[curY] = minIndex;
		minIndex += bp[curY--][minIndex];
	}
	
	return seam;
}

/* CARVE
 * Removes a single vertical path from an image map.
 * @param (path) A list of x-values to carve, one per y-value (row).
 */
function carve(map, curWidth, path){
	// remove a single entry in each row by shifting elements left
	for(var y = 0; y < path.length; y++){
		for(var x = path[y]; x < curWidth-1; x++){
			map[x][y] = map[x+1][y];
		}
	}
}

//// INTERFACE /////////////////////////////////////////////////////////////////

/* RESETINTERFACE
 * Prepares the user interface for interaction with the latest result.
 */
function resetInterface(){
	// set seam slider extrema
	seamSlider.min = -currentLocalSeams.length;
	seamSlider.max = 0;
	seamSlider.value = seamSlider.min;
	// show seams
	updateInterface();
}

function updateInterface(seamCount){
	// display seams over source image
	var globalSeams = currentGlobalSeams.slice(0, seamCount);
	displaySeams(canvas[3], imageCanvas, globalSeams);
	// display carved image
	var localSeams = currentLocalSeams.slice(0, seamCount);
	displayResult(resultCanvas, currentData, localSeams);
}

//// DISPLAY ///////////////////////////////////////////////////////////////////

function mapFromSeamList(seams, width, height){
	var map = getIndexMap(width, height);
	for(var s = 0; s < seams.length; s++){
		carve(map, width-s, seams[s]);
	}
	return map;
}

function displayGrayArray(canvas, arr, normalized){
	if(normalized===undefined) normalized = true;
	// dimensions
	var width = canvas.width = arr.length;
	var height = canvas.height = arr[0].length;
	// draw to canvas
	var context = canvas.getContext("2d");
	var dispFunc = normalized ? arrayToGrayNorm : arrayToGray;
	var imgData = dispFunc(context, arr, width, height);
	context.putImageData(imgData, 0, 0);
}

function displaySeams(canvas, sourceCanvas, globalSeams){
	// dimensions
	var width = canvas.width = sourceCanvas.width;
	var height = canvas.height = sourceCanvas.height;
	var seamCount = globalSeams.length;
	
	// draw seam to seamData for visualization
	var seamData = sourceCanvas.getContext("2d").getImageData(0, 0, width, height);
	for(var s = 0; s < seamCount; s++){
		var seam = globalSeams[s];
		for(var y = 0; y < height; y++){
			var idx = seam[y];
			seamData.data[idx] = Math.floor((1.0+s)/seamCount*255.0);
			seamData.data[idx+1] = 0;
			seamData.data[idx+2] = 0;
		}
	}
	canvas.getContext("2d").putImageData(seamData, 0, 0);
}

function displayResult(canvas, imgData, localSeams){
	// dimensions
	var width = imgData.width;
	var height = imgData.height;
	var seamCount = localSeams.length;
	var reducedWidth = width - seamCount;
	
	
	// sort global seam indices
	var sorted = [];
	var xs = new Array(seamCount);
	
	for(var y = 0; y < height; y++){
		// sort seams for this y coordinate
		for(var s = 0; s < seamCount; s++){
			xs[s] = currentGlobalSeams[s][y];
		}
		xs.sort(function(a,b){ return a-b; });
		// insert into final array
		var yidx = y * seamCount;
		for(var s = 0; s < seamCount; s++){
			sorted[yidx+s] = xs[s];
		}
	}
	
	// result
	canvas.width = reducedWidth;
	canvas.height = height;
	var context = canvas.getContext("2d");
	var resultData = context.createImageData(reducedWidth, height);
	
	var seamIdx = 0;
	var resultIdx = 0;
	
	// copy pixels from source to result, skipping those contained in seams
	for(var sourceIdx = 0; sourceIdx < width*height*4; sourceIdx += 4){
		// skip if seam
		if(sourceIdx === sorted[seamIdx]) { seamIdx++; continue; }
		// otherwise draw to result
		for(var c = 0; c < 4; c++){
			resultData.data[resultIdx + c] = imgData.data[sourceIdx + c];
		}
		resultIdx += 4;
	}
	
	context.putImageData(resultData, 0, 0);
}

function displayMap(canvas, imgData, map, mapWidth){
	// set dimensions
	canvas.width = mapWidth;
	canvas.height = imgData.height;
	
	// generate image data
	var context = canvas.getContext("2d");
	var carved = context.createImageData(mapWidth, imgData.height);
	for(var x = 0; x < mapWidth; x++){
		for(var y = 0; y < imgData.height; y++){
			var idx = (x + y*mapWidth)*4;
			carved.data[idx+3] = 255;
			for(var c = 0; c < 3; c++){
				carved.data[idx+c] = imgData.data[map[x][y]+c];
			}
		}
	}
	
	// draw
	context.putImageData(carved, 0, 0);
}

/* GETINDEXMAP
 * Returns an *index map*, initialized as a two-dimensional array of size
 * (width x height) such that each [x][y] coordinate maps to the index of the
 * corresponding pixel color values in an ImageData.data array, of length
 * (width * height * 4), with RGBA values stored sequentially in chunks of 4.
 * @param (width, height) Dimensions of the map array.
 */
function getIndexMap(width, height){
	var map = [];
	for(var x = 0; x < width; x++){
		map[x] = [];
		for(var y = 0; y < height; y++){
			map[x][y] = (x+y*width)*4;
		}
	}
	return map;
}

//// CONVOLUTION ///////////////////////////////////////////////////////////////

var KERNEL_EDGE = [
	[0,1,0],
	[1,-4,1],
	[0,1,0]];
var KERNEL_EDGE_H = [[1,-2,1]];
var KERNEL_EDGE_V = [[1],[-2],[1]];
var KERNEL_SOBEL_H = [
	[1,0,-1],
	[2,0,-2],
	[1,0,-1]];
var KERNEL_SOBEL_V = [
	[ 1, 2, 1],
	[ 0, 0, 0],
	[-1,-2,-1]];
var KERNEL_CUSTOM_EDGE = [
	[ 1, 2, 0],
	[ 2, 0,-2],
	[ 0,-2,-1]];

function convolve(imgData, map, curWidth, kernel, normalize){
	// default arguments
	if(normalize===undefined) normalize=false;
	
	// determine kernel size
	var rows = kernel.length;
	var cols = kernel[0].length;
	if(rows % 2 != 1 || cols % 2 != 1)
		{ throw "Invalid Kernel Size: (" + rows + " x " + cols + ")"; }
	var halfrows = Math.floor(rows/2);
	var halfcols = Math.floor(cols/2);
	
	// normalize kernel
	var kernelNorm = 0;
	if(normalize){
		for(var x = 0; x < rows; x++){
			for(var y = 0; y < cols; y++){
				kernelNorm += Math.abs(kernel[x][y]);
			}
		}
	} else kernelNorm = 1;
	
	// convolve
	var data = imgData.data;
	var result = [];
	for(var x = 0; x < curWidth; x++){
		result[x] = [];//new Uint32Array(curWidth);
		for(var y = 0; y < imgData.height; y++){
			var sum = 0;
			// compute weighted sum of neighboring pixels
			for(var dx = -halfcols; dx <= halfcols; dx++){
				// skip neighbor if outside image
				var xx = x + dx;
				if(xx < 0 || xx >= imgData.width) continue;
				
				for(var dy = -halfrows; dy <= halfrows; dy++){
					// skip neighbor if outside image
					var yy = y + dy;
					if(yy < 0 || yy >= imgData.height) continue;
					
					// use this neighbor
					var weight = kernel[dy+halfrows][dx+halfcols]/3; // [y][x]
					sum += data[map[xx][yy]+0] * weight;
					sum += data[map[xx][yy]+1] * weight;
					sum += data[map[xx][yy]+2] * weight;
				}
			}
			// set pixel
			result[x][y] = sum / kernelNorm;
		}
	}
	
	return result;
}

//// IMAGES ////////////////////////////////////////////////////////////////////

function loadImage(url, callback){
	var img = new Image();
	img.onload = function(){
		callback(this);
	}
	img.src = url;
}

/* GRAYDATAFROMARRAY
 * Converts a 2D array of intensity values to an ImageData object.
 * @param (ctx) Canvas context, necessary for creating new ImageData.
 * @param (gray) Two-dimensional array of pixel intensities in the range [0-255]
 * @param (width,height) Dimensions of image and intensity array.
 * @returns An ImageData object.
 */
function arrayToGray(ctx, gray, width, height){
	// Create grayscale image
	var imgData = ctx.createImageData(width, height);
	for(var x = 0; x < imgData.width; x++){
		for(var y = 0; y < imgData.height; y++){
			var idx = x + y * imgData.width;
			// full alpha channel
			imgData.data[idx*4 + ALPHA] = 255;
			// equal color channels
			for(var c = 0; c < 3; c++){
				imgData.data[idx*4 + c] = gray[x][y];
			}
		}
	}
	return imgData;
}

/* GRAYDATAFROMARRAY
 * Converts a 2D array of intensity values to an ImageData object, with values
 * normalized to the range [0-255] based on the extrema of the input array.
 * 
 * @param (ctx) Canvas context, necessary for creating new ImageData.
 * @param (gray) Two-dimensional array of pixel intensities in the range [0-255]
 * @param (width,height) Dimensions of image and intensity array.
 * @returns An ImageData object.
 */
function arrayToGrayNorm(ctx, gray, width, height){
	// Find extrema
	var extrema = getGridExtrema(gray);
	var max = extrema.max;
	var min = extrema.min;
	var range = max - min;
	console.log(max,min,range);
	var norm = 255.0 / range;
	if(range===0) throw "Cannot normalize array of identical values!";
	
	// Create grayscale image
	var imgData = ctx.createImageData(width, height);
	for(var x = 0; x < imgData.width; x++){
		for(var y = 0; y < imgData.height; y++){
			var idx = x + y * imgData.width;
			// full alpha channel
			imgData.data[idx*4 + ALPHA] = 255;
			// equal color channels
			for(var c = 0; c < 3; c++){
				imgData.data[idx*4 + c] = (gray[x][y] - min) * norm;
			}
		}
	}
	return imgData;
}

//// HELPERS ///////////////////////////////////////////////////////////////////

/* COPY2D
 * Naive "deep" copy of 2D array of integers.
 */
function copy2d(arr){
	var copy = new Array(arr.length);
	for(var i = 0; i < arr.length; i++){
		copy[i] = arr[i].slice(0);
	}
	return copy;
}

function getGridExtrema(grid){
	var max = grid[0][0];
	var min = grid[0][0];
	for(var x = 0; x < grid.length; x++){
		for(var y = 0; y < grid[x].length; y++){
			var v = grid[x][y];
			if(v > max) max = v;
			if(v < min) min = v;
		}
	}
	return { max: max, min: min };
}