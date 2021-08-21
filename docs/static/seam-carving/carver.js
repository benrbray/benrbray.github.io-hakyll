"use strict";

/* WORKER.JS
 * Web-worker for seam carving on a separate thread.
 */

var STATUS_PROGRESS = 0;
var STATUS_DONE = 1;
var STATUS_ERROR = 2;
 
self.onmessage = function(evt){
	var message = evt.data;
	process(message.imgData, message.userGrad);
}

//// PROCESSING ////////////////////////////////////////////////////////////////

// perform seam carving & display result
function process(imgData, userGrad){
	// image dimensions
	var width = imgData.width;
	var height = imgData.height;
	
	// intermediate image data
	var initialGrad, initialEnergy;
	
	// seam carve
	var map = getIndexMap(width, height);
	var carvePixels = width-1;
	var curWidth = width;
	var localSeams = [];
	var globalSeams = [];
	
	for(var i = 0; i < carvePixels; i++){
		// progress report
		self.postMessage({
			status: STATUS_PROGRESS,
			message: {
				percent: (i/carvePixels)*100
			}
		});
		
		// compute gradient
		var energy = computeVerticalGradient(imgData, map, curWidth);
		// add user gradient
		for(var x = 0; x < curWidth; x++)
			for(var y = 0; y < height; y++)
				energy[x][y] += userGrad[map[x][y]/4];
		if(i==0) initialGrad = copy2d(energy);
		
		// accumulate downwards, storing backpointers
		var bp = accumulateEnergy(energy);
		if(i==0) initialEnergy = copy2d(energy);
		
		// follow backpointers to find vertical seam in local coordinates
		var seam = computeSeam(energy, bp);
		localSeams.push(seam);
		
		// transform seam to source image coordinates
		var globalSeam = new Array(seam.length);
		for(var y = 0; y < seam.length; y++) globalSeam[y] = map[seam[y]][y];
		globalSeams.push(globalSeam);
		
		// remove seam from map, reducing active width by one
		carve(map, curWidth, seam);
		curWidth--;
	};
	
	// finish
	self.postMessage({
		status: STATUS_DONE,
		message: {
			initialGrad : initialGrad, 
			initialEnergy : initialEnergy,
			localSeams : localSeams,
			globalSeams : globalSeams,
		}
	});
	self.close();
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

//// HELPERS ///////////////////////////////////////////////////////////////////

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