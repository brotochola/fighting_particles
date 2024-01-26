//PATOVA
class Poli extends Person {
  possibleStates = [
    "empujando",
    "pegando",
    "yendo",
    "huyendo",
    "apaciguando",
    "muerto",
  ];

  constructor(opt) {
    super({ ...opt, diameter: 9 });
    this.strength = Math.random() * 0.5 + 0.5;
    this.setPointWhereIShouldHold();
    this.maxDistanceToBecomeViolent = this.diameter * 6;
    this.attackDistance = this.diameter * 3;

    this.minBearableDistance = this.diameter * 2;
  }
  setPointWhereIShouldHold() {
    this.initialPoint = this.pos.copy();
    setTimeout(() => {
      this.target = {
        pos: this.initialPoint,
        body: { velocity: new p5.Vector(0, 0) },
      };
    }, 500);
  }

  update(COUNTER) {
    super.update(COUNTER);
  }

  updateMyStats() {
    super.updateMyStats();

    this.distanceToInitialPoint = cheaperDist(
      this.pos.x,
      this.pos.y,
      this.initialPoint.x,
      this.initialPoint.y
    );

    //los polis se enojan si tienen gente cerca
    this.anger +=
      this.closeEnemies *
      this.particleSystem.MULTIPLIERS.ANGER_RECOVERY_REDUCER *
      0.1 *
      this.irascibilidad;
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
    fan.recieveDamageFrom(this, 0.1);

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

    fan.recieveDamageFrom(this);
    if (fan.dead || fan.health < 0) this.closestFan = null;
  }

  finiteStateMachine() {
    // if (this.health <= 0) {
    //   this.die();
    // } else if (
    //   this.health < 0.1 ||
    //   this.fear > this.particleSystem.MULTIPLIERS.FEAR_LIMIT_TO_ESCAPE
    // ) {
    //   this.setState("escaping");
    // } else if (
    //   this.fear < this.particleSystem.MULTIPLIERS.FEAR_LIMIT_TO_ESCAPE &&
    //   this.health > this.particleSystem.MULTIPLIERS.HEALTH_LIMIT_TO_ESCAPE
    // ) {
    //   this.setState("idle");
    // }
    // if (!this.target) {
    // }

    // if (
    //   this.distanceToInitialPoint > this.minBearableDistance &&
    //   this.distanceToInitialPoint < this.maxDistanceToBecomeViolent
    // ) {
    //   this.setState("chasing");
    // } else if (this.distanceToInitialPoint > this.maxDistanceToBecomeViolent) {
    //   this.setState("attacking");
    // } else if (this.distanceToInitialPoint < this.minBearableDistance) {
    //   this.setState("idle");
    // }

    if (this.health < 0.1) {
      //me estoy muriendo mal
      this.setState("huyendo");
    } else if (this.health > 0.1 && this.health < 0.3) {
      //ta maomeno de vida

      if (this.fear > 0.9) {
        this.setState("huyendo");
      }
    } else {
      //esta bien de vida
      if (this.anger > 0.9) {
        this.setState("yendo");
      } else {
        if (this.state == "apaciguando") {
          if (this.distanceToInitialPoint > this.sightDistance * this.courage) {
            this.setState("empujando");
          }

          if (this.closeEnemies) {
            this.setState("empujando");
          }
        } else {
          if (this.anger > 0.5) {
            this.setState("pegando");
          } else {
            //esta bien de ira
            if (this.closeEnemies) {
              this.setState("apaciguando");
            } else {
              this.setState("empujando");
            }
          }
        }
      }
    }
  }

  getInfo() {
    return {
      ...super.getInfo(),
      distanceToInitialPoint: (this.distanceToInitialPoint || 0).toFixed(2),
    };
  }

  doActions() {
    if (this.state == "pegando" || this.state == "empujando") {
      if (this.oncePerSecond()) this.checkWhichFansAreClose();
      if (this.isItMyFrame()) {
        if (this.distanceToInitialPoint > this.particleSystem.CELL_SIZE) {
          this.defineVelVectorToMove();
          this.addFlockingBehavior();
          this.doTheWalk();
        }
      }
    }

    if (this.state == "pegando") {
      if (this.isItMyFrame()) this.attackClosestFan();
    }

    if (this.state == "empujando") {
      if (this.isItMyFrame()) this.pushClosestFan();
    }
  }

  // recieveDamageFrom(part, what) {
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
