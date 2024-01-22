class Fan extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 8 });

    this.strength = Math.random() * 0.4 + 0.1;

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }
  // findIdol() {
  //   let idols = this.particleSystem.people.filter((k) => k instanceof Idol);
  //   // console.log(idols);
  //   if (idols.length > 0) {
  //     this.setTarget(idols[0]);
  //   }
  // }

  doStuffAccordingToState() {
    //BUSCAR A QUIEN PEGARLE
    if (this.oncePerSecond()) {
      this.findClosestEnemy(this.team == "boca" ? "river" : "boca");
    }

    if (this.target) {
      //TIENE UN TARGET
      if (this.isItMyFrame()) {
        this.calculateVelVectorAccordingToTarget();
        if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
          this.whatToDoIfIReachedMyTarget();
        }
      }
    } else if (!this.target || this.target.dead) this.setState("idle");
  }
  whatToDoIfIReachedMyTarget() {
    this.interactWithAnotherPerson(this.target);
    this.throwAPunch();
  }

  // render() {
  //   this.updateDebugText(
  //     this.health.toFixed(2) +
  //       "," +
  //       this.fear.toFixed(2) +
  //       "," +
  //       this.anger.toFixed(2)
  //   );
  //   super.render();
  // }

  interactWithAnotherPerson(part, coeficient = 1) {
    if (!part || part.dead) return;
    // console.log(this.team, part.team, this.health);

    let howMuchHealthThisIsTakingFromMe = (part || {}).strength * coeficient;
    //take health:

    this.health -=
      howMuchHealthThisIsTakingFromMe *
      this.particleSystem.MULTIPLIERS.FORCE_REDUCER;

    this.fear +=
      this.intelligence *
      howMuchHealthThisIsTakingFromMe *
      this.particleSystem.MULTIPLIERS.FEAR_REDUCER; //FEAR GOES UP ACCORDING TO INTELLIGENCE. MORE INTELLIGENT, MORE FEAR

    this.anger +=
      this.courage *
      howMuchHealthThisIsTakingFromMe *
      this.particleSystem.MULTIPLIERS.FEAR_REDUCER; //ANGER GOES UP ACCORDING TO courage. MORE courage, YOU GET ANGRIER

    let incomingAngleOfHit = Math.atan2(
      part.body.position.y,
      part.body.position.x
    );

    // this.emitBlood(incomingAngleOfHit);

    // let difX = part.body.position.x - this.body.position.x;
    // let difY = part.body.position.y - this.body.position.y;

    // let dif = new p5.Vector(difX, difY).setMag(1);

    // this.body.position.x -= dif.x * part.strength * 10;
    // this.body.position.y -= dif.y * part.strength * 10;

    // this.makeMeFlash();

    // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  }
}
