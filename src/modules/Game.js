import { Card } from './Card';
export class Game {
	constructor(p5, board, score, timer, soundManager) {
		this.p5 = p5
		this.board = board;
		this.score = score;
		this.timer = timer;
		this.soundManager = soundManager;

		this.level = 1;
		this.state = 0;

		this.deck = [];
		this.mouseWasClicked = false; // Checks to see if we already selected a card in topDisplay
		this.displayMap = new Map(); // Map that splits deck into four equal parts after shuffle

		this.cancelsLeft = 3;
		this.gameStateSaver = [];
		this.stateSaver();

		this.paperFrameLong;
		this.cancelButton;
		this.randomNum = 0;
	}

	load() {
		// Loads all static UI
		const suits = ['diamonds', 'hearts', 'spades', 'clubs'];
		const values = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];

		for (const suit of suits) {
			for (const value of values) {
				this.deck.push(new Card(this.p5, `${suit[0]}`, `${value}`, this.p5.loadImage(`../../static/cards/card_${suit}_${value}.png`)));
			}
		}

		this.deck.push(new Card(this.p5, "wild", "wild", this.p5.loadImage('../../static/cards/card_joker_black.png')));
		this.deck.push(new Card(this.p5, "wild", "wild", this.p5.loadImage('../../static/cards/card_joker_black.png')));
		this.deck.push(new Card(this.p5, "wild", "wild", this.p5.loadImage('../../static/cards/card_joker_red.png')));
		this.deck.push(new Card(this.p5, "wild", "wild", this.p5.loadImage('../../static/cards/card_joker_red.png')));

