//PATOVA
class Poli extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 9 });
    this.strength = Math.random() * 0.5 + 0.5;
    this.setPointWhereIShouldHold();
    this.maxDistanceToBecomeViolent = this.diameter * 6;
    this.attackDistance = this.diameter * 3;

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
    // console.log("###", closestFans);
    if (closestFans.length > 0) {
      let dist = closestFans[0].dist;
      let fan = closestFans[0].part;
      // console.log(dist, fan, this.minBearableDistance);
      // if (dist < this.minBearableDistance) {
      if (dist < this.attackDistance) {
        this.closestFan = fan;
        // console.log(this.closestFan);
      }
    }
  }

  pushClosestFan() {
    let fan = this.closestFan;
    if (!fan) return;
    fan.makeMeFlash();
    // console.log("###", this.name, "pushing ", fan.name, fan.team);
    fan.interactWithAnotherPerson(this, 0.1);

    fan.body.force.x =
      -fan.vel.x *
      this.strength *
      this.particleSystem.MULTIPLIERS.POLI_FORCE_PUSH_MULTIPLIER;
    fan.body.force.y =
      -fan.vel.y *
      this.strength *
      this.particleSystem.MULTIPLIERS.POLI_FORCE_PUSH_MULTIPLIER;
  }

  attackClosestFan() {
    let fan = this.closestFan;
    if (!fan) return;

    // console.log(this.name, " attacking ", fan.name, fan.health);

    fan.interactWithAnotherPerson(this);
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

  getInfo() {
    return {
      ...super.getInfo(),
      distToTarget: (this.distToTarget || 0).toFixed(2),
    };
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
      if (this.isItMyFrame()) this.attackClosestFan();
    }

    if (this.state == "chasing") {
      if (this.isItMyFrame()) this.pushClosestFan();
    }
  }

  // interactWithAnotherPerson(part, what) {
  //   if (!part || part.dead || !(part instanceof Fan)) return;
  //   let howMuchHealthThisIsTakingFromMe =
  //     (part || {}).strength || 0 * this.particleSystem.MULTIPLIERS.FORCE_REDUCER;
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
