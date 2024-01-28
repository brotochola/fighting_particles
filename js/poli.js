//PATOVA
class Poli extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 9 });
    this.strength = Math.random() * 0.5 + 0.5;
    this.setPointWhereIShouldHold();
    this.maxDistanceToBecomeViolent = this.diameter * 6;
    this.attackDistance = this.diameter * 3;

    this.minBearableDistance = this.diameter * 2;

    this.distanceToTargetPerson = 999999999999;

    this.violentFansAround = [];
    this.targetAtinitialPoint = {
      pos: this.initialPoint,
      vel: new p5.Vector(0, 0),
      body: { velocity: new p5.Vector(0, 0) },
    };
  }
  setPointWhereIShouldHold() {
    this.initialPoint = this.pos.copy();
    setTimeout(() => {
      this.setTarget(this.targetAtinitialPoint);
    }, 500);
  }

  update(COUNTER) {
    super.update(COUNTER);
  }

  lookAround() {
    super.lookAround();
    this.getViolentEnemiesAround();
    this.checkWhichFansAreClose();
  }

  calcDistanceToTargetPerson() {
    if (this.target instanceof Person) {
      this.distanceToTargetPerson = cheaperDist(
        this.target.pos.x,
        this.target.pos.y,
        this.pos.x,
        this.pos.y
      );
    } else {
      this.distanceToTargetPerson = null;
    }
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
      (this.enemiesClose || []).length *
      this.particleSystem.MULTIPLIERS.POLICE_ANGER_MULTIPLIER *
      0.1 *
      this.irascibilidad;

    // this.anger +=
    //   this.violentFansAround.length *
    //   this.particleSystem.MULTIPLIERS.POLICE_ANGER_MULTIPLIER *
    //   this.irascibilidad;

    if (isNaN(this.anger)) debugger;
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
      this.setState(this.states.HUYENDO);
    } else if (this.health > 0.1 && this.health < 0.3) {
      //ta maomeno de vida

      if (this.fear > 0.9) {
        this.setState(this.states.HUYENDO);
      }
    } else {
      //esta bien de vida
      if (this.anger > 0.9) {
        this.setState(this.states.YENDO);
      } else {
        if (this.state == this.states.APACIGUANDO) {
          if (this.distanceToInitialPoint > this.sightDistance * this.courage) {
            this.setState(this.states.EMPUJANDO);
          }
        } else {
          if (this.anger > 0.5) {
            this.setState(this.states.PEGANDO);
          } else {
            //esta bien de ira
            if (this.violentFansAround.length > 0) {
              this.setState(this.states.APACIGUANDO);
            } else {
              this.setState(this.states.EMPUJANDO);
            }
          }
        }
      }
    }
  }

  getViolentEnemiesAround() {
    this.violentFansAround = this.enemiesICanSee.filter(
      (k) => k.lastViolentAct
    );
  }

  getInfo() {
    return {
      ...super.getInfo(),
      distanceToInitialPoint: (this.distanceToInitialPoint || 0).toFixed(2),
      violentosCerca: this.violentFansAround.length,
      distanceToTarget: this.distanceToTargetPerson,
    };
  }

  doActions() {
    if (
      this.state == this.states.PEGANDO ||
      this.state == this.states.EMPUJANDO
    ) {
      if (this.isItMyFrame()) {
        this.setTarget(this.targetAtinitialPoint);
        if (this.distanceToInitialPoint > this.particleSystem.CELL_SIZE) {
          this.defineVelVectorToMove();
          this.defineFlockingBehaviorTowardsFriends();
          this.sumAllVectors(1, 0.5, 0);

          this.doTheWalk();
        }
      }
    }

    if (this.state == this.states.PEGANDO) {
      if (this.isItMyFrame()) this.attackClosestFan();
    }

    if (this.state == this.states.EMPUJANDO) {
      if (this.isItMyFrame()) this.pushClosestFan();
    }

    if (this.state == this.states.APACIGUANDO) {
      //SI ESTA APACIGUANDO
      if (this.isItMyFrame()) {
        //3 VECES POR SEGUNDO BUSCA UN HINCHA VIOLENTO
        if (
          !(this.target instanceof Person && this.violentFansAround.length > 0)
        ) {
          this.setTarget(this.violentFansAround[0]);
        }

        //SI EST ALEJOS
        this.calcDistanceToTargetPerson();

        if (this.distanceToTargetPerson > this.attackDistance) {
          //VE PARA DONDE IR
          this.defineVelVectorToMove();
          //SE FIJA DE NO QUEDARSE LEJOS DE LOS OTROS RATIS
          this.defineFlockingBehaviorTowardsFriends();
          this.sumAllVectors(1, 0, 0);
          this.doTheWalk();
        } else {
          //SI LLEGÓ, LO FAJA
          this.attackClosestFan();
        }
      }
    } else if (this.state == this.states.YENDO) {
      if (this.isItMyFrame()) {
        if (!(this.target instanceof Person)) {
          if (this.enemiesClose.length > 0) {
            this.setTarget(this.enemiesClose[0].part);
          } else if (this.enemiesICanSee.length > 0) {
            this.setTarget(this.enemiesICanSee[0]);
          }
        }

        this.calcDistanceToTargetPerson();
        if (this.distanceToTargetPerson > this.attackDistance) {
          this.defineVelVectorToMove();
          // this.defineFlockingBehaviorTowardsFriends();
          this.sumAllVectors(1, 0, 0);

          this.doTheWalk();
        } else {
          this.attackClosestFan();
        }
      }
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
