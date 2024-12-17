class Person extends GenericObject {
  states = {
    //de todes

    YENDO: 1,
    RETROCEDIENDO: 2,
    HUYENDO: 3,
    BANCANDO: 4,
    MUERTO: 5,
    //del poli
    EMPUJANDO: 6,
    PEGANDO: 7,
    APACIGUANDO: 8,
  };

  constructor(opt) {
    super(opt);
    this.initialScale = this.scale = 2;
    const { x, y, particleSystem, team, isStatic, diameter } = opt;
    this.options = opt;
    this.diameter = diameter;
    this.isStatic = isStatic;
    //PARAMS OF THIS PERSON:

    this.initStartingAttributes();
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

    this.lastViolentAct = null;

    this.vel = new p5.Vector(0, 0);
    this.lastTimeItFlipped = 0;
    this.amILookingLeft = false;

    //create stuff
    this.createBody(
      this.diameter,
      this.diameter,
      "circle",
      "person",
      0,
      false,
      this.weight
    );

    this.createDebugContainer();

    this.createAnimatedSprite(
      this.options.spritesheetName || this.team + "_ss",
      this instanceof Ambulancia ? "1" : "parado"
    );

    this.createBloodSpriteSheet();
    this.alignSpriteMiddleBottom();

    // this.createSprite("idle_" + this.team);

    this.updateMyPositionInGrid();
    this.resetAnimationActions();

    // this.createShadow();
  }

  createBloodSpriteSheet() {
    this.bloodSplat = new PIXI.AnimatedSprite(
      this.particleSystem.res["splat_ss"].animations["splat"]
    );
    this.bloodSplat.stop();
    this.bloodSplat.loop = false;
    this.bloodSplat.visible = false;
    // this.bloodSplat.s
    this.bloodSplat.animationSpeed = 0.66;
    this.bloodSplat.anchor.set(0.5, 0.5);
    this.bloodSplat.scale.set(0.2 + Math.random() * 0.1);
    this.bloodSplat.x = 0;
    this.bloodSplat.y = -this.container.height / 4;
    this.container.addChild(this.bloodSplat);
    this.bloodSplat.name = "blood";
    this.bloodSplat.alpha = 0.5 + Math.random() * 0.1;

    this.bloodSplat.onComplete = () => {
      this.bloodSplat.stop();
      this.bloodSplat.visible = false;
    };
  }

  resetAnimationActions() {
    this.actions = {
      meo: false,
      birra: false,
      tirapiedra: false,
      golpe: false,
      recibir_golpe: false,
      pucho: false,
    };
  }

  setAction(action) {
    if (!Object.keys(this.actions).includes(action)) {
      return console.warn("La accion " + action + " no existe");
    }
    for (let a of Object.keys(this.actions)) {
      this.actions[a] = false;
    }

    this.actions[action] = true;
  }

  createDebugContainer() {
    this.debugContainer = new PIXI.Container();
    this.debugContainer.x = -10;
    this.debugContainer.y = -15;

    this.debugText = new PIXI.Text("", {
      fontFamily: "Arial",
      fontWeight: "bold",
      fontSize: 13,
      fill: 0x000000,
      align: "left",
    });

    this.debugContainer.addChild(this.debugText);

    this.container.addChild(this.debugContainer);
  }
  updateDebugText(txt) {
    this.debugText.text = txt;
  }

  fireBullet() {
    if (!this.target || this.dead) return;

    //HERE WE CAN EVALUATE WHAT TYPE OF BULLET, HOW OFTEN, RELOD, ETC

    this.particleSystem.addBullet(this);
  }
  recieveDamageFrom(part, coeficient = 1) {
    // if(this instanceof Civil && part instanceof Ambulancia) debugger
    // this.makeMeFlash();
    if (!part || part.dead) return;
    // console.log(this.team, part.team, this.health);

    let howMuchHealthThisIsTakingFromMe = (part || {}).strength * coeficient;
    //take health:

    this.health -=
      howMuchHealthThisIsTakingFromMe *
      this.particleSystem.MULTIPLIERS.FORCE_REDUCER;

    this.fear +=
      this.intelligence *
      howMuchHealthThisIsTakingFromMe *
      this.particleSystem.MULTIPLIERS.FEAR_REDUCER; //FEAR GOES UP ACCORDING TO INTELLIGENCE. MORE INTELLIGENT, MORE FEAR

    this.anger +=
      this.courage *
      howMuchHealthThisIsTakingFromMe *
      this.particleSystem.MULTIPLIERS.FEAR_REDUCER; //ANGER GOES UP ACCORDING TO courage. MORE courage, YOU GET ANGRIER

    this.frenar();
    this.setAction("recibir_golpe");

    let incomingAngleOfHit = Math.atan2(
      part.pos.y - this.pos.y,
      part.pos.x - this.pos.x
    );

    if (howMuchHealthThisIsTakingFromMe > 0.5) this.bleed(incomingAngleOfHit);
  }

  bleed(angle) {
    this.bloodSplat.rotation = angle;
    this.bloodSplat.gotoAndPlay(0);
    this.bloodSplat.visible = true;
  }

  frenar() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  lookAround() {
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

  update(COUNTER) {
    if (this.REMOVED) return;
    super.update(COUNTER);

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;
    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex =
      Math.floor(this.pos.y - (this.z || 0)) - (this.dead ? 100 : 0);

    this.updateMyPositionInGrid();

    this.lookAround();
    this.cambiarEstadoSegunCosas();
    this.updateMyStats(); //feel
    this.doActions();

    this.checkHowManyPeopleAreAroundAndSeeIfImSqueezingToDeath();

    this.changeSpriteAccordingToStateAndVelocity();
    // }

    // this.animateGravityToParticles();

    // this.emitBlood();
    // if (this.emitter) this.emitter.emit = false;


    this.updateShadowPosition()

    this.render();

    // this.saveLog();
  }

  updateShadowPosition(){
    if(!this.shadow) return
    this.shadow.x=this.pos.x
    this.shadow.y=this.pos.y
  }

  removeMeFromArray() {
    this.particleSystem.people = this.particleSystem.people.filter(
      (k) => k.id != this.id
    );
  }
  removeMatterBodyAfterIDied() {
    this.world.remove(this.engine.world, this.body);
    this.removeMeAsTarget();
  }
  doActions() {
    return console.warn("deberias sobreescribir este metodo");
  }

  throwRock() {
    if (!this.target) return;
    this.lastViolentAct = this.COUNTER;

    this.frenar();
    this.setAction("tirapiedra");
    this.particleSystem.addRock(this);
  }

  checkHowManyPeopleAreAroundAndSeeIfImSqueezingToDeath() {
    let howMany = ((this.cell || {}).particlesHere || []).filter(
      (k) => !k.dead
    ).length;
    if (howMany > 11) {
      this.squeezed = true;
      let evilSqueezingEvilness = {
        strength: 1,
        pos: this.pos,
      };
      this.recieveDamageFrom(evilSqueezingEvilness, (howMany - 11) * 0.007);

      //EMPUJAR RANDOM
      this.pushInARandomDirection();
    } else {
      this.squeezed = false;
    }
  }

  pushInARandomDirection() {
    this.body.force.x += (Math.random() * 1 - 0.5) * (this.strength * 10);
    this.body.force.y += (Math.random() * 1 - 0.5) * (this.strength * 10);
  }

  getHowManyOfPeopleFromCertainTeamICanSee(team) {
    return this.peopleICanSee.filter((k) => k.team == team).length;
  }

  getInfo() {
    return {
      name: this.name,
      state: this.textState,
      target: (this.target || {}).name,

      isStatic: this.isStatic,
      diameter: this.diameter,
      team: this.team,
      courage: this.courage,

      sprite: this.whichSpriteAmIShowing(),
      distanceToClosestEnemy: (this.distanceToClosestEnemy || 0).toFixed(2),
      sight: this.sightDistance.toFixed(2),
      intelligence: this.intelligence.toFixed(2),
      // stamina: this.stamina,
      health: this.health.toFixed(2),
      fear: this.fear.toFixed(2),
      anger: this.anger.toFixed(2),
      prediction: (this.mappedPrediction || 0).toFixed(2),
    };
  }
  saveLog() {
    if (!this.dead) this.log.push(this.getInfo());
    // if(this.log.length>300) this.log.splice(this.log.length)
  }

  getCurrentActions() {
    return Object.keys(this.actions).filter((k) => this.actions[k]);
  }

  changeSpriteAccordingToStateAndVelocity() {
    if (this.dead) return;

    let vel = new p5.Vector(this.body.velocity.x, this.body.velocity.y);

    ///ABOUT MOVEMENT:
    let velLineal = Math.abs(vel.mag());

    if (velLineal < 0.05) {
      //PARADO
      let actionsHappening = this.getCurrentActions();

      //SI HAY ALGUNA ACCION QUE DEBA HACER EL CHABON:
      if (actionsHappening.length > 0) {
        let accion = actionsHappening[actionsHappening.length - 1];

        //CUANDO TERMINA LA ANIMACION SELECCIONADA
        this.image.onComplete = (e) => {
          this.image.onComplete = null;
          //PONGO EN FALSE LA ACCION ESTA EN EL OBJETO DE ACCIONES
          this.resetAnimationActions();
          this.changeSpriteAccordingToStateAndVelocity();
        };

        this.changeAnimation(accion, true);
      } else {
        this.changeAnimation("parado", false);
      }
    } else if (velLineal > 0.05) {
      //EN MOV.
      if (this.state == this.states.HUYENDO) {
        this.changeAnimation("corre", false);
      } else {
        this.changeAnimation("camina", false);
      }
      //SI ESTA CORRIENDO Y TIENE Q HACER ALGUNA ANIMACION, Y ESTA CAMINANDO O CORRIENDO, LA SALTEA
      // this.resetAnimationActions();
    }
  }

  defineVelVectorToMoveTowardsTarget() {
    if (!("x" in this.vel) || !("x" in this.pos)) return;

    if ((this.target || {}).dead || !this.target || !this.target.pos) {
      this.target = null;
      this.vel.x = 0;
      this.vel.y = 0;
      this.vectorThatAimsToTheTarget = null;
      return;
    }

    // OK
    let targetsPosPlusVel = this.target.pos
      .copy()
      .add((this.target.vel || new p5.Vector()).copy());

    this.vectorThatAimsToTheTarget = p5.Vector.sub(targetsPosPlusVel, this.pos);
  }

  sumAllVectors(
    magnitudOfTarget = 0.5,
    magnitudOfFlockingTowardsFriends = 0.25,
    magnitudOfCops = 0.5
  ) {
    // Calculate vector to repel objects, like houses and such
    // this.repelHouses();
    // this.avoidGas();

    this.vecAwayFromGas = this.getVectorToRepelGas();
    this.vecAwayFromObjects = this.getVectorToRepelBlockedCells();

    //MOVE OR REPEL TARGET
    let whereToMoveRegardingTarget;
    if ((this.vectorThatAimsToTheTarget || {}).x) {
      whereToMoveRegardingTarget = this.vectorThatAimsToTheTarget.copy();

      //-1 PORQ SE ALEJA DEL TARGET
      if (
        this.state == this.states.HUYENDO ||
        this.state == this.states.RETROCEDIENDO
      ) {
        whereToMoveRegardingTarget.x *= -1;
        whereToMoveRegardingTarget.y *= -1;
      }
    } else {
      whereToMoveRegardingTarget = { x: 0, y: 0 };
    }
    // console.log(whereToMoveRegardingTarget);

    //FLOCKING PART WITH FRIENDS

    this.vel.x =
      whereToMoveRegardingTarget.x * magnitudOfTarget +
      ((this.vecThatAimsToTheAvg || {}).x || 0) *
        magnitudOfFlockingTowardsFriends +
      ((this.vecAwayFromCops || {}).x || 0) * magnitudOfCops +
      ((this.vecAwayFromObjects || {}).x || 0) +
      ((this.vecAwayFromGas || {}).x || 0);

    this.vel.y =
      whereToMoveRegardingTarget.y * magnitudOfTarget +
      ((this.vecThatAimsToTheAvg || {}).y || 0) *
        magnitudOfFlockingTowardsFriends +
      ((this.vecAwayFromCops || {}).y || 0) * magnitudOfCops +
      ((this.vecAwayFromObjects || {}).y || 0) +
      ((this.vecAwayFromGas || {}).y || 0);

    //LIMITAR LA VELOCIDA A LA VELOCIDAD DEL CHABON, Y SI SE ESTA RAJANDO, UN TOQ MAS
    this.limitVelToSpeed();
    if (isNaN(this.vel.x)) debugger;
  }

  limitVelToSpeed() {
    this.vel.limit(
      this.speed *
        (this.state == this.states.HUYENDO
          ? this.particleSystem.MULTIPLIERS.EXTRA_SPEED_WHEN_ESCAPING
          : 1)
    );
  }

  getVectorToRepelGas() {
    if (!this.cell) return;
    let cellWithMostGas = this.cell
      .getNeighbours()
      .sort((a, b) => (a.gas > b.gas ? -1 : 1))[0];

    if (cellWithMostGas.gas < 0.1) {
      return new p5.Vector(0, 0);
    }

    let vecGas = p5.Vector.sub(
      new p5.Vector(
        cellWithMostGas.x * this.particleSystem.CELL_SIZE,
        cellWithMostGas.y * this.particleSystem.CELL_SIZE
      ),
      this.pos
    );

    vecGas.setMag(2);

    vecGas.x *= -1;
    vecGas.y *= -1;

    return vecGas;
  }

  //   // let dist = cheaperDist(
  //   //   this.vecAwayFromCops.x,
  //   //   this.vecAwayFromCops.y,
  //   //   this.pos.x,
  //   //   this.pos.y
  //   // );

  //   this.vecAwayFromObjects.setMag(1);

  //   this.vecAwayFromObjects.x *= -1;
  //   this.vecAwayFromObjects.y *= -1;

  //   // let goTowardsAvgCenterX=this.vecThatAimsToTheAvg.x * this.intelligence;
  //   // let goTowardsAvgCenterY=this.vecThatAimsToTheAvg.y * this.intelligence;

  //   // this.vel.setMag(1);

  //   return this.vecAwayFromObjects;
  // }

  defineFlockingBehaviorAwayFromCops() {
    if (!this.particleSystem.MULTIPLIERS.DO_FLOCKING) return;
    this.copsClose = this.nearPeople.filter((k) => k.part.team == "poli");
    if (this.copsClose.length == 0) {
      this.vecAwayFromCops = new p5.Vector(0, 0);
      return;
    }
    let avgX = getAvg(this.copsClose.map((k) => k.part.pos.x));
    let avgY = getAvg(this.copsClose.map((k) => k.part.pos.y));

    this.vecAwayFromCops = p5.Vector.sub(new p5.Vector(avgX, avgY), this.pos);

    // let dist = cheaperDist(
    //   this.vecAwayFromCops.x,
    //   this.vecAwayFromCops.y,
    //   this.pos.x,
    //   this.pos.y
    // );

    this.vecAwayFromCops.setMag(1);

    this.vecAwayFromCops.x *= -1;
    this.vecAwayFromCops.y *= -1;

    // let goTowardsAvgCenterX=this.vecThatAimsToTheAvg.x * this.intelligence;
    // let goTowardsAvgCenterY=this.vecThatAimsToTheAvg.y * this.intelligence;

    // this.vel.setMag(1);
  }

  defineFlockingBehaviorTowardsFriends() {
    if (!this.particleSystem.MULTIPLIERS.DO_FLOCKING) return;

    let friendsICanSeeButAreNotInTheCloseArea = this.friendsICanSee.filter(
      (m) => !this.friendsClose.map((k) => k.part).includes(m)
    );

    let avgX = getAvg(
      friendsICanSeeButAreNotInTheCloseArea.map((k) => k.pos.x)
    );
    let avgY = getAvg(
      friendsICanSeeButAreNotInTheCloseArea.map((k) => k.pos.y)
    );

    this.vecThatAimsToTheAvg = p5.Vector.sub(
      new p5.Vector(avgX, avgY),
      this.pos
    );

    if (this.friendsClose.length > 3) {
      this.vecThatAimsToTheAvg.setMag(0);
    } else {
      this.vecThatAimsToTheAvg.setMag(1);
    }

    // if(this.pos.copy().add(this.vel))

    // let goTowardsAvgCenterX=this.vecThatAimsToTheAvg.x * this.intelligence;
    // let goTowardsAvgCenterY=this.vecThatAimsToTheAvg.y * this.intelligence;

    // this.vel.setMag(1);
  }

  throwAPunch() {
    // console.log("#", this.name, "punch");
    // this.setState("attacking");
    this.lastViolentAct = this.COUNTER;
    this.target.recieveDamageFrom(this);
    this.actions.golpe = true;
  }

  die() {
    if (this.dead) return;

    this.setState("muerto");

    this.removeMatterBodyAfterIDied();
    this.removeMeFromArray();

    this.unHighlight();

    this.changeAnimation("muerte", true, true);

    this.health = 0;
    this.cell.removeMe(this);

    this.leaveBloodOnTheGroundAsIDie();

    lastParticle.container.cullable = true;

    this.dead = true;

    // console.log(this.name, " died");
    // this.createSprite("die_1");
  }

  leaveBloodOnTheGroundAsIDie() {
    this.particleSystem.bloodContainer.cacheAsBitmap = false;
    this.container.removeChild(this.bloodSplat);

    this.particleSystem.bloodContainer.addChild(this.bloodSplat);

    this.bloodSplat.x = this.pos.x;
    this.bloodSplat.y = this.pos.y;
    this.bloodSplat.onComplete = null;
    this.bloodSplat.gotoAndPlay(0);
    this.bloodSplat.visible = true;
    this.bloodSplat.rotation = Math.random() * 10;
    this.bloodSplat.scale.set(0.5 + Math.random() * 0.3);
    this.bloodSplat.zIndex = -2;
    this.image.onComplete = () => {
      this.putMyDeadBodyInTheBloodContainer();
      this.particleSystem.bloodContainer.cacheAsBitmap = true;
    };
  }

  putMyDeadBodyInTheBloodContainer() {
    this.container.removeChild(this.image);
    this.particleSystem.bloodContainer.addChild(this.image);
    this.image.x = this.pos.x;
    this.image.y = this.pos.y;

    this.image.zIndex = -1;

    this.container.removeChildren();
    this.particleSystem.mainContainer.removeChild(this.container);
    //LOS PONGO EN NULL ASI EL METODO REMOVE() NO LOS BORRA
    this.image = null;
    delete this.animatedSprites.muerte;

    this.remove();
  }

  makeMeLookLeft() {
    // if (this.COUNTER - this.lastTimeItFlipped < this.spriteSpeed) return;
    this.direction = -1;

    // this.image.x = ;

    if (!this.amILookingLeft) {
      this.lastTimeItFlipped = this.COUNTER;
    }

    this.amILookingLeft = true;
  }

  makeMeLookRight() {
    this.direction = 1;
    // if (this.COUNTER - this.lastTimeItFlipped < this.spriteSpeed) return;

    // this.image.x = -32;

    if (this.amILookingLeft) {
      this.lastTimeItFlipped = this.COUNTER;
    }

    this.amILookingLeft = false;
  }

  render() {
    super.render();

    if (this.actions.tirapiedra && this.target) {
      if (this.target.pos.x > this.pos.x) {
        this.makeMeLookRight();
      } else {
        this.makeMeLookLeft();
      }
      return;
    }

    if (this.vel.x < 0) this.makeMeLookLeft();
    else this.makeMeLookRight();
  }

  setTarget(target) {
    this.target = target;
  }

  findClosestEnemy(team) {
    let arr = this.peopleICanSee
      .filter((k) => k.team == team && !k.dead)
      .map((k) => {
        return {
          dist: cheaperDist(this.pos.x, this.pos.y, k.pos.x, k.pos.y),
          part: k,
        };
      })
      .sort((a, b) => (a.dist > b.dist ? 1 : -1));

    // console.log(arr, this.sightDistance, this.team);

    if (arr.length == 0) {
      this.closestEnemy = null;
      this.distanceToClosestEnemy = null;
      return;
    }

    this.closestEnemy = arr[0].part;
    this.distanceToClosestEnemy = arr[0].dist;

    this.setTarget(this.closestEnemy);
    return this.closestEnemy;
  }

  getNextCellAccordingToMyDirection(numberOfCells) {
    let vector = this.vel
      .copy()
      .setMag(particleSystem.CELL_SIZE * numberOfCells);
    let startingX = this.pos.x;
    let startingY = this.pos.y;
    let x = Math.floor(startingX + vector.x);
    let y = Math.floor(startingY + vector.y);

    return this.particleSystem.getCellAt(x, y);
  }

  createShadow() {
    // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

    //CIRCLE

    let width=this.diameter
    this.shadow = new PIXI.Graphics();
    this.shadow.beginFill("0x000000");
    // this.graphics.alpha = 0.16;
    this.shadow.drawCircle(0, 0, width);
    this.shadow.endFill();
    this.shadow.pivot.set(width/2,width/2);
    // this.graphics.position.y = 40;
    // this.container.addChild(this.graphics);
    this.particleSystem.shadowsContainer.addChild(this.shadow);
  }
}
