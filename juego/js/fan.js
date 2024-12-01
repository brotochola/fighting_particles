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

    if (this.oncePerSecond() && this.target) {
      if (this.state == this.states.RETROCEDIENDO) {
        if (this.enemiesClose.length == 0) {
          if (
            this.courage <
            this.particleSystem.MULTIPLIERS.LIMITE_DE_CORAJE_PARA_SER_UN_CAGON
          ) {
            if (this.isItMyFrame()) {
              if (this.polisApaciguandoCerca.length == 0) this.throwRock();
            }
          }
        }
      } else if (this.state == this.states.BANCANDO) {
        if (
          this.courage <
          this.particleSystem.MULTIPLIERS.LIMITE_DE_CORAJE_PARA_SER_UN_CAGON
        ) {
          if (this.isItMyFrame()) {
            if (this.polisApaciguandoCerca.length == 0) this.throwRock();
          }
        }
      }
    }

    if (this.isItMyFrame()) {
      if (!this.target || this.distanceToClosestEnemy >= this.sightDistance) {
        this.setTarget(null);
        this.vel.y = this.vel.x = 0;
        this.defineFlockingBehaviorTowardsFriends();
        this.defineFlockingBehaviorAwayFromCops();
        this.sumAllVectors(0, 1, 1);
        this.doTheWalk();
      } else {
        //TIENE TARGET
        if (this.state == this.states.YENDO) {
          if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
            //LLEGÓ!
            this.whatToDoIfIReachedMyTarget();
          } else {
            //YENDO A UNA DISTANCIA Q PUEDE VER Y A LA VEZ NO ES TAN CERCA
            this.defineVelVectorToMove();
            this.defineFlockingBehaviorTowardsFriends();
            this.defineFlockingBehaviorAwayFromCops();
            this.sumAllVectors(1 + this.anger, 1 - this.fear, 1 - this.anger); //los mas corajudos tienden a ir solos
            this.doTheWalk();
          }
        } else if (this.state == this.states.BANCANDO) {
          this.defineFlockingBehaviorTowardsFriends();
          this.defineFlockingBehaviorAwayFromCops();
          this.sumAllVectors(0, 0.5, 0.5);
          this.doTheWalk();
        } else if (this.state == this.states.HUYENDO) {
          this.defineVelVectorToMove();
          this.defineFlockingBehaviorAwayFromCops();
          this.sumAllVectors(1, 0, 0.1);
          this.doTheWalk();
        } else if (this.state == this.states.RETROCEDIENDO) {
          this.defineVelVectorToMove();
          this.defineFlockingBehaviorTowardsFriends();
          this.defineFlockingBehaviorAwayFromCops();
          this.sumAllVectors(1, 1, 1.25);
          this.doTheWalk();
        }
      }
    }
    ////// old

    // if (this.target) {
    //   //TIENE UN TARGET
    //   if (this.isItMyFrame()) {
    //     this.defineVelVectorToMove();
    //     //VEMOS SI LLEGO A SU TARGET O NO
    //     if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
    //       this.whatToDoIfIReachedMyTarget();
    //     }
    //   } else if (this.oncePerSecond()) {
    //     if (this.isStatic) {
    //       // this.fireBullet();
    //       this.throwRock();
    //     }
    //   }
    // } //else if (!this.target || this.target.dead) this.setState("idle");

    //   acciones(){
    //     if(estado=="retrocediendo"){
    //         if(no hay ningun enemigo bien cerca){
    //             if(coraje < 0.5){
    //                 //cagon
    //                 tirarPiedra()
    //             }
    //         }
    //     }
    //     else if(estado=="bancando la parada" && coraje < 0.5){
    //         tirarPiedra()
    //     }
    // }

    // movimiento(){
    //     if(yendo) vel+=vectorDeDireccion hacia el target + promedio de los vec de velocidad de los amigos
    //     if(ira<0.75){
    //         vel-= vector hacia policia mas cercano
    //     }
    // }
  }
  whatToDoIfIReachedMyTarget() {
    this.recieveDamageFrom(this.target);
    this.throwAPunch();
  }

  finiteStateMachine() {
    if (this.health <= 0) {
      this.die();
    } else if (this.health < 0.1) {
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