		this.board.load();
		this.score.fillScoreTable();
		this.paperFrameLong = this.p5.loadImage("/static/UI/paperStrip.png");
		this.cancelButton = this.p5.loadImage("/static/UI/Buttons/Icon_SquareStraight.png");
	}

	play(width, height, scaleX, scaleY) {
		this.soundManager.playGameTheme();

		// Render game elements
		this.renderLevel(width, height, scaleX, scaleY);

		this.score.render(width, height, scaleX, scaleY);

		this.board.render(this.displayMap, this.mouseWasClicked, width, height, scaleX, scaleY);

		this.cancelDisplay(width, height, scaleX, scaleY);

		this.timer.drawTimer(width, height, scaleX, scaleY);
		this.timerTrigger();
		this.timer.drawSeconds(width, height, scaleX, scaleY);

		// Every 60 frames, decrement timer
		if (this.p5.frameCount % 60 == 0) {
			this.timer.countDown();
		}

		if (this.board.isBoardFull()) {
			if (this.score.isWin()) {
				this.level++;
				this.score.setExtend();
				this.score.setClearPoint(this.level, 0);
				this.setRandomNum();
				if (this.getRandomNum() == 0) {
					// Random omikuji
					this.soundManager.resetGameTheme();
					return 3;
				}
				else {
					this.score.updateTotalScore(this.cancelsLeft, 0);
				}
				return 5;
			}
			else {
				this.soundManager.playContinue();
				return 2;
			}
		}

		return 1;
	}

	stateSaver() {
		// Saves the state of the board, score and counts after a card is dropped
		let currBoard = this.board.boardCols.map(r => {
			return r.hand.map(c => {
				return `${c.value}${c.suit}`
			})
		})

		let cardDisplay = [];
		for (var i = 0; i < 4; i++) {
			cardDisplay.push(this.board.counts[i]);
		}

		const gameState = {
			score: this.score.currentScore,
			board: currBoard,
			counts: cardDisplay
		}

		this.gameStateSaver.push(gameState);

		if (this.gameStateSaver.length > 4) {
			this.gameStateSaver.shift();
		}
	}

	intToKanji(number) {
		let kanji = "";

		const kanji_table = {
			0: "",
			1: "一",
			2: "二",
			3: "三",
			4: "四",
			5: "五",
			6: "六",
			7: "七",
			8: "八",
			9: "九",
			10: "十",
			100: "百"
		};

		// Hundreds
		if ((number / 100) >= 1) {
			const hundred = Math.floor(number / 100);
			kanji += (hundred != 1 ? kanji_table[hundred] : "") + kanji_table[100];

			number = number % 100;
		}

		// Tens
		if ((number / 10) >= 1) {
			const ten = Math.floor(number / 10);
			kanji += (ten != 1 ? kanji_table[ten] : "") + kanji_table[10];

			number = number % 10;
		}

		// Ones
		kanji += kanji_table[number];

		return kanji;
	}

	renderLevel(width, height, scaleX, scaleY) {
		// Displays level in Kanji
		this.p5.strokeWeight(3);
		this.p5.noFill();
		this.p5.stroke(204, 97, 61);
		this.p5.rect(width / 3, height / 11, 70 * scaleX, 80 * scaleY);

		this.p5.strokeWeight(1);
		this.p5.stroke(0, 0, 0);
		this.p5.fill(255, 255, 255);
		this.p5.textAlign(this.p5.CENTER, this.p5.TOP);
		this.p5.textSize(40 * Math.min(scaleX, scaleY));
		this.p5.text(`${this.intToKanji(this.level)}`, width / 3, height / 11, 80 * scaleX, 80 * scaleY);
		this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
		this.p5.text(`面`, width / 3, height / 11 + 10 * scaleY, 80 * scaleX, 80 * scaleY);
	}

	updateTopDisplay(px, py) {
		// Sets current card to whatever was clicked/selected from Board.js
		this.currentCard = this.board.clicked(px, py, this.displayMap);
		this.mouseWasClicked = true;
	}

	splitCards() {
		// Shuffles and splits the deck into four equal parts
		this.p5.shuffle(this.deck, true);
		let x = 0;
		for (let i = 0; i < 4; i++) {
			this.displayMap.set(i, this.deck.slice(x, x + 13));
			x += 13;
		}
	}

	reShuffle() {
		// Shuffles deck for reset 
		for (let i = 0; i < 4; i++) {
			this.displayMap.set(i, this.p5.shuffle(this.displayMap.get(i), true));
		}
	}

	timerTrigger() {
		// Drops card if timer is up 
		if (this.board.cardPlaced == true) {
			// Card has been placed by user 
			this.timer.resetTimer();
			this.board.cardPlaced = false;
			this.stateSaver();
		}
		else {
			if (this.timer.seconds == 0) {
				// Drops card selected
				if (this.board.cardSelected) {
					for (let i = 0; i <= 5; i++) {
						if (this.board.addCard(i, this.board.currentCard, this.score) !== -1) {
							this.board.currentCard = null;
							this.board.counts[this.board.draggingColumn] -= 1
							this.board.cardSelected = false;
							this.stateSaver();
							break;
						}
					}
				}
				else {
					// Drops a card from 3x4 array
					let firstCard = this.board.getFirstCard(this.displayMap);
					for (let i = 0; i < 5; i++) {
						if (firstCard != null) {
							if (this.board.addCard(i, firstCard, this.score) != -1) {
								this.board.currentCard = null;
								this.stateSaver();
								break;
							}
						}
					}
				}
				this.timer.resetTimer();
			}
		}
	}

	cancelDisplay(width, height, scaleX, scaleY) {
		// Displays section for remaining cancels/undos
		this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
		this.p5.image(this.paperFrameLong, width - width / 4.5, height / 5, width / 5, height / 15);

		this.p5.strokeWeight(3);
		this.p5.stroke(0, 0, 0);
		this.p5.fill(255, 255, 255);
		this.p5.textSize(20 * Math.min(scaleX, scaleY));
		this.p5.text("CANCELS", width - width / 6, height / 4.25);

		this.p5.image(this.cancelButton, width * 0.7, height / 12, 95 * scaleX, 80 * scaleY);
		this.p5.text("CANCEL", width * 0.7 + 13 * scaleX, height / 12 + 40 * scaleY);

		this.p5.textFont("Helvetica");
		this.p5.text("🐉".repeat(this.cancelsLeft), width - width / 10, height / 4.25);
	}

	getRank(rank) {
		// Gets ranking of poker hand 
		this.score.updateScore(rank);
	}

	resetLevel() {
		this.level = 1;
	}

	getState() {
		// States for undo/cancel
		return this.state;
	}

	setState(state) {
		this.state = state;
	}

	getLevel() {
		return this.level;
	}

	getCancels() {
		return this.cancelsLeft;
	}

	cancelState(x, y, width, height, scaleX, scaleY) {
		if ((width * 0.7) < x && x < (width * 0.7 + 95 * scaleX) && y > (height / 12) && y < (height / 12 + 80 * scaleY)) {
			if (this.cancelsLeft > 0 && this.board.currentCard !== null) {
				this.board.unChooseCard();
				this.timer.resetTimer();
				this.cancelsLeft--;
			}
			else if (this.cancelsLeft > 0 && this.board.currentCard === null) {
				if (this.board.boardIsEmpty() === false) {
					let temp = this.gameStateSaver.splice(-2)[0];
					this.board.updateHands(temp, this.deck);
					this.board.updateTopDisplay(temp, this.displayMap);
					this.score.currentScore = temp.score;
					this.stateSaver();
					this.timer.resetTimer();
					this.cancelsLeft--;
				}
			}
		}
	}

	getRandomNum() {
		return this.randomNum;
	}

	setRandomNum() {
		this.randomNum = Math.floor(Math.random() * 2); // Random number 0-1
	}
};
