"use strict";

const actorTypeToTitle = {
  player: "Игрок",
  mushroom: "Гриб",
  coinGold: "Золотая монета",
  coinBronze: "Бронзовая монета"
};

class Vector {
  constructor(left = 0, top = 0) {
    this.x = left;
    this.y = top;
  }

  plus(v) {
    if (!(v instanceof Vector)) throw Error("Not a Vector");

    return new Vector(this.x + v.x, this.y + v.y);
  }

  times(multiply) {
    return new Vector(this.x * multiply, this.y * multiply);
  }
}

class Actor {
  constructor(position = new Vector(), size = new Vector(1, 1), speed = new Vector(0, 0), type = "actor") {
    // если позиция передана она должна быть типом Vector
    if (!(position instanceof Vector)) {
      throw Error("Position is not a Vector");
    }

    // Если размер дан то это должен быть Vector
    if (!(size instanceof Vector)) {
      throw Error("Size is not a Vector");
    }

    // если скорость задана это должен быть Vector
    if (!(speed instanceof Vector)) {
      throw Error("Size is not a Vector");
    }

    // задаем позицию
    this.pos = position;
    // задаем размер
    this.size = size;
    // задаем скорость
    this.speed = speed;

    // задаем тип
    this._type = type;
  }

  set type(val) {
    if (this._type != undefined) throw Error("can't change type");
    this._type = val;
  }

  get type() {
    return this._type;
  }

  set pos(val) {
    this._position = val;
    this.left = val.x;
    this.top = val.y;
  }

  get pos() {
    return this._position;
  }

  set size(val) {
    this._size = val;
    this.right = this.left + val.x;
    this.bottom = this.top + val.y;
  }

  get size() {
    return this._size;
  }

  act() {}

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw Error("Not a Actor");
    }

    if (this == actor) return false;

    return (
      actor.pos.x + actor.size.x > this.pos.x &&
      actor.pos.x < this.pos.x + this.size.x &&
      actor.pos.y + actor.size.y > this.pos.y &&
      actor.pos.y < this.pos.y + this.size.y
    );
  }
}

class Level {
  constructor(grid = [], actors = []) {
    // устанавливаем высоту
    this.height = grid.length;

    // устанавливаем ширину
    this.width = grid.reduce((max, current) => {
      return current.length > max ? current.length : max;
    }, 0);

    // устанавливаем грид
    this.grid = grid;

    this.status = null;
    this.finishDelay = 1;

    // устанавливаем акторов
    this.actors = actors;

    // устанавливаем игрока
    actors.find(actor => {
      if (actor.type == "player") this.player = actor;
    });
  }

  isFinished() {
    return this.status != null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor)) throw Error("Not an actor");

    return this.actors.find(act => {
      if (act.isIntersect(actor)) return act;
    });
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw Error("Not an vector");
    }

    const x1 = Math.floor(pos.x);
    const x2 = Math.ceil(pos.x + size.x);
    const y1 = Math.floor(pos.y);
    const y2 = Math.ceil(pos.y + size.y);

    if (x2 > this.width || x1 < 0 || y1 < 0) {
      return "wall";
    }

    if (y2 > this.height) {
      return "lava";
    }

    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const item = this.grid[y][x];

        if (item != undefined) {
          return item;
        }
      }
    }
  }

  removeActor(actor) {
    this.actors.find((act, index) => {
      if (act == actor) {
        this.actors.splice(index, 1);
      }
    });
  }

  noMoreActors(actor) {
    let actorLeft = true;

    this.actors.forEach(act => {
      if (act.title === actorTypeToTitle[actor]) {
        actorLeft = false;
      }
    });

    return actorLeft;
  }

  playerTouched(object, actor) {
    if (object === "lava" || object === "fireball") {
      return (this.status = "lost");
    }

    if (object === "coin" && actor instanceof Actor) {
      this.removeActor(actor);

      let noMoreCoins = true;
      this.actors.forEach(item => {
        if (item.type == "coin") {
          noMoreCoins = false;
        }
      });

      if (noMoreCoins) {
        console.log("Won!");
        return (this.status = "won");
      }
    }
  }
}

class LevelParser {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    return symbol == undefined ? symbol : this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol == undefined) return symbol;
    if (symbol == "x") return "wall";
    if (symbol == "!") return "lava";
  }

  createGrid(sArr) {
    let newArr = [];

    sArr.forEach(arr => {
      newArr.push(
        arr.split("").map(symbol => {
          return this.obstacleFromSymbol(symbol);
        })
      );
    });

    return newArr;
  }

  createActors(sArr) {
    if (sArr.length == 0 || this.dictionary == undefined) return [];

    let newArr = [];

    sArr.forEach((row, indexRow) => {
      let symbols = row.split("");

      symbols.forEach((symbol, indexSymbol) => {
        let actor = this.actorFromSymbol(symbol);

        if (typeof actor == "function") {
          let newActor = new actor();

          if (newActor instanceof Actor) {
            newArr.push(new actor(new Vector(indexSymbol, indexRow)));
          }
        }
      });
    });

    return newArr;
  }

  parse(sArr) {
    if (this.dictionary == undefined) {
      return new Level(this.createGrid(sArr));
    } else {
      return new Level(this.createGrid(sArr), this.createActors(sArr));
    }
  }
}

class Fireball extends Actor {
  constructor(position, speed) {
    super(position, new Vector(1, 1), speed, "fireball");
  }

  getNextPosition(time = 1) {
    let count = time;

    while (count > 0) {
      this.pos = this.pos.plus(this.speed);
      count--;
    }

    return this.pos;
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    let oldPos = this.pos;
    let pos = this.getNextPosition(time);

    if (level.obstacleAt(pos, this.size) == "wall") {
      this.pos = oldPos;
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(position) {
    super(position, new Vector(0.1, 0), new Vector(1, 1), "fireball");
  }
}

class VerticalFireball extends Fireball {
  constructor(position) {
    super(position, new Vector(0, 0.1), new Vector(1, 1), "fireball");
  }
}

class FireRain extends Fireball {
  constructor(position) {
    super(position, new Vector(0, 3), new Vector(1, 1), "fireball");
    this.startPos = position;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(position = new Vector(0, 0)) {
    let pos = position.plus(new Vector(0.2, 0.1));

    super(pos, new Vector(0.6, 0.6), new Vector(1, 1), "coin");

    this.startPos = pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.spring += time * this.springSpeed;

    let newY = this.getSpringVector().y;

    return new Vector(this.startPos.x, this.startPos.y + newY);
  }

  act(time) {
    const nextPos = this.getNextPosition(time);
    this.pos = nextPos;
  }
}

class Player extends Actor {
  constructor(position) {
    let pos = position;

    if (position != undefined) {
      pos = new Vector(position.x, position.y - 0.5);
    }

    super(pos, new Vector(0.8, 1.5), new Vector(0, 0), "player");
  }
}

// Game itself
const schema = [
  "                  v ",
  "                    ",
  "                    ",
  "          o        o",
  "     !xxxxxxxxxxx  x",
  " @                  ",
  "xxx!                ",
  "                 xxx",
  "       o      f     ",
  "      xxx    xxx    "
];
const actorDict = {
  "@": Player,
  o: Coin,
  f: HorizontalFireball,
  v: VerticalFireball
};

const parser = new LevelParser(actorDict);
const level = parser.parse(schema);
runLevel(level, DOMDisplay);
