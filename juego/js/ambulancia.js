class Ambulancia extends GenericObject {
  constructor(opt) {
    super({
      ...opt,
      isStatic: false,
      spritesheetName: "ambulancia_ss",
    });
    this.team = "auto";
    this.initialScale = this.scale = 1;
    const { x, y, particleSystem, team, isStatic, diameter } = opt;
    this.options = opt;
    this.diameter = diameter;
    this.isStatic = isStatic;

    this.initStartingAttributes();

    this.weight = 2000;
    this.speed = 12;

    this.spriteSpeed = Math.floor(4 * this.speed);

    this.lastMatterVels = [];
    this.numberOfVelocitiesWeSave = 2;

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

    // this.updateMyPositionInGrid();

    this.strength = Math.random() * 0.4 + 0.1;
    this.isThereACopInMyWay = false;

    this.polisApaciguandoCerca = [];
    this.angulo = 0;

    this.angularFriction = 0.02;

    //OPT DEBERIA TENER VALORES MINIMOS Y MAXIMOS PARA GENERAR FANS DE DIFERENTES TIPOS
  }

  createBodyParaLaAmbulancia() {
    this.createBody(90, 45, "rectangle", "auto", 0, false, this.weight);

    this.body.frictionAir = 0.01;
    this.body.restitution = 0.9;
    this.body.frictionAir = 0.1;
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

  lookAround() {
    this.getFutureCell(30);

    if (this.oncePerSecond()) {
      this.checkIfImNotConsideredViolentAnyMore();
      this.seePeople();
      this.discernirAmigosYEnemigosYEvaluarLaSituacion();

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
    //UN TOQ DE INERCIA DEL MOTOR
    let inercia=0.01//0.2
    this.vel.x = (this.body.velocity.x + this.vel.x) * inercia;
    this.vel.y = (this.body.velocity.y + this.vel.y) * inercia;

    let vectores = [
      this.getVectorToRepelBlockedCells(),
      this.getVectorAwayFromGroup(["boca", "river", "civil", "auto"], -1.2, {
        // onlyNearPeople: true,
        useFuturePositionNearPeople: true,
      }),
      this.getVectorAwayFromGroup(["boca", "river", "civil", "auto"], -1, {
        onlyNearPeople: true,
        // useFuturePositionNearPeople: true,
      }),
      this.cell.directionVector1,
    ];

    for (let i = 0; i < vectores.length; i++) {
      if (vectores[i]) {
        this.vel.x += vectores[i].x * 2;
        this.vel.y += vectores[i].y * 2;
      }
    }

    this.vel.mult(3);

    this.vel.limit(this.speed);

    this.doTheWalk();
  }

  updateMyStats() {
    super.updateMyStats();

    this.isThereACopInMyWay =
      this.checkIfTheresSomeoneInTheWay("poli").length > 0;

    this.getPolisApaciguando();
  }

  update(COUNTER) {
    if (this.REMOVED) return;
    this.COUNTER = COUNTER;

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;

    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex = Math.floor(this.pos.y - (this.z || 0));

    this.updateMyPositionInGrid();
    this.updateMyPositionInGridForLargerObjects();
    this.lookAround();
    this.cambiarEstadoSegunCosas();
    this.updateMyStats(); //feel
    this.doActions();

    this.ajustarSpriteSegunAngulo();

    // }

    // this.animateGravityToParticles();

    // this.emitBlood();
    // if (this.emitter) this.emitter.emit = false;

    this.saveLast10Velocities();

    this.render();

    // this.saveLog();
  }

  saveLast10Velocities() {
    this.lastMatterVels.push(
      new p5.Vector(this.body.velocity.x, this.body.velocity.y)
    );
    if (this.lastMatterVels.length > this.numberOfVelocitiesWeSave) {
      this.lastMatterVels.splice(0, 1);
    }
  }

  getAvgOfLast10Velocities() {
    let sum = new p5.Vector(0, 0);

    for (let vel of this.lastMatterVels) {
      sum.add(vel);
    }

    sum.x /= this.lastMatterVels.length + 1;
    sum.y /= this.lastMatterVels.length + 1;

    return sum;
  }

  render() {
    // if (!this.doNotShowIfOutOfScreen()) return;

    //POSICION X E Y
    this.container.y = this.pos.y; // this.calculateContainersY();
    this.container.x = this.pos.x; //this.calculateContainersX();

    // //SI ESTA HIGHLIGHTED
    this.ifHighlightedTintRed();

    // this.drawLineBetweenMeAndTarget();
  }

  ajustarSpriteSegunAngulo() {
    //TENEMOS 41 SPRITES PARA EL GIRO DE LA AMBULANCIA
    //360 GRADOS LOS DIVIDO POR LA CANTIDAD Q TENEMOS
    // this.calcularAngulo();

    let promOfVelocities = this.getAvgOfLast10Velocities();

    const angle = Math.atan2(promOfVelocities.y, promOfVelocities.x); // Ángulo de la velocidad
    this.particleSystem.Matter.Body.setAngle(
      this.body,
      (this.body.angle + angle) * 0.5
    );

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
