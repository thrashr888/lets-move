
import {style, event, div, span, br} from './helpers';


//
// Stats
//
var Stats = function (world) {
  this.world = world;
  this.el = div(world.el, 'Stats', '<b>loading...</b>');
}
Stats.prototype.update = function () {
  // console.log(this.world.player)
  this.el.innerHTML = [
    // 'Tick:',
    // this.world.tickCount,
    // ';',
    'Pos:',
    this.world.player.oldPos,
    'Baddies:',
    this.world.getEntitiesByType('Baddie').length,
    '<br/>HP:',
    Math.floor(this.world.player.hp),
    'Score:',
    Math.floor(this.world.player.score),
    '<br/>FPS:',
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


//
// Control
//
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
    self.world.player.dir = dir;
  }
}


//
// Inventory
//
var Inventory = function (world) {
  this.world = world;
  this.el = div(world.el, 'Inventory', 'Inventory:', {
    display: 'none',
  });
  this.buttons = [
    // span(this.el, 'Button', 'e', null),
  ];
  this.items = [];
  this.open = false;
}
Inventory.prototype.toggle = function () {
  if (this.open === true) {
    style(this.el, {
      display: 'none',
    });
    this.open = false;
  } else {
    style(this.el, {
      display: 'block',
    });
    this.open = true;
  }
}

module.exports = {Stats, Control, Inventory};
