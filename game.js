"use strict";

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
    // if position is given it must be a Vector
    if (position != undefined && !(position instanceof Vector)) {
      throw Error("Position is not a Vector");
    }

    // if position is undefined, set default Vector
    if (position != undefined) {
      this.pos = position;
    } else {
      this.pos = new Vector();
    }

    // if size is given it must be a Vector
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

    Object.defineProperty(this, "type", {
      value: "actor",
      writable: false
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

    if (grid != undefined) {
      this.grid = grid;
    } else {
      this.grid = null;
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
}
