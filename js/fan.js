class Fan extends Person {
  possibleStates = ["yendo", "huyendo", "retrocediendo", "bancando", "muerto"];

  constructor(opt) {
    super({ ...opt, diameter: 8 });

    this.strength = Math.random() * 0.4 + 0.1;
    this.isThereACopInMyWay = false;

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
    } //else if (!this.target || this.target.dead) this.setState("idle");
  }
  whatToDoIfIReachedMyTarget() {
    this.recieveDamageFrom(this.target);
    this.throwAPunch();
  }

  finiteStateMachine() {
    if (this.health <= 0) {
      this.die();
    } else if (this.health < 0.1) {
      this.setState("huyendo");
    } else if (this.health > 0.1 && this.health < 0.9) {
      if (this.fear > 0.9) {
        this.setState("huyendo");
      } else {
        this.setState("retrocediendo");
      }
    } else {
      //salud >90%
      if (this.isThereACopInMyWay && this.anger < 0.5) {
        this.setState("bancando");
      } else {
        this.setState("yendo");
      }
    }

    ////
    // // this.state = "searching";
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

  updateMyStats() {
    super.updateMyStats();

    this.isThereACopInMyWay = !!this.checkIfTheresSomeoneInTheWay("poli");
  }
}
