let snakeHead = [];
let snakeBody = [];
let addTail = false;
let score = 0;
const foodContainer = document.querySelector("#food-container");
const snakeContainer = document.querySelector("#snake-container");
const gameOverContainer = document.querySelector(".game-overlay");
const boardContainer = document.querySelector("#game-area");
const shrinkContainer = document.querySelector(".shrink-container");
let myInterval = null;
let direction = "";
let foodPos = [];
let canChange = true;
let boardDim = [725, 0];
let foodSpawnMax = 29;
let foodSpawnMin = 1;
let snakeEatAudio = new Audio("snake_eat_3.wav");
let snakeDieAudio = new Audio("snake_die_2.wav");
let speed = document.querySelector('input[name="speed-select"]:checked').value;
let highScore = getHighScore();
document.querySelector("#score").innerText = `${score}`;
document.querySelector("#high-score").innerText = `${highScore}`;
let isPaused = false;

function pauseGame() {
	if (isPaused === false) {
		clearInterval(myInterval);
		document.querySelector(".pause").classList.add("show");
		isPaused = true;
		document.documentElement.style.cursor = "auto";
	} else if (isPaused === true) {
		myInterval = setInterval(runGame, speed);
		document.querySelector(".pause").classList.remove("show");
		isPaused = false;
		document.documentElement.style.cursor = "none";
	}
}

window.addEventListener("keydown", startEnter);

function startGame() {
	score = 0;
	isStartScreen = false;
	isPaused = false;
	speed = document.querySelector('input[name="speed-select"]:checked').value;
	document.querySelector("#score").innerText = `${score}`;
	myInterval = setInterval(runGame, speed);
	direction = "right";
	snakeHead = [250, 250];
	snakeBody = [];
	addTail = false;
	score = 0;
	canChange = true;
	boardDim = [725, 0];
	foodSpawnMax = 28;
	foodSpawnMin = 1;
	snakeContainer.innerHTML = "";
	shrinkContainer.innerHTML = "";
	loadHighScore();
	highScore = getHighScore();

	createSnakePart();
	createSnakePart();
	createSnakePart();
	createSnakePart();

	foodPos = calcFoodPos();
	spawnFood();

	window.addEventListener("keydown", getDirection);
	window.removeEventListener("keydown", startEnter);

	gameOverContainer.classList.remove("show");
}

function loadHighScore() {
	if (getHighScore() === null) {
		createLocalContainers();
		highScore = saveHighScore();
	} else {
		highScore = getHighScore();
	}

	document.querySelector("#high-score").innerText = `${highScore}`;
}

function createLocalContainers() {
	localStorage.setItem("highscore", JSON.stringify(0));
}

function saveHighScore() {
	return localStorage.setItem("highscore", JSON.stringify(highScore));
}

function getHighScore() {
	if (localStorage.getItem("highscore") === null) {
		return 0;
	} else {
		return JSON.parse(localStorage.getItem("highscore"));
	}
}

function runGame() {
	if (direction === "up") {
		snakeHead[1] -= 25;
	} else if (direction === "down") {
		snakeHead[1] += 25;
	} else if (direction === "left") {
		snakeHead[0] -= 25;
	} else if (direction === "right") {
		snakeHead[0] += 25;
	}
	document.documentElement.style.cursor = "none";
	moveSnake();
	eatFoodCheck(snakeHead[0], snakeHead[1], foodPos[0], foodPos[1]);
	checkCollision(snakeHead[0], snakeHead[1], snakeBody);
	snakeTail(snakeContainer);
	canChange = true;
}
function getDirection(e) {
	if (!canChange) return;
	switch (e.key) {
		case "ArrowUp":
		case "w":
			if (direction != "down") {
				direction = "up";
				canChange = false;
			}
			break;
		case "ArrowDown":
		case "s":
			if (direction != "up") {
				direction = "down";
				canChange = false;
			}
			break;
		case "ArrowLeft":
		case "a":
			if (direction != "right") {
				direction = "left";
				canChange = false;
			}
			break;
		case "ArrowRight":
		case "d":
			if (direction != "left") {
				direction = "right";
				canChange = false;
			}
			break;
		case "Escape":
		case " ":
			pauseGame();
			break;
		default:
	}
}

