//PATOVA
class Poli extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 9 });
    this.strength = Math.random() * 0.5 + 0.5;
    this.setPointWhereIShouldHold();
    this.maxDistanceToBecomeViolent = this.diameter * 8;
    this.minBearableDistance = this.diameter * 2;
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
  }

  checkWhichFansAreClose() {
    this.closestFan = null;

    let closestFans = this.nearPeople.filter(
      (k) => k.part instanceof Fan && !k.part.dead && k.part.health > 0
    );
    if (closestFans.length > 0) {
      let dist = closestFans[0].dist;
      let fan = closestFans[0].part;

      if (dist < this.minBearableDistance) {
        this.closestFan = fan;
      }
    }
  }

  pushClosestFan() {
    let fan = this.closestFan;
    if (!fan) return;
    fan.makeMeFlash();

    fan.interactWithAnotherPerson(this, 0.02);

    fan.body.force.x = -fan.vel.x * this.strength * 0.02;
    fan.body.force.y = -fan.vel.y * this.strength * 0.02;
  }

  attackClosestFan() {
    let fan = this.closestFan;
    if (!fan) return;

    console.log(this.name, " attacking ", fan.name, fan.health);

    fan.interactWithAnotherPerson(this, 0.5);
    if (fan.dead || fan.health < 0) this.closestFan = null;
  }

  updateStateAccordingToManyThings() {
    super.updateStateAccordingToManyThings();
    this.distToTarget = cheaperDist(
      this.pos.x,
      this.pos.y,
      this.targetPoint.x,
      this.targetPoint.y
    );

    if (
      this.distToTarget > this.minBearableDistance &&
      this.distToTarget < this.maxDistanceToBecomeViolent
    ) {
      this.setState("chasing");
    } else if (this.distToTarget > this.maxDistanceToBecomeViolent) {
      this.setState("attacking");
    } else if (this.distToTarget < this.minBearableDistance) {
      this.setState("idle");
    }
  }

  doStuffAccordingToState() {
    if (!this.target) {
      this.setState("idle");
      return;
    }

    if (this.state == "chasing" || this.state == "attacking") {
      if (this.oncePerSecond()) this.checkWhichFansAreClose();
      if (this.isItMyFrame()) this.calculateVelVectorAccordingToTarget();
    }

    if (this.state == "attacking") {
      this.attackClosestFan();
    }

    if (this.state == "chasing") {
      this.pushClosestFan();
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
