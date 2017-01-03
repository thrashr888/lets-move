
import {style, div} from './helpers';


var Game = {};


//
// Entity
//
Game.Entity = function (world, pos, name, icon) {
  this.world = world;
  this.name = name;
  this.icon = icon;
  this.pos = pos ? pos : [0, 0];
  this.oldPos = [-1, -1];
  this.size = [this.world.chunkSize, this.world.chunkSize];
  this.hp = 0;
  this.gold = 0;
}
Game.Entity.prototype.serialize = function () {
  return {
    type: this.type,
    name: this.name,
    pos: this.pos,
    hp: this.hp,
    gold: this.gold,
  }
}
Game.Entity.prototype.deserialize = function (world, data) {
  let entity = new Game[data.type](
      world,
      data.pos,
      data.name,
      world.map.iconsByType[data.type]
    );
  entity.hp = data.hp;
  entity.gold = data.gold;
  return entity;
}
Game.Entity.prototype.createAndPos = function () {
  let left = (this.pos[0] * this.world.chunkSize);
  let top = (this.pos[1] * this.world.chunkSize);
  this.el = div(this.world.map.el, 'Entity ' + this.type, this.icon, {
    fontSize: this.size[0],
    width: this.size[0],
    height: this.size[0],
    left: left,
    top: top,
  });
}
Game.Entity.prototype.create = function () {
  this.el = div(this.world.map.el, 'Entity ' + this.type, this.icon, {
    fontSize: this.size[0],
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
Game.Entity.prototype.resetPos = function () {
  this.pos[0] = this.oldPos[0];
  this.pos[1] = this.oldPos[1];
}
Game.Entity.prototype.savePos = function () {
  this.oldPos[0] = this.pos[0];
  this.oldPos[1] = this.pos[1];
}
Game.Entity.prototype.destroy = function () {
  console.log('DESTROY', this)
  this.el.parentElement.removeChild(this.el);
  this.world.removeEntity(this.name);
}


//
// Player
//
Game.Player = function (world, pos, name, icon) {
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
}
Game.Player.prototype = Object.create(Game.Entity.prototype);
Game.Player.prototype.createStats = function (e) {
  this.hp = 50;
  this.score = 0;
  this.stats = {};
  this.stats.strength = 10;
  this.stats.intelligence = 10;
  this.stats.wisdom = 10;
  this.stats.dexterity = 10;
  this.stats.constitution = 10;
  this.stats.charisma = 10;
}
Game.Player.prototype.keyUp = function (e) {
  e.preventDefault();
  e.stopPropagation();
  switch(e.key) {
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
    default:
      break;
  }
  // console.log('Player.keyUp', this.dir, e.key)
}
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
  } else if (entity.type === 'Exit') {
    this.world.exit();
  }
}
Game.Player.prototype.eat = function (entity) {
  this.hp = this.hp + entity.hp;
  // console.log(entity.hp);
}
Game.Player.prototype.hit = function (entity) {
  this.hp = this.hp - entity.hp;
  // console.log(entity.hp);
}
Game.Player.prototype.win = function (entity) {
  // TODO replace baddie with gold
  this.score += entity.gold;
  // console.log(entity.hp);
}
Game.Player.prototype.act = function () {
  this.acted = false;
  if (this.action === 'inventory') {
    this.world.ui.inventory.toggle();
    this.acted = true;
  } else if (this.action === 'engage') {
    let entity = this.world.findByDir(this.pos, this.oldDir);
    this.world.engage(entity);
    this.acted = true;
  }
  this.oldAction = this.action;
  this.action = null;
}
Game.Player.prototype.move = function () {
  if (this.dir === 'up') {
    this.pos[1] = this.pos[1] - 1;
  } else if (this.dir === 'left') {
    this.pos[0] = this.pos[0] - 1;
  } else if (this.dir === 'down') {
    this.pos[1] = this.pos[1] + 1;
  } else if (this.dir === 'right') {
    this.pos[0] = this.pos[0] + 1;
  }
  this.moved = this.pos[0] !== this.oldPos[0] || this.pos[1] !== this.oldPos[1];
  if (this.moved) {
    let entity = this.world.getEntityByPos(this.pos);
    if (entity) {
      console.log('Hit', entity.type, entity.hp, this.world.entities.length)
      this.handleHit(entity);
    }
    // console.log(this.type + '.move', this.dir, this.oldPos, this.pos);
    this.goToPos();
  }
  this.savePos();
  this.oldDir = this.dir;
  this.dir = null;
};


//
// Baddie
//
Game.Baddie = function (world, pos, name, icon) {
  this.type = 'Baddie';
  Game.Entity.apply(this, arguments);
  this.hp = Math.random() * 10 * this.world.level;
  this.gold = Math.random() * 10 * this.world.level;
  this.createAndPos();
}
Game.Baddie.prototype = Object.create(Game.Entity.prototype);


//
// Wall
//
Game.Wall = function (world, pos, name, icon) {
  this.type = 'Wall';
  Game.Entity.apply(this, arguments);
  this.createAndPos();
}
Game.Wall.prototype = Object.create(Game.Entity.prototype);


//
// Food
//
Game.Food = function (world, pos, name, icon) {
  this.type = 'Food';
  Game.Entity.apply(this, arguments);
  this.hp = Math.random() * 10 * this.world.level;
  this.createAndPos();
}
Game.Food.prototype = Object.create(Game.Entity.prototype);


//
// Gold
//
Game.Gold = function (world, pos, name, icon) {
  this.type = 'Gold';
  Game.Entity.apply(this, arguments);
  this.gold = Math.random() * 10 * this.world.level;
  this.createAndPos();
}
Game.Gold.prototype = Object.create(Game.Entity.prototype);


//
// Exit
//
Game.Exit = function (world, pos, name, icon) {
  this.type = 'Exit';
  Game.Entity.apply(this, arguments);
  this.createAndPos();
}
Game.Exit.prototype = Object.create(Game.Entity.prototype);


//
// Empty
//
Game.Empty = function (world, pos, name, icon) {
  this.type = 'Empty';
  Game.Entity.apply(this, arguments);
}
Game.Empty.prototype = Object.create(Game.Entity.prototype);


module.exports = Game;
module.exports.test = true;