function addShrinkDivs(boardDim) {
	//function that creates the closing borders
	let outerBoardTop = [boardDim[1], boardDim[1]];
	let outerBoardRight = [boardDim[0], boardDim[1]];
	let outerBoardBottom = [boardDim[1], boardDim[0]];
	let outerBoardLeft = [boardDim[1], boardDim[1]];
	while (outerBoardTop[0] <= boardDim[0] + 50) {
		let newBorder = document.createElement("div");
		shrinkContainer.appendChild(newBorder);
		newBorder.classList.add("shrink");
		newBorder.style.top = `${outerBoardTop[1] - 25}px`;
		newBorder.style.left = `${outerBoardTop[0] - 25}px`;
		outerBoardTop[0] += 25;
	}
	while (outerBoardRight[1] <= boardDim[0] + 50) {
		let newBorder = document.createElement("div");
		shrinkContainer.appendChild(newBorder);
		newBorder.classList.add("shrink");
		newBorder.style.top = `${outerBoardRight[1] - 25}px`;
		newBorder.style.left = `${outerBoardRight[0] + 25}px`;
		outerBoardRight[1] += 25;
	}
	while (outerBoardBottom[0] <= boardDim[0] + 50) {
		let newBorder = document.createElement("div");
		shrinkContainer.appendChild(newBorder);
		newBorder.classList.add("shrink");
		newBorder.style.top = `${outerBoardBottom[1] + 25}px`;
		newBorder.style.left = `${outerBoardBottom[0] - 25}px`;
		outerBoardBottom[0] += 25;
	}
	while (outerBoardLeft[1] <= boardDim[0] + 50) {
		let newBorder = document.createElement("div");
		shrinkContainer.appendChild(newBorder);
		newBorder.classList.add("shrink");
		newBorder.style.top = `${outerBoardLeft[1] - 25}px`;
		newBorder.style.left = `${outerBoardLeft[0] - 25}px`;
		outerBoardLeft[1] += 25;
	}
}

function shrinkBoard(score, board) {
	if (score > 0 && score % 5 === 0) {
		board[0] -= 25;
		board[1] += 25;
		addShrinkDivs(boardDim);
		foodSpawnMax--;
		foodSpawnMin++;
	}
}

function checkCollision(x, y, bodyArr) {
	if (x > boardDim[0] || y > boardDim[0] || x < boardDim[1] || y < boardDim[1]) {
		clearInterval(myInterval);
		snakeDieAudio.play();
		gameOver();
	}

	for (let i = bodyArr.length - 2; i >= 0; i--) {
		if (x === bodyArr[i][0] && y === bodyArr[i][1]) {
			clearInterval(myInterval);
			snakeDieAudio.play();
			gameOver();
		}
	}
}

function startEnter(e) {
	switch (e.key) {
		case "Enter":
			startGame();
			break;

		default:
			break;
	}
}

function gameOver() {
	gameOverContainer.classList.add("show");
	window.removeEventListener("keydown", getDirection);
	window.addEventListener("keydown", startEnter);
	document.documentElement.style.cursor = "auto";
}

function removeFood(container) {
	if (container.firstChild) {
		container.removeChild(container.firstChild);
	}
}

function snakeTail(snake) {
	if (addTail === true) {
		addTail = false;
	} else {
		snake.removeChild(snake.children[0]);
		snakeBody.shift();
	}
}

function randomMaxMin(max, min) {
	return Math.floor(Math.random() * (max - min + 1) + min) * 25;
}

function calcFoodPos() {
	let foodX = randomMaxMin(foodSpawnMax, foodSpawnMin);
	let foodY = randomMaxMin(foodSpawnMax, foodSpawnMin);

	return [foodX, foodY];
}

function spawnFood() {
	removeFood(foodContainer);
	let newFood = document.createElement("div");
	foodContainer.appendChild(newFood);
	newFood.classList.add("food");
	if (score > 0 && (score + 1) % 5 === 0) {
		newFood.style.backgroundColor = "yellow";
	}

	let validfood = false;

	while (validfood === false) {
		foodPos = calcFoodPos();
		for (let i = snakeBody.length - 1; i >= 0; i--) {
			if (foodPos[0] === snakeBody[i][0] && foodPos[1] === snakeBody[i][1]) {
				validfood = false;
				break;
			} else {
				validfood = true;
			}
		}
	}

	newFood.style.left = `${foodPos[0]}px`;
	newFood.style.top = `${foodPos[1]}px`;
}

function moveSnake() {
	let newSnake = createSnakePart();
}

function createSnakePart() {
	let newSnake = document.createElement("div");
	snakeContainer.appendChild(newSnake);
	newSnake.classList.add("snake-body");
	snakeBody.push([snakeHead[0], snakeHead[1]]);

	newSnake.style.left = `${snakeHead[0]}px`;
	newSnake.style.top = `${snakeHead[1]}px`;
	return newSnake;
}

function eatFoodCheck(snakeX, snakeY, foodX, foodY) {
	if (snakeX === foodX && snakeY === foodY) {
		score++;
		snakeEatAudio.play();
		if (score > getHighScore()) {
			highScore = score;
			saveHighScore();
		}
		document.querySelector("#high-score").innerText = `${highScore}`;
		document.querySelector("#score").innerText = `${score}`;
		addTail = true;
		shrinkBoard(score, boardDim);
		spawnFood();
	}
}
