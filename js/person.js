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
    const { x, y, particleSystem, team, isStatic, diameter } = opt;
    this.diameter = diameter;
    this.isStatic = isStatic;
    //PARAMS OF THIS PERSON:

    this.initStartingAttributes();
    this.team = team;

    this.spriteWidth = 12;
    this.spriteHeight = 21;
    this.spriteSpeed = Math.floor(5 * this.speed);

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
    this.createContainers();
    this.createDebugContainer();
    this.createSprite("idle_" + this.team);

    this.updateMyPositionInCell();
    // this.addParticleEmitter();
  }
  initStartingAttributes() {
    this.dead = false;
    this.name = generateID();

    this.strength = Math.random() * 0.05 + 0.05;
    this.weight = Math.random() * 50 + 50;

    this.health = 1;
    this.speed = Math.random() * 0.5 + 0.5;
    this.intelligence = Math.random(); //opposite of courage
    this.courage = 1 - this.intelligence;

    this.attackDistance = this.diameter * 2;
    this.sightDistance = Math.random() * 100 + 300;

    this.stamina = 1;
    this.fear = 0;
    this.anger = 0;
    this.happiness = 1;

    //que tan rapido le baja la ira
    this.calma = Math.random() + 0.01;
    //que tan rapido acumula ira ante diferente eventos
    this.irascibilidad = 1 - this.calma;
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
  createContainers() {
    this.container = new PIXI.Container();

    this.particleContainer = new PIXI.ParticleContainer();
    this.particleContainer.zIndex = 1;

    this.container.addChild(this.particleContainer);
    this.particleSystem.mainContainer.addChild(this.container);
  }
  addParticleEmitter() {
    // your imported namespace is
    this.emitter = new PIXI.particles.Emitter(
      // The PIXI.Container to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the root stage Container
      this.particleContainer,
      // Emitter configuration, edit this to change the look
      // of the emitter
      {
        lifetime: {
          min: 0.1,
          max: 1,
        },
        autoUpdate: true,
        frequency: 0.1,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 1,
        maxParticles: 100,
        pos: {
          x: 0,
          y: 10,
        },
        addAtBack: false,
        behaviors: [
          // {
          //   type: "movePath",
          //   config: {
          //     path: "x",
          //     speed: {
          //       list: [
          //         { value: -10, time: 0 },
          //         { value: 100, time: 0.1 },
          //       ],
          //     },
          //     minMult: 0.8,
          //   },
          // },
          {
            type: "scale",
            config: {
              scale: {
                list: [
                  {
                    value: 1,
                    time: 0,
                  },
                  {
                    value: 0.2,
                    time: 1,
                  },
                ],
              },
            },
          },
          {
            type: "color",
            config: {
              color: {
                list: [
                  {
                    value: "dd0000",
                    time: 0,
                  },
                  {
                    value: "ff000055",
                    time: 1,
                  },
                ],
              },
            },
          },
          {
            type: "moveSpeed",
            config: {
              speed: {
                list: [
                  {
                    value: 200,
                    time: 0,
                  },
                  {
                    value: 100,
                    time: 1,
                  },
                ],
                isStepped: false,
              },
            },
          },
          {
            type: "rotationStatic",
            config: {
              min: 0,
              max: -180,
            },
          },
          {
            type: "textureSingle",
            config: {
              texture: PIXI.Texture.from("blood"),
            },
          },

          // {
          //   type: "spawnShape",
          //   config: {
          //     type: "circle",
          //     data: {
          //       x: 0,
          //       y: 10,
          //       radius: 1,
          //     },
          //   },
          // },
        ],
      }
    );
  }

  animateGravityToParticles() {
    this.particleContainer.children.map((k) => {
      k.position.y += 2;
      if (k.position.y > this.spriteHeight * 2) {
        // console.log(k);
        // this.container.parent.addChild(k.texture);

        let blood = new PIXI.Sprite(
          this.particleSystem.res["blood"].texture.clone()
        );
        // this.container.x
        // console.log(this.container.x + k.position.x);
        blood.position.x = this.container.x + k.position.x;
        blood.position.y = this.container.y + k.position.y;

        blood.alpha = 0.6;
        this.container.parent.addChild(blood);

        this.particleContainer.removeChild(k);
      }
    });
  }
  emitBlood(angle) {
    // this.particleContainer.x = this.body.position.x;
    // this.particleContainer.y = this.body.position.y;
    // this.emitter.update(this.particleSystem.getDurationOfOneFrame() * 100000);
    // this.emitter.initBehaviors[3].min = angle;
    // this.emitter.initBehaviors[3].max = angle;
    // this.emitter.emit = true;
  }

  fireBullet() {
    if (!this.target || this.dead) return;

    //HERE WE CAN EVALUATE WHAT TYPE OF BULLET, HOW OFTEN, RELOD, ETC

    this.particleSystem.addBullet(this);
  }
  recieveDamageFrom(part, coeficient = 1) {
    this.makeMeFlash();
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

    let incomingAngleOfHit = Math.atan2(part.pos.y, part.pos.x);

    // this.emitBlood(incomingAngleOfHit);

    // let difX = part.body.position.x - this.body.position.x;
    // let difY = part.body.position.y - this.body.position.y;

    // let dif = new p5.Vector(difX, difY).setMag(1);

    // this.body.position.x -= dif.x * part.strength * 10;
    // this.body.position.y -= dif.y * part.strength * 10;

    // this.makeMeFlash();

    // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  }
  // createBody(radius) {
  //   let bodyOptions = {
  //     restitution: 0.1,
  //     mass: 0.01,
  //     friction: 1,
  //     slop: 0,
  //     frictionAir: 0.5,
  //     label: "particle",
  //     // isSensor: true,
  //     render: { visible: false },
  //     isStatic: false,
  //     // density: 99999999999999
  //     // mass: 0
  //     plugin: {
  //       // attractors: [
  //       //   (bodyA, bodyB) => {
  //       //     let factor = this.getAttractionFactorAccordingToTemperature();
  //       //     let distX = bodyA.position.x - bodyB.position.x;
  //       //     let distY = bodyA.position.y - bodyB.position.y;
  //       //     return {
  //       //       x: (bodyA.position.x - bodyB.position.x) * 1e-6 * factor,
  //       //       y: (bodyA.position.y - bodyB.position.y) * 1e-6 * factor,
  //       //     };
  //       //   },
  //       // ],
  //     },
  //   };

  //   this.body = this.Matter.Bodies.circle(
  //     this.pos.x,
  //     this.pos.y,
  //     radius || this.diameter,
  //     bodyOptions
  //   );

  //   this.body.constraints = []; //i need to keep track which constraints each body has
  //   this.body.particle = this;

  //   this.world.add(this.engine.world, [this.body]);
  // }

  lookAround() {
    if (this.oncePerSecond()) {
      this.seePeople();
      this.evaluateSituation();

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
  checkIfImNotConsideredViolentAnyMore() {
    if (this.lastViolentAct == null) return;
    if (
      this.COUNTER - this.lastViolentAct >
      this.particleSystem.MULTIPLIERS
        .CANTIDAD_DE_FRAMES_PARA_DEJAR_DE_SER_UN_VIOLENTO
    ) {
      this.lastViolentAct = null;
    }
  }
  update(COUNTER) {
    super.update(COUNTER);

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;
    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex = Math.floor(this.pos.y - (this.z || 0));

    this.checkIfImNotConsideredViolentAnyMore();

    this.updateMyPositionInCell();

    this.lookAround();

    // if (this.isItMyFrame()) this.evaluateSituation();

    if (!this.dead) {
      if (this.isItMyFrame()) this.updateMyStats(); //feel
      this.finiteStateMachine(); //change state/mood
      this.doActions(); //do
      this.checkHowManyPeopleAreAroundAndSeeIfImSqueezingToDeath();
    }
    this.changeSpriteAccordingToStateAndVelocity();
    // }

    this.animateSprite();
    this.animateGravityToParticles();

    // this.emitBlood();
    // if (this.emitter) this.emitter.emit = false;

    this.render();

    this.saveLog();
  }
  doActions() {
    return console.warn("deberias sobreescribir este metodo");
  }

  throwRock() {
    this.lastViolentAct = this.COUNTER;
    if (!this.target) return;

    //HERE WE CAN EVALUATE WHAT TYPE OF BULLET, HOW OFTEN, RELOD, ETC

    this.particleSystem.addRock(this);
  }

  checkHowManyPeopleAreAroundAndSeeIfImSqueezingToDeath() {
    let howMany = ((this.cell || {}).particlesHere || []).filter(
      (k) => !k.dead
    ).length;
    if (howMany > 11) {
      let evilSqueezingEvilness = {
        strength: 1,
        pos: this.pos,
      };
      this.recieveDamageFrom(evilSqueezingEvilness, (howMany - 11) * 0.007);
    }
  }
  evaluateSituation() {
    // let time = performance.now();

    this.enemiesICanSee = this.peopleICanSee.filter((k) => k.team != this.team);

    this.friendsICanSee = this.peopleICanSee.filter((k) => k.team == this.team);

    let val =
      (this.friendsICanSee.length + 1) / (this.enemiesICanSee.length + 1);

    this.prediction = val;
    this.mappedPrediction = mapLogExpValuesTo1(val);
    // console.log(performance.now() - time, "XXXXXXX");

    // //COMBINACION DE MIEDO, VIDA, ENEMIGOS CERCA, ETC
    // this.arrogance =
    //   (this.prediction *
    //     (this.anger + this.health - this.fear + this.courage)) /
    //   4;
  }

  getNumberOfEnemiesRunningAway() {
    return this.peopleICanSee.filter(
      (k) => k.state == this.states.HUYENDO && k.team != this.team
    ).length;
  }
  getHowManyOfPeopleFromCertainTeamICanSee(team) {
    return this.peopleICanSee.filter((k) => k.team == team).length;
  }
  updateMyStats() {
    // miedo -= prediccion *k //mis amigos me sacan el miedo

    if (this.mappedPrediction > 0) {
      //hay mas amigos q enemigos
      this.fear -=
        this.mappedPrediction *
        this.particleSystem.MULTIPLIERS.FEAR_RECOVERY_REDUCER *
        this.courage;
    } else if (this.mappedPrediction < 0) {
      //hay mas enemigos
      this.fear -=
        this.mappedPrediction *
        this.particleSystem.MULTIPLIERS.FEAR_RECOVERY_REDUCER *
        (1 - this.courage);
    }

    // miedo+= (1-salud)*(1-coraje) *k //si me lastimaron, me sube el miedo
    this.fear +=
      (1 - this.health) *
      (1 - this.courage) *
      this.particleSystem.MULTIPLIERS.FEAR_INCREASE_DUE_TO_HEALTH;

    // miedo-=enemigosBienCerca.filter(k=>estado==this.states.HUYENDO).length * k
    this.fear -=
      this.getNumberOfEnemiesRunningAway() *
      this.particleSystem.MULTIPLIERS.FEAR_RECOVERY_REDUCER;

    this.anger -=
      this.calma * this.particleSystem.MULTIPLIERS.ANGER_RECOVERY_REDUCER;

    if (this.health > 0.1) {
      this.health += this.particleSystem.MULTIPLIERS.HEALTH_RECOVERY_REDUCER;
    }

    if (this.health > 1) this.health = 1;
    if (this.anger < 0) this.anger = 0;
    if (this.anger > 1) this.anger = 1;
    if (this.fear < 0) this.fear = 0;
    if (this.fear > 1) this.fear = 1;
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

  changeSpriteAccordingToStateAndVelocity() {
    let vel = new p5.Vector(this.body.velocity.x, this.body.velocity.y);

    if (this.state == "dead" || this.dead) {
      //EMPIEZA A MORIR
      this.createSprite("die_" + this.team, true);
      //Y MUERE
      // setTimeout(
      //   () => this.createSprite("dead_1"),
      //   this.particleSystem.getDurationOfOneFrame() * 7
      // );
    } else if (this.state == "attacking") {
      this.createSprite("attack_" + this.team);
    } else if (
      this.state == "searching" ||
      this.state == "chasing" ||
      this.state == "escaping" ||
      this.state == "idle"
    ) {
      if (this.whichSpriteAmIShowing().startsWith("attack")) {
        this.createSprite("idle_" + this.team);
      }
    }

    ///ABOUT MOVEMENT:

    if (Math.abs(vel.mag()) > 0.05) {
      //IT'S IDLE AND STARTS TO WALK
      if (
        this.whichSpriteAmIShowing().startsWith("idle")
        //|| this.whichSpriteAmIShowing().startsWith("attack")
      ) {
        this.createSprite("walk_" + this.team);
      }
    } else if (Math.abs(vel.mag()) < 0.05) {
      //it's not moving
      if (this.whichSpriteAmIShowing().startsWith("walk")) {
        //and the sprite is still walking
        this.createSprite("idle_" + this.team);
      }
    }
  }

  ImTotallyDead() {
    this.world.remove(this.engine.world, this.body);

    // this.particleSystem.people = this.particleSystem.people.filter(
    //   (k) => k.body.id != this.body.id
    // );

    this.particleSystem.mainContainer.removeChild(this.graphics);

    this.removeMeAsTarget();
  }

  defineVelVectorToMove() {
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
    this.repelHouses();
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
      ((this.vecAwayFromObjects || {}).x || 0);

    this.vel.y =
      whereToMoveRegardingTarget.y * magnitudOfTarget +
      ((this.vecThatAimsToTheAvg || {}).y || 0) *
      magnitudOfFlockingTowardsFriends +
      ((this.vecAwayFromCops || {}).y || 0) * magnitudOfCops +
      ((this.vecAwayFromObjects || {}).y || 0);

    //LIMITAR LA VELOCIDA A LA VELOCIDAD DEL CHABON, Y SI SE ESTA RAJANDO, UN TOQ MAS
    this.vel.limit(
      this.speed *
      (this.state == this.states.HUYENDO
        ? this.particleSystem.MULTIPLIERS.EXTRA_SPEED_WHEN_ESCAPING
        : 1)
    );

    if (isNaN(this.vel.x)) debugger;
  }

  doTheWalk() {
    // let minStam = this.particleSystem.MINIMUM_STAMINA_TO_MOVE;
    if (this.isStatic) return;
    // if (this.state == "bancando") return;
    // if (this.stamina >= minStam) {
    //SI ESTA ESCAPANDOSE VA MAS RAPIDO
    let forceToApplyInX =
      this.vel.x * this.particleSystem.MULTIPLIERS.SPEED_REDUCER;
    let forceToApplyInY =
      this.vel.y * this.particleSystem.MULTIPLIERS.SPEED_REDUCER;

    // console.log("##", forceToApplyInX, forceToApplyInY);
    this.body.force.x = forceToApplyInX;
    this.body.force.y = forceToApplyInY;

    // this.stamina -= minStam * 0.1;
    // } else {
    //   this.stamina += minStam;
    // }
  }

  repelHouses() {
    if (!this.particleSystem.MULTIPLIERS.DO_FLOCKING) return;

    if (this.closeFixedObjects.length == 0) {
      this.vecAwayFromObjects = new p5.Vector(0, 0);
      return;
    }

    let avgX = getAvg(this.closeFixedObjects.map((k) => k.pos.x));
    let avgY = getAvg(this.closeFixedObjects.map((k) => k.pos.y));

    this.vecAwayFromObjects = p5.Vector.sub(
      new p5.Vector(avgX, avgY),
      this.pos
    );

    // let dist = cheaperDist(
    //   this.vecAwayFromCops.x,
    //   this.vecAwayFromCops.y,
    //   this.pos.x,
    //   this.pos.y
    // );

    this.vecAwayFromObjects.setMag(1);

    this.vecAwayFromObjects.x *= -1;
    this.vecAwayFromObjects.y *= -1;

    // let goTowardsAvgCenterX=this.vecThatAimsToTheAvg.x * this.intelligence;
    // let goTowardsAvgCenterY=this.vecThatAimsToTheAvg.y * this.intelligence;

    // this.vel.setMag(1);
  }

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
    let avgX = getAvg(this.friendsICanSee.map((k) => k.pos.x));
    let avgY = getAvg(this.friendsICanSee.map((k) => k.pos.y));

    this.vecThatAimsToTheAvg = p5.Vector.sub(
      new p5.Vector(avgX, avgY),
      this.pos
    );

    if (this.friendsClose.length > 3 || this.cell.particlesHere > 2) {
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
  }

  die() {
    if (this.dead) return;
    this.unHighlight();

    this.body.isStatic = true;
    this.health = 0;

    // console.log(this.name, " died");
    // this.createSprite("die_1");

    setTimeout(() => {
      this.setState("muerto");
      this.dead = true;
    }, this.particleSystem.deltaTime * 4);

    // setTimeout(() => this.remove(), 1000);
  }

  makeMeLookLeft() {
    // if (this.COUNTER - this.lastTimeItFlipped < this.spriteSpeed) return;
    this.direction = -1;

    // this.image.x = 6;

    if (!this.amILookingLeft) {
      this.lastTimeItFlipped = this.COUNTER;
    }

    this.amILookingLeft = true;
  }

  makeMeLookRight() {
    this.direction = 1;
    // if (this.COUNTER - this.lastTimeItFlipped < this.spriteSpeed) return;

    // this.image.x = -9;

    if (this.amILookingLeft) {
      this.lastTimeItFlipped = this.COUNTER;
    }

    this.amILookingLeft = false;
  }

  render() {
    super.render();

    if (this.vel.x < 0) this.makeMeLookLeft();
    else this.makeMeLookRight();
  }

  setTarget(target) {
    this.target = target;
  }

  seePeople() {
    // let time = performance.now();
    let offset = Math.floor(this.sightDistance / this.particleSystem.CELL_SIZE);
    //ya q estamos lo guardo
    this.peopleICanSee = this.findClosePeople(offset, offset);

    // console.log(performance.now() - time, "XXXXXXX");
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

  checkIfTheresSomeoneInTheWay(team) {
    let vector = this.vel.copy().setMag(particleSystem.CELL_SIZE);
    let startingX = this.pos.x;
    let startingY = this.pos.y;

    for (let i = 0; i < 50; i++) {
      // console.log(vector, tempPos.copy());
      let x = startingX + vector.x * i;
      let y = startingY + vector.y * i;
      let objects = this.particleSystem.getObjectsAt(x, y);

      // let cellX = Math.floor(x / this.particleSystem.CELL_SIZE);
      // let cellY = Math.floor(y / this.particleSystem.CELL_SIZE);
      // let cell = (this.particleSystem.grid[cellY] || [])[cellX];
      // if (!cell) return console.warn("end");
      // cell.highlight();

      if (objects.length == 0) return [];

      let peopleFromSelectedTeam = objects.filter((k) => k.team == team);
      if (peopleFromSelectedTeam.length > 0) {
        return peopleFromSelectedTeam;
      }
    }

    return [];
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

  // getClosePeopleWithWebWorkers() {
  //   let dataToSend = {
  //     people: this.particleSystem.saveLevel(),
  //     myX: this.pos.x,
  //     myY: this.pos.y,
  //     maxSight: this.sightDistance,
  //   };

  //   mandarAProcesarEnSegundoPlano("findClosePeople", dataToSend, (e) => {
  //     // console.log("volvio la data", e);
  //     this.nearPeople = e.resp
  //       .filter((k) => k.dist < this.sightDistance)
  //       .map((p) => {
  //         return {
  //           part: this.particleSystem.getPersonByID(p.id),
  //           dist: p.dist,
  //         };
  //       });
  //   });
  // }
  createCircleInPixi() {
    // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

    //CIRCLE
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x220000");
    this.graphics.drawCircle(0, 0, this.diameter);
    this.graphics.endFill();
    this.container.addChild(this.graphics);
  }
  createShadow() {
    // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

    //CIRCLE
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x000000");
    this.graphics.alpha = 0.16;
    this.graphics.drawEllipse(0, 0, this.diameter * 0.82, this.diameter / 4);
    this.graphics.endFill();
    this.graphics.position.x = 10;
    this.graphics.position.y = 40;
    this.container.addChild(this.graphics);
  }
}
