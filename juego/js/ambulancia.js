class Ambulancia extends GenericObject {
  constructor(opt) {
    super({
      ...opt,
      team: "civil",
      isStatic: false,
      spritesheetName: "ambulancia_ss",
    });

    this.initialScale = this.scale = 1;
    const { x, y, particleSystem, team, isStatic, diameter } = opt;
    this.options = opt;
    this.diameter = diameter;
    this.isStatic = isStatic;

    this.initStartingAttributes();
    this.speed = 0.1;

    this.team = team;

    this.spriteSpeed = Math.floor(4 * this.speed);

    /////////////////////////////

    this.prediction = 0;
    this.mappedPrediction = 0;

    //initialize variables:
    this.log = [];
    this.nearPeople = [];
    this.peopleICanSee = [];
    this.enemiesClose = [];
    this.friendsICanSee = [];
    this.enemiesICanSee = [];
    this.friendsClose = [];
    this.closeFixedObjects = [];

    this.lastViolentAct = null;

    this.vel = new p5.Vector(0, 0);
    this.lastTimeItFlipped = 0;
    this.amILookingLeft = false;

    this.createBodyParaLaAmbulancia();
    // this.createParticleContainer()
    // this.createDebugContainer();

    this.createAnimatedSprite("ambulancia_ss");
    this.alignAmbulanceSprite();

    // this.createSprite("idle_" + this.team);

    this.updateMyPositionInCell();

    this.strength = Math.random() * 0.4 + 0.1;
    this.isThereACopInMyWay = false;

    this.polisApaciguandoCerca = [];
    this.angulo = 0;

    this.angularFriction = 0.02;

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }

  createBodyParaLaAmbulancia() {
    this.createBody(40, 20, "rectangle", "person", 0, false, this.weight);
    this.body.frictionAir = 0.01;
    this.body.restitution = 0.9;
    this.body.frictionAir = 0.3;
    this.body.inertia = Infinity;
  }
  alignAmbulanceSprite() {
    this.image.pivot.x = +this.image.width / (this.initialScale * 2);
    this.image.pivot.y = +this.image.height / (this.initialScale * 1.5);

    if (this.animatedSprites) {
      for (let as of Object.keys(this.animatedSprites)) {
        this.animatedSprites[as].pivot.x = this.image.pivot.x;
        this.animatedSprites[as].pivot.y = this.image.pivot.y;
      }
    }
  }
  // findIdol() {
  //   let idols = this.particleSystem.people.filter((k) => k instanceof Idol);
  //   // console.log(idols);
  //   if (idols.length > 0) {
  //     this.setTarget(idols[0]);
  //   }
  // }
  seePeople() {
    // let time = performance.now();
    let offset = Math.floor(this.sightDistance / this.particleSystem.CELL_SIZE);
    //ya q estamos lo guardo
    this.peopleICanSee = this.findClosePeople(offset, offset);

    // console.log(performance.now() - time, "XXXXXXX");
  }

  lookAround() {
    if (this.oncePerSecond()) {
      this.checkIfImNotConsideredViolentAnyMore();
      this.seePeople();
      this.discernirAmigosYEnemigosYEvaluarLaSituacion();

      this.closeFixedObjects = this.findCloseObjects(2, 2);

      this.nearPeople = this.getParticlesFromCloseCells();
      this.enemiesClose = this.nearPeople.filter(
        (k) => k.part.team != this.team
      );
      this.friendsClose = this.nearPeople.filter(
        (k) => k.part.team == this.team
      );

      // this.updateDebugText(this.nearPeople.length);
    }
  }

  getPolisApaciguando() {
    this.polisApaciguandoCerca = this.enemiesClose.filter(
      (k) => k.part.state == this.states.APACIGUANDO
    );
  }

  cambiarEstadoSegunCosas() {}
  doActions() {
    // if (this.isItMyFrame()) {
    this.hacerCosasEstadoIDLE();
    // }
  }

  hacerCosasEstadoIDLE() {
    let vectores = [
      // this.getVectorAwayFromGroup("poli", -1).mult(0.2),
      // this.getVectorAwayFromGroup("boca", -1).mult(1),
      // this.getVectorAwayFromGroup("river", -1).mult(1),
      this.cell.directionVector && this.cell.directionVector,
    ];

    if (!this.cell.directionVector) {
      this.vel.x = 0;
      this.vel.y = 0;
    } else {
      for (let i = 0; i < vectores.length; i++) {
        if (vectores[i]) this.vel.add(vectores[i]);
      }

      this.vel.limit(this.speed);

      this.doTheWalk();
    }
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

  update(COUNTER) {
    this.COUNTER = COUNTER;

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;

    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex = Math.floor(this.pos.y - (this.z || 0));

    this.updateMyPositionInCell();

    this.lookAround();
    this.cambiarEstadoSegunCosas();
    this.updateMyStats(); //feel
    this.doActions();

    // this.friccionAngular();

    this.ajustarSpriteSegunAngulo();

    // }

    // this.animateGravityToParticles();

    // this.emitBlood();
    // if (this.emitter) this.emitter.emit = false;

    this.lastMatterVel = { x: this.body.velocity.x, y: this.body.velocity.y };

    this.render();

    // this.saveLog();
  }

  // friccionAngular() {
  //   // Aplicar fricción angular solo si el cuerpo está rotando
  //   if (this.body.angularVelocity !== 0) {
  //     this.particleSystem.Matter.Body.setAngularVelocity(
  //       this.body,
  //       this.body.angularVelocity / 2
  //     );

  //     // Detener la rotación si es muy pequeña
  //     if (Math.abs(this.body.angularVelocity) < 0.001) {
  //       this.particleSystem.Matter.Body.setAngularVelocity(this.body, 0);
  //     }
  //   }
  // }

  render() {
    // if (!this.doNotShowIfOutOfScreen()) return;

    //POSICION X E Y
    this.container.y = this.pos.y; // this.calculateContainersY();
    this.container.x = this.pos.x; //this.calculateContainersX();

    // //SI ESTA HIGHLIGHTED
    // try {
    //   if (this.highlighted) {
    //     if (this.image.tint != 0xff0000) this.image.tint = 0xff0000;
    //   } else {
    //     if (this.image.tint != 0xffffff) this.image.tint = 0xffffff;
    //   }
    // } catch (e) {
    //   debugger;
    // }

    // this.drawLineBetweenMeAndTarget();
  }

  ajustarSpriteSegunAngulo() {
    //TENEMOS 41 SPRITES PARA EL GIRO DE LA AMBULANCIA
    //360 GRADOS LOS DIVIDO POR LA CANTIDAD Q TENEMOS
    // this.calcularAngulo();

    let promOfVelcocities

    if (!this.lastMatterVel) {
      promOfVelcocities = this.body.velocity;
    } else {
      promOfVelcocities = {
        y: (this.body.velocity.y + this.lastMatterVel.y) / 2,
        x: (this.body.velocity.x + this.lastMatterVel.x) / 2,
      };
    }

    const angle = Math.atan2(promOfVelcocities.y, promOfVelcocities.x); // Ángulo de la velocidad
    this.particleSystem.Matter.Body.setAngle(this.body, angle);

    const cantidadDeImagenesQTenemos = 47;
    let grados = 360 / cantidadDeImagenesQTenemos;

    let anguloActualizado = (rad2deg(angle) + 720) % 360;
    let porcion = Math.floor(anguloActualizado / grados) + 1;

    // this.cambiarSprite(porcion);
    this.changeAnimation(porcion, false);

    this.porcion = porcion;
  }

  getInfo() {
    return {
      ...super.getInfo(),
      copOnTheWay: this.isThereACopInMyWay,
    };
  }
}
