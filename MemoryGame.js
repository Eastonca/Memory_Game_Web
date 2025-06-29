const get = id => document.getElementById(id);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const startBtn = get("gameStart");

const maxRound = 10;
const colors = ["green", "red", "yellow", "blue"];
let pattern = [];
let round;

const buttons = {
    green: get("greenBtn"),
    red: get("redBtn"),
    yellow: get("yellowBtn"),
    blue: get("blueBtn"),
};

const sounds = {
    green: new Audio("audio/btn/green.mp3"),
    red: new Audio("audio/btn/red.mp3"),
    yellow: new Audio("audio/btn/yellow.mp3"),
    blue: new Audio("audio/btn/blue.mp3"),
}

const gameOverSound = new Audio("audio/gameOver.mp3");
gameOverSound.volume = 0.6;
const gameWinningSound = new Audio("audio/winning.mp3");
gameWinningSound.volume = 0.6;

const roundDisplay = get("round");
const turnDisplay = get("turnDisplay")

async function playSound(sound) {
    return new Promise(resolve => {
        sound.currentTime = 0
        sound.addEventListener("ended", resolve);
        sound.play();
    });
}

startBtn.addEventListener("click", async event => {
    startBtn.style.display = "none";
    setButtonsDisabled(true);
    resetGame();
    while (round < maxRound) {
        await delay(1000);
        roundDisplay.textContent = `Round: ${round+1}/${maxRound}`;
        const result = await newRound();
        if (!result) {
            break;
        } else {
            round++;
        }
    }
    if (round == maxRound) winning();
});

function resetGame() {
    pattern = [];
    round = 0;
    turnDisplay.textContent = "Game Starting"
}

async function newRound() { 
    pattern.push(pickNewColor());
    // change round number text and bot turn text
    await playPattern();
    setButtonsDisabled(false);
    turnDisplay.textContent = "Your turn";
    // change bot turn to your turn
    const result = await awaitPlayerInput();

    setButtonsDisabled(true);
    return result; 
}

function pickNewColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

async function playPattern() {
    turnDisplay.textContent = "Bot's turn";
    for (const color of pattern) {
        await lightUpButton(color);
        await delay(500);
    }
}

function lightUpButton(color) {
    return new Promise(async resolve => {
        const btn = buttons[color];
        btn.classList.add("lit");
        await playSound(sounds[color]);
        btn.classList.remove("lit");

        resolve(); // finish this color
    });
}

function awaitPlayerInput() {
    return new Promise(resolve => {
        let currentStep = 0;

        const handleClick = (color) => {

            if (color !== pattern[currentStep]) {
                cleanup();
                gameOver();
                return resolve(false);
            }

            const btn = buttons[color];
            btn.classList.add("lit");

            (async () => {
                await playSound(sounds[color]);
                btn.classList.remove("lit");
            })();

            currentStep++;

            if (currentStep === pattern.length) {
                cleanup();
                return resolve(true);
            }
        };

        const cleanup = () => {
            for (const color of Object.keys(buttons)) {
                buttons[color].removeEventListener("click", listeners[color]);
            }
        };

        const listeners = {};
        for (const color of Object.keys(buttons)) {
            listeners[color] = () => handleClick(color);
            buttons[color].addEventListener("click", listeners[color]);
        }
    });
}

async function gameOver() {
    // display game over text 
    turnDisplay.textContent = "Incorrect sequence. You lost!";
    // play game over sound
    await playSound(gameOverSound);
    // show start game button
    startBtn.style.display = "block";
}

async function winning() {
    turnDisplay.textContent = "You won! Congrats!"
    await playSound(gameWinningSound);
    startBtn.style.display = "block";
}

function setButtonsDisabled(disabled) {
    for (const color of Object.keys(buttons)) {
        if (disabled) {
            buttons[color].classList.add("disabled");
        } else {
            buttons[color].classList.remove("disabled");
        }
    }
}