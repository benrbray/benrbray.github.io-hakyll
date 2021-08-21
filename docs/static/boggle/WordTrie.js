class WordTrie {
	constructor(wordList, minWordLength){
		this.tree = {};

		// build trie from wordList
		for(var i = 0; i < wordList.length; i++){
			var word = wordList[i];
			if(word.length >= minWordLength){
				this.insert(word);
			}
		}
	}

	// Insert a word into the trie -- O(|w|)
	insert(word){
		word = word.toUpperCase();
		var subtrie = this.tree;
		for(var j = 0; j < word.length; j++){
			var letter = word[j];
			// insert letter if not already present
			if(subtrie.hasOwnProperty(letter) === false){ 
				subtrie[letter] = {} 
			};
			// continue descending into tree
			subtrie = subtrie[letter];
		}
		// finished iterating over word, add star at this depth
		subtrie["*"] = true;
	}

	// Check if a word is in the trie -- O(|w|)
	contains(word){
		word = word.toUpperCase();
		var subtrie = this.tree;
		
		// traverse trie, following characters in word
		for(var j=0; j < word.length; j++){
			var letter = word[j];
			if(subtrie.hasOwnProperty(letter) === true){
				subtrie = subtrie[letter];
			} else {
				return false;
			}
		}
		
		// check if a word ends here
		return (subtrie.hasOwnProperty("*") === true);
	}
}