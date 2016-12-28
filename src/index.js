import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );


var Map = function () {
  this.map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
  ];
}


var Player = function (name, world) {
  this.world = world;
  this.pos = [5,5];
  this.size = [50,50];
  this.el = document.createElement('div');
  this.el.className = 'Player';
  this.el.innerHTML = "🦆";
  this.style();
  world.el.appendChild(this.el);
  console.log(this.el)
}
Player.prototype.style = function () {
  this.el.style.width = this.size[0] + 'px';
  this.el.style.height = this.size[0] + 'px';
}
Player.prototype.move = function (dir) {
  console.log({dir})
  if (dir === 'up') {
    this.pos[1] = this.pos[1] - 1;
  } else if (dir === 'left') {
    this.pos[0] = this.pos[0] - 1;
  } else if (dir === 'down') {
    this.pos[1] = this.pos[1] + 1;
  } else if (dir === 'right') {
    this.pos[0] = this.pos[0] + 1;
  }
  let left = (this.pos[0] * this.world.chunkSize) + this.size[0]/2;
  let top = (this.pos[1] * this.world.chunkSize) + this.size[1]/2;
  console.log('Player pos', left, top)
  this.el.style.left = left + 'px';
  this.el.style.top = top + 'px';
};

var Stats = function (world) {
  this.world = world;
  this.el = document.createElement('div');
  this.el.className = 'Stats';
  world.el.appendChild(this.el);
  // this.el.style.width = '300px';
  // this.el.style.height = '50px';
  this.el.style.left = 0;
  this.el.style.top = 0;
  this.el.innerHTML = '<b>loading...</b>';
}
Stats.prototype.update = function () {
  this.el.innerHTML = [
    'Tick:',
    this.world.tickCount,
    ';',
    'FPS:',
    this.world.fps
    ].join(' ');
}


var World = function (rootEl) {
  this.el = rootEl;
  this.el.className = 'World';
  this.tickCount = 0;
  this.fps = 0;
  this.fpsTick = 0;

  this.stats = new Stats(this);
  this.map = new Map();
  this.chunkSize = 50;
  this.size = [this.map.map[0].length * this.chunkSize, this.map.map.length * this.chunkSize];
  this.el.style.width = this.size[0] + 'px';
  this.el.style.height = this.size[1] + 'px';

  this.player = new Player('Paul', this);

  document.addEventListener('keyup', this.keyUp.bind(this));
  this.second.bind(this)();
}
World.prototype.second = function () {
    this.fps = this.tickCount - this.fpsTick;
    this.fpsTick = this.tickCount;
    setTimeout(this.second.bind(this), 1000);
}
World.prototype.tick = function () {
  this.tickCount = this.tickCount + 1;
  if (this.dir !== null) {
    this.player.move(this.dir);
    this.dir = null;
  }
  this.stats.update();
  // requestAnimationFrame(this.tick.bind(this));
}
World.prototype.keyUp = function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.key === 'w' || e.key === 'ArrowUp') {
    this.dir = 'up';
  } else if (e.key === 'a' || e.key === 'ArrowLeft') {
    this.dir = 'left';
  } else if (e.key === 's' || e.key === 'ArrowDown') {
    this.dir = 'down';
  } else if (e.key === 'd' || e.key === 'ArrowRight') {
    this.dir = 'right';
  }
  console.log('keyUp', this.dir, e.key)
}


var w = new World(document.getElementById('root'));
w.tick();
