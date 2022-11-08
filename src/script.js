import p5 from 'p5';
import { Board } from '../src/modules/Board';
import { Timer } from '../src/modules/Timer';
import { Score } from '../src/modules/Score';
import { Game } from '../src/modules/Game';
import { Omikuji } from '../src/modules/Omikuji';

export function getWindow() {
    let w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return { w: x, h: y };
}

const GM = {
    preload: () => { },
    setup: () => { },
    draw: () => { },
    mouseClicked: (x, y) => { },
    keyPressed: () => { }
}

const p = new p5(p => {
    const windowSize = getWindow();
    p.preload = function preload() {
      game.load();
    };

    p.setup = function setup() {
        p.createCanvas(windowSize.w, windowSize.h);
        GM.setup();
    };

    p.draw = function draw() {
        p.background(0);
        GM.draw(p.windowWidth, p.windowHeight);
    };

    p.mouseClicked = function mouseClicked() {
        GM.mouseClicked(p.mouseX, p.mouseY);
    };

    p.windowResized = function windowResized() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.keyPressed = function keyPressed() {
        GM.keyPressed();
    }
});

let score = new Score(p);
let timer = new Timer(p);
let board = new Board(p, timer);
let state = 0;

const game = new Game(p, board, score, timer);
const omikuji = new Omikuji(p, score);

let omikujiSound = new Audio('/static/sounds/spinner.mp3');
let gameSound = new Audio('/static/sounds/japanese_music.mp3');
let menuSound = new Audio('/static/sounds/gong.mp3');
let winSound = new Audio('/static/sounds/win.mp3');
let gameOverSound = new Audio('/static/sounds/gameover.mp3');

function resetGame(currentState) {
    score.resetScore();

    board = new Board(p, timer);
    board.loadCardsLeft();
    board.loadJPFont();
    game.board = board;

    if (currentState == 4) {
        score.setClearPoint(1, 0);
        state = 0;
    }
    else {
        state = 1;
    }

    game.reShuffle();
}

function menu(width, height) {
    // TODO: Implement main menu but better
    p.stroke(255, 255, 255);
    p.fill(255, 255, 255);
    p.rect(width / 3, height / 3, 400, 150);

    p.stroke(0, 0, 0);
    p.fill(0, 0, 0);
    p.textSize(64);
    p.text("CLICK TO PLAY GAME", width / 3, height / 3, 400, 150);
}

function menuState(width, height, x, y) {
    // Function for p5 mouseClicked and menu()
    if (state == 0) {
        if (width / 3 < x && x < width / 3 + 400 && height / 3 < y && y < height / 3 + 150) {
            // If button is cicked, new game
            menuSound.volume = 0.5;
            menuSound.play();
    
            gameSound.volume = 0.1;
            gameSound.loop = true;
            gameSound.play();
            p.textSize(20);
            state = 1;
        }
    }
}


function gameOver(width, height) {
    // TODO: Implement a game over screen
    gameSound.pause();
    gameSound.currentTime = 0;

    p.stroke(255, 255, 255);
    p.fill(255, 255, 255);
    p.rect(width / 2, height - height / 5, 150, 100);

    p.stroke(0, 0, 0);
    p.fill(0, 0, 0);
    p.textSize(24);
    p.text("MAIN MENU", width / 2, height - height / 7);

    // var user = p.createInput();
    // score.addLeaderboad(user);
}

function gameOverState(width, height, x, y) {
    // Function for P5 mouseClicked and gameOver()
    if (state == 4) {
        gameOverSound.play();
        if (width / 2 < x && x < width / 2 + 150 && (height - height / 5) < y && y < (height - height / 5) + 100) {
            // Goes to main menu if button is clicked
            p.textSize(20);
            resetGame(4); // TODO: Code automatically skips to resetting game instead of displaying gameOver screen
        }
    }
}
function continueScreen(width, height, scaleX, scaleY) {   
    // Render Continue? screen after lost game 
    p.stroke(255, 0, 0);
    p.fill(255, 255, 255);
    p.textSize(64 * Math.min(scaleX, scaleY));
    p.text("CONTINUE?", width / 3, height / 3);

    // NO button
    p.rect(width / 2 + width / 10, height / 2, 150, 100);

    // YES button
    p.rect(width / 3 - width / 25, height / 2, 150, 100);

    p.noStroke();
    p.fill(0, 0, 0);
    p.text("YES", width / 3 - width / 30, height / 2 + height / 15);
    p.text("NO", width / 2 + width / 8, height / 2 + height / 15);
}

function continueScreenStates(width, height, x, y) {
    // Function for P5 mouseClicked and cont() 
    if (state == 2) {
        if ((width / 2 + width / 10) < x && x < (width / 2 + width / 10) + 150 && height / 2 < y && y < height / 2 + 100) {
            // If NO button is clicked, game over
            state = 4;
        }
        if ((width / 3 - width / 25) < x && x < (width / 3 - width / 25) + 150 && height / 2 < y && y < height / 2 + 100) {
            // If YES button is clicked, omikuji
            omikujiSound.volume = 0.2;
            omikujiSound.loop = true;
            omikujiSound.play();

            state = 3;
        }
    }
}

function win() {
    // Function for winning game 
    winSound.play();
    game.level++;
    score.updateTotalScore();
    resetGame(5);
}

GM.setup = function () {
    game.splitCards();
    omikuji.loadJPFont();
}

GM.draw = function (width, height) {
    let scaleX = width / 1440;
    let scaleY = height / 790;

    // State is 0, main menu
    if (state == 0) {
        // menu(width, height);
        gameOver(width, height);
    }

    // State is 1, play game
    if (state == 1) {
        state = game.play(width, height, scaleX, scaleY);
    }

    // State is 2, continue screen
    if (state == 2) {   
        continueScreen(width, height, scaleX, scaleY);
    }

    // State is 3, omikuji
    if (state == 3) {
        state = omikuji.omikuji(game.level, width, height, scaleX, scaleY);
    }

    // State is 4, game over
    if (state == 4) {
        gameOver(width, height);
    }

    // State is 5, won
    if (state == 5) {
        win();
    }

    // State is 6, omikuji bonus is added and the game should reset
    if (state == 6) {
        resetGame(6);
    }
}

GM.mouseClicked = function (x, y) {
    const popSound = new Audio('/static/sounds/pop.wav');
    popSound.play();
    popSound.volume = 0.2;
    game.updateTopDisplay(x, y);
    board.chooseCol(y, game.recentMoves, score);
    continueScreenStates(p.windowWidth, p.windowHeight, x, y);
    menuState(p.windowWidth, p.windowHeight, x, y);
    gameOverState(p.windowWidth, p.windowHeight, x, y);
}

GM.keyPressed = function () {
    if (p.keyCode == 32) {
        console.log("Space bar was pressed");
        omikujiSound.pause();
        stop.currentTime = 0; 
    }
}