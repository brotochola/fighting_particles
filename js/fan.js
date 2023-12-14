class Fan extends Person {
  constructor(opt) {
    super(opt);

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }
  findIdol() {
    let idols = this.particleSystem.particles.filter((k) => k instanceof Idol);
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
}
