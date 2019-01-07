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
