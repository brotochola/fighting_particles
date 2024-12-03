// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class GenericObject {
  states = {};
  constructor(opt) {
    // this.pepe();
    const { x, y, particleSystem, team, isStatic, diameter, scaleX } = opt;
    this.opt = opt;

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

    this.currentAnimation = "parado";
    this.createContainers();

    // this.createBody(10);
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

  update(COUNTER) {
    this.COUNTER = COUNTER;
    this.ratioOfY = this.getRatioOfY();
    this.ratioOfX = this.getRatioOfX();

    // if (this.oncePerSecond()) console.log(this.name, performance.now());
  }
  render() {
    if (!this.doNotShowIfOutOfScreen()) return;

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
    this.image.scale.x = this.direction * this.scale;
    this.image.scale.y = this.scale;
    //}

    // if (this.direction == -1) {
    //   this.image.x = 15;
    // } else {
    //   this.image.x = -15;
    // }

    //SI ESTA HIGHLIGHTED
    try {
      if (this.highlighted) {
        if (this.image.tint != 0xff0000) this.image.tint = 0xff0000;
      } else {
        if (this.image.tint != 0xffffff) this.image.tint = 0xffffff;
      }
    } catch (e) {
      debugger;
    }

    this.drawLineBetweenMeAndTarget();
  }

  highlight() {
    this.highlighted = true;
  }
  unHighlight() {
    this.highlighted = false;
  }

  removeMeAsTarget() {
    let particlesWithMeAsTarget = this.particleSystem.people.filter(
      (k) => k.target == this
    );
    if (particlesWithMeAsTarget.length > 0) {
      particlesWithMeAsTarget.map((k) => k.setTarget(null));
    }
  }
  updateMyPositionInCell() {
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

  remove(opt) {
    // console.log("removing", this);

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

  findCloseObjects(xMargin, yMargin) {
    let offset = Math.floor(this.sightDistance / this.particleSystem.CELL_SIZE);

    if (!yMargin) yMargin = offset;
    if (!xMargin) xMargin = offset;
    // let tiempo = performance.now();

    let ret = this.particleSystem.fixedObjects.filter(
      (k) =>
        k.cellX > this.cellX - xMargin &&
        k.cellX < this.cellX + xMargin &&
        k.cellY > this.cellY - yMargin &&
        k.cellY < this.cellY + yMargin
    );

    // console.log("###", performance.now() - tiempo);
    return ret;
  }

  findClosePeople(xMargin, yMargin) {
    // let tiempo = performance.now();

    let ret = this.particleSystem.people.filter(
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

  getParticlesFromCloseCells() {
    //from this cell and neighbour cells
    // let tiempo = performance.now();
    if (!this.cell) return [];
    let arr = [];
    arr.push(...this.getParticlesFromCell());

    for (let cell of this.cell.getNeighbours()) {
      for (let p of cell.particlesHere) {
        arr.push(p);
      }
    }
    let ret = arr
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

  createAnimatedSprite() {
    this.spritesheet = this.particleSystem.res[this.team + "_ss"];
    // console.log(this.spritesheet);
    this.image = new PIXI.AnimatedSprite(this.spritesheet.animations.parado);
    this.container.addChild(this.image);
    // this.image.y = 64;
    this.image.animationSpeed = this.speed * 0.2;
    this.image.pivot.x = 0;
  }

  changeAnimation(which, stopAtEnd = false, force) {
    if (this.currentAnimation === which) {
      return;
    }

    if (!force && performance.now() - this.lastTimeChangedAnimation < 500) {
      return;
    }
    var newAnim = this.spritesheet.animations[which];
    // this.image.stop();
    this.image.loop = !stopAtEnd;
    this.image.textures = newAnim;
    this.image.play();
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
    this.image.pivot.x = +this.image.width / 2;
    this.image.pivot.y = +this.image.height;
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
}
