
import Howler from 'howler';

function Sounds(world) {
  this.world = world;
  this.master = Howler.Howler;

  this.setMasterVolume(0.7);
  this.masterMute = window.localStorage.getItem('mute') === 'true' || false;
  this.mute(this.masterMute);

  this.sounds = {};
  this.backgrounds = new Map([
    ['lvl0', 'Toys.mp3'],
    ['lvl1', 'Country Jig.mp3'],
    ['lvl2', 'Fun Fair.mp3'],
    ['lvl3', 'Simon Says.mp3'],
    ['lvl4', 'Mr Jelly Rolls.mp3'],
    ['lvl5', 'All Fall Down.mp3'],
    ['lvl6', 'Schooldays.mp3'],

    ['lvl7', 'Country Jig.mp3'],
    ['lvl8', 'Fun Fair.mp3'],
    ['lvl9', 'Simon Says.mp3'],
    ['lvl10', 'Mr Jelly Rolls.mp3'],
    ['lvl11', 'All Fall Down.mp3'],
    ['lvl12', 'Schooldays.mp3'],

    ['lvl13', 'Country Jig.mp3'],
    ['lvl14', 'Fun Fair.mp3'],
    ['lvl15', 'Simon Says.mp3'],
    ['lvl16', 'Mr Jelly Rolls.mp3'],
    ['lvl17', 'All Fall Down.mp3'],
    ['lvl18', 'Schooldays.mp3'],
  ]);
  this.effects = new Map([
    ['move', 'HKAP2 Seq2.13 Whoosh 6.wav.mp3'],
    ['hit', 'Ice,Impact,Throw,Snowball,Step,Snow,Stalactite,Various12.M.wav.mp3'],
    ['wall', 'Impact Body Heavy.wav.mp3'],
    ['gold', 'Coins_Several_11.wav.mp3'],
    ['fire', 'Flash Fire Ignite 01.wav.mp3'],
    ['bite', 'Celery,Bite,Crunch,Slow,Bone,Break,Stick,Creak,Various07.wav.mp3'],
    ['win', 'Ta Da-SoundBible.com-1884170640.wav.mp3'],
  ]);
  this.backgrounds.forEach((v, k) => {
    this.sounds[k] = new Howler.Howl({
      src: ['/sound/' + v],
      autoplay: false,
      loop: true,
      volume: this.masterVolume,
      mute: this.masterMute,
    });
  });
  this.effects.forEach((v, k) => {
    this.sounds[k] = new Howler.Howl({
      src: ['/sound/' + v],
      autoplay: false,
      loop: false,
      volume: this.masterVolume,
      mute: this.masterMute,
    });
  });

  this.playing = [];
}

Sounds.prototype.mute = function (doMute) {
  this.masterMute = doMute;
  this.master.mute(this.masterMute);
  window.localStorage.setItem('mute', this.masterMute);
  console.log('MUTE', this.masterMute);
};

Sounds.prototype.toggleMute = function () {
  this.mute(!this.masterMute);
};

Sounds.prototype.isMuted = function () {
  return this.masterMute;
};

Sounds.prototype.setMasterVolume = function (vol) {
  this.masterVolume = vol;
  this.master.volume(vol);
};

Sounds.prototype.playBgMusic = function (level) {
  this.currentBg.play();
};

Sounds.prototype.stopBgMusic = function (level) {
  this.currentBg.pause();
};

Sounds.prototype.switchBgMusic = function (level) {
  let name = 'lvl' + level;
  this.currentBg && this.currentBg.stop();
  this.currentBg = this.sounds[name];
  this.currentBg.play();
  console.log('PLAY', name);
};

Sounds.prototype.playOnce = function (name) {
  this.sounds[name].play();
};

module.exports = Sounds;
