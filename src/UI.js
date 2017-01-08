
import { style, event, div, span, br, h1, input } from './helpers';

//
// Stats
//
var Stats = function (ui) {
  this.world = ui.world;
  this.el = div(ui.el, 'Stats', '<b>loading...</b>');
};

Stats.prototype.update = function () {
  // console.log(this.world.player)
  this.el.innerHTML = [

    // 'Tick:',
    // this.world.tickCount,
    // ';',
    'Level: ',
    this.world.level,
    ', Baddies: ',
    this.world.getEntitiesByType('Baddie').length,
    ', HP: ',
    Math.floor(this.world.player.hp),
    ', Gold: ',
    Math.floor(this.world.player.gold),

    // '<br/>Pos:',
    // this.world.player.oldPos,
    // 'FPS:',
    // this.world.fps,
    // '<span class="History">',
    // this.renderHistory(),
    // '</span>'
    ].join('');
};

Stats.prototype.renderHistory = function () {
  let out = [];
  for (let v of this.world.fpsHistory) {
    out.push('<span style="height:' + (v / 2.5) + 'px">&nbsp;</span>');
  };

  return out.join('');
};

//
// Control
//
var Control = function (ui) {
  this.world = ui.world;
  this.el = div(ui.el, 'Control');
  this.buttons = [
    event(span(this.el, 'Button Up', '🔼', null), 'click', this.clickDir.bind(this)('up')),
    br(this.el),
    event(span(this.el, 'Button Left', '️◀️️', null), 'click', this.clickDir.bind(this)('left')),
    event(span(this.el, 'Button Down', '🔽', null), 'click', this.clickDir.bind(this)('down')),
    event(span(this.el, 'Button Right', '️▶️', null), 'click', this.clickDir.bind(this)('right')),
    br(this.el),
    event(span(this.el, 'Button Pause', '⏯', null), 'click', () => {
      if (this.world.running) {
        this.world.stop();
      } else {
        this.world.start();
      }
    }),
  ];
};

Control.prototype.clickDir = function (dir) {
  let _this = this;
  return function (e) {
    e.preventDefault();
    e.stopPropagation();
    _this.world.player.dir = dir;
  };
};

Control.prototype.toggle = function () {
  if (this.open === true) {
    style(this.el, {
      display: 'none',
    });
    this.open = false;
  } else {
    style(this.el, {
      display: 'inline-block',
    });
    this.open = true;
  }
};

//
// Inventory
//
var Inventory = function (ui) {
  this.world = ui.world;
  this.el = div(ui.el, 'Inventory', 'Inventory:', {
    display: 'none',
  });
  this.buttons = [

    // span(this.el, 'Button', 'e', null),
  ];
  this.items = [];
  this.open = false;
};

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
};

//
// UI
//
var UI = function (world) {
  this.world = world;
  this.el = div(world.el, 'UI');
  this.control = new Control(this);
  this.stats = new Stats(this);
  this.inventory = new Inventory(this);
};

UI.prototype.update = function () {
  this.stats.update();
};

//
// Title Card
//
var TitleCard = function (world) {
  this.world = world;
  this.el = div(world.rootEl, 'TitleCard');
  this.content = [
    h1(this.el, null, 'Let’s Eat'),
    input(this.el, 'Name', 'WHAT IS YOUR NAME?', this.onNameChange.bind(this)),
  ];
};

TitleCard.prototype.onNameChange = function (e) {
  this.world.player.displayName = e.target.value;
};

module.exports = { UI, Stats, Control, Inventory };
