//PATOVA
class Poli extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 9 });
    this.strength = Math.random() * 0.5 + 0.5;
    this.setPointWhereIShouldHold();
  }
  setPointWhereIShouldHold() {
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
    if (COUNTER % 10 == 0) this.checkWhichFansAreClose();
  }

  checkWhichFansAreClose() {
    let closestFans = this.nearPeople.filter((k) => k.part instanceof Fan);
    if (closestFans.length > 0) {
      // this.closestFan = closestFans[0];
      let dist = closestFans[0].dist;
      let fan = closestFans[0].part;
      if (dist < this.diameter * 2) {
        this.makeMeFlash();
        fan.makeMeFlash();

        fan.body.force.x -=
          fan.vel.x * this.strength * this.particleSystem.FORCE_REDUCER;
        fan.body.force.y -=
          fan.vel.y * this.strength * this.particleSystem.FORCE_REDUCER;
      }
    }
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
      if (this.COUNTER % 5 == 0) {
        this.calculateVelVectorAccordingToTarget();
      }

      // if (this.isStatic) {
      //   this.fireBullet();
      // }

      if (!this.target) this.setState("idle");
    }
  }

  // interactWithAnotherPerson(part, what) {
  //   if (!part || part.dead || !(part instanceof Fan)) return;
  //   let howMuchHealthThisIsTakingFromMe =
  //     (part || {}).strength || 0 * this.particleSystem.FORCE_REDUCER;
  //   //take health:

  //   // this.health -= howMuchHealthThisIsTakingFromMe;

  //   // this.fear += this.intelligence * howMuchHealthThisIsTakingFromMe; //FEAR GOES UP ACCORDING TO INTELLIGENCE. MORE INTELLIGENT, MORE FEAR

  //   // this.anger += this.courage * howMuchHealthThisIsTakingFromMe; //ANGER GOES UP ACCORDING TO courage. MORE courage, YOU GET ANGRIER

  //   let incomingAngleOfHit = Math.atan2(
  //     part.body.position.y,
  //     part.body.position.x
  //   );

  //   // this.emitBlood(incomingAngleOfHit);

  //   // let difX = part.body.position.x - this.body.position.x;
  //   // let difY = part.body.position.y - this.body.position.y;

  //   // let dif = new p5.Vector(difX, difY).setMag(1);

  //   // this.body.position.x -= dif.x * part.strength;
  //   // this.body.position.y -= dif.y * part.strength;

  //   this.makeMeFlash();

  //   // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  // }
}
