// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
import './index.css';

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );


var Game = {};


//
// HELPERS
//
var style = function (el, styles) {
  for (let i in styles) {
    if (Number.isInteger(styles[i])) {
      el.style[i] = styles[i] + 'px';
    } else {
      el.style[i] = styles[i];
    }
  }
}
var event = function (el, name, cb) {
  el.addEventListener(name, cb);
  return el;
}
var el = function (parentEl, className, innerHTML, styles, type='div') {
  var el = document.createElement(type);
  if (className) {
    el.className = className;
  }
  if (innerHTML) {
    el.innerHTML = innerHTML;
  }
  if (styles) {
    style(el, styles);
  }
  parentEl.appendChild(el);
  return el;
}
var div = function (parentEl, className, innerHTML, styles) {
  return el(parentEl, className, innerHTML, styles, 'div');
}
var span = function (parentEl, className, innerHTML, styles) {
  return el(parentEl, className, innerHTML, styles, 'span');
}
var br = function (parentEl) {
  return el(parentEl, null, null, null, 'br');
}


var Stats = function (world) {
  this.world = world;
  this.el = div(world.el, 'Stats', '<b>loading...</b>');
}
Stats.prototype.update = function () {
  this.el.innerHTML = [
    // 'Tick:',
    // this.world.tickCount,
    // ';',
    'FPS:',
    this.world.fps,
    '<span class="History">',
    this.renderHistory(),
    '</span>'
    ].join(' ');
}
Stats.prototype.renderHistory = function () {
  let out = [];
  for (let v of this.world.fpsHistory) {
    out.push('<span style="height:'+(v/2.5)+'px">&nbsp;</span>');
  }
  return out.join('');
}


var Control = function (world) {
  this.world = world;
  this.el = div(world.el, 'Control');
  this.buttons = [
    span(this.el, 'Button', '&nbsp;&nbsp;&nbsp;', null),
    event(span(this.el, 'Button Up', '🔼', null), 'click', this.clickDir.bind(this)('up')),
    span(this.el, 'Button', '&nbsp;', null),
    br(this.el),
    event(span(this.el, 'Button Left', '️◀️️', null), 'click', this.clickDir.bind(this)('left')),
    event(span(this.el, 'Button Down', '🔽', null), 'click', this.clickDir.bind(this)('down')),
    event(span(this.el, 'Button Right', '️▶️', null), 'click', this.clickDir.bind(this)('right')),
    br(this.el),
    span(this.el, 'Button', '&nbsp;&nbsp;&nbsp;', null),
    event(span(this.el, 'Button Pause', '⏯', null), 'click', () => {
      if (this.world.running) {
        this.world.stop();
      } else {
        this.world.start();
      }
    }),
  ];
}
Control.prototype.clickDir = function (dir) {
  let self = this;
  return function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.world.dir = dir;
  }
}


var Map = function () {
  this.map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,2,0,0,0,0,1],
    [1,3,0,0,0,0,0,0,3,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
  ];
  this.width = this.map[0].length;
  this.height = this.map.length;
  this.named = {
    0: 'Empty',
    1: 'Wall',
    2: 'Player',
    3: 'Baddie',
  };
  this.namedMap = new Array(this.height);
  for (let r in this.map) {
    let row = this.map[r];
    for (let c in row) {
      let col = row[c];
      if (!this.namedMap[r]) this.namedMap[r] = [];
      this.namedMap[r][c] = this.named[col];
    }
  }
}


Game.Entity = function (world, pos, name) {
  this.world = world;
  this.name = name;
  this.type = 'Entity';
  this.icon = '●';
  this.pos = pos ? pos : [0, 0];
  this.oldPos = [-1, -1];
  this.size = [this.world.chunkSize, this.world.chunkSize];
}
Game.Entity.prototype.create = function () {
  this.el = div(this.world.el, this.type, this.icon, {
    width: this.size[0],
    height: this.size[0],
  });
}
Game.Entity.prototype.goToPos = function () {
  let left = (this.pos[0] * this.world.chunkSize);
  let top = (this.pos[1] * this.world.chunkSize);
  style(this.el, {
    left: left,
    top: top,
  });
}


