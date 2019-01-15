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
  constructor(position, size, speed) {
    // если позиция передана она должна быть типом Vector
    if (position != undefined && !(position instanceof Vector)) {
      throw Error("Position is not a Vector");
    }

    // если позиция не передана, задаем дефолт
    if (position != undefined) {
      this.pos = position;
    } else {
      this.pos = new Vector();
    }

    // Если размер if size is given it must be a Vector
    if (size != undefined && !(size instanceof Vector)) {
      throw Error("Size is not a Vector");
    }

    // if size is undefined, set it Vector(1,1 )
    if (size != undefined) {
      this.size = size;
    } else {
      this.size = new Vector(1, 1);
    }

    // if size is given it must be a Vector
    if (speed != undefined && !(speed instanceof Vector)) {
      throw Error("Size is not a Vector");
    }

    // if size is undefined, set it Vector(1,1 )
    if (speed != undefined) {
      this.speed = speed;
    } else {
      this.speed = new Vector(0, 0);
    }

    // тут не понятно т.к. что потом наследуется от этого класса не может переписать свойство
    Object.defineProperty(this, "type", {
      value: "actor",
      writable: false,
      configurable: true
    });
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

    if (JSON.stringify(this) == JSON.stringify(actor)) return false;

    return !(
      this.left >= actor.right ||
      this.right <= actor.left ||
      this.top >= actor.bottom ||
      this.bottom <= actor.top
    );
  }
}

class Level {
  constructor(grid, actors) {
    if (grid != undefined) {
      this.height = grid.length;
    } else {
      this.height = 0;
    }

    if (grid != undefined) {
      let max = 0;

      grid.forEach(item => {
        if (item.length > max) max = item.length;
      });

      this.width = max;
    } else {
      this.width = 0;
    }

    if (arguments.length == 0) {
      this.grid = null;
    } else {
      this.grid = grid;
    }

    this.status = null;
    this.finishDelay = 1;

    if (actors != undefined) {
      this.actors = actors;

      actors.forEach(actor => {
        if (actor.title == "Игрок") {
          this.player = actor;
        }
      });
    }
  }

  isFinished() {
    if (this.status != null && this.finishDelay < 0) {
      return true;
    } else {
      return false;
    }
  }

  actorAt(actor) {
    if (!(actor instanceof Actor)) throw Error("Not an actor");
    if (this.grid === null) return undefined;
    if (this.actors.length == 1) return undefined;

    if (this.actors != undefined) {
      let found = undefined;
      this.actors.forEach(act => {
        if (act.isIntersect(actor)) {
          found = act;
        }
      });
      return found;
    }
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
    this.actors.forEach((act, index) => {
      if (act === actor) {
        this.actors.splice(index, 1);
      }
    });
  }

  noMoreActors(actor) {
    let actorLeft = true;

    if (this.actors != undefined) {
      this.actors.forEach(act => {
        if (act.title === actorTypeToTitle[actor]) {
          actorLeft = false;
        }
      });
    }

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
        if (item.title.includes("монета")) {
          noMoreCoins = false;
        }
      });

      if (noMoreCoins) {
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
}
