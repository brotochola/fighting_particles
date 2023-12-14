//taylor swift
class Idol extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 8 });

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
  doStuffAccordingToState() {
    if (this.state == "searching" || (this.state == "chasing" && this.target)) {
      if (this.COUNTER % 3 == 0) {
        this.calculateVelVectorAccordingToTarget();
      }

      // if (this.isStatic) {
      //   this.fireBullet();
      // }

      //   if (!this.target) this.setState("idle");
    }
  }
}
