const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameState = "menu";
let player1Score = 0;
let player2Score = 0;
let winner = "";
let opponentType = "computer"; // "computer" tai "human"

const paddleWidth = 25, 
paddleHeight = 130;
const ballRadius = 15;
const paddleSpeed = 6;

let paddle1Y, paddle2Y, ballX, ballY, ballSpeedX, ballSpeedY;
let upPressed = false, downPressed = false;
let wPressed = false, sPressed = false;

const hitSound = new Audio("sounds/hit.mp3");
const scoreSound = new Audio("sounds/score2.mp3");
const winSound = new Audio("sounds/win.mp3");

// Ääniasetukset ja napin käsittely (määritellään kerran globaalisti)
let soundEnabled = true; // Ääni oletuksena päällä

const soundToggleButton = document.getElementById("sound-toggle");
if (soundToggleButton) {
    soundToggleButton.textContent = "Ääni: Päällä";
    soundToggleButton.classList.add("sound-on");

    soundToggleButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundToggleButton.textContent = "Ääni: Päällä";
            soundToggleButton.classList.remove("sound-off");
            soundToggleButton.classList.add("sound-on");
        } else {
            soundToggleButton.textContent = "Ääni: Pois";
            soundToggleButton.classList.remove("sound-on");
            soundToggleButton.classList.add("sound-off");
        }
    });
}

// Responsiivinen canvas
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = Math.random() > 0.5 ? 5 : -5;
    ballSpeedY = (Math.random() * 4) - 2;
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    paddle1Y = canvas.height / 2 - paddleHeight / 2;
    paddle2Y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    gameState = "playing";
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}


function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(text, x, y, size = "30px", color = "white") {
    ctx.fillStyle = color;
    ctx.font = `${size} Arial`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
    }
}

function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("", canvas.width / 2, canvas.height / 2);
}

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText(`${winner} voitti!`, canvas.width / 2, canvas.height / 2, "40px");

    // Näytetään start-message uudelleen pelin lopussa (halutessasi)
    const startMessage = document.getElementById("start-message");
    if (startMessage) {
        startMessage.style.display = "block";
        const mobileControls = document.getElementById("mobile-controls");
if (mobileControls) {
    mobileControls.style.display = "none";
}

    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(0, paddle1Y, paddleWidth, paddleHeight, "green");
    drawRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight, "white");
    drawCircle(ballX, ballY, ballRadius, "yellow");
    drawText(player1Score, canvas.width / 4, 50);
    drawText(player2Score, canvas.width * 3 / 4, 50);
}

function move() {
    // Pelaaja 1
    if (wPressed) paddle1Y -= paddleSpeed;
    if (sPressed) paddle1Y += paddleSpeed;
    paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));

    // Pelaaja 2 tai tietokone
    if (opponentType === "human") {
        if (upPressed) paddle2Y -= paddleSpeed;
        if (downPressed) paddle2Y += paddleSpeed;
        paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
    } else {
        const centerY = paddle2Y + paddleHeight / 2;

        // Lisätään satunnaista virhettä pallon kohtaan
        const errorMargin = 200;  // Kuinka paljon virhe voi olla (pikseleinä)
        const targetY = ballY + (Math.random() * errorMargin * 2 - errorMargin);

        if (centerY < targetY - 20) paddle2Y += paddleSpeed;
        else if (centerY > targetY + 20) paddle2Y -= paddleSpeed;

        paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
    }

    // Liikutetaan palloa
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Osuu ylä- tai alareunaan
    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
        if (soundEnabled) hitSound.play();  // Soitetaan ääni
    }

    // Osuuko pelaajaan
    if (
        ballX - ballRadius <= paddleWidth &&
        ballY >= paddle1Y &&
        ballY <= paddle1Y + paddleHeight
    ) {
        ballSpeedX = -ballSpeedX;
        if (soundEnabled) hitSound.play();
    }

    if (
        ballX + ballRadius >= canvas.width - paddleWidth &&
        ballY >= paddle2Y &&
        ballY <= paddle2Y + paddleHeight
    ) {
        ballSpeedX = -ballSpeedX;
        if (soundEnabled) hitSound.play();
    }

    // Pisteet
    if (ballX < 0) {
        player2Score++;
        if (soundEnabled) scoreSound.play();
        resetBall();
    }

    if (ballX > canvas.width) {
        player1Score++;
        if (soundEnabled) scoreSound.play();
        resetBall();
    }

    // Voitto
    if (player1Score >= 10) {
        winner = "Pelaaja 1";
        if (soundEnabled) winSound.play();
        gameState = "gameover";
    } else if (player2Score >= 10) {
        winner = opponentType === "human" ? "Pelaaja 2" : "Tietokone";
        if (soundEnabled) winSound.play();
        gameState = "gameover";
    }
}


function gameLoop() {
    if (gameState === "menu") {
        drawMenu();
    } else if (gameState === "playing") {
        move();
        drawGame();
    } else if (gameState === "gameover") {
        drawGameOver();
    }
    requestAnimationFrame(gameLoop);
}
gameLoop();

// Näppäinkäsittely
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (gameState === "menu" || gameState === "gameover") {
            const select = document.getElementById("opponent-select");
            if (select) {
                opponentType = select.value;
            }
            resetGame();

            // Piilotetaan start-message-elementti
            const startMessage = document.getElementById("start-message");
            if (startMessage) {
                startMessage.style.display = "none";
            }
        }
    }
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;
    if (e.key === "w" || e.key === "W") wPressed = true;
    if (e.key === "s" || e.key === "S") sPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") upPressed = false;
    if (e.key === "ArrowDown") downPressed = false;
    if (e.key === "w" || e.key === "W") wPressed = false;
    if (e.key === "s" || e.key === "S") sPressed = false;
});

function startGameIfReady() {
    const select = document.getElementById("opponent-select");
    if (select) {
        opponentType = select.value;
    }
    const mobileControls = document.getElementById("mobile-controls");
if (mobileControls) {
    mobileControls.style.display = "block";

    const player2Controls = document.getElementById("player2-controls");
    if (player2Controls) {
        player2Controls.style.display = (opponentType === "human") ? "flex" : "none";
    }
}
    resetGame();

    // Piilotetaan start-message mobiilissakin
    const startMessage = document.getElementById("start-message");
    if (startMessage) {
        startMessage.style.display = "none";
    }
}



// Kosketustuki (mobiililaitteille)
canvas.addEventListener("touchstart", () => {
    if (gameState === "menu" || gameState === "gameover") {
        startGameIfReady();
    }
});