"use strict"
importScripts("lib/complex.min.js");

var STATUS_PROGRESS = 0;
var STATUS_DONE = 1;
var DEFAULT_FUNC = function(z){ return z.rPow(2); };

self.onmessage = function(evt){
	var message = evt.data.message;
	var complexFunc = Complex.parseFunction(message.complexFunc,["z"]) || DEFAULT_FUNC;
	
	process(complexFunc, evt.data.sourceData, evt.data.targetData,
			message.repeatTexture, message.fadeTexture, message.blerp);
}

////////////////////////////////////////////////////////////////////////////////

class Rectangle {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	contains(x, y) {
		return (x > this.x && x < this.x + this.w) && (y > this.y && y < this.y + this.h);
	}
}

function lerp_rgb(c1, c2, frac){
	return {
		r : c1.r * (1-frac) + c2.r * frac,
		g : c1.g * (1-frac) + c2.g * frac,
		b : c1.b * (1-frac) + c2.b * frac
	}
}

function idx_wrap(x, y, w, h){
	x = mod(x|0, w);
	y = mod(y|0, h);
	return (x + y * w);
}

function process(complexFunc, sourceData, targetData, repeatTexture, fadeTexture, blerp){
	// dimensions
	var sourceWidth = sourceData.width;
	var sourceHeight = sourceData.height;
	var targetWidth = targetData.width;
	var targetHeight = targetData.height;
	
	var source = sourceData.data;
	var target = targetData.data;
	
	var sourceRect = new Rectangle(0, 0, sourceWidth, sourceHeight);
	var screenRect = new Rectangle(0, 0, targetWidth, targetHeight);
	
	var r1 = 1;
	var screenDomain = new Rectangle(-r1, -r1, 2*r1, 2*r1);
	var r2 = 1;
	var sourceDomain = new Rectangle(-r2/2, -r2/2, r2, r2);

	// iterate screen pixels, map to complex plane, and determine colors
	for(var x = 0; x < targetWidth; x++){
		for(var y = 0; y < targetHeight; y++){
			// map screen coordinates to complex domain
			var before = mapRect(x, targetHeight-y, screenRect, screenDomain);
			// apply function
			var after = complexFunc(before);
			// map result to source image to get color
			var sourcePoint = mapRect(after.r, -after.i, sourceDomain, sourceRect);

			// if not tiling, skip drawing if point is outside texture
			var display = repeatTexture || sourceRect.contains(sourcePoint.r, sourcePoint.i);
			if(!display) continue;

			var sourceX = sourcePoint.r;
			var sourceY = sourcePoint.i;
			
			// tile
			var reps = 1; // repetitions
			if(repeatTexture){
				if(sourceX < 0) reps++;
				if(sourceY < 0) reps++;
				reps += Math.abs(sourceX/sourceWidth)|0 + Math.abs(sourceY/sourceHeight)|0;
				sourceX = mod(sourceX, sourceWidth);
				sourceY = mod(sourceY, sourceHeight);
			}

			if(blerp){
				// bilinear interpolation
				//  (x1,y2)---(x2,y2)
				//     |         |   
				//  (x1,y1)---(x2,y1)

				var x1 = Math.floor(sourceX) | 0;
				var x2 = x1 + 1;
				var y1 = Math.floor(sourceY) | 0;
				var y2 = y1 + 1;
				var xfrac = mod(sourceX, 1);
				var yfrac = mod(sourceY, 1)

				// get corner indices
				var tl_idx = idx_wrap(x1, y2, sourceWidth, sourceHeight) * 4;
				var tr_idx = idx_wrap(x2, y2, sourceWidth, sourceHeight) * 4;
				var bl_idx = idx_wrap(x1, y1, sourceWidth, sourceHeight) * 4;
				var br_idx = idx_wrap(x2, y1, sourceWidth, sourceHeight) * 4;

				// get corner colors
				var tl_color = { r: source[tl_idx], g: source[tl_idx+1], b: source[tl_idx+2] };
				var tr_color = { r: source[tr_idx], g: source[tr_idx+1], b: source[tr_idx+2] };
				var bl_color = { r: source[bl_idx], g: source[bl_idx+1], b: source[bl_idx+2] };
				var br_color = { r: source[br_idx], g: source[br_idx+1], b: source[br_idx+2] };

				// lerp
				var top_lerp = lerp_rgb(tl_color, tr_color, xfrac);
				var bot_lerp = lerp_rgb(bl_color, br_color, xfrac);
				var result   = lerp_rgb(bot_lerp, top_lerp, yfrac);
				
				// copy rgb channels
				var targetIdx = (x + y * targetWidth) * 4;
				target[targetIdx]   = result.r / (fadeTexture?reps:1);
				target[targetIdx+1] = result.g / (fadeTexture?reps:1);
				target[targetIdx+2] = result.b / (fadeTexture?reps:1);
				target[targetIdx+3] = 255;
			} else {
				
				////////////

				let dx = sourcePoint.r - sourceWidth / 2;
				let dy = sourcePoint.i - sourceHeight / 2;
				let r = Math.sqrt(dx * dx + dy * dy);

				let h = Math.atan2(sourcePoint.i - sourceHeight/2, sourcePoint.r - sourceHeight/2) / (2 * Math.PI);
				let l = (1 - Math.pow(0.999, r));
				l = Math.min(Math.max(l, 0.0), 1.0);
				let s = 1.0;

				////////////


				sourceX = sourceX | 0;
				sourceY = sourceY | 0;
				var sourceIdx = (sourceX + sourceY * sourceWidth) * 4;
				var targetIdx = (x + y * targetWidth) * 4;
				
				let rgb = hslToRgb(h,s,l);
				target[targetIdx] = rgb[0] | 0;
				target[targetIdx+1] = rgb[1] | 0;
				target[targetIdx+2] = rgb[2] | 0;

				// copy rgb channels
				/*
				for(var c = 0; c < 3; c++){
					target[targetIdx + c] = source[sourceIdx + c] / (fadeTexture?reps:1);
				}*/
				
				target[targetIdx+3] = 255;
			}
		}
	}
	
	// done; send ImageData back
	var msg = {
		"status": STATUS_DONE,
		"message" : {
			"imgData": targetData
		}
	};
	postMessage(msg);
}

// Helpers ---------------------------------------------------------------------

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// computes a % b that works for negatives
function mod(a, b){
	return ((a%b)+b)%b;
}

// scale screen (canvas) coordinates to complex plane coordinates
function mapRect(x, y, sourceRect, targetRect){
	var cx = targetRect.x + (x - sourceRect.x) / sourceRect.w * targetRect.w;
	var cy = targetRect.y + (y - sourceRect.y) / sourceRect.h * targetRect.h;
	return Complex(cx, cy);
}