
import {style, div} from './helpers';
import {UI} from './UI';
import Game from './Game';


//
// WorldMap
//
var WorldMap = function (world, level) {
  this.el = div(world.el, 'WorldMap');

  this.fields = [
    [
      [1,1,1,1,1,1,1],
      [1,2,1,6,0,0,1],
      [1,0,0,1,1,0,5],
      [1,0,1,0,0,0,1],
      [1,4,0,3,1,0,1],
      [1,1,1,1,1,1,1],
    ],
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,3,0,0,0,1,0,1,3,0,0,0,0,0,0,3,1,0,0,0,0,1],
      [1,0,1,0,1,1,1,1,0,0,0,1,0,1,1,1,1,0,1,0,1,1,0,1],
      [1,0,1,4,0,0,0,1,1,1,1,1,0,1,0,0,0,0,4,0,0,1,0,1],
      [1,4,1,1,1,0,1,1,0,0,0,4,0,1,0,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,1,1,1,1,1,0,1,0,1,0,1,3,1,3,1],
      [1,3,1,0,1,0,1,0,3,1,0,0,1,0,0,1,0,1,0,4,0,1,0,1],
      [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,0,0,1,0,1,1,1],
      [1,0,1,0,0,0,0,3,0,0,0,0,1,0,3,0,0,1,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1],
    ],
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,1,3,0,3,0,1,0,1,3,0,0,3,0,0,0,3,1,0,0,0,3,0,5],
      [1,0,1,0,1,1,1,1,0,0,0,1,0,1,1,1,1,0,1,0,1,1,0,1,1],
      [1,0,1,4,0,0,0,1,1,1,1,1,0,1,0,0,0,0,4,0,0,1,0,1,1],
      [1,4,1,1,1,0,1,1,0,0,0,4,0,1,0,1,1,1,1,1,1,1,0,1,1],
      [1,0,0,0,1,0,0,0,0,1,1,1,1,1,0,1,0,1,0,1,3,1,3,1,1],
      [1,3,1,0,1,0,1,0,3,1,0,0,1,0,0,1,0,1,0,4,0,1,0,1,1],
      [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,0,0,1,0,1,1,1,1],
      [1,2,1,0,0,0,0,3,0,3,0,0,1,0,3,0,0,1,0,1,0,1,3,1,1],
      [1,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,0,0,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
  ];
  this.setLevel(level);

  this.types = {
    0: 'Empty',
    1: 'Wall',
    2: 'Player',
    3: 'Baddie',
    4: 'Food',
    5: 'Exit',
    6: 'Gold',
  };
  this.icons = {
    0: '⬜️',
    1: '🌳',
    2: '🐕',
    3: '🐑',
    4: '🍖',
    5: '⛩',
    6: '💰',
  };
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
}
WorldMap.prototype.setLevel = function (level) {
  this.field = this.fields[level-1];
  this.width = this.field[0].length;
  this.height = this.field.length;
}


//
// World
//
var World = function (rootEl) {
  // element
  this.el = div(rootEl, 'World');

  // stats
  this.tickCount = 0;
  this.fps = 0;
  this.fpsLast = 0;
  this.fpsHistory = [];
  this.running = true;

  // map
  this.level = 1;
  this.map = new WorldMap(this, this.level);
  this.chunkSize = 35;
  this.size = [this.map.width * this.chunkSize, this.map.height * this.chunkSize];
  style(this.map.el, {
    width: this.size[0] + 1,
    height: this.size[1] + 5,
  })

  // entities
  this.placeAll();
  this.player = this.entities.find(e => e.type === 'Player');
  this.ui = new UI(this);

  // handlers
  this.second.bind(this)();
  window.stop = this.stop.bind(this);
  window.start = this.start.bind(this);

  // debugging
  console.log(this);
  // console.table(this.map.iconsMap);
}
World.prototype.getEntitiesByType = function (type) {
  return this.entities.filter(e => e.type === type);
}
World.prototype.getEntityByPos = function (pos) {
  return this.entities
    .filter(e => e.type !== 'Player' && e.type !== 'Empty')
    .find(e => e.pos[0] === pos[0] && e.pos[1] === pos[1]);
}
World.prototype.second = function () {
  if (!this.running) {
    return;
  }
  this.fps = this.tickCount - this.fpsLast;
  this.fpsHistory.push(this.fps);
  if (this.fpsHistory.length > 100) {
    this.fpsHistory = this.fpsHistory.slice(-100);
  }
  this.fpsLast = this.tickCount;
  setTimeout(this.second.bind(this), 1000);
}
World.prototype.tick = function () {
  if (!this.running) {
    return;
  }
  this.tickCount = this.tickCount + 1;
  this.player.act();
  this.player.move();
  this.ui.update();
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
World.prototype.placeAll = function (search, entity) {
  this.entities = [];
  return this.map.field.map((row, r) => {
    // console.log(r, row)
    return row.map((col, c) => {
      // console.log(c, col)
      let type = this.map.types[col];
      // console.log(type, 'FOUND', r, c);
      let entity = new Game[type](
          this,
          [c, r],
          [type, c, r].join(':'),
          this.map.icons[col]
        );
      this.entities.push(entity);
      return entity;
    });
  });
}
World.prototype.removeEntity = function (name) {
  for (let e in this.entities) {
    if (this.entities[e].name === name) {
      this.entities.splice(e, 1);
      return;
    }
  }
}
World.prototype.clearMap = function () {
  this.map.el.innerHTML = '';
  this.size = [this.map.width * this.chunkSize, this.map.height * this.chunkSize];
  style(this.map.el, {
    width: this.size[0],
    height: this.size[1],
  })
}
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
  return this.getEntityByPos(newPos);
}
World.prototype.engage = function () {
}
World.prototype.exit = function () {
  this.level++;
  this.map.setLevel(this.level);
  this.clearMap();
  this.entities = [];
  this.placeAll();
}

module.exports = World;
