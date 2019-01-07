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
  constructor() {
    this.pos = new Vector();
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 0);
    this.type = "";
  }

  act() {}
}
