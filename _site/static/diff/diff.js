function mainInit(){
	var A = "MZJAWXU";
	var B = "XMJYAUZ";
	
	console.log(A,B);
	console.log(diffString(A,B));
}

//// DIFF //////////////////////////////////////////////////////////////////////

function diffString(A,B){
	var diff = diffArray(A.split(""),B.split(""));
	var result = "";
	diff.forEach(function(edit){
		var type = edit[0];
		if(type < 0) result += "-";
		else if(type > 0) result += "+";
		result += edit[1] + " ";
	});
	return result;
}

// computes longest common subsequence of two strings
function diffArray(A,B){
	// convert strings to arrays
	var a = A.length;
	var b = B.length;
	
	// compute the lcs between increasingly longer combinations of prefixes
	var lcs = make2DArray(a+1,b+1,0);
	for(var i=1; i < a+1; i++){
		for(var j=1; j < b+1; j++){
			// if final element same for both, it is in diff, so we prefixes
			if(A[i-1] === B[j-1]) lcs[i][j] = lcs[i-1][j-1] + 1;
			// otherwise, one of the final elements is NOT in diff
			else lcs[i][j] = Math.max(lcs[i][j-1], lcs[i-1][j]); 
		}
	}
	
	// compute diff as array of edits
	var result = [];
	var idxA = a;
	var idxB = b;
	while(idxA > 0 || idxB > 0){
		if(idxA > 0 && idxB > 0 && A[idxA-1] == B[idxB-1]){
			// elements at current indeces are identical, i.e. part of LCS
			idxA--; idxB--;
			result.push([ 0, A[idxA] ]); // element unchanged
		} else if(idxA > 0 && (idxB==0 || (lcs[idxA][idxB-1] <  lcs[idxA-1][idxB])) ){
			result.push([-1, A[--idxA]]); // deleted element
		} else if(idxB > 0 && (idxA==0 || (lcs[idxA][idxB-1] >= lcs[idxA-1][idxB])) ){
			result.push([+1, B[--idxB]]); // added element
		}
	}
	
	// print table
	/*var bstr = "    ";
	for(var j = 0; j < b; j++){
		bstr += B[j] + " ";
	}
	console.log(bstr);
	for(var i = 0; i <= a; i++){
		var row = "";
		for(var j = 0; j <= b; j++){
			row += lcs[i][j] + " ";
		}
		console.log((i==0?" ":A[i-1]) + " " + row);
	}*/
	
	return result.reverse();
}

//// HELPERS ///////////////////////////////////////////////////////////////////

/* MAKE2DARRAY
 * Creates a length-n array populated with 'defaultValue' (NOT copies thereof!).
 * This method was me being clever and probably shouldn't be used in code that
 * others will read :)
 */
function makeArray(n, defaultValue){
	return (function(a){ while(a.push(defaultValue) < n); return a; })([]);
}

/* MAKE2DARRAY
 * Creates a length-n array of length-m arrays (a matrix of n rows, m columns),
 * populated with 'defaultValue' (NOT copies thereof!) This method was me trying
 * to be clever and probably shouldn't be used in code that others will read :)
 */
function make2DArray(m, n, defaultValue){
	// enforce nonnegative size
	m = (m > 0) ? m : 0;
	n = (n > 0) ? n : 0;
	// populate 2d array with default value
	return (function(a){ while(a.push(makeArray(n,defaultValue)) < m); return a; })([]);
}