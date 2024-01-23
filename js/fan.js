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
        //VEMOS SI LLEGO A SU TARGET O NO
        if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
          this.whatToDoIfIReachedMyTarget();
        }
      } else if (this.oncePerSecond()) {
        if (this.isStatic) {
          // this.fireBullet();
          this.throwRock();
        }
      }
    } else if (!this.target || this.target.dead) this.setState("idle");
  }
  whatToDoIfIReachedMyTarget() {
    this.recieveDamageFrom(this.target);
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
}
