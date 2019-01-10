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
  constructor(position) {
    if (position != undefined) {
      this.pos = position;
    } else {
      this.pos = new Vector();
    }

    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 0);
    this.type = "actor";
    console.log(this.pos);
  }

  get type() {
    return this._type;
  }

  set type(val) {
    if (this._type !== undefined) {
      throw Error("You can't set type");
    } else {
      this._type = val;
    }
  }

  act() {}
}
