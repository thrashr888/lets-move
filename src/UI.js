
import { setSplashBg, setMapBg, style, event, div, span, br, h1, h3, ul, input } from './helpers';
import './UI.css';

//
// Stats
//
function Stats(ui) {
  this.world = ui.world;
  this.el = div(ui.el, 'StatsUI', '<b>loading...</b>');
};

Stats.prototype.update = function () {
  // console.log(this.world.player)

  this.el.innerHTML = `
    ${this.world.player.displayName}
    is on level
    ${this.world.level} of ${this.world.map.fields.length}
    called
    "${this.world.map.name}"
    <br/>
    <span class="HPStat">${Math.floor(this.world.player.hp)}</span> Hearts and
    <span class="GoldStat">${Math.floor(this.world.player.gold)}</span> Gold
  `;

  // <br/>
  // Tick: ${this.world.tickCount},
  // Pos: "${this.world.player.oldPos}",
  // FPS: ${this.world.fps}
  // <br/>
  // <span class="History">${this.world.fpsHistory.map(
  //   v => `<span style="height:${(v / 2.5)}px">&nbsp;</span>`
  //   ).join('')}</span>
  // ${this.world.message ? `<div class="Message">${this.world.message}</div>` : ''}
};

Stats.prototype.renderHistory = function () {
  let out = [];
  for (let v of this.world.fpsHistory) {
    out.push(`<span style="height: ${(v / 2.5)}px">&nbsp;</span>`);
  };

  return out.join('');
};

//
// Control
//
function Control(ui) {
  this.world = ui.world;
  this.el = div(ui.el, 'ControlUI');
  this.buttons = [
    event(span(this.el, 'Button Up', '⬆️'), 'click', this.clickDir.bind(this)('up')),
    br(this.el),
    event(span(this.el, 'Button Left', '⬅️'), 'click', this.clickDir.bind(this)('left')),
    span(this.el, 'UISpace', '&nbsp;'),
    event(span(this.el, 'Button Right', '➡️'), 'click', this.clickDir.bind(this)('right')),
    br(this.el),
    event(span(this.el, 'Button Down', '⬇️'), 'click', this.clickDir.bind(this)('down')),
    br(this.el),
    event(span(this.el, 'Button Mute', '🔈'), 'click', this.onClickMute.bind(this)),

    // br(this.el),
    // event(span(this.el, 'Button Pause', '⏯'), 'click', () => {
    //   if (this.world.running) {
    //     this.world.stop();
    //   } else {
    //     this.world.start();
    //   }
    // }),
  ];
};

Control.prototype.onClickMute = function onNameChange(e) {
  e.preventDefault();
  e.stopPropagation();
  this.world.sounds.toggleMute();
  this.buttons[8].innerHTML = this.world.sounds.isMuted() ? '🔇' : '🔈';
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
// UI
//
function UI(world) {
  this.world = world;
  this.el = div(world.el, 'UI');
  this.stats = new Stats(this);
  this.control = new Control(this);
};

UI.prototype.update = function () {
  this.stats.update();
};

//
// Splash Screen
//
function SplashScreen(world, onClose) {
  this.world = world;
  this.onClose = onClose;

  setSplashBg();
  this.el = div(world.rootEl, 'SplashScreenUI');
  this.content = [
    h1(this.el, null, '🐕 Let’s Eat! 🐈'),
    event(input(this.el, {
        type: 'text',
        className: 'Name',
        name: 'Player.displayName',
        autocomplete: 'given-name',
        autofocus: true,
        autocapitalize: 'characters',
        placeholder: 'Name?',
        value: this.world.playerDisplayName,
      }), 'keyup', this.onNameChange.bind(this)),
    br(this.el),
    event(span(this.el, 'Button Mute', '🔈'), 'click', this.onClickMute.bind(this)),
    event(span(this.el, 'Button Play', 'PLAY ▶️'), 'click', this.onClickPlay.bind(this)),
  ];
};

SplashScreen.prototype.onNameChange = function onNameChange(e) {
  this.world.playerDisplayName = e.target.value;
  if (e.code === 'Enter') {
    this.onClickPlay(e);
  };
};

SplashScreen.prototype.onClickMute = function onNameChange(e) {
  e.preventDefault();
  e.stopPropagation();
  this.world.sounds.toggleMute();
  this.content[3].innerHTML = this.world.sounds.isMuted() ? '🔇' : '🔈';
};

SplashScreen.prototype.onClickPlay = function onClickPlay(e) {
  e.preventDefault();
  e.stopPropagation();
  this.close();
};

SplashScreen.prototype.close = function close() {
  this.onClose();
  this.el.parentElement.removeChild(this.el);
  setMapBg(this.world);
};

//
// End Screen
//
var EndScreen = function (world, dieBy, onClose) {
  this.world = world;
  this.onClose = onClose;
  this.dieBy = dieBy;

  let message;
  if (dieBy) {
    message = `😤 You were stopped by a ${dieBy.displayName} ${dieBy.icon}! 😂`;
  } else {
    message = '🎉 You Win!!! 🏆';
  };

  let lb = this.world.leaderboard.get();
  // console.log({ lb });

  setSplashBg();
  this.el = div(world.rootEl, 'EndScreenUI');
  this.content = [
    h1(this.el, null, message),
    h3(this.el, null, 'Top 10 Scores:'),
    ul(this.el, 'Leaderboard', lb.map((player, i) => {
      let me = player.id === this.world.id;
      let icon = player.dieByType ? this.world.map.getIconByType(player.dieByType) : '';
      return `
        <li class="${me ? 'me' : ''}">
          <span class="rank">${i + 1}.</span>
          <span class="name">${player.name}</span>
          <span class="gold">${player.gold}</span>
          <span class="icon">${icon}</span>
        </li>`;
    }).join('')),
    event(span(this.el, 'Button Play', 'PLAY AGAIN ▶️'), 'click', this.onClickPlay.bind(this)),
  ];
};

EndScreen.prototype.onClickPlay = function onClickPlay(e) {
  e.preventDefault();
  e.stopPropagation();
  this.close();
};

EndScreen.prototype.close = function () {
  this.onClose();
  this.el.parentElement.removeChild(this.el);

  setMapBg(this.world);
};

module.exports = { Stats, Control, UI, SplashScreen, EndScreen };
