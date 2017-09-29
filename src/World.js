
import { style, div, scrollToPos, setMapBg } from './helpers';
import { UI, SplashScreen, EndScreen } from './UI';
import WorldMap from './WorldMap';
import Game from './Game';
import Leaderboard from './Leaderboard';
import Sounds from './Sounds';

import uuidV4 from 'uuid/v4';

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

  this.sounds = new Sounds(this);
  this.sounds.switchBgMusic(0);

  this.fpsHistory = [];
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

  // map
  this.level = 1;
  this.sounds.switchBgMusic(this.level);
  this.map = new WorldMap(this, this.level);
  this.chunkSize = this.map.chunkSize;
  this.size = [this.map.width * this.chunkSize, this.map.height * this.chunkSize];
  style(this.map.el, {
    width: this.size[0] + 1,
    height: this.size[1] + 5,
  });
  this.ui = new UI(this);

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

  if (this.entities && this.player) {
    this.getEntitiesByType('Friendly').forEach((e) => e.move(this.player.pos));
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
  if (this.player) {
    this.player.move();
  };

  if (this.ui) {
    this.ui.update();
  }

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
  if (this.player) {
    scrollToPos(this.player.pos, this);
  }
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

      if (type !== 'Wall' && type !== 'Floor') {
        let entity = new Game.Floor(this, {
          pos: [c, r],
          name: ['Floor', c, r].join(':'),
          icon: this.map.icons[1],
        });
        this.entities.push(entity);
      };

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
      newPos[0]--;
      break;
    case 'Left':
      newPos[1]--;
      break;
    case 'Right':
      newPos[1]++;
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
  setMapBg(this);
  this.clearMap();
  this.entities = [];
  this.placeAll();
  scrollToPos(this.player.pos, this);
  this.sounds.switchBgMusic(this.level);
};

World.prototype.show = function () {
  style(this.el, {
    display: 'block',
  });
};

World.prototype.hide = function () {
  style(this.el, {
    display: 'none',
  });
};

World.prototype.win = function () {
  this.leaderboard.add(this);
  this.hide();
  this.sounds.switchBgMusic(0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  });
  this.splash = new EndScreen(this, false, _ => {
    this.level = 0;
    this.exit();
    this.show();
    // window.scrollTo(0, 0);
  });
};

World.prototype.lose = function (entity) {
  this.leaderboard.add(this, entity);
  this.hide();
  this.sounds.switchBgMusic(0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  });
  this.splash = new EndScreen(this, entity, _ => {
    this.level = 0;
    this.exit();
    this.show();
    // window.scrollTo(0, 0);
  });
};

module.exports = World;