Game.Player = function (world, pos, name) {
  Game.Entity.apply(this, arguments);
  this.icon = '🐕';
  this.type = 'Player';
  this.pos = [4,4];
  this.create();
  this.goToPos();
  // console.log(this)
}
Game.Player.prototype = Object.create(Game.Entity.prototype);
Game.Player.prototype.move = function (dir) {
  if (dir === 'up') {
    this.pos[1] = this.pos[1] - 1;
  } else if (dir === 'left') {
    this.pos[0] = this.pos[0] - 1;
  } else if (dir === 'down') {
    this.pos[1] = this.pos[1] + 1;
  } else if (dir === 'right') {
    this.pos[0] = this.pos[0] + 1;
  }
  if (this.pos[0] !== this.oldPos[0] || this.pos[1] !== this.oldPos[1]) {
    this.goToPos();
  }
  console.log(this.type, dir, this.oldPos, this.pos);
  this.oldPos[0] = this.pos[0];
  this.oldPos[1] = this.pos[1];
};


Game.Baddie = function (world, pos, name) {
  Game.Entity.apply(this, arguments);
  this.icon = '🐑';
  this.type = 'Baddie';
  this.create();
  this.goToPos();
  // console.log(this)
}
Game.Baddie.prototype = Object.create(Game.Entity.prototype);


Game.Wall = function (world, pos) {
  Game.Entity.apply(this, arguments);
  this.world = world;
  this.pos = pos ? pos : [0, 0];
  this.size = [this.world.chunkSize, this.world.chunkSize];
  let left = (this.pos[0] * this.world.chunkSize);
  let top = (this.pos[1] * this.world.chunkSize);
  this.el = div(world.el, 'Wall', '🌳', {
    width: this.size[0],
    height: this.size[0],
    left: left,
    top: top,
  });
}
Game.Wall.prototype = Object.create(Game.Entity.prototype);


Game.Walls = function (world) {
  this.world = world;
  this.walls = [];
  this.placeAll();
}
Game.Walls.prototype.placeAll = function () {
  var map = this.world.map.map;
  for (let r in map) {
    let row = map[r];
    for (let c in row) {
      let col = row[c];
      // console.log('>', r, c, col);
      if (col === 1) {
        // console.log('WALL FOUND', r, c, col);
        this.walls.push(new Game.Wall(this.world, [c, r]));
      }
    }
  }
};


var World = function (rootEl) {
  this.el = rootEl;
  this.el.className = 'World';
  this.tickCount = 0;
  this.fps = 0;
  this.fpsTick = 0;
  this.fpsHistory = [];
  this.running = true;
  this.dir = null;

  this.stats = new Stats(this);
  this.map = new Map(this);
  this.chunkSize = 50;
  this.size = [this.map.width * this.chunkSize, this.map.height * this.chunkSize];
  style(this.el, {
    width: this.size[0],
    height: this.size[1],
  })

  this.walls = this.placeAll(1, 'Wall');
  this.player = this.placeAll(2, 'Player')[0];
  this.baddies = this.placeAll(3, 'Baddie');

  this.control = new Control(this);

  document.addEventListener('keyup', this.keyUp.bind(this));
  this.second.bind(this)();
  window.stop = this.stop.bind(this);
  window.start = this.start.bind(this);
  console.log(this)
  console.table(this.map.namedMap);
}
World.prototype.second = function () {
  if (!this.running) {
    return;
  }
  this.fps = this.tickCount - this.fpsTick;
  this.fpsHistory.push(this.fps);
  if (this.fpsHistory.length > 100) {
    this.fpsHistory = this.fpsHistory.slice(-100);
  }
  this.fpsTick = this.tickCount;
  setTimeout(this.second.bind(this), 1000);
}
World.prototype.tick = function () {
  if (!this.running) {
    return;
  }
  this.tickCount = this.tickCount + 1;
  if (this.dir !== null) {
    this.player.move(this.dir);
    this.dir = null;
  }
  this.stats.update();
  requestAnimationFrame(this.tick.bind(this));
}
World.prototype.stop = function () {
  this.running = false;
  console.log('STOP');
}
World.prototype.start = function () {
  this.running = true;
  this.second();
  this.tick();
  console.log('START');
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
World.prototype.placeAll = function (search, entity) {
  var map = this.map.map;
  var entities = [];
  for (let r in map) {
    let row = map[r];
    for (let c in row) {
      let col = row[c];
      // console.log('>', r, c, col);
      if (col === search) {
        console.log(search + ' FOUND', r, c, col);
        // TODO: this call doesn't really work
        entities.push(new Game[entity](this, [c, r], c + ':' + r));
      }
    }
  }
  return entities;
}


var w = new World(document.getElementById('root'));
w.tick();
