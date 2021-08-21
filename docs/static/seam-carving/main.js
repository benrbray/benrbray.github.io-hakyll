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

// Images
var IMAGE_OPTIONS = {
	"Balloons" : "img/balloons.png",
	"Mountains" : "img/balloon-mountains.jpeg",
	"Book" : "img/book.png",
	"Castle" : "img/castle.jpg",
	"Cattle" : "img/cattle.jpg",
	"Clouds" : "img/clouds.jpg",
	"Flower" : "img/flower.png",
	"Lena" : "img/lena.png",
	"Mandril" : "img/mandril.png",
	"Peppers" : "img/peppers.png",
	"Waterfall" : "img/waterfall.jpg",
	"Obama" : "img/obama.png",
	"Seattle" : "img/seattle.png"
};
var DEFAULT_IMAGE = "Balloons";

// Worker Status
var STATUS_PROGRESS = 0;
var STATUS_DONE = 1;
var STATUS_ERROR = 2;

var TWOPI = 2 * Math.PI;

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
var drawCanvas, drawContext;
var protectRadio, removeRadio, clearRadio;
var carveButton;

var loadContainer, loadBar;

//// INITIALIZATION ////////////////////////////////////////////////////////////

// initial config, then wait for image to load
function init(){
	// elements
	container = document.getElementById("container");
	loadContainer = document.getElementById("load-container");
	loadBar = document.getElementById("loadbar").childNodes[0];
	
	// Canvas
	initCanvas();
	// Controls
	initControls();
	// Drawing
	initDrawing();
}

function initCanvas(){
	// image + draw canvas
	drawCanvas = document.getElementById("drawCanvas");
	drawContext = drawCanvas.getContext("2d");
	imageCanvas = document.getElementById("imageCanvas");
	imageContext = imageCanvas.getContext("2d");
	
	// create several canvas elements
	for(var k = 0; k < 4; k++){
		canvas[k] = document.createElement("canvas");
		context[k] = canvas[k].getContext("2d");
		var wrap = document.createElement("div");
		wrap.className = "canvas-wrap";
		wrap.appendChild(canvas[k]);
		container.appendChild(wrap);
	}
	
	resultCanvas = canvas[0];
	resultContext = context[0];
}

function initControls(){
	// image select
	var imageSelect = document.getElementById("image-select");
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
	seamSlider = document.getElementById("seam-slider");
	seamSlider.oninput = function(evt){
		updateInterface(-parseInt(evt.target.value));
	}
	
	// wait for image to load
	imageSelect.value = DEFAULT_IMAGE;
	loadImage(IMAGE_OPTIONS[imageSelect.value], setImage);
	
	carveButton = document.getElementById("carve-button");
	carveButton.onclick = function(evt){
		beginSeamCarve();
	}

	// hide loadbar
	loadContainer.style.display = "none";
}

function initDrawing(){
	// tool radio buttons
	protectRadio = document.getElementById("protect");
	removeRadio = document.getElementById("remove");
	clearRadio = document.getElementById("clear");
	
	drawCanvas.onmousedown = function(evt){
		drawContext.drawing = true;
		
		if(clearRadio.checked){
			drawContext.globalCompositeOperation = "destination-out";
		} else {
			drawContext.fillStyle = protectRadio.checked ? "#0F0" : "#F00";
			drawContext.globalCompositeOperation = "source-over";
		}
	}
	
	drawCanvas.onmouseup = function(evt){
		drawContext.drawing = false;
	}
	
	drawCanvas.onmousemove = function(evt){
		if(!drawContext.drawing) return;
		drawContext.beginPath();
		drawContext.arc(evt.offsetX, evt.offsetY, 10, 0, TWOPI);
		drawContext.fill();
	}
}

//// INTERFACE /////////////////////////////////////////////////////////////////

// image loaded, continue to main
function setImage(img){
	// dimensions
	currentImage = img;
	drawCanvas.width = imageCanvas.width = img.width;
	drawCanvas.height = imageCanvas.height = img.height;
	
	// draw image
	imageContext.drawImage(img, 0, 0);
	
	// reset drawing canvas
	drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

/* RESETINTERFACE
 * Prepares the user interface for interaction with the latest result.
 */
function resetInterface(){
	// set seam slider extrema
	seamSlider.min = -currentLocalSeams.length;
	seamSlider.max = 0;
	seamSlider.value = seamSlider.max;
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

function beginSeamCarve(){
	// dimensions
	var width = imageCanvas.width;
	var height = imageCanvas.height;
	
	// get image data
	currentData = imageContext.getImageData(0, 0, width, height);
	
	// get user markings
	var drawData = drawContext.getImageData(0, 0, width, height);
	var userGrad = new Array(width*height*4);
	for(var x = 0; x < width; x++){
		for(var y = 0; y < height; y++){
			var idx = x+y*width;
			var green = drawData.data[idx*4+1] > 0;
			var red = drawData.data[idx*4] > 0;
			userGrad[idx] = green ? 255 : (red ? -255 : 0);
		}
	}
	
	// create worker
	var worker = new Worker("carver.js");
	worker.onmessage = function(evt){
		var data = evt.data;
		switch(data.status){
			case STATUS_PROGRESS:
				progressSeamCarve(data.message);
				break;
			case STATUS_DONE:
				finishSeamCarve(data.message);
				break;
			default:
				break;
		}
	}
	
	// show loadbar
	loadContainer.style.display = "block";
	loadBar.style.width = "0%";
	
	// start worker
	worker.postMessage({
		imgData: currentData,
		userGrad: userGrad
	});
}

function progressSeamCarve(message){
	var percent = parseFloat(message.percent);
	loadBar.style.width = percent + "%";
}

function finishSeamCarve(message){
	var initialGrad = message.initialGrad;
	var initialEnergy = message.initialEnergy;
	currentLocalSeams = message.localSeams;
	currentGlobalSeams = message.globalSeams;
	
	// display gradient
	displayGrayArray(canvas[1], initialGrad,   true);
	displayGrayArray(canvas[2], initialEnergy, true);
	
	// hide loadbar
	loadContainer.style.display = "none";
	
	// prepare interface for interaction
	resetInterface();
}

//// DISPLAY ///////////////////////////////////////////////////////////////////

/*function mapFromSeamList(seams, width, height){
	var map = getIndexMap(width, height);
	for(var s = 0; s < seams.length; s++){
		carve(map, width-s, seams[s]);
	}
	return map;
}*/

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
			imgData.data[idx*4 + 3] = 255;
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
			imgData.data[idx*4 + 3] = 255;
			// equal color channels
			for(var c = 0; c < 3; c++){
				imgData.data[idx*4 + c] = (gray[x][y] - min) * norm;
			}
		}
	}
	return imgData;
}

//// HELPERS ///////////////////////////////////////////////////////////////////

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