// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class GenericObject {
  states = {};
  constructor(opt) {
    // this.pepe();
    const { x, y, particleSystem, team, isStatic, diameter, scaleX } = opt;

    this.opt = opt;
    this.type = this.constructor.name;
    this.particleSystem = particleSystem;
    this.Matter = particleSystem.Matter;
    this.engine = particleSystem.engine;
    this.isStatic = isStatic;
    this.world = particleSystem.world;
    this.DISPLACEMENT_X = 0.4;
    this.id = Math.floor(Math.random() * 9999999999999);

    //INIT STUFF:
    this.pos = new p5.Vector(parseInt(x), parseInt(y));
    this.visible = true;
    this.initialScale = this.scale = 1;
    this.direction = scaleX ? scaleX : 1;
    this.image = null;
    this.startingFrame = randomInt(6);
    this.maxLuckyNumbers = 25;
    this.myLuckyNumber = randomInt(this.maxLuckyNumbers - 1);
    this.drawTargetLine = false; //true;

    this.currentAnimation = null; //"parado";
    this.animatedSprites = {};
    this.createContainers();
    this.cellsOccupied = [];

    // this.createBody(10);
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

  isItMyFrame() {
    return this.COUNTER % 7 == this.startingFrame;
  }
  oncePerSecond() {
    return this.COUNTER % this.maxLuckyNumbers == this.myLuckyNumber;
  }

  getFullwidthOfCurrentSprite() {
    return (
      (this.particleSystem.res[this.whichSpriteAmIShowing()] || {}).data || {}
    ).width;
  }
  discernirAmigosYEnemigosYEvaluarLaSituacion() {
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

  seePeople() {
    // let time = performance.now();
    let offset = Math.floor(this.sightDistance / this.particleSystem.CELL_SIZE);
    //ya q estamos lo guardo
    this.peopleICanSee = this.findClosePeople(offset, offset);

    // console.log(performance.now() - time, "XXXXXXX");
  }

  whichSpriteAmIShowing() {
    // return this.currentAnimation;
    // return (
    //   ((((this.image || {}).texture || {}).baseTexture || {}).textureCacheIds ||
    //     [])[0] || ""
    // );

    return this.currentAnimation;
  }

  createBody(
    width,
    height,
    type,
    label,
    angle = 0,
    isStatic = false,
    mass = 10,
    scaleY = 1
  ) {
    // console.log(mass);
    let bodyOptions = {
      restitution: 0.1,
      mass: mass, //peso en kg? de esto depende la fuerza q tengamos q meterle para q caminen
      friction: 0.9,
      slop: 0.05,
      frictionAir: 0.5,
      label: label || "particle",
      // isSensor: true,
      render: {
        visible: true,
        fillStyle:
          this.team == "boca"
            ? "blue"
            : this.team == "river"
            ? "white"
            : "yellow",
      },
      isStatic: false,
      // density: 99999999999999
      // mass: 0
      plugin: {
        // attractors: [
        //   (bodyA, bodyB) => {
        //     let factor = this.getAttractionFactorAccordingToTemperature();
        //     let distX = bodyA.position.x - bodyB.position.x;
        //     let distY = bodyA.position.y - bodyB.position.y;
        //     return {
        //       x: (bodyA.position.x - bodyB.position.x) * 1e-6 * factor,
        //       y: (bodyA.position.y - bodyB.position.y) * 1e-6 * factor,
        //     };
        //   },
        // ],
      },
    };

    // debugger;

    if (type == "circle") {
      this.body = this.Matter.Bodies.circle(
        this.pos.x,
        this.pos.y,
        width,
        bodyOptions
      );
    } else if (type == "rectangle") {
      this.body = this.Matter.Bodies.rectangle(
        this.pos.x,
        this.pos.y,
        width,
        height,
        bodyOptions
      );
    }

    this.body.constraints = []; //i need to keep track which constraints each body has
    this.body.particle = this;

    this.world.add(this.engine.world, [this.body]);

    Matter.Body.setAngle(this.body, degreesToRadians(angle));
    Matter.Body.scale(this.body, 1, scaleY);

    this.body.isStatic = isStatic;
  }

  getMyAbsolutePosition() {
    return {
      x: this.pos.x + this.particleSystem.mainContainer.x,
      y: this.pos.y + this.particleSystem.mainContainer.y,
    };
  }

  getRatioOfX() {
    return this.getMyAbsolutePosition().x / this.particleSystem.viewportWidth;
  }

  getRatioOfY() {
    return this.getMyAbsolutePosition().y / this.particleSystem.viewPortHeight;
  }
  doNotShowIfOutOfScreen() {
    if (
      this.ratioOfY < -0.1 ||
      this.ratioOfY > 1.1 ||
      this.ratioOfX > 1.1 ||
      this.ratioOfX < -0.1
    ) {
      this.visible = false;
    } else {
      this.visible = true;
    }
    this.container.visible = this.visible;
    return this.visible;
  }

  calculateScaleAccordingToY() {
    // DEFINE SCALE

    let dif =
      this.particleSystem.maxScaleOfSprites -
      this.particleSystem.minScaleOfSprites;

    this.scale = Math.pow(dif, this.ratioOfY);
    // this.scale = dif * this.ratioOfY + this.particleSystem.minScaleOfSprites;

    //SCALE.Y DOESN'T DEPEND ON WHICH SIDE THE PARTICLE IS WALKING TOWARDS
  }

  calculateContainersX() {
    if (!this.particleSystem.doPerspective) return this.pos.x;
    let amount = this.particleSystem.viewportWidth * this.DISPLACEMENT_X;
    let factor = this.scale * amount;
    return this.pos.x + (this.ratioOfX - 0.5) * factor;
  }
  getHeight() {
    let ret;
    try {
      ret = this.image.texture.baseTexture.height;
    } catch (e) {
      ret = this.graphics.height;
    }
    return ret;
  }
  calculateContainersY() {
    if (!this.particleSystem.doPerspective) return this.pos.y;

    let y = this.pos.y - this.getHeight() * 2;

    let yFactor = this.scale * this.particleSystem.worldPerspective;

    // let ret;
    let cameraY = -this.container.parent.y;
    let whatToReturnIfWeDoPerspective = (y - cameraY) * yFactor + cameraY;
    // let whatToReturnIfWeDoPerspective = 0.1 * this.scale * y;

    return whatToReturnIfWeDoPerspective;
  }

  doTheWalk() {
    // if (this.getCurrentActions().length) return;

    if (this.isStatic) return;

    //SI ESTA ESCAPANDOSE VA MAS RAPIDO
    let forceToApplyInX =
      this.vel.x * this.particleSystem.MULTIPLIERS.SPEED_REDUCER;
    let forceToApplyInY =
      this.vel.y * this.particleSystem.MULTIPLIERS.SPEED_REDUCER;

    this.body.force.x = forceToApplyInX;
    this.body.force.y = forceToApplyInY;
  }

  update(COUNTER) {
    this.COUNTER = COUNTER;
    this.ratioOfY = this.getRatioOfY();
    this.ratioOfX = this.getRatioOfX();

    // if (this.oncePerSecond()) console.log(this.name, performance.now());
  }
  render() {
    // if (!this.doNotShowIfOutOfScreen()) return;

    //POSICION X E Y
    this.container.y = this.pos.y; // this.calculateContainersY();
    this.container.x = this.pos.x; //this.calculateContainersX();

    //ESCALA, SI HACEMOS LA MOVIDA DE LA PERSPOECTIVA
    /* if (this.particleSystem.doPerspective) {
      this.calculateScaleAccordingToY();
      this.image.scale.y = this.scale;
      this.image.scale.x = this.direction * this.scale;
    } else {*/
    // this.scale = this.initialScale;
    if (!this.image || this.image.destroyed) return;

    this.image.scale.x = (this.direction || 1) * this.scale;
    this.image.scale.y = this.scale;
    //}

    // if (this.direction == -1) {
    //   this.image.x = 15;
    // } else {
    //   this.image.x = -15;
    // }

    this.ifHighlightedTintRed();

    // this.drawLineBetweenMeAndTarget();
  }

  highlight() {
    this.highlighted = true;
  }
  unHighlight() {
    this.highlighted = false;
  }

  getFutureCell(lookAheadFrames = 50) {
    let futurePosition = this.pos
      .copy()
      .add(
        new p5.Vector(this.body.velocity.x, this.body.velocity.y).mult(
          lookAheadFrames
        )
      );

    this.futureCell = this.particleSystem.getCellAt(
      futurePosition.x,
      futurePosition.y
    );
  }
  getVectorToRepelBlockedCells() {
    let vec = new p5.Vector();
    let count = 0;

    if (!this.futureCell) {
      return vec;
    }

    this.futureCell
      .getNeighbours()
      .filter((k) => k.blocked)
      .forEach((k) => {
        count++;
        vec.x += k.centerX;
        vec.y += k.centerY;
      });

    if (count) {
      // console.log(1);
      vec.x /= count;
      vec.y /= count;

      vec.sub(this.pos).setMag(-1);
    }

    return vec;
  }

  removeMeAsTarget() {
    let particlesWithMeAsTarget = this.particleSystem.people.filter(
      (k) => k.target == this
    );
    if (particlesWithMeAsTarget.length > 0) {
      particlesWithMeAsTarget.map((k) => k.setTarget(null));
    }
  }
  updateMyPositionInGrid() {
    if (this.dead) return;
    // let ret;

    this.cellX = Math.floor(this.pos.x / this.particleSystem.CELL_SIZE);
    this.cellY = Math.floor(this.pos.y / this.particleSystem.CELL_SIZE);
    if (isNaN(this.cellY)) {
      return;
    }
    let newCell = (this.particleSystem.grid[this.cellY] || [])[this.cellX];

    if (this.cell && newCell && this.cell == newCell) {
      //you're already here
      return;
    }

    if (this.cell) this.cell.removeMe(this);

    try {
      this.cell = newCell;
      this.cell.addMe(this);
    } catch (e) {
      console.error("this particle is not in any cell", this.cellX, this.cellY);
      this.remove();
      // debugger;
    }

    // return ret;
  }

  remove() {
    // console.log("removing", this);
    this.dead = true;
    if (this.cell) this.cell.removeMe(this);

    this.removeMeAsTarget();

    // for (let constr of this.body.constraints) {
    //   this.world.remove(this.engine.world, constr);
    // }

    if (this.graphics)
      this.particleSystem.mainContainer.removeChild(this.graphics);
    this.particleSystem.mainContainer.removeChild(this.container);

    if (this.body) {
      this.world.remove(this.engine.world, this.body);
    }

    if (this.image) this.image.destroy();

    this.particleSystem.people = this.particleSystem.people.filter(
      (k) => k.id != this.id
    );

    this.particleSystem.fixedObjects = this.particleSystem.fixedObjects.filter(
      (k) => k.id != this.id
    );

    this.particleSystem.grounds = this.particleSystem.grounds.filter(
      (k) => k.id != this.id
    );

    // if ((opt || {}).leaveAshes) {
    // }
  }
  getParticlesFromCell() {
    if (!this.cell) return;
    return this.cell.particlesHere;
  }

  findClosePeople(xMargin, yMargin) {
    // let tiempo = performance.now();

    let ret = this.particleSystem
      .getPeopleAndCars()
      .filter(
        (k) =>
          k.cellX > this.cellX - xMargin &&
          k.cellX < this.cellX + xMargin &&
          k.cellY > this.cellY - yMargin &&
          k.cellY < this.cellY + yMargin &&
          !k.dead
      );

    // console.log("###", performance.now() - tiempo);
    return ret;
  }

  drawLineBetweenMeAndTarget() {
    // console.log("line", obj.pos.x, obj.pos.y);
    if (this.targetLine) this.container.removeChild(this.targetLine);

    if (
      !this.drawTargetLine ||
      !this.target ||
      this.dead ||
      !this.target.pos ||
      !(this.target.pos || {}).x
    ) {
      return;
    }

    this.targetLine = new PIXI.Graphics();
    this.container.addChild(this.targetLine);

    // Move it to the beginning of the line
    // this.targetLine.position.set(0, 0);

    // Draw the line (endPoint should be relative to myGraph's position)

    let relativePosition = {
      x: this.target.pos.x - this.pos.x,
      y: this.target.pos.y - this.pos.y,
    };

    this.targetLine.alpha = 0.5;

    this.targetLine
      .lineStyle(3, 0xffffff)
      .lineTo(relativePosition.x, relativePosition.y);

    // this.targetLine.opa
  }

  updateMyStats() {
    if (!this.isItMyFrame()) return;
    // miedo -= prediccion *k //mis amigos me sacan el miedo

    if (this.mappedPrediction > 0) {
      //hay mas amigos q enemigos
      this.fear -=
        this.mappedPrediction *
        this.particleSystem.MULTIPLIERS.FEAR_RECOVERY_REDUCER *
        this.courage;
    } else if (this.mappedPrediction < 0) {
      //hay mas enemigos
      //CUANDO HAY MUCHOS ENEMIGOS, EL MIEDO SUBE RAPIDO
      this.fear -=
        this.mappedPrediction *
        100 *
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

  checkIfTheresSomeoneInTheWay(team) {
    let vector = new p5.Vector(
      this.body.velocity.x,
      this.body.velocity.y
    ).setMag(particleSystem.CELL_SIZE);
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
  getNumberOfEnemiesRunningAway() {
    return this.peopleICanSee.filter(
      (k) => k.state == this.states.HUYENDO && k.team != this.team
    ).length;
  }

  getVectorAwayFromGroup(arrOfTeam, mult = 1, options) {
    // if(this instanceof Civil) debugger
    let entities = [];

    if ((options || {}).useFuturePositionNearPeople) {
      entities = this.futureCell
        ? this.futureCell.getParticlesFromHereAndNeighboorCells()
        : [];
    } else {
      if ((options || {}).onlyNearPeople) {
        entities = this.nearPeople
          .map((k) => k.part)
          .filter((k) => arrOfTeam.includes(k.team) && k != this);
      } else {
        entities = this.peopleICanSee.filter(
          (k) => arrOfTeam.includes(k.team) && k != this
        );
      }

      if ((options || {}).discardNearPeople) {
        entities = entities.filter(
          (m) => !this.nearPeople.map((k) => k.part).includes(m)
        );
      }
    }
    if (entities.length == 0) {
      return new p5.Vector(0, 0);
    }

    let avgX = getAvg(entities.map((k) => k.pos.x));
    let avgY = getAvg(entities.map((k) => k.pos.y));

    let vecAway = p5.Vector.sub(new p5.Vector(avgX, avgY), this.pos);

    vecAway.setMag(1);

    vecAway.mult(mult);

    return vecAway;
  }

  moverseUnPoquitoRandom() {
    let mult = Math.random() * 1.5;
    if (this.oncePerSecond() && Math.random() > 0.3) {
      this.vel.x = (Math.random() - 0.5) * mult;
      this.vel.y = (Math.random() - 0.5) * mult;
    }
  }

  getParticlesFromCloseCells() {
    if (!this.cell) return [];

    let ret = this.cell
      .getParticlesFromHereAndNeighboorCells()
      .map((k) => {
        return {
          dist: cheaperDist(this.pos.x, this.pos.y, k.pos.x, k.pos.y),
          part: k,
        };
      })
      .sort((a, b) => (a.dist > b.dist ? 1 : -1))
      .filter((k) => k.part != this && !k.part.dead);

    // console.log("###", performance.now() - tiempo);
    return ret;
  }

  makeMeFlash() {
    // this.highlight();
    // setTimeout(() => this.unHighlight(), this.particleSystem.deltaTime);
    this.image.tint = 0xff0000;
    setTimeout(() => {
      this.image.tint = 0xffffff;
    }, 100);
  }

  createAnimatedSprite(which, startingAnimationID, stopAtEnd) {
    this.spritesheet = this.particleSystem.res[which];

    let animations = Object.keys(this.spritesheet.animations);

    // console.log("##", this.spritesheet, animations);

    if (!startingAnimationID) startingAnimationID = animations[0];

    for (let i = 0; i < animations.length; i++) {
      let animatedSprite = new PIXI.AnimatedSprite(
        this.spritesheet.animations[animations[i]]
      );
      this.animatedSprites[animations[i]] = animatedSprite;

      animatedSprite.name = animations[i];
      this.container.addChild(animatedSprite);

      animatedSprite.animationSpeed = (this.speed || 1) * 0.2;

      animatedSprite.scale.set(this.initialScale);
      animatedSprite.visible = false;
    }
    this.changeAnimation(startingAnimationID, stopAtEnd);
  }

  changeAnimation(which, stopAtEnd = false, force) {
    if (!force && performance.now() - this.lastTimeChangedAnimation < 300) {
      return;
    }

    if (this.currentAnimation === which) {
      return;
    }
    // console.log("changeAnimation", this.name, which, this.currentAnimation)

    // var newAnim = this.spritesheet.animations[which];

    // console.trace("##", which)

    if (this.image) this.image.visible = false;
    this.image = this.animatedSprites[which];
    this.image.visible = true;

    this.image.gotoAndPlay(0);
    this.image.loop = !stopAtEnd;
    this.currentAnimation = which;
    this.lastTimeChangedAnimation = performance.now();
  }

  // createSprite(which, stopsAtEnd) {
  //   if (
  //     this.whichSpriteAmIShowing().startsWith(which.substr(0, which.length - 2))
  //   ) {
  //     //IF THIS PARTICLE ALRADY HAD THIS SPRITE, DONT DO ANYTHING
  //     return;
  //   }

  //   this.shouldSpriteAnimationStopAtEnd = stopsAtEnd;
  //   this.animationStartedAt = this.COUNTER;

  //   this.removeImage();
  //   //IMG
  //   const frame1 = new PIXI.Rectangle(
  //     0,
  //     0,
  //     this.image.width,
  //     this.image.height
  //   );

  //   // this.particleSystem.res["walk"].texture.frame = frame1; //esto tiene q ser una copia de la textura, no la mismisima
  //   // console.log("###", which);
  //   this.image = new PIXI.Sprite(
  //     this.particleSystem.res[which].texture.clone()
  //   );

  //   this.image.pivot.y = 0;
  //   this.image.pivot.x = 32;

  //   this.image.texture.frame = frame1;

  //   this.container.addChildAt(this.image, 0);
  // }
  changeSizeOfPhysicsCircle(radius) {
    if (this.body) {
      this.world.remove(this.engine.world, this.body);
    }
    this.createBody(radius);
  }
  setState(state) {
    this.state = state;

    let keys = Object.keys(this.states);
    let textState;
    for (let key of keys) {
      if (this.states[key] == state) textState = key;
    }

    this.textState = textState;
  }

  addTempCircleAt00() {
    let cuadraditoTemporal = new PIXI.Graphics();
    cuadraditoTemporal.beginFill();
    cuadraditoTemporal.fill.color = 0;
    cuadraditoTemporal.drawCircle(0, 0, 2);
    cuadraditoTemporal.endFill();
    this.container.addChild(cuadraditoTemporal);
    cuadraditoTemporal.zIndex = 999999;
  }
  alignSpriteForIsometricView() {
    this.image.pivot.x = +this.image.width / 2;
    this.image.pivot.y = +this.image.height - this.image.width / 4;
  }
  alignSpriteMiddleBottom() {
    this.image.pivot.x = +this.image.width / (this.initialScale * 2);
    this.image.pivot.y = +this.image.height / this.initialScale;

    if (this.animatedSprites) {
      for (let as of Object.keys(this.animatedSprites)) {
        this.animatedSprites[as].pivot.x = this.image.pivot.x;
        this.animatedSprites[as].pivot.y = this.image.pivot.y;
      }
    }
  }
  calcularAngulo() {
    this.angulo =
      (rad2deg(Math.atan2(this.body.velocity.x, this.body.velocity.y)) -
        90 +
        360) %
      360;

    return this.angulo;
  }
  alignSpriteMiddleCenter() {
    this.image.pivot.x = +this.image.width / (this.initialScale * 2);
    this.image.pivot.y = +this.image.height / (this.initialScale * 2);

    if (this.animatedSprites) {
      for (let as of Object.keys(this.animatedSprites)) {
        this.animatedSprites[as].pivot.x = this.image.pivot.x;
        this.animatedSprites[as].pivot.y = this.image.pivot.y;
      }
    }
  }

  createParticleContainer() {
    this.particleContainer = new PIXI.ParticleContainer();
    this.particleContainer.zIndex = 1;

    this.container.addChild(this.particleContainer);
  }
  createContainers() {
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;

    this.container.name = this.constructor.name;
    this.container.owner = this;

    // this.container.pivot.set(this.image.width / 2, this.image.height);

    // cuadraditoTemporal.rectangle()
    // this.particleContainer.zIndex = 1;

    // this.container.addChild(this.particleContainer);
    this.particleSystem.mainContainer.addChild(this.container);

    // this.addTempCircleAt00();
  }

  getCellsALargeObjectIsAt() {
    let numberOfCellsInX = Math.ceil(
      this.container.width / this.particleSystem.CELL_SIZE
    );
    let numberOfCellsInY = Math.ceil(
      this.container.height / this.particleSystem.CELL_SIZE
    );
    let cells = [];

    for (let x = 0; x < numberOfCellsInX; x++) {
      for (let y = 0; y < numberOfCellsInY; y++) {
        cells.push(
          this.particleSystem.getCellAt(
            this.pos.x - this.image.pivot.x + x * this.particleSystem.CELL_SIZE,
            this.pos.y - this.image.pivot.y + y * this.particleSystem.CELL_SIZE
          )
        );
      }
    }

    return cells;
  }

  updateMyPositionInGridForLargerObjects() {
    for (let c of this.cellsOccupied) {
      c.removeMe(this);
    }
    this.cellsOccupied = [];
    // debugger

    let changuiX =
      Math.ceil(this.container.width / this.particleSystem.CELL_SIZE) * 0.5;
    let changuiY =
      Math.ceil(this.container.height / this.particleSystem.CELL_SIZE) * 0.5;

    // let desdeX = this.cellX - changuiX;
    // let hastaX = this.cellX + changuiX;
    // let desdeY = this.cellY - changuiY;
    // let hastaY = this.cellY + changuiY;

    this.cell.getMoreNeighbours(changuiX, changuiY).forEach((cell) => {
      // cell.highlight()
      let posX = cell.x * cell.cellWidth + cell.cellWidth * 0.5;
      let posY = cell.y * cell.cellWidth + cell.cellWidth * 0.5;

      let bodies = this.particleSystem.findBodiesAtPoint({ x: posX, y: posY });
      for (let body of bodies) {
        if (body.particle == this) {
          cell.addMe(this);
          this.cellsOccupied.push(cell);
          // cell.showDirectionVector()
          break;
        }
      }
    });
  }

  ifHighlightedTintRed() {
    try {
      if (this.highlighted) {
        if (this.image.tint != 0xff0000) this.image.tint = 0xff0000;
      } else {
        if (this.image.tint != 0xffffff) this.image.tint = 0xffffff;
      }
    } catch (e) {
      debugger;
    }
  }
}
