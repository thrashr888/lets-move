
import { style, div, span, getPosDistance, pickRandomMove, getRandomInt, lnRandomScaled } from './helpers';

var Game = {};
var stdDev = 3;

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
    // size: [this.world.chunkSize, this.world.chunkSize],
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
    fontSize: this.world.chunkSize,
    width: this.world.chunkSize,
    height: this.world.chunkSize,
    left: left,
    top: top,
    animationDelay: Math.floor(left + 1 * top + 1 * 1000 * Math.random()) + 'ms',
  });
  this.savePos();
  this.applyStats();
};

Game.Entity.prototype.create = function () {
  this.statsEl = [];
  this.el = div(this.world.map.el, 'Entity ' + this.type, this.icon, {
    fontSize: this.world.chunkSize,
    width: this.world.chunkSize,
    height: this.world.chunkSize,
  });
  this.applyStats();
};

Game.Entity.prototype.applyStats = function () {
  if (this.type === 'Empty' || this.type === 'Wall') return;
  this.statsEl.forEach(e => this.el.removeChild(e));
  this.statsEl = [
    span(this.el, 'Stat HP', this.hp, {
      fontSize: Math.floor(this.world.chunkSize / 2.5),
    }),
    span(this.el, 'Stat Gold', this.gold, {
      fontSize: Math.floor(this.world.chunkSize / 2.5),
    }),

    // span(this.el, 'Stat Pos', this.pos, {
    //   fontSize: Math.floor(this.world.chunkSize / 2.5),
    // }),
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
  this.savePos();
  this.applyStats();
};

Game.Entity.prototype.resetPos = function () {
  this.pos[0] = this.oldPos[0];
  this.pos[1] = this.oldPos[1];
};

Game.Entity.prototype.savePos = function () {
  this.oldPos[0] = this.pos[0];
  this.oldPos[1] = this.pos[1];
};

Game.Entity.prototype.isInsideMap = function () {
  return (
    this.pos[0] >= 0 && this.pos[1] >= 0 &&
    this.pos[0] < this.world.map.width && this.pos[1] < this.world.map.height
  );
};

Game.Entity.prototype.hasMoved = function () {
  return (this.pos[0] !== this.oldPos[0] || this.pos[1] !== this.oldPos[1]);
};

Game.Entity.prototype.getOtherEntitiesByPos = function (pos) {
  return this.world.getEntitiesByPos(this.pos)
        .filter(e => e.type !== 'Empty' && e.name !== this.name);
};

Game.Entity.prototype.getEmptyByPos = function (pos) {
  return this.world.getEntitiesByPos(this.pos).find(e => e.type === 'Empty');
};

Game.Entity.prototype.getNearEmptiesByPos = function (pos) {
  // up, down, left, right
  return this.world.entities
    .filter(e => e.type === 'Empty')
    .filter((e) => (e.pos[0] === pos[0] - 1 && e.pos[1] === pos[1]) ||
        (e.pos[0] === pos[0] + 1 && e.pos[1] === pos[1]) ||
        (e.pos[1] === pos[1] - 1 && e.pos[0] === pos[0]) ||
        (e.pos[1] === pos[1] + 1 && e.pos[0] === pos[0])
    );
};

// return the closest empty space to the dest
// 012345
// 1..u..
// 2.lSr.
// 3..d..
// 4.....
// 5....D
Game.Entity.prototype.getEmptyNearDestByPos = function (sourcePos, destPos) {
  let empties = this.getNearEmptiesByPos(sourcePos);
  if (empties.length === 0) return null;

  // console.log('empties', sourcePos, empties.map(e => e.pos));
  return empties.sort((a, b) => {
      let aDist = getPosDistance(a.pos, destPos);
      let bDist = getPosDistance(b.pos, destPos);

      // console.log('===>', destPos, a.pos, aDist, b.pos, bDist);
      return aDist > bDist;
    })[0];
};

// return the closest empty space to the dest
// 012345
// 1..u..
// 2.lSr.
// 3..d..
// 4.....
// 5....D
Game.Entity.prototype.getEmptyFarthestDestByPos = function (sourcePos, destPos) {
  let empties = this.getNearEmptiesByPos(sourcePos);
  if (empties.length === 0) return null;

  // console.log('empties', sourcePos, empties.map(e => e.pos));
  return empties.sort((a, b) => {
      let aDist = getPosDistance(a.pos, destPos);
      let bDist = getPosDistance(b.pos, destPos);

      // console.log('===>', destPos, a.pos, aDist, b.pos, bDist);
      return aDist < bDist;
    })[0];
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
  this.dirCount = 0;
  this.oldDir = null;
  this.moved = false;
  this.action = null;
  this.oldAction = null;
  this.acted = false;

  this.resetStats();
  this.createAndPos();

  document.addEventListener('keydown', this.keyDown.bind(this));

  // console.log(this)
};

Game.Player.prototype = Object.create(Game.Entity.prototype);
Game.Player.prototype.resetStats = function () {
  this.hp = 20;
  this.gold = 0;
};

Game.Player.prototype.keyDown = function (e) {
  switch (e.key) {
    case 'w' || 'ArrowUp':
      this.dir = 'up';
      this.dirCount++;
      break;
    case 'a' || 'ArrowLeft':
      this.dir = 'left';
      this.dirCount++;
      break;
    case 's' || 'ArrowDown':
      this.dir = 'down';
      this.dirCount++;
      break;
    case 'd' || 'ArrowRight':
      this.dir = 'right';
      this.dirCount++;
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

  if (e.metaKey === true && (e.key === 'r' || e.key === 'm' || e.key === 'p')) {
    // refresh page, minimize or print
    // pass
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  // console.log('Player.keyDown', this.dirCount, e.key, e);
};

Game.Player.prototype.handleHit = function (entity) {
  if (entity.type === 'Baddie') {
    // console.log({entity});
    this.hit(entity);
    this.win(entity);
    entity.destroy();
    this.resetPos();
  } else if (entity.type === 'Friendly') {
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

  // this.applyStats();
};

Game.Player.prototype.eat = function (entity) {
  this.hp = this.hp + entity.hp;
};

Game.Player.prototype.hit = function (entity) {
  this.hp = this.hp + entity.hp;
  if (this.hp <= 0) {
    this.die(entity);
  };
};

Game.Player.prototype.win = function (entity) {
  // TODO replace baddie with gold
  this.gold += entity.gold;
};

Game.Player.prototype.die = function (entity) {
  this.resetStats();
  this.world.lose(entity);
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

  this.moved = this.hasMoved();
  if (this.moved && this.oldPos[0] !== -1 && this.oldPos[1] !== -1) {
    this.dirCount = 0;

    // Stay in the world
    if (!this.isInsideMap()) {
      this.resetPos();
      return;
    }

    console.log(this.name, 'Move.Pass', this.oldPos, this.pos);

    // Check if we hit any other entities
    let entities = this.getOtherEntitiesByPos(this.pos);
    if (entities.length > 0) {
      console.log('Hit', entities);
      this.handleHit(entities[0]);
    };

    // console.log(this.type + '.move', this.dir, this.oldPos, this.pos);
    this.goToPos();
    if (this.oldPos[0] !== -1) {
      this.world.moved();
    }
  };

  // this.savePos();
  this.oldDir = this.dir;
  this.dir = null;
};

//
// NPC
//
Game.NPC = function () {
  Game.Entity.apply(this, arguments);
};

Game.NPC.prototype = Object.create(Game.Entity.prototype);

//
// Friendly
//
Game.Friendly = function () {
  this.type = 'Friendly';
  Game.NPC.apply(this, arguments);
  this.displayName = 'Sheep';
  this.hp = 0 - lnRandomScaled(1, stdDev);
  this.gold = lnRandomScaled(this.world.level, stdDev);
  this.createAndPos();
};

Game.Friendly.prototype = Object.create(Game.NPC.prototype);
Game.Friendly.prototype.handleHit = function (entity) {
  if (entity.type === this.type && entity.name !== this.name) {
    this.resetPos();
  } else if (entity.type === 'Baddie') {
    this.resetPos();
  } else if (entity.type === 'Friendly') {
    this.resetPos();
  } else if (entity.type === 'Player') {
    this.resetPos();
  } else if (entity.type === 'Food') {
    this.resetPos();
  } else if (entity.type === 'Gold') {
    this.resetPos();
  } else if (entity.type === 'Wall') {
    this.resetPos();
  } else if (entity.type === 'Fire') {
    this.resetPos();
  } else if (entity.type === 'Exit') {
    this.resetPos();
  };
};

Game.Friendly.prototype.move = function (playerPos) {
  // let nearestEmpty = this.getEmptyFarthestDestByPos(this.pos, playerPos);
  // if (nearestEmpty) {
  //   console.log(playerPos, this.pos, nearestEmpty.pos, { nearestEmpty });
  //   this.pos[0] = nearestEmpty.pos[0];
  //   this.pos[1] = nearestEmpty.pos[1];
  // }

  if (getRandomInt(0, 3) === 1) {
    this.pos = pickRandomMove(this.pos);
  };

  console.log(this.name, 'Move.Check', this.pos);

  this.moved = this.hasMoved();
  if (this.moved && this.oldPos[0] !== -1 && this.oldPos[1] !== -1) {
    if (!this.isInsideMap()) {
      this.resetPos();
      return;
    }

    console.log(this.name, 'Move.Pass', this.oldPos, this.pos);

    let entities = this.getOtherEntitiesByPos(this.pos);
    if (entities.length > 0) {
      console.log(this.name, 'Hit', entities);
      this.handleHit(entities[0]);
    };

    this.goToPos();
  };
};

//
// Baddie
//
Game.Baddie = function () {
  this.type = 'Baddie';
  Game.NPC.apply(this, arguments);
  this.displayName = 'Snake';

  // this.hp = 0 - getRandomInt(this.world.level / 2, this.world.level);
  // this.gold = getRandomInt(0, this.world.level);
  this.hp = 0 - lnRandomScaled(this.world.level, stdDev);
  this.gold = lnRandomScaled(this.world.level, stdDev);
  this.createAndPos();
};

Game.Baddie.prototype = Object.create(Game.NPC.prototype);
Game.Baddie.prototype.handleHit = function (entity) {
  if (entity.type === this.type && entity.name !== this.name) {
    this.resetPos();
  } else if (entity.type === 'Baddie') {
    this.resetPos();
  } else if (entity.type === 'Friendly') {
    this.resetPos();
  } else if (entity.type === 'Player') {
    this.resetPos();
  } else if (entity.type === 'Food') {
    this.resetPos();
  } else if (entity.type === 'Gold') {
    this.resetPos();
  } else if (entity.type === 'Wall') {
    this.resetPos();
  } else if (entity.type === 'Fire') {
    this.resetPos();
  } else if (entity.type === 'Exit') {
    this.resetPos();
  };
};

Game.Baddie.prototype.move = function (playerPos) {
  let nearestEmpty = this.getEmptyNearDestByPos(this.pos, playerPos);
  if (nearestEmpty) {
    console.log(this.name, 'Move.nearestEmpty',
      playerPos, this.pos, nearestEmpty.pos, { nearestEmpty },
      );
    this.pos[0] = nearestEmpty.pos[0];
    this.pos[1] = nearestEmpty.pos[1];
  }

  console.log(this.name, 'Move.Check', this.pos);

  this.moved = this.hasMoved();
  if (this.moved && this.oldPos[0] !== -1 && this.oldPos[1] !== -1) {
    if (!this.isInsideMap()) {
      this.resetPos();
      return;
    }

    console.log(this.name, 'Move.Pass', this.oldPos, this.pos);

    let entities = this.getOtherEntitiesByPos(this.pos);
    if (entities.length > 0) {
      console.log(this.name, 'Hit', entities);
      this.handleHit(entities[0]);
    };

    this.goToPos();
  };
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

  // this.hp = getRandomInt(1 + this.world.level / 2, this.world.level);
  this.hp = lnRandomScaled(this.world.level, stdDev);
  this.createAndPos();
};

Game.Food.prototype = Object.create(Game.Entity.prototype);

//
// Gold
//
Game.Gold = function () {
  this.type = 'Gold';
  Game.Entity.apply(this, arguments);

  // this.gold = getRandomInt(1, this.world.level);
  this.gold = lnRandomScaled(this.world.level, stdDev);
  this.createAndPos();
};

Game.Gold.prototype = Object.create(Game.Entity.prototype);

//
// Fire
//
Game.Fire = function () {
  this.type = 'Fire';
  Game.Entity.apply(this, arguments);

  // this.hp = 0 - getRandomInt(1, this.world.level);
  this.hp = 0 - lnRandomScaled(this.world.level, stdDev);
  this.createAndPos();
};

Game.Fire.prototype = Object.create(Game.Entity.prototype);

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
// Empty
//
Game.Empty = function () {
  this.type = 'Empty';
  Game.Entity.apply(this, arguments);
};

Game.Empty.prototype = Object.create(Game.Entity.prototype);

module.exports = Game;
