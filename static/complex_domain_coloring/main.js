// canvas
var sourceCanvas, sourceContext;
var targetCanvas, targetContext;
var demo = null;

// controls
var imageSelect;
var repeatFlag, fadeFlag, blerpFlag;
var recurseButton, computeButton;
var functionInput;
// default function
var DEFAULT_FUNCTION = function(z){ return z.rPow(2); }

var IMAGE_OPTIONS = {
	"Rainbow" : "img/rainbow.png",
	"Doge" : "img/doge.jpeg",
	"Orange" : "img/orange.png",
	"Smooth Orange" : "img/orange-smooth.png",
	"Water" : "img/water.jpg"
};
var DEFAULT_IMAGE = "Doge";


window.onload = function(){
	// fetch source canvas
	sourceCanvas = document.getElementById("source");
	sourceContext = sourceCanvas.getContext("2d");
	
	// fetch target canvas
	targetCanvas = document.getElementById("target");
	targetContext = targetCanvas.getContext("2d");
	
	// image select
	imageSelect = document.getElementById("image-select");
	Object.keys(IMAGE_OPTIONS).forEach(function(key){
		var opt = document.createElement("option");
		opt.setAttribute("value", IMAGE_OPTIONS[key]);
		opt.innerHTML = key;
		imageSelect.appendChild(opt);
	});
	imageSelect.value = IMAGE_OPTIONS[DEFAULT_IMAGE];
	imageSelect.onchange = function(evt){
		loadSourceImage(imageSelect.value);
	}
	
	// flags
	repeatFlag = document.getElementById("repeat-flag");
	fadeFlag = document.getElementById("fade-flag");
	blerpFlag = document.getElementById("blerp-flag");
	repeatFlag.onchange = fadeFlag.onchange = blerpFlag.onchange = process;
	
	// compute button
	computeButton = document.getElementById("compute-button");
	computeButton.onclick = function(evt){
		process();
	}
	
	// recurse button
	recurseButton = document.getElementById("recurse-button");
	recurseButton.onclick = function(evt){
		setSourceImageData(targetContext.getImageData(0, 0, targetCanvas.width, targetCanvas.height));
	}
	
	// function input
	functionInput = document.getElementById("fn");
	functionInput.value = 'z^2';
	
	// draw image on source canvas
	loadSourceImage(imageSelect.value);
}

function loadSourceImage(url){
	var image = new Image();
	image.onload = function(){ setSourceImage(image) }
	image.src = url;
}

function setSourceImage(image){
	// draw image
	sourceCanvas.width = image.width;
	sourceCanvas.height = image.height;
	sourceContext.drawImage(image, 0, 0);
	
	process();
}

function setSourceImageData(imgData){
	sourceCanvas.width = imgData.width;
	sourceCanvas.height = imgData.height;
	sourceContext.putImageData(imgData, 0, 0);
	
	process();
}

function process(){
	// data to pass to domain coloring function
	var message = {
		"complexFunc" : functionInput.value,
		"repeatTexture" : repeatFlag.checked,
		"fadeTexture" : fadeFlag.checked,
		"blerp" : blerpFlag.checked
	}
	
	// init demo
	if(!demo){
		demo = new SimpleImageProcessDemo(sourceCanvas, targetCanvas,"domain-coloring.js");
	}
	demo.process(message);
}