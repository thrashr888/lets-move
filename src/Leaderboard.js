
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

module.exports = Leaderboard;
