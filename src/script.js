import p5 from 'p5';
import { Board } from './modules/Board';
import { Timer } from './modules/Timer';
import { Game } from '/src/modules/Game.js';
let board = new Board();
let timer = new Timer();
let game = new Game(board, timer); 
let windowSize;
let timerGraphics;
let seconds = 60;
let frameCounter = 0; //maybe use frameCount()?

function getWindow() {
  let w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
  return { w: x, h: y };
}

"use strict";
new p5(p => {
  function randColor() {
    return p.color(p.random(255), p.random(255), p.random(255));
  };

  p.preload = function preload() {
    game.load(p);
  };

  p.setup = function setup() {
    windowSize = getWindow();
    p.createCanvas(windowSize.w, windowSize.h);
    game.splitCards(p);
    //timerGraphics = p.createGraphics(window.w, window.h);
  };

  p.draw = function () {
    p.background(0);
    timer.drawTimer(p);
    frameCounter++;
    if(frameCounter % 60 == 0){ //seems to be 60 fps?
      frameCounter = 0; 
      //console.log("FrameCounter refreshed");
      game.timerTrigger();
      timer.drawSeconds(p);

      //p.image(timer.drawSeconds(timerGraphics), 0, 0); //take timerGraphics and load it onto canvas
    }
    game.staticRender(p, windowSize.w, windowSize.h);
  };

  p.mouseClicked = function mouseClicked() {
    game.updateTopDisplay(p.mouseX, p.mouseY);
    board.chooseCol(p.mouseY, p);
  };
});