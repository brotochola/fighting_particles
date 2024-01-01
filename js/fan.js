class Fan extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 7 });
    this.strength = Math.random() * 0.4 + 0.1;

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }
  findIdol() {
    let idols = this.particleSystem.people.filter((k) => k instanceof Idol);
    // console.log(idols);
    if (idols.length > 0) {
      this.setTarget(idols[0]);
    }
  }

  doStuffAccordingToState() {
    if (
      this.state == "searching" ||
      this.state == "chasing" ||
      this.state == "idle"
    ) {
      if (this.COUNTER % 4 == 0) this.findIdol();
    }

    if (this.state == "searching" || (this.state == "chasing" && this.target)) {
      if (this.COUNTER % 3 == 0) {
        this.calculateVelVectorAccordingToTarget();
      }

      if (!this.target) this.setState("idle");
    }
  }

  interactWithAnotherPerson(part, what) {
    if (!part || part.dead || !(part instanceof Bouncer)) return;
    let howMuchHealthThisIsTakingFromMe =
      (part || {}).strength || 0 * this.particleSystem.FORCE_REDUCER;
    //take health:

    // this.health -= howMuchHealthThisIsTakingFromMe;

    // this.fear += this.intelligence * howMuchHealthThisIsTakingFromMe; //FEAR GOES UP ACCORDING TO INTELLIGENCE. MORE INTELLIGENT, MORE FEAR

    // this.anger += this.corage * howMuchHealthThisIsTakingFromMe; //ANGER GOES UP ACCORDING TO CORAGE. MORE CORAGE, YOU GET ANGRIER

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

    this.makeMeFlash();

    // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  }
}
