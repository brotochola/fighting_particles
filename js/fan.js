class Fan extends Person {
  states = {
    YENDO: 1,
    RETROCEDIENDO: 2,
    HUYENDO: 3,
    BANCANDO: 4,
    MUERTO: 5,
  };

  constructor(opt) {
    super({ ...opt, diameter: 8 });

    this.strength = Math.random() * 0.4 + 0.1;
    this.isThereACopInMyWay = false;

    this.contrincante = this.team == "boca" ? "river" : "boca";

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }
  // findIdol() {
  //   let idols = this.particleSystem.people.filter((k) => k instanceof Idol);
  //   // console.log(idols);
  //   if (idols.length > 0) {
  //     this.setTarget(idols[0]);
  //   }
  // }

  doActions() {
    if (this.oncePerSecond()) {
      this.findClosestEnemy(this.contrincante);
    }

    if (!this.target) return;

    if (this.oncePerSecond()) {
      if (this.state == this.states.RETROCEDIENDO) {
        if (this.enemiesClose.length == 0) {
          if (this.courage < 0.5) {
            this.throwRock();
          }
        }
      } else if (this.state == this.states.BANCANDO) {
        if (this.courage > 0.5) {
          this.throwRock();
        }
      }
    }

    if (this.isItMyFrame()) {
      if (
        this.state == this.states.HUYENDO ||
        this.state == this.states.YENDO ||
        this.state == this.states.RETROCEDIENDO
      ) {
        if (this.distanceToClosestEnemy <= this.particleSystem.CELL_SIZE) {
          //VEMOS SI LLEGO A SU TARGET O NO
          this.whatToDoIfIReachedMyTarget();
        } else if (this.distanceToClosestEnemy >= this.sightDistance) {
          //O SI EL TARGET ESTA MUY LEJOS, LO SACO
          this.setTarget(null);
        } else {
          //ESTA A UNA DISTANCIA Q PUEDE VER Y A LA VEZ NO ES TAN CERCA
          this.defineVelVectorToMove();
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
      //salud >90%
      if (this.isThereACopInMyWay) {
        if (this.anger < 0.5) this.setState(this.states.BANCANDO);
        else this.setState(this.states.YENDO);
      } else {
        //no hay polis en el camino
        if (this.fear <= 0.5) this.setState(this.states.YENDO);
        else if (this.fear < 0.5 && this.fear > 0.9)
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

    this.isThereACopInMyWay = !!this.checkIfTheresSomeoneInTheWay("poli");
  }
}
