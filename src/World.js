
import { style, div } from './helpers';
import { UI, SplashScreen, EndScreen } from './UI';
import Game from './Game';

import uuidV4 from 'uuid/v4';

//
// WorldMap
//
var WorldMap = function (world, level) {
  this.el = div(world.el, 'WorldMap');

  this.types = {
    0: 'Empty',
    1: 'Wall',
    2: 'Player',
    3: 'Friendly',
    4: 'Food',
    5: 'Exit',
    6: 'Gold',
    7: 'Fire',
    8: 'Baddie',
    9: 'Friendly',
  };
  this.icons = {
    0: '⬜️',
    1: '🌳',
    2: '🐕',
    3: '🐑',
    4: '🍖',
    5: '⛩',
    6: '💰',
    7: '🔥',
    8: '🐍',
    9: '🐈',
  };
  this.acceptableTiles = [0];

  // jscs:disable requireSpaceAfterComma
  // jscs:disable maximumLineLength
  this.fields = [
    { name: 'Starter', chunkSize: 75, field: [
      [1,1,1,1,1,1,1],
      [1,2,1,6,0,0,1],
      [1,0,0,1,1,0,5],
      [1,0,1,0,0,0,1],
      [1,4,0,9,1,7,1],
      [1,1,1,1,1,1,1],
    ], },
    { name: 'A Baddie Appears!', chunkSize: 75, field: [
      [1,1,1,1,1,1,1,1],
      [1,2,1,6,8,0,0,1],
      [1,0,9,1,1,1,0,5],
      [1,0,1,4,0,0,0,1],
      [1,0,1,1,0,1,0,1],
      [1,4,0,3,0,1,7,1],
      [1,1,1,1,1,1,1,1],
    ], },
    { name: 'EMMA', chunkSize: 47, field: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,1],
      [1,0,1,1,1,0,1,0,4,0,1,0,1,0,4,0,1,0,0,0,1,0,0,0,1],
      [1,0,1,0,0,0,1,1,0,1,1,0,1,1,0,1,1,0,0,1,0,1,0,0,1],
      [1,0,1,7,3,0,1,0,7,0,1,8,1,0,7,0,1,0,0,1,7,1,0,0,1],
      [1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,3,0,1,0,1,0,3,0,1,0,1,0,3,0,1,0,1],
      [1,4,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ], },
    { name: 'Open Field', chunkSize: 47, field: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
      [1,0,7,1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,3,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ], },
    { name: 'Maze', chunkSize: 52, field: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,3,0,0,6,7,0,1,3,0,0,0,0,0,0,3,1,0,0,0,0,1],
      [1,0,1,0,1,1,1,1,0,0,0,1,0,1,1,1,1,0,1,0,1,1,0,1],
      [1,0,1,4,0,0,0,1,1,1,1,1,0,1,0,0,0,0,4,0,0,1,0,1],
      [1,4,1,1,1,0,1,1,0,0,0,4,0,1,0,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,7,1,1,1,1,0,1,0,1,0,1,3,1,3,1],
      [1,3,1,0,1,0,1,0,3,1,6,0,1,0,0,1,0,1,0,4,0,1,6,1],
      [1,0,1,0,7,0,1,1,1,1,1,0,1,0,1,1,0,0,0,1,0,1,1,1],
      [1,6,1,0,0,0,0,3,0,0,0,0,1,0,3,0,0,7,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1],
    ], },
    { name: 'Bigger Maze', chunkSize: 47, field: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,6,1,3,0,3,6,1,6,1,3,0,0,3,0,0,0,3,1,0,0,0,3,0,1,8,5],
      [1,0,1,0,1,1,1,1,0,0,0,1,0,1,1,1,1,0,1,0,1,1,0,1,1,0,1],
      [1,0,1,4,0,0,0,7,1,1,1,1,0,1,0,0,0,0,4,0,0,1,0,7,1,0,1],
      [1,4,1,1,1,0,1,1,0,0,0,4,0,1,0,1,1,1,1,1,1,4,0,6,1,0,1],
      [1,0,0,0,1,0,0,0,0,1,1,1,1,7,0,1,6,1,0,1,3,1,3,1,1,0,1],
      [1,3,1,0,1,0,1,0,3,1,6,0,1,0,0,1,0,1,0,4,0,1,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,0,0,1,0,1,1,1,1,7,1],
      [1,0,1,0,0,0,0,3,0,3,0,0,1,0,3,7,0,1,0,1,0,1,3,6,1,4,1],
      [1,0,7,0,0,1,0,0,7,0,0,0,1,0,0,0,0,1,0,1,0,0,0,7,1,0,1],
      [1,2,1,0,1,1,1,1,1,0,7,0,1,0,1,1,0,1,0,1,1,1,0,1,1,0,1],
      [1,0,1,0,0,0,4,0,1,8,4,0,1,0,4,1,0,3,0,0,6,1,0,0,0,3,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ], },
    { name: 'Pacman', chunkSize: 32, field: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,6,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,6,1],
      [1,0,1,1,1,0,1,1,1,0,7,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,4,0,0,1,0,0,4,1,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,1,1,0,7,0,1,1,1,0,1,1,1,1,1],
      [0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0],
      [1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1,1],
      [1,2,0,0,0,0,0,0,1,3,8,3,1,0,0,0,0,0,0,0,5],
      [1,0,0,0,0,0,1,0,1,3,8,3,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1,1],
      [0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0],
      [1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,1,1,1,0,7,0,1,1,1,0,1,1,0,0,1],
      [1,0,0,4,1,3,0,0,0,0,0,0,0,0,0,3,1,4,0,0,1],
      [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,0,7,0,1,1,1,1,1,1,1,0,1],
      [1,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ], },
    { name: 'BIG Field', chunkSize: 27, field: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1],
      [1,0,7,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,7,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,0,0,1],
      [1,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ], },
  ];

  // jscs:enable requireSpaceAfterComma
  // jscs:enable maximumLineLength

  this.levels = this.fields.length;
  this.setLevel(level);

  this.iconsByType = {};
  Object.keys(this.types).forEach((key) => {
    this.iconsByType[this.types[key]] = this.icons[key];
  });

  this.typesMap = new Array(this.height);
  this.iconsMap = new Array(this.height);
  this.field.forEach((row, r) => {
    this.typesMap[r] = [];
    this.iconsMap[r] = [];
    row.forEach((col, c) => {
      this.typesMap[r][c] = this.types[col];
      this.iconsMap[r][c] = this.icons[col];
    });
  });
};

