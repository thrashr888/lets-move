function GetRandom(low, high) {
  return ~~(Math.random() * (high - low)) + low;
}

// eslint-disable-next-line
const TYPES = {
  Empty: 0,
  Wall: 1,
  Player: 2,
  Friendly: 3,
  Food: 4,
  Exit: 5,
  Gold: 6,
  Fire: 7,
  Baddie: 8,
};

module.exports = {
  map: null,
  map_size: 64,
  rooms: [],

  Generate: function () {
    this.map = [];
    for (var x = 0; x < this.map_size; x++) {
      this.map[x] = [];
      for (var y = 0; y < this.map_size; y++) {
        this.map[x][y] = 0; // space
      }
    }

    var roomCount = GetRandom(10, 20);
    var minSize = 5;
    var maxSize = 15;

    for (var i = 0; i < roomCount; i++) {
      var room = {};

      room.x = GetRandom(1, this.map_size - maxSize - 1);
      room.y = GetRandom(1, this.map_size - maxSize - 1);
      room.w = GetRandom(minSize, maxSize);
      room.h = GetRandom(minSize, maxSize);

      if (this.DoesCollide(room)) {
        i--;
        continue;
      }

      room.w--;
      room.h--;

      this.rooms.push(room);
    }

    this.SquashRooms();

    for (i = 0; i < roomCount; i++) {
      var roomA = this.rooms[i];
      var roomB = this.FindClosestRoom(roomA);

      let pointA = {
        x: GetRandom(roomA.x, roomA.x + roomA.w),
        y: GetRandom(roomA.y, roomA.y + roomA.h),
      };
      let pointB = {
        x: GetRandom(roomB.x, roomB.x + roomB.w),
        y: GetRandom(roomB.y, roomB.y + roomB.h),
      };

      while (pointB.x !== pointA.x || pointB.y !== pointA.y) {
        if (pointB.x !== pointA.x) {
          if (pointB.x > pointA.x) pointB.x--;
          else pointB.x++;
        } else if (pointB.y !== pointA.y) {
          if (pointB.y > pointA.y) pointB.y--;
          else pointB.y++;
        }

        this.map[pointB.x][pointB.y] = 1; // floor
      }
    }

    for (i = 0; i < roomCount; i++) {
      room = this.rooms[i];
      for (let x = room.x; x < room.x + room.w; x++) {
        for (let y = room.y; y < room.y + room.h; y++) {
          this.map[x][y] = 1; // floor
        }
      }
    }

    for (let x = 0; x < this.map_size; x++) {
      for (let y = 0; y < this.map_size; y++) {
        if (this.map[x][y] === 1) {
          for (let xx = x - 1; xx <= x + 1; xx++) {
            for (let yy = y - 1; yy <= y + 1; yy++) {
              if (this.map[xx][yy] === 0) this.map[xx][yy] = 2; // wall
            }
          }
        }
      }
    }
  },

  FindClosestRoom: function (room) {
    let mid = { x: room.x + room.w / 2, y: room.y + room.h / 2 };
    var closest = null;
    var closestDistance = 1000;
    for (var i = 0; i < this.rooms.length; i++) {
      let check = this.rooms[i];
      if (check === room) continue;
      var checkMid = { x: check.x + check.w / 2, y: check.y + check.h / 2 };
      var distance = Math.min(
        Math.abs(mid.x - checkMid.x) - room.w / 2 - check.w / 2,
        Math.abs(mid.y - checkMid.y) - room.h / 2 - check.h / 2,
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = check;
      }
    }

    return closest;
  },

  SquashRooms: function () {
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < this.rooms.length; j++) {
        var room = this.rooms[j];
        while (true) {
          let oldPosition = { x: room.x, y: room.y };
          if (room.x > 1) room.x--;
          if (room.y > 1) room.y--;
          if (room.x === 1 && room.y === 1) break;
          if (this.DoesCollide(room, j)) {
            room.x = oldPosition.x;
            room.y = oldPosition.y;
            break;
          }
        }
      }
    }
  },

  DoesCollide: function (room, ignore) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (i === ignore) continue;
      var check = this.rooms[i];
      if (
        !(room.x + room.w < check.x ||
          room.x > check.x + check.w ||
          room.y + room.h < check.y ||
          room.y > check.y + check.h)
      )
        return true;
    }

    return false;
  },

  PlaceInRoom: function (roomNum, type) {
    let room = this.rooms[roomNum];
    let x = room.x + Math.floor(Math.random() * room.w);
    let y = room.y + Math.floor(Math.random() * room.h);
    this.map[y][x] = type;
  },

  LastRoom: function () {
    return this.rooms.length - 1;
  },
};
