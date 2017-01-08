
import { style, div, span } from './helpers';

var Game = {};

//
// Entity
//
Game.Entity = function (world, config) {
  this.world = world;
  config = Object.assign({}, {
    name: this.type || null,
    displayName: this.type || null,
    icon: null,
    pos: [0, 0],
    oldPos: [-1, -1],
    moved: false,
    size: [this.world.chunkSize, this.world.chunkSize],
    hp: 0,
    gold: 0,
  }, config);

  // apply settings to object
  for (let c in config) {
    if (Object.prototype.hasOwnProperty.call(config, c)) {
      this[c] = config[c];
    }
  };

  this.statsEl = [];
};

Game.Entity.prototype.serialize = function () {
  return {
    type: this.type,
    name: this.name,
    pos: this.pos,
    hp: this.hp,
    gold: this.gold,
  };
};

Game.Entity.prototype.deserialize = function (world, data) {
  let entity = new Game[data.type](world, {
    pos: data.pos,
    name: data.name,
    icon: world.map.iconsByType[data.type],
  });
  entity.hp = data.hp;
  entity.gold = data.gold;
  return entity;
};

Game.Entity.prototype.createAndPos = function (pos) {
  this.statsEl = [];
  this.pos = pos ? pos : this.pos;
  let left = (this.pos[0] * this.world.chunkSize);
  let top = (this.pos[1] * this.world.chunkSize);
  this.el = div(this.world.map.el, 'Entity ' + this.type, this.icon, {
    fontSize: this.size[0],
    width: this.size[0],
    height: this.size[0],
    left: left,
    top: top,
    animationDelay: Math.floor(left + 1 * top + 1 * 1000 * Math.random()) + 'ms',
  });
  this.applyStats();
};

Game.Entity.prototype.create = function () {
  this.statsEl = [];
  this.el = div(this.world.map.el, 'Entity ' + this.type, this.icon, {
    fontSize: this.size[0],
    width: this.size[0],
    height: this.size[0],
  });
  this.applyStats();
};

Game.Entity.prototype.applyStats = function () {
  this.statsEl.forEach(e => this.el.removeChild(e));
  this.statsEl = [
    span(this.el, 'Stat HP', this.hp, {
      fontSize: Math.floor(this.world.chunkSize / 2.5),
    }),
    span(this.el, 'Stat Gold', this.gold, {
      fontSize: Math.floor(this.world.chunkSize / 2.5),
    }),
  ];
};

Game.Entity.prototype.goToPos = function (pos) {
  this.pos = pos ? pos : this.pos;
  let left = (this.pos[0] * this.world.chunkSize);
  let top = (this.pos[1] * this.world.chunkSize);
  style(this.el, {
    left: left,
    top: top,
    animationDelay: Math.floor(left + 1 * top + 1 * 1000 * Math.random()) + 'ms',
  });
};

Game.Entity.prototype.resetPos = function () {
  this.pos[0] = this.oldPos[0];
  this.pos[1] = this.oldPos[1];
};

Game.Entity.prototype.savePos = function () {
  this.oldPos[0] = this.pos[0];
  this.oldPos[1] = this.pos[1];
};

Game.Entity.prototype.destroy = function () {
  console.log('DESTROY', this);
  this.el.parentElement.removeChild(this.el);
  this.world.removeEntity(this.name);
};

//
// Player
//
Game.Player = function () {
  this.type = 'Player';
  Game.Entity.apply(this, arguments);

  this.dir = null;
  this.oldDir = null;
  this.moved = false;
  this.action = null;
  this.oldAction = null;
  this.acted = false;

  this.createStats();

  this.createAndPos();
  document.addEventListener('keyup', this.keyUp.bind(this));

  // console.log(this)
};

Game.Player.prototype = Object.create(Game.Entity.prototype);
Game.Player.prototype.createStats = function () {
  this.hp = 50;
  this.gold = 0;
  this.stats = {};
  this.stats.strength = 10;
  this.stats.intelligence = 10;
  this.stats.wisdom = 10;
  this.stats.dexterity = 10;
  this.stats.constitution = 10;
  this.stats.charisma = 10;
};

Game.Player.prototype.keyUp = function (e) {
  e.preventDefault();
  e.stopPropagation();
  switch (e.key) {
    case 'w' || 'ArrowUp':
      this.dir = 'up';
      break;
    case 'a' || 'ArrowLeft':
      this.dir = 'left';
      break;
    case 's' || 'ArrowDown':
      this.dir = 'down';
      break;
    case 'd' || 'ArrowRight':
      this.dir = 'right';
      break;
    case 'e':
      this.action = 'engage';
      break;
    case 'i':
      this.action = 'inventory';
      break;
    case 'c':
      this.action = 'control';
      break;
    default:
      break;
  };

  // console.log('Player.keyUp', this.dir, e.key)
};

Game.Player.prototype.handleHit = function (entity) {
  if (entity.type === 'Baddie') {
    // console.log({entity});
    this.hit(entity);
    this.win(entity);
    entity.destroy();
    this.resetPos();
  } else if (entity.type === 'Food') {
    // console.log({entity});
    this.eat(entity);
    entity.destroy();
  } else if (entity.type === 'Gold') {
    this.win(entity);
    entity.destroy();
  } else if (entity.type === 'Wall') {
    this.resetPos();
  } else if (entity.type === 'Fire') {
    this.hit(entity);
    this.resetPos();
  } else if (entity.type === 'Exit') {
    this.world.exit();
  };

  this.world.player.applyStats();
};

Game.Player.prototype.eat = function (entity) {
  this.hp = this.hp + entity.hp;

  // console.log(entity.hp);
};

