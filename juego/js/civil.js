class Civil extends Person {
  constructor(opt) {
    super({ ...opt, diameter: 6, team: "civil", isStatic: false });

    this.strength = Math.random() * 0.4 + 0.1;
    this.isThereACopInMyWay = false;

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

  cambiarEstadoSegunCosas() {}
  doActions() {
    if (this.isItMyFrame()) {
      this.hacerCosasEstadoIDLE();
    }
  }

  hacerCosasEstadoIDLE() {
    this.vel.y = this.vel.x = 0;

    let vecAmigos =
      !this.friendsClose.length &&
      !this.squeezed &&
      this.getVectorAwayFromGroup("civil", 1, {
        discardNearPeople: true,
      }).mult(1);

    let vectores = [
      vecAmigos,
      this.getVectorToRepelGas(),
      this.getVectorAwayFromGroup("poli", -1).mult(0.2),
      this.getVectorAwayFromGroup("boca", -1).mult(1),
      this.getVectorAwayFromGroup("river", -1).mult(1),
      this.cell.directionVector,
    ];

    // this.avoidGas();

    for (let i = 0; i < vectores.length; i++) {
      if (vectores[i]) this.vel.add(vectores[i]);
    }

    this.limitVelToSpeed();

    if (this.vel.mag() < 0.01) {
      this.moverseUnPoquitoRandom();
    }

    this.doTheWalk();
  }

  //   hacerCosasEstadoYENDO() {
  //     if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
  //       //LLEGÓ!
  //       this.whatToDoIfIReachedMyTarget();
  //     } else {
  //       //YENDO A UNA DISTANCIA Q PUEDE VER Y A LA VEZ NO ES TAN CERCA
  //       this.defineVelVectorToMoveTowardsTarget();
  //       this.defineFlockingBehaviorTowardsFriends();
  //       this.defineFlockingBehaviorAwayFromCops();
  //       this.sumAllVectors(1 + this.anger, 1 - this.fear, 1 - this.anger); //los mas corajudos tienden a ir solos
  //       this.doTheWalk();
  //     }
  //   }
  //   hacerCosasEstadoBANCANDO() {
  //     this.tirarPiedraSiEstanDadasLasCondiciones();

  //     this.defineFlockingBehaviorTowardsFriends();
  //     this.defineFlockingBehaviorAwayFromCops();
  //     this.sumAllVectors(0, 0.5, 0.5);
  //     this.doTheWalk();
  //   }
  //   hacerCosasEstadoHUYENDO() {
  //     this.defineVelVectorToMoveTowardsTarget();
  //     this.defineFlockingBehaviorAwayFromCops();
  //     this.sumAllVectors(1, 0, 0.1);
  //     this.doTheWalk();
  //   }

  //   hacerCosasEstadoRETROCEDIENDO() {
  //     this.tirarPiedraSiEstanDadasLasCondiciones();

  //     this.defineVelVectorToMoveTowardsTarget();
  //     this.defineFlockingBehaviorTowardsFriends();
  //     this.defineFlockingBehaviorAwayFromCops();
  //     this.sumAllVectors(1, 1, 1.25);
  //     this.doTheWalk();
  //   }

  //   tirarPiedraSiEstanDadasLasCondiciones() {
  //     if (
  //       this.target &&
  //       this.oncePerSecond() &&
  //       !this.enemiesClose.length &&
  //       this.courage <
  //         this.particleSystem.MULTIPLIERS.LIMITE_DE_CORAJE_PARA_SER_UN_CAGON &&
  //       this.isItMyFrame() &&
  //       !this.polisApaciguandoCerca.length
  //     ) {
  //       this.throwRock();
  //     }
  //   }

  //   whatToDoIfIReachedMyTarget() {
  //     // this.recieveDamageFrom(this.target);
  //     this.throwAPunch();
  //   }

  //   cambiarEstadoSegunCosas() {
  //     if (this.health <= 0) {
  //       this.die();
  //     } else if (this.health < 0.1) {
  //       this.setState(this.states.HUYENDO);
  //     } else if (this.health > 0.1 && this.health < 0.5) {
  //       if (this.fear > 0.9) {
  //         this.setState(this.states.HUYENDO);
  //       } else {
  //         this.setState(this.states.RETROCEDIENDO);
  //       }
  //     } else {
  //       //salud >50%
  //       if (this.isThereACopInMyWay) {
  //         if (this.anger < 0.5) this.setState(this.states.BANCANDO);
  //         else this.setState(this.states.YENDO);
  //       } else {
  //         //no hay polis en el camino
  //         if (this.fear <= 0.5) this.setState(this.states.YENDO);
  //         else if (this.fear > 0.5 && this.fear < 0.9)
  //           this.setState(this.states.BANCANDO);
  //         else if (this.fear >= 0.9) this.setState(this.states.RETROCEDIENDO);
  //       }
  //     }
  //   }

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
