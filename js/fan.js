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
    if (
      this.state == "searching" ||
      this.state == "chasing" ||
      this.state == "idle" ||
      this.state == "attacking" ||
      this.state == "escaping"
    ) {
      //BUSCAR A QUIEN PEGARLE
      if (this.COUNTER % 20 == 0)
        this.findClosestTarget(this.team == "boca" ? "river" : "boca");
    }

    if (
      this.state == "searching" ||
      ((this.state == "chasing" ||
        this.state == "attacking" ||
        this.state == "escaping") &&
        this.target)
    ) {
      //TIENE UN TARGET
      if (this.COUNTER % 7 == this.startingFrame) {
        this.calculateVelVectorAccordingToTarget();
        if (this.distanceToTarget <= this.particleSystem.CELL_SIZE) {
          this.whatToDoIfIReachedMyTarget();
        }
      }

      if (!this.target || this.target.dead) this.setState("idle");
    }
  }
  whatToDoIfIReachedMyTarget() {
    this.interactWithAnotherPerson(this.target);
    this.throwAPunch();
  }

  interactWithAnotherPerson(part, what) {
    // console.log(this.team, part.team, this.health);
    if (!part || part.dead) return;
    // console.log(this.team, part.team, this.health, "sdsd");
    let howMuchHealthThisIsTakingFromMe =
      (part || {}).strength || 0 * this.particleSystem.FORCE_REDUCER;
    //take health:

    this.health -= howMuchHealthThisIsTakingFromMe;

    this.fear += this.intelligence * howMuchHealthThisIsTakingFromMe; //FEAR GOES UP ACCORDING TO INTELLIGENCE. MORE INTELLIGENT, MORE FEAR

    this.anger += this.courage * howMuchHealthThisIsTakingFromMe; //ANGER GOES UP ACCORDING TO courage. MORE courage, YOU GET ANGRIER

    let incomingAngleOfHit = Math.atan2(
      part.body.position.y,
      part.body.position.x
    );

    this.emitBlood(incomingAngleOfHit);

    let difX = part.body.position.x - this.body.position.x;
    let difY = part.body.position.y - this.body.position.y;

    let dif = new p5.Vector(difX, difY).setMag(1);

    this.body.position.x -= dif.x * part.strength * 10;
    this.body.position.y -= dif.y * part.strength * 10;

    // this.makeMeFlash();

    // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  }
}
