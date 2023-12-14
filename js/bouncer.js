//PATOVA
class Bouncer extends Person {
  constructor(opt) {
    super(opt);
    this.setPointWhereIShuoldHold();
  }
  setPointWhereIShuoldHold() {
    this.targetPoint = this.pos.copy();
    setTimeout(() => {
      this.target = {
        pos: this.targetPoint,
        body: { velocity: new p5.Vector(0, 0) },
      };
    }, 500);
  }

  update(COUNTER) {
    super.update(COUNTER);
  }

  updateStateAccordingToStuff() {
    super.updateStateAccordingToStuff();
    this.distToTarget = cheaperDist(
      this.pos.x,
      this.pos.y,
      this.targetPoint.x,
      this.targetPoint.y
    );
    if (this.distToTarget > this.diameter * 3) {
      this.setState("chasing");
    } else {
      this.setState("idle");
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

      if (!this.target) this.setState("idle");
    }
  }
}
