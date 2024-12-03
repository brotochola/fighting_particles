//taylor swift
class Idol extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 8 });
    this.speed = Math.random() * 0.5 + 0.1;

    this.setRandomTarget();
  }
  setRandomTarget() {
    this.target = {
      pos: new p5.Vector(
        this.particleSystem.worldWidth * Math.random(),
        this.particleSystem.worldHeight * Math.random()
      ),
      body: { velocity: new p5.Vector(0, 0) },
    };
  }

  update(COUNTER) {
    super.update(COUNTER);
    if (COUNTER % 100 == 0) {
      this.setRandomTarget();
    }
  }
  doActions() {
    if (this.state == "searching" || (this.state == "chasing" && this.target)) {
      if (this.COUNTER % 3 == 0) {
        this.defineVelVectorToMoveTowardsTarget();
      }

      // if (this.isStatic) {
      //   this.fireBullet();
      // }

      //   if (!this.target) this.setState("idle");
    }
  }
}
