import p5 from 'p5';
import { Board } from './modules/Board';
import { Game } from '/src/modules/Game.js';
let game = new Game(new Board()); 

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
  let bg, sprite;

  function randColor() {
    return p.color(p.random(255), p.random(255), p.random(255));
  };

  p.preload = function preload() {
    game.load(p);
  };

  p.setup = function setup() {
    let window = getWindow()
    p.createCanvas(window.w, window.h);
    p.background(0);
  };

  p.draw = function () {
    game.staticRender(p);
  };

  p.mouseClicked = function mouseClicked() {
    if (p.mouseY >= 125 && p.mouseY <= 180) {
      game.updateTopDisplay(p.mouseX, p);
    }
  };
});