WorldMap.prototype.setLevel = function (level) {
  this.field = this.fields[level - 1].field;
  this.chunkSize = this.fields[level - 1].chunkSize;
  this.name = this.fields[level - 1].name;
  this.width = this.field[0].length;
  this.height = this.field.length;
};

//
// Leaderboard
//
var Leaderboard = function () {
  this._data = [];
  this.load();
};

Leaderboard.prototype.load = function () {
  let lb = window.localStorage.getItem('leaderboard');
  this._data = JSON.parse(lb) || [];
};

Leaderboard.prototype.save = function () {
  window.localStorage.setItem('leaderboard', JSON.stringify(this._data));
};

Leaderboard.prototype.add = function (world) {
  this._data.push({
    id: world.id,
    name: world.player.displayName,
    gold: world.player.gold,
  });
  this._data = this._data.sort((a, b) => a.gold < b.gold).slice(0, 10);
  this.save();
};

Leaderboard.prototype.get = function () {
  return this._data.sort((a, b) => a.gold < b.gold);
};

//
// World
//
var World = function (rootEl) {
  // element
  this.rootEl = rootEl;
  this.el = div(this.rootEl, 'World');

  // get the default name
  var playerDisplayName = window.localStorage.getItem('playerDisplayName');
  this.playerDisplayName = playerDisplayName || 'Player1';

  this.leaderboard = new Leaderboard();
  this.hide();
  this.splash = new SplashScreen(this, _ => {
    this.show();
    this.play();
  });

  // debugging
  console.log(this);

  // console.table(this.map.iconsMap);
};

World.prototype.play = function () {
  this.id = uuidV4();

  // stats
  this.tickCount = 0;
  this.fps = 0;
  this.fpsLast = 0;
  this.fpsHistory = [];
  this.running = true;
  this.message = null;
  this.ui = new UI(this);

  // map
  this.level = 1;
  this.map = new WorldMap(this, this.level);
  this.chunkSize = this.map.chunkSize;
  this.size = [this.map.width * this.chunkSize, this.map.height * this.chunkSize];
  style(this.map.el, {
    width: this.size[0] + 1,
    height: this.size[1] + 5,
  });

  // entities
  this.placeAll();
  this.player = this.entities.find(e => e.type === 'Player');

  // update the player's name
  this.player.displayName = this.playerDisplayName;
  window.localStorage.setItem('playerDisplayName', this.playerDisplayName);

  // handlers
  this.second.bind(this)();
  window.stop = this.stop.bind(this);
  window.start = this.start.bind(this);

  // debugging
  console.log(this);

  // console.table(this.map.iconsMap);

  this.start();
};

World.prototype.getEntitiesByType = function (type) {
  return this.entities.filter(e => e.type === type);
};

World.prototype.getEntitiesByPos = function (pos) {
  return this.entities.filter(e => e.pos[0] === pos[0] && e.pos[1] === pos[1]);
};

World.prototype.second = function () {
  if (!this.running) {
    return;
  };

  this.fps = this.tickCount - this.fpsLast;
  this.fpsHistory.push(this.fps);
  if (this.fpsHistory.length > 100) {
    this.fpsHistory = this.fpsHistory.slice(-100);
  };

  this.fpsLast = this.tickCount;
  setTimeout(this.second.bind(this), 1000);
};

World.prototype.tick = function () {
  if (!this.running) {
    return;
  };

  this.tickCount = this.tickCount + 1;
  this.player.act();
  this.player.move();
  this.ui.update();
  requestAnimationFrame(this.tick.bind(this));
};

World.prototype.moved = function () {
  this.getEntitiesByType('Baddie').forEach((e) => e.move(this.player.pos));
  this.getEntitiesByType('Friendly').forEach((e) => e.move(this.player.pos));
};

World.prototype.stop = function () {
  this.running = false;
  console.log('STOP');
};

World.prototype.start = function () {
  this.running = true;
  this.second();
  this.tick();
  console.log('START');
};

World.prototype.setMessage = function (msg) {
  this.message = msg;
  setTimeout(() => {
    this.message = null;
  }, 1000 * 10);
};

World.prototype.placeAll = function () {
  this.entities = [];
  this.map.field.forEach((row, r) => {
    // console.log(r, row)
    row.forEach((col, c) => {
      // console.log(c, col)
      let type = this.map.types[col];
      if (type === 'Player' && this.player) {
        this.player.createAndPos([c, r]);
        return;
      };

      // console.log(type, 'FOUND', r, c);
      let entity = new Game[type](this, {
        pos: [c, r],
        name: [type, c, r].join(':'),
        icon: this.map.icons[col],
      });
      this.entities.push(entity);
    });
  });
};

World.prototype.removeEntity = function (name) {
  for (let e in this.entities) {
    if (this.entities[e].name === name) {
      this.entities.splice(e, 1);
      return;
    }
  }
};

World.prototype.clearMap = function () {
  this.map.el.innerHTML = '';
  this.size = [this.map.width * this.chunkSize, this.map.height * this.chunkSize];
  style(this.map.el, {
    width: this.size[0],
    height: this.size[1],
  });
};

World.prototype.findByDir = function (pos, dir) {
  let newPos = [pos[0], pos[1]];
  switch (dir) {
    case 'Up':
      newPos[0]++;
      break;
    case 'Left':
      newPos[0]++;
      break;
    case 'Right':
      newPos[0]++;
      break;
    case 'Down':
      newPos[0]++;
      break;
    default:
      break;
  }
  return this.getEntitiesByPos(newPos);
};

World.prototype.engage = function () {
};

World.prototype.exit = function () {
  this.level++;
  if (this.level > this.map.levels) {
    this.win();
    return;
  }

  this.id = uuidV4();
  this.map.setLevel(this.level);
  this.chunkSize = this.map.chunkSize;
  this.clearMap();
  this.entities = [];
  this.placeAll();
};

World.prototype.show = function () {
  style(this.el, {
    visibility: 'visible',
  });
};

World.prototype.hide = function () {
  style(this.el, {
    visibility: 'hidden',
  });
};

World.prototype.win = function () {
  this.leaderboard.add(this);
  this.hide();
  this.splash = new EndScreen(this, false, _ => {
    this.level = 0;
    this.exit();
    this.show();
  });
};

World.prototype.lose = function (entity) {
  this.leaderboard.add(this);
  this.hide();
  this.splash = new EndScreen(this, entity, _ => {
    this.level = 0;
    this.exit();
    this.show();
  });
};

module.exports = World;
