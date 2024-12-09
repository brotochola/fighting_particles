class Fan extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 6 });

    this.strength = Math.random() * 0.4 + 0.1;
    this.isThereACopInMyWay = false;

    this.contrincante = this.team == "boca" ? "river" : "boca";

    this.polisApaciguandoCerca = [];

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }
  // findIdol() {
  //   let idols = this.particleSystem.people.filter((k) => k instanceof Idol);
  //   // console.log(idols);
  //   if (idols.length > 0) {
  //     this.setTarget(idols[0]);
  //   }
  // }

  getPolisApaciguando() {
    this.polisApaciguandoCerca = this.enemiesClose.filter(
      (k) => k.part.state == this.states.APACIGUANDO
    );
  }

  doActions() {
    if (this.oncePerSecond()) {
      this.findClosestEnemy(this.contrincante);
    }

    if (this.isItMyFrame()) {
      if (!this.target || this.distanceToClosestEnemy >= this.sightDistance) {
        this.hacerCosasEstadoIDLE();
      } else {
        //TIENE TARGET
        if (this.state == this.states.YENDO) {
          this.hacerCosasEstadoYENDO();
        } else if (this.state == this.states.BANCANDO) {
          this.hacerCosasEstadoBANCANDO();
        } else if (this.state == this.states.HUYENDO) {
          this.hacerCosasEstadoHUYENDO();
        } else if (this.state == this.states.RETROCEDIENDO) {
          this.hacerCosasEstadoRETROCEDIENDO();
        }
      }
    }
  }

  hacerCosasEstadoIDLE() {
    this.setTarget(null);
    this.vel.y = this.vel.x = 0;
    this.defineFlockingBehaviorTowardsFriends();
    this.defineFlockingBehaviorAwayFromCops();
    this.sumAllVectors(0, 1, 1);
    if (this.vel.mag() < 0.01) {
      this.moverseUnPoquitoRandom();
    }

    this.doTheWalk();
  }

  hacerCosasEstadoYENDO() {
    if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
      //LLEGÓ!
      this.whatToDoIfIReachedMyTarget();
    } else {
      //YENDO A UNA DISTANCIA Q PUEDE VER Y A LA VEZ NO ES TAN CERCA
      this.defineVelVectorToMoveTowardsTarget();
      this.defineFlockingBehaviorTowardsFriends();
      this.defineFlockingBehaviorAwayFromCops();
      this.sumAllVectors(1 + this.anger, 1 - this.fear, 1 - this.anger); //los mas corajudos tienden a ir solos
      this.doTheWalk();
    }
  }
  hacerCosasEstadoBANCANDO() {
    this.tirarPiedraSiEstanDadasLasCondiciones();

    this.defineFlockingBehaviorTowardsFriends();
    this.defineFlockingBehaviorAwayFromCops();
    this.sumAllVectors(0, 0.5, 0.5);
    this.doTheWalk();
  }
  hacerCosasEstadoHUYENDO() {
    this.defineVelVectorToMoveTowardsTarget();
    this.defineFlockingBehaviorAwayFromCops();
    this.sumAllVectors(1, 0, 0.1);
    this.doTheWalk();
  }

  hacerCosasEstadoRETROCEDIENDO() {
    this.tirarPiedraSiEstanDadasLasCondiciones();

    this.defineVelVectorToMoveTowardsTarget();
    this.defineFlockingBehaviorTowardsFriends();
    this.defineFlockingBehaviorAwayFromCops();
    this.sumAllVectors(1, 1, 1.25);
    this.doTheWalk();
  }

  tirarPiedraSiEstanDadasLasCondiciones() {
    if (
      this.target &&
      this.oncePerSecond() &&
      !this.enemiesClose.length &&
      this.courage <
        this.particleSystem.MULTIPLIERS.LIMITE_DE_CORAJE_PARA_SER_UN_CAGON &&
      this.isItMyFrame() &&
      !this.polisApaciguandoCerca.length
    ) {
      this.throwRock();
    }
  }

  moverseUnPoquitoRandom() {
    let mult = Math.random() * 1.5;
    if (this.oncePerSecond() && Math.random() > 0.3) {
      this.vel.x = (Math.random() - 0.5) * mult;
      this.vel.y = (Math.random() - 0.5) * mult;
    }
  }

  whatToDoIfIReachedMyTarget() {
    this.recieveDamageFrom(this.target);
    this.throwAPunch();
  }

  cambiarEstadoSegunCosas() {
    if (this.health < 0.1) {
      this.setState(this.states.HUYENDO);
    } else if (this.health > 0.1 && this.health < 0.5) {
      if (this.fear > 0.9) {
        this.setState(this.states.HUYENDO);
      } else {
        this.setState(this.states.RETROCEDIENDO);
      }
    } else {
      //salud >50%
      if (this.isThereACopInMyWay) {
        if (this.anger < 0.5) this.setState(this.states.BANCANDO);
        else this.setState(this.states.YENDO);
      } else {
        //no hay polis en el camino
        if (this.fear <= 0.5) this.setState(this.states.YENDO);
        else if (this.fear > 0.5 && this.fear < 0.9)
          this.setState(this.states.BANCANDO);
        else if (this.fear >= 0.9) this.setState(this.states.RETROCEDIENDO);
      }
    }
  }

  updateMyStats() {
    super.updateMyStats();

    this.isThereACopInMyWay =
      this.checkIfTheresSomeoneInTheWay("poli").length > 0;

    this.getPolisApaciguando();
  }

  getInfo() {
    return {
      ...super.getInfo(),
      copOnTheWay: this.isThereACopInMyWay,
    };
  }
}
