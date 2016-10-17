/*
Copyright 2016 Drew Reese

javascript for fifteen puzzle page
- Sets up, initializes, and controls webpage output
*/

(function () {
	"use strict";

	// internal global variables
	var puzzleBoard = [16];
	var neighbors = [];
	var emptyIndex;

	// puzzle background images
	var backgroundDir = "img/backgrounds/";
	var background = ["colorblind.jpg", "SB50.jpg", "bronco_logo.jpg", "CSElogo.jpg"];
	var currentBackground = 1;

	// game vars
	var timer = null;
	var bestTime = -1;
	var bestMoveCount = -1;
	var currTime;
	var currMoveCount;
	var solvable = false;

	// *************************

	/* 
	 * console DEBUGging 
	 * Set to true to see DEBUGging information in the console, false otherwise
	 */
	var DEBUG = false;

	// loads webpage controls
	window.onload = function () {
		// load controls
		var shuffleButton = document.querySelector("shufflebutton");

		// set control behavior
		shufflebutton.onclick = shufflePuzzle;

		// add background changer
		var backgroundOption = document.createElement("select");
		backgroundOption.id = "backgroundOption";
		backgroundOption.onchange = updateBackground;
		for (var i = 0; i < background.length; i++) {
			var option = document.createElement("option");
			option.value = i;
			option.innerHTML = "background " + i;
			if (i === currentBackground) {
				option.selected = "selected";
			}
			backgroundOption.appendChild(option);
		}
		var controls = document.getElementById("controls").appendChild(backgroundOption);

		// initialize
		console.log("Debugging: " + (DEBUG ? "ON" : "OFF"));
		loadPuzzle();
		setEmptyIndex(findIndex(0));

		if (DEBUG) {
			debugBoard();
		}
		
	};

	function loadPuzzle() {
		if (DEBUG) {
			console.log("Creating boxes");
		}

		var tiles = document.querySelectorAll("puzzlearea .puzzlepiece");
		for (var i = 0; i < tiles.length; i++) {
			tiles[i].parentNode.removeChild(tiles[i]);
		}

		var puzzlearea = document.getElementById("puzzlearea");

		puzzlearea.innerHTML = "";
		for (var i = 0; i < 16; i++) {
			puzzleBoard[i] = 0;
		}

		if (DEBUG) {
			debugBoard();
		}
		
		for (var i = 0; i < 15; i++) {
			var puzzlePiece = document.createElement("div");
			
			var xPos = getCol(i) * 100;
			var yPos = getRow(i) * 100;
			var label = i + 1;

			puzzlePiece.className = "puzzlepiece";
			puzzlePiece.innerHTML = label;
			puzzlePiece.id = label;
			puzzlePiece.style.top = yPos + "px";
			puzzlePiece.style.left = xPos + "px";
			puzzlePiece.style.backgroundPosition = -xPos + "px " + -yPos + "px";
			puzzlePiece.style.backgroundImage = "url(\"" + backgroundDir + background[currentBackground] + "\")";

			// attach listeners
			puzzlePiece.onclick = clickedTile;

			puzzlearea.appendChild(puzzlePiece);

			puzzleBoard[i] = label;
		}
	}

	function clickedTile() {
		moveTile(this);
		checkSolved();
	}

	function moveTile(tile) {
		if (!isNeighbor(tile.id)) {
			return;
		}

		var index = findIndex(parseInt(tile.id));

		var emptyRow = getRow(emptyIndex);
		var emptyCol = getCol(emptyIndex);

		// swap locations
		swapTile(index, emptyIndex);
		setEmptyIndex(index);

		// move tile
		tile.style.top = emptyRow * 100 + "px";
		tile.style.left = emptyCol * 100 + "px";
		currMoveCount++;

		if (DEBUG) {
			debugBoard();
		}
	}

	function isNeighbor(tileID) {
		for (var i=0; i < neighbors.length; i++) {
			if (tileID === neighbors[i]) {
				return true;
			}
		}
		return false;
	}

	function findIndex(tileID) {
		return puzzleBoard.indexOf(tileID);
	}

	function getRow(index) {
		return Math.floor(index / 4);
	}

	function getCol(index) {
		return index % 4;
	}

	function swapTile(index1, index2) {
		var valueIndex2 = puzzleBoard[index2];
		puzzleBoard[index2] = puzzleBoard[index1];
		puzzleBoard[index1] = valueIndex2;
	}

	function setEmptyIndex(index) {
		emptyIndex = index;
		setMoveableTiles(index);
	}

	function setMoveableTiles(emptyIndex) {
		// wipe out old movable tiles
		var oldMovableTiles = document.querySelectorAll(".movable");
		for (var i = 0; i < oldMovableTiles.length; i++) {
			oldMovableTiles[i].classList.remove("movable");
		}

		var emptyRow = getRow(emptyIndex);
		var emptyCol = getCol(emptyIndex);
		
		// North
		var northIndex = (emptyRow > 0) ? emptyIndex - 4 : -1;
		if (northIndex !== -1) {
			document.getElementById(puzzleBoard[northIndex]).classList.add("movable");
		}

		// South
		var southIndex = (emptyRow < 3) ? emptyIndex + 4 : -1;
		if (southIndex !== -1) {
			document.getElementById(puzzleBoard[southIndex]).classList.add("movable");
		}

		// East
		var eastIndex = (emptyCol > 0) ? emptyIndex - 1 : -1;
		if (eastIndex !== -1) {
			document.getElementById(puzzleBoard[eastIndex]).classList.add("movable");
		}

		// West
		var westIndex = (emptyCol < 3) ? emptyIndex + 1 : -1;
		if (westIndex !== -1) {
			document.getElementById(puzzleBoard[westIndex]).classList.add("movable");
		}

		setNeighbors();

		if (DEBUG) {
			console.log("Empty tile: (" + emptyRow + ", " + emptyCol + ")");
			console.log("North tile = " + puzzleBoard[northIndex]);
			console.log("East tile = "  + puzzleBoard[eastIndex]);
			console.log("South tile = " + puzzleBoard[southIndex]);
			console.log("West tile = "  + puzzleBoard[westIndex]);
		}
	}

	function setNeighbors() {
		var neighborTiles = document.querySelectorAll(".movable");
		neighbors = [];
		for (var i = 0; i < neighborTiles.length; i++) {
			neighbors.push(neighborTiles[i].id);
		}
	}

	function shufflePuzzle() {

		console.log("Shuffling...");
		loadPuzzle();
		setEmptyIndex(findIndex(0));

		for (var i = 0; i < 1000; i++) {
			var rand = parseInt(Math.random() * neighbors.length)
			var tile = document.getElementById(neighbors[rand]);

			if (DEBUG) {
				console.log("  shuffle: " + i);
				console.log("    " + neighbors.length + " neighbors, picked " + tile.id);
			}

			moveTile(tile);
		}
		
		currTime = 0;
		currMoveCount = 0;
		timer = setInterval(showGameStats, 1000);
		document.querySelector("#output").className = "timer";

		unsolved();
		
		checkSolved(); // incase accidentally shuffled into solved state
	}

	function checkSolved() {
		if (!solvable) {
			return;
		}

		for (var i = 1; i < puzzleBoard.length - 1; i++) {
			if (puzzleBoard[i-1] > puzzleBoard[i]) {
				return;
			}
		}

		solved();
	}

	function solved() {
		clearTimeout(timer);
		timer = null;
		solvable = false;
		
		if (bestTime < 0) {
			bestTime = currTime;
			bestMoveCount = currMoveCount;
		}

		if (currTime < bestTime) {
			bestTime = currTime;
		}

		if (currMoveCount < bestMoveCount) {
			bestMoveCount = currMoveCount;
		}

		var output = document.querySelector("#output");
		output.className = "solved";
		output.innerHTML = "Congratulations!<br \>" + 
			"Time: " + currTime + " Record: " + bestTime + "<br \>" +
			"Moves: " + currMoveCount + " Record: " + bestMoveCount;
	}

	function unsolved() {
		var output = document.querySelector("#output");
		output.classList.remove("solved");
		output.innerHTML = "";
		solvable = true;
	}

	function showGameStats() {
		var output = document.querySelector("#output");
		currTime++;
		var minutes = Math.floor(currTime / 60);
		var seconds = currTime % 60;
		output.innerHTML =  "Time: " + minutes + ":" + seconds + "<br \> Moves: " + currMoveCount;
	}

	function updateBackground() {
		currentBackground = this.value;
		var tiles = document.querySelectorAll(".puzzlepiece");
		for (var i = 0; i < tiles.length; i++) {
			tiles[i].style.backgroundImage = "url(\"" + backgroundDir + background[this.value] + "\")";
		}
	}

	function debugBoard() {
		console.log("Board: " + puzzleBoard.toString());
		console.log("Neighbors: " + neighbors);
	}

})();