Game.Player.prototype.hit = function (entity) {
  this.hp = this.hp + entity.hp;
  if (this.hp <= 0) {
    this.die(entity);
  };

  // console.log(entity.hp);
};

Game.Player.prototype.win = function (entity) {
  // TODO replace baddie with gold
  this.gold += entity.gold;

  // console.log(entity.hp);
};

Game.Player.prototype.die = function (entity) {
  // this.world.level = 1;
  this.world.message('You were stopped by a ' + entity.type);
};

Game.Player.prototype.act = function () {
  this.acted = false;
  if (this.action === 'inventory') {
    this.world.ui.inventory.toggle();
    this.acted = true;
  } else if (this.action === 'control') {
    this.world.ui.control.toggle();
    this.acted = true;
  } else if (this.action === 'engage') {
    let entity = this.world.findByDir(this.pos, this.oldDir);
    this.world.engage(entity);
    this.acted = true;
  };

  this.oldAction = this.action;
  this.action = null;
};

Game.Player.prototype.move = function () {
  if (this.dir === 'up') {
    this.pos[1] = this.pos[1] - 1;
  } else if (this.dir === 'left') {
    this.pos[0] = this.pos[0] - 1;
  } else if (this.dir === 'down') {
    this.pos[1] = this.pos[1] + 1;
  } else if (this.dir === 'right') {
    this.pos[0] = this.pos[0] + 1;
  };

  this.moved = this.pos[0] !== this.oldPos[0] || this.pos[1] !== this.oldPos[1];
  if (this.moved && this.oldPos !== -1) {
    let entity = this.world.getEntityByPos(this.pos);
    if (entity) {
      console.log('Hit', entity.type, entity.hp, this.world.entities.length);
      this.handleHit(entity);
    };

    // console.log(this.type + '.move', this.dir, this.oldPos, this.pos);
    this.goToPos();
    if (this.oldPos[0] !== -1) {
      this.world.moved();
    }
  };

  this.savePos();
  this.oldDir = this.dir;
  this.dir = null;
};

//
// Baddie
//
Game.Baddie = function () {
  this.type = 'Baddie';
  Game.Entity.apply(this, arguments);
  this.displayName = 'Sheep';
  this.hp = 0 - Math.floor(Math.random() * 5 * this.world.level) + 1;
  this.gold = Math.floor(Math.random() * 5 * this.world.level) + 1;
  this.createAndPos();
};

Game.Baddie.prototype = Object.create(Game.Entity.prototype);
Game.Baddie.prototype.handleHit = function (entity) {
  // this.resetPos();
  // if (entity.type === 'Baddie') {
  //   this.resetPos();
  // } else if (entity.type === 'Player') {
  //   this.resetPos();
  // } else if (entity.type === 'Food') {
  //   this.resetPos();
  // } else if (entity.type === 'Gold') {
  //   this.resetPos();
  // } else if (entity.type === 'Wall') {
  //   this.resetPos();
  // } else if (entity.type === 'Fire') {
  //   this.resetPos();
  // } else if (entity.type === 'Exit') {
  //   this.resetPos();
  // };

  return;
};

Game.Baddie.prototype.move = function (playerPos) {
  return;

  // if (playerPos[0] > this.pos[0]) {
  //   this.pos[0]++;
  // } else if (playerPos[0] < this.pos[0]) {
  //   this.pos[0]--;
  // } else if (playerPos[1] > this.pos[1]) {
  //   this.pos[1]++;
  // } else if (playerPos[1] < this.pos[1]) {
  //   this.pos[1]--;
  // }
  // this.moved = this.pos[0] !== this.oldPos[0] || this.pos[1] !== this.oldPos[1];
  // if (this.moved && this.oldPos[0] !== -1) {
  //   let entity = this.world.getEntityByPos(this.pos);
  //   if (entity) {
  //     console.log('Baddie Hit', entity.type, entity.hp, this.world.entities.length)
  //     this.handleHit(entity);
  //   }
  //   this.goToPos();
  // }
  // this.savePos();
};

//
// Wall
//
Game.Wall = function () {
  this.type = 'Wall';
  Game.Entity.apply(this, arguments);
  this.createAndPos();
};

Game.Wall.prototype = Object.create(Game.Entity.prototype);

//
// Food
//
Game.Food = function () {
  this.type = 'Food';
  Game.Entity.apply(this, arguments);
  this.hp = Math.floor(Math.random() * 5 * this.world.level) + 1;
  this.createAndPos();
};

Game.Food.prototype = Object.create(Game.Entity.prototype);

//
// Gold
//
Game.Gold = function () {
  this.type = 'Gold';
  Game.Entity.apply(this, arguments);
  this.gold = Math.floor(Math.random() * 5 * this.world.level) + 1;
  this.createAndPos();
};

Game.Gold.prototype = Object.create(Game.Entity.prototype);

//
// Exit
//
Game.Exit = function () {
  this.type = 'Exit';
  Game.Entity.apply(this, arguments);
  this.createAndPos();
};

Game.Exit.prototype = Object.create(Game.Entity.prototype);

//
// Fire
//
Game.Fire = function () {
  this.type = 'Fire';
  Game.Entity.apply(this, arguments);
  this.hp = 0 - Math.floor(Math.random() * 5 * this.world.level) + 1;
  this.createAndPos();
};

Game.Fire.prototype = Object.create(Game.Entity.prototype);

//
// Empty
//
Game.Empty = function () {
  this.type = 'Empty';
  Game.Entity.apply(this, arguments);
};

Game.Empty.prototype = Object.create(Game.Entity.prototype);

module.exports = Game;
