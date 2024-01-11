// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class GenericObject {
  constructor(opt) {
    // this.pepe();
    const { x, y, particleSystem, team, isStatic, diameter } = opt;

    this.particleSystem = particleSystem;
    this.Matter = particleSystem.Matter;
    this.engine = particleSystem.engine;
    this.isStatic = isStatic;
    this.world = particleSystem.world;
    this.DISPLACEMENT_X = 0.4;

    //INIT STUFF:
    this.pos = new p5.Vector(parseInt(x), parseInt(y));
    this.visible = true;
    this.scale = 2;
    this.direction = 1;
    this.image = null;
    this.startingFrame = randomInt(6);

    // this.createBody(10);
  }

  isItMyFrame() {
    return this.COUNTER % 7 == this.startingFrame;
  }
  oncePerSecond() {
    return (this.COUNTER * 0.25) % 7 == this.startingFrame;
  }

  getFullwidthOfCurrentSprite() {
    return (
      (this.particleSystem.res[this.whichSpriteAmIShowing()] || {}).data || {}
    ).width;
  }

  whichSpriteAmIShowing() {
    return (
      ((((this.image || {}).texture || {}).baseTexture || {}).textureCacheIds ||
        [])[0] || ""
    );
  }

  createBody(
    width,
    height,
    type,
    label,
    angle = 0,
    isStatic = false,
    mass = 10
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
      isStatic,
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

    this.body.angle = angle;

    this.body.constraints = []; //i need to keep track which constraints each body has
    this.body.particle = this;

    this.world.add(this.engine.world, [this.body]);
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
    let y = this.pos.y - this.getHeight() * 2;
    if (!this.particleSystem.doPerspective) return y;

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
    this.container.y = this.calculateContainersY();
    this.container.x = this.calculateContainersX();

    //ESCALA, SI HACEMOS LA MOVIDA DE LA PERSPOECTIVA
    if (this.particleSystem.doPerspective) {
      this.calculateScaleAccordingToY();
      this.image.scale.y = this.scale;
      this.image.scale.x = this.direction * this.scale;
    } else {
      this.image.scale.x = this.direction * this.scale;
      this.image.scale.y = this.scale;
    }
    //SI ESTA HIGHLIGHTED
    try {
      if (this.highlighted) {
        if (this.image.tint != 0xff0000) this.image.tint = 0xff0000;
      } else {
        if (this.image.tint != 0xffffff) this.image.tint = 0xffffff;
      }
    } catch (e) {}
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
    // let ret;

    this.cellX = Math.floor(this.pos.x / this.particleSystem.CELL_SIZE);
    this.cellY = -Math.floor(-this.pos.y / this.particleSystem.CELL_SIZE);
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
  removeImage() {
    if (this.image && this.image.parent)
      this.image.parent.removeChild(this.image);
  }

  remove(opt) {
    // console.log("removing");

    try {
      this.cell.removeMe(this);
    } catch (e) {
      console.warn("no cell");
    }

    // for (let constr of this.body.constraints) {
    //   this.world.remove(this.engine.world, constr);
    // }

    this.particleSystem.mainContainer.removeChild(this.graphics);

    this.world.remove(this.engine.world, this.body);
    this.removeImage();

    this.particleSystem.people = this.particleSystem.people.filter(
      (k) => k.body.id != this.body.id
    );

    this.removeMeAsTarget();

    // if ((opt || {}).leaveAshes) {
    // }
  }
  getParticlesFromCell() {
    if (!this.cell) return;
    return this.cell.particlesHere;
  }

  findCloseParticles(xMargin, yMargin) {
    // let tiempo = performance.now();

    let ret = this.particleSystem.people.filter(
      (k) =>
        k.cellX > this.cellX - xMargin &&
        k.cellX < this.cellX + xMargin &&
        k.cellY > this.cellY - yMargin &&
        k.cellY < this.cellY + yMargin
    );

    // console.log("###", performance.now() - tiempo);
    return ret;
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
      .filter((k) => k != this);

    // console.log("###", performance.now() - tiempo);
    return ret;
  }

  makeMeFlash() {
    this.highlight();
    setTimeout(() => this.unHighlight(), this.particleSystem.deltaTime);
  }

  createSprite(which, stopsAtEnd) {
    if (
      this.whichSpriteAmIShowing().startsWith(which.substr(0, which.length - 2))
    ) {
      //IF THIS PARTICLE ALRADY HAD THIS SPRITE, DONT DO ANYTHING
      return;
    }

    this.shouldSpriteAnimationStopAtEnd = stopsAtEnd;
    this.animationStartedAt = this.COUNTER;

    this.removeImage();
    //IMG
    const frame1 = new PIXI.Rectangle(
      0,
      0,
      this.spriteWidth,
      this.spriteHeight
    );

    // this.particleSystem.res["walk"].texture.frame = frame1; //esto tiene q ser una copia de la textura, no la mismisima
    // console.log("###", which);
    this.image = new PIXI.Sprite(
      this.particleSystem.res[which].texture.clone()
    );

    this.image.pivot.y = 0;
    this.image.pivot.x = this.spriteWidth * 0.5;

    this.image.texture.frame = frame1;

    this.container.addChildAt(this.image, 0);
  }
  changeSizeOfPhysicsCircle(radius) {
    if (this.body) {
      this.world.remove(this.engine.world, this.body);
    }
    this.createBody(radius);
  }
  setState(state) {
    this.state = state;
  }

  createContainers() {
    this.container = new PIXI.Container();

    this.container.pivot.set(this.spriteWidth / 2, this.spriteHeight / 2);

    // this.particleContainer.zIndex = 1;

    // this.container.addChild(this.particleContainer);
    this.particleSystem.mainContainer.addChild(this.container);
  }

  animateSprite() {
    let cantFrames = this.getFullwidthOfCurrentSprite() / this.spriteWidth;

    let frameCount = this.COUNTER + this.startingFrame;

    if (frameCount % this.spriteSpeed != 0) return;

    let x;
    if (!this.shouldSpriteAnimationStopAtEnd) {
      x = this.spriteWidth * ((frameCount / this.spriteSpeed) % cantFrames);
    } else {
      let framesPassed = this.COUNTER - this.animationStartedAt;
      let whichFrame = Math.floor(framesPassed / this.spriteSpeed);
      if (whichFrame >= cantFrames) {
        this.ImTotallyDead();
        return;
      }
      x = this.spriteWidth * whichFrame;
    }

    this.image.texture.frame = new PIXI.Rectangle(
      x,
      0,
      this.spriteWidth,
      this.spriteHeight
    );
  }
}
