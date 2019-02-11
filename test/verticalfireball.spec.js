"use strict";

describe("Класс VerticalFireball", () => {
  describe("Конструктор new VerticalFireball", () => {
    it("Создает экземпляр Fireball", () => {
      const ball = new VerticalFireball();

      expect(ball).to.be.an.instanceof(Fireball);
    });

    it("Имеет скорость Vector(0, 0.1)", () => {
      const ball = new VerticalFireball();

      expect(ball.speed).to.eql(new Vector(0, 0.1));
    });

    it("Имеет свойство type, равное fireball", () => {
      const ball = new HorizontalFireball();

      expect(ball.type).to.equal("fireball");
    });
  });
});
