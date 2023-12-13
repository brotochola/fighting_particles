// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class GenericObject {
  constructor(opt) {
    // this.pepe();
    const { x, y, particleSystem, team, isStatic } = opt;

    this.particleSystem = particleSystem;
    this.Matter = particleSystem.Matter;
    this.engine = particleSystem.engine;
    this.isStatic = isStatic;
    this.world = particleSystem.world;

    //INIT STUFF:
    this.pos = new p5.Vector(x, y);
    this.visible = true;
    this.scale = 2;
    this.image = null;

    // this.createBody(10);
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

  createBody(width, height, type) {
    let bodyOptions = {
      restitution: 0.1,
      mass: 0.01,
      friction: 1,
      slop: 0,
      frictionAir: 0.5,
      label: "particle",
      // isSensor: true,
      render: { visible: false },
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
    let dif =
      this.particleSystem.maxScaleOfSprites -
      this.particleSystem.minScaleOfSprites;

    // DEFINE SCALE
    if (this.particleSystem.doPerspective) {
      this.scale = Math.pow(dif, this.ratioOfY);
      // this.scale = dif * this.ratioOfY + this.particleSystem.minScaleOfSprites;
    } else {
      this.scale = 2;
    }
    //SCALE.Y DOESN'T DEPEND ON WHICH SIDE THE PARTICLE IS WALKING TOWARDS

    this.container.scale.y = this.scale;
  }

  calculateContainersX() {
    let amount = this.particleSystem.viewportWidth * 0.25;
    let factor = this.scale * amount;
    return this.particleSystem.doPerspective
      ? this.pos.x + (this.ratioOfX - 0.5) * factor
      : this.pos.x;
  }
  calculateContainersY() {
    let y = this.pos.y - this.image.texture.baseTexture.height * 2;
    if (!this.particleSystem.doPerspective) return y;

    let yFactor = this.scale * this.particleSystem.worldPerspective;

    // let ret;
    let cameraY = -this.container.parent.y;
    let whatToReturnIfWeDoPerspective = (y - cameraY) * yFactor + cameraY;
    // let whatToReturnIfWeDoPerspective = 0.1 * this.scale * y;

    return whatToReturnIfWeDoPerspective;
  }

  genericUpdate(COUNTER) {
    this.COUNTER = COUNTER;
    this.ratioOfY = this.getRatioOfY();
    this.ratioOfX = this.getRatioOfX();
  }
  genericRender() {
    if (!this.doNotShowIfOutOfScreen()) return;

    this.container.y = this.calculateContainersY();

    this.calculateScaleAccordingToY();

    this.container.x = this.calculateContainersX();

    if (this.highlighted) {
      this.image.tint = "0xffffff";
      // return;
    } else if (this.team == 1) {
      // this.graphics.tint = "0xff0000";
      // this.image.tint = "0xff000011";
    } else if (this.team == 2) {
      // this.graphics.tint = "0x00ff00";
      // this.image.tint = "0x00440011";
    }
  }

  highlight() {
    this.highlighted = true;
  }
  unHighlight() {
    this.highlighted = false;
  }

  removeMeAsTarget() {
    let particlesWithMeAsTarget = this.particleSystem.particles.filter(
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
      console.warn(this);
      debugger;
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

    this.particleSystem.particles = this.particleSystem.particles.filter(
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
  getParticlesFromCloseCells() {
    //from this cell and neighbour cells
    if (!this.cell) return [];
    let arr = [];
    arr.push(...this.getParticlesFromCell());

    for (let cell of this.cell.getNeighbours()) {
      for (let p of cell.particlesHere) {
        arr.push(p);
      }
    }
    return arr;
  }

  getNearParticles() {
    let arr = [];
    let closeParts = this.getParticlesFromCloseCells();
    if (!Array.isArray(closeParts)) debugger;

    for (let p of closeParts) {
      let difX = Math.abs(this.pos.x - p.x);
      let difY = Math.abs(this.pos.y - p.y);
      // let difY
      if (difX < this.diameter * 6 && difY < this.diameter * 6) {
        if (p != this) arr.push(p);
      }
      // if(p.body.x)
    }
    return arr;
  }

  getDistanceToCameraInY() {
    return this.particleSystem.viewPortHeight - this.getMyAbsolutePosition().y;
  }

  distanceToCamera() {
    return Math.sqrt(
      this.particleSystem.cameraHeight ** 2 + this.getDistanceToCameraInY() ** 2
    );
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
    const frame1 = new PIXI.Rectangle(0, 0, 12, 21);

    // this.particleSystem.res["walk"].texture.frame = frame1; //esto tiene q ser una copia de la textura, no la mismisima
    // console.log("###", which);
    this.image = new PIXI.Sprite(
      this.particleSystem.res[which].texture.clone()
    );

    this.image.texture.frame = frame1;
    // this.image.scale.x = 2;
    // this.image.scale.y = 2;

    this.container.addChildAt(this.image, 0);
  }
  // removeImage() {
  //   if (this.image && this.image.parent)
  //     this.image.parent.removeChild(this.image);
  // }

  // remove(opt) {
  //   // console.log("removing");

  //   try {
  //     this.cell.removeMe(this);
  //   } catch (e) {
  //     console.warn("no cell");
  //   }

  //   // for (let constr of this.body.constraints) {
  //   //   this.world.remove(this.engine.world, constr);
  //   // }

  //   if (this.graphics)
  //     this.particleSystem.mainContainer.removeChild(this.graphics);

  //   this.world.remove(this.engine.world, this.body);
  //   this.removeImage();

  //   this.particleSystem.particles = this.particleSystem.particles.filter(
  //     (k) => k.body.id != this.body.id
  //   );

  //   this.removeMeAsTarget();

  //   // if ((opt || {}).leaveAshes) {
  //   // }
  // }

  // removeMeAsTarget() {
  //   let particlesWithMeAsTarget = this.particleSystem.particles.filter(
  //     (k) => k.target == this
  //   );
  //   if (particlesWithMeAsTarget.length > 0) {
  //     particlesWithMeAsTarget.map((k) => k.setTarget(null));
  //   }
  // }
  // updateMyPositionInCell() {
  //   // let ret;

  //   this.cellX = Math.floor(this.pos.x / this.particleSystem.CELL_SIZE);
  //   this.cellY = -Math.floor(-this.pos.y / this.particleSystem.CELL_SIZE);
  //   if (isNaN(this.cellY)) {
  //     console.warn(this);
  //     debugger;
  //   }
  //   let newCell = (this.particleSystem.grid[this.cellY] || [])[this.cellX];

  //   if (this.cell && newCell && this.cell == newCell) {
  //     //you're already here
  //     return;
  //   }

  //   if (this.cell) this.cell.removeMe(this);

  //   try {
  //     this.cell = newCell;
  //     this.cell.addMe(this);
  //   } catch (e) {
  //     console.error("this particle is not in any cell", this.cellX, this.cellY);
  //     this.remove();
  //     // debugger;
  //   }

  //   // return ret;
  // }

  // getParticlesFromCell() {
  //   if (!this.cell) return;
  //   return this.cell.particlesHere;
  // }
  // getParticlesFromCloseCells() {
  //   //from this cell and neighbour cells
  //   if (!this.cell) return [];
  //   let arr = [];
  //   arr.push(...this.getParticlesFromCell());

  //   for (let cell of this.cell.getNeighbours()) {
  //     for (let p of cell.particlesHere) {
  //       arr.push(p);
  //     }
  //   }
  //   return arr;
  // }

  // genericUpdate(COUNTER) {
  //   this.COUNTER = COUNTER;

  //   this.lastY = this.pos.y;
  //   this.lastX = this.pos.x;
  //   //get the position in the matterjs world and have it here

  //   this.pos.x = this.body.position.x;
  //   this.pos.y = this.body.position.y;
  //   this.container.zIndex = Math.floor(this.pos.y);

  //   this.updateMyPositionInCell();
  //   this.nearParticles = this.getNearParticles();
  //   //   this.updateStateAccordingToStuff();

  //   //   this.doStuffAccordingToState();
  //   //   this.changeSpriteAccordingToStateAndVelocity();

  //   // this.animateSprite();
  //   // this.animateGravityToParticles();

  //   // this.emitBlood();
  //   // this.emitter.emit = false;

  //   // this.genericRender();
  // }

  // getFullwidthOfCurrentSprite() {
  //   return (
  //     (this.particleSystem.res[this.whichSpriteAmIShowing()] || {}).data || {}
  //   ).width;
  // }

  // whichSpriteAmIShowing() {
  //   return (
  //     ((((this.image || {}).texture || {}).baseTexture || {}).textureCacheIds ||
  //       [])[0] || ""
  //   );
  // }
  // getNearParticles() {
  //   let arr = [];
  //   let closeParts = this.getParticlesFromCloseCells();
  //   if (!Array.isArray(closeParts)) debugger;

  //   for (let p of closeParts) {
  //     let difX = Math.abs(this.pos.x - p.x);
  //     let difY = Math.abs(this.pos.y - p.y);
  //     // let difY
  //     if (difX < this.diameter * 6 && difY < this.diameter * 6) {
  //       if (p != this) arr.push(p);
  //     }
  //     // if(p.body.x)
  //   }
  //   return arr;
  // }

  // highlight() {
  //   this.highlighted = true;
  // }
  // unHighlight() {
  //   this.highlighted = false;
  // }

  // getMyAbsolutePosition() {
  //   return {
  //     x: this.pos.x + this.particleSystem.mainContainer.x,
  //     y: this.pos.y + this.particleSystem.mainContainer.y,
  //   };
  // }

  // getRatioOfX() {
  //   return this.getMyAbsolutePosition().x / this.particleSystem.viewportWidth;
  // }

  // getRatioOfY() {
  //   return this.getMyAbsolutePosition().y / this.particleSystem.viewPortHeight;
  // }

  // calculateScaleAccordingToY() {
  //   let dif =
  //     this.particleSystem.maxScaleOfSprites -
  //     this.particleSystem.minScaleOfSprites;

  //   // DEFINE SCALE
  //   if (this.particleSystem.doPerspective) {
  //     this.scale = Math.pow(dif, this.ratioOfY);
  //     // this.scale = dif * this.ratioOfY + this.particleSystem.minScaleOfSprites;
  //   } else {
  //     this.scale = 2;
  //   }
  //   //SCALE.Y DOESN'T DEPEND ON WHICH SIDE THE PARTICLE IS WALKING TOWARDS

  //   this.container.scale.y = this.scale;
  // }

  // calculateContainersX() {
  //   let amount = this.particleSystem.viewportWidth * 0.25;
  //   let factor = this.scale * amount;
  //   return this.particleSystem.doPerspective
  //     ? this.pos.x + (this.ratioOfX - 0.5) * factor
  //     : this.pos.x;
  // }
  // calculateContainersY() {
  //   let y = this.pos.y - this.image.texture.baseTexture.height * 2;
  //   if (!this.particleSystem.doPerspective) return y;

  //   let yFactor = this.scale * this.particleSystem.worldPerspective;

  //   // let ret;
  //   let cameraY = -this.container.parent.y;
  //   let whatToReturnIfWeDoPerspective = (y - cameraY) * yFactor + cameraY;
  //   // let whatToReturnIfWeDoPerspective = 0.1 * this.scale * y;

  //   return whatToReturnIfWeDoPerspective;
  // }

  // getDistanceToCameraInY() {
  //   return this.particleSystem.viewPortHeight - this.getMyAbsolutePosition().y;
  // }

  // distanceToCamera() {
  //   return Math.sqrt(
  //     this.particleSystem.cameraHeight ** 2 + this.getDistanceToCameraInY() ** 2
  //   );
  // }
  // doNotShowIfOutOfScreen() {
  //   if (
  //     this.ratioOfY < -0.1 ||
  //     this.ratioOfY > 1.1 ||
  //     this.ratioOfX > 1.1 ||
  //     this.ratioOfX < -0.1
  //   ) {
  //     this.visible = false;
  //   } else {
  //     this.visible = true;
  //   }
  //   return this.visible;
  // }
  // genericRender() {
  //   // Render the particle on the canvas

  //   // if (this.graphics) {
  //   //   this.graphics.x = this.pos.x;
  //   //   this.graphics.y = this.pos.y * yFactor;
  //   // }
  //   this.ratioOfY = this.getRatioOfY();
  //   this.ratioOfX = this.getRatioOfX();

  //   this.doNotShowIfOutOfScreen();
  //   if (!this.visible) return;

  //   this.container.y = this.calculateContainersY();

  //   this.calculateScaleAccordingToY();

  //   this.container.x = this.calculateContainersX();
  //   //COMPENSATE THE POSITION OF THE LITTLE GUY

  //   // if (this.substance == "wood") this.setColorAccordingToTemperature();

  //   if (this.highlighted) {
  //     this.image.tint = "0xffffff";
  //     // return;
  //   } else if (this.team == 1) {
  //     // this.graphics.tint = "0xff0000";
  //     // this.image.tint = "0xff000011";
  //   } else if (this.team == 2) {
  //     // this.graphics.tint = "0x00ff00";
  //     // this.image.tint = "0x00440011";
  //   }
  // }

  // createCircleInPixi() {
  //   // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

  //   //CIRCLE
  //   this.graphics = new PIXI.Graphics();
  //   this.graphics.beginFill("0x220000");
  //   this.graphics.drawCircle(0, 0, this.diameter);
  //   this.graphics.endFill();
  //   this.container.addChild(this.graphics);
  // }
  // createShadow() {
  //   // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

  //   //CIRCLE
  //   this.graphics = new PIXI.Graphics();
  //   this.graphics.beginFill("0x000000");
  //   this.graphics.alpha = 0.16;
  //   this.graphics.drawEllipse(0, 0, this.diameter * 0.82, this.diameter / 4);
  //   this.graphics.endFill();
  //   this.graphics.position.x = 10;
  //   this.graphics.position.y = 40;
  //   this.container.addChild(this.graphics);
  // }
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
  //   const frame1 = new PIXI.Rectangle(0, 0, 12, 21);

  //   // this.particleSystem.res["walk"].texture.frame = frame1; //esto tiene q ser una copia de la textura, no la mismisima
  //   // console.log("###", which);
  //   this.image = new PIXI.Sprite(
  //     this.particleSystem.res[which].texture.clone()
  //   );

  //   this.image.texture.frame = frame1;
  //   // this.image.scale.x = 2;
  //   // this.image.scale.y = 2;

  //   this.container.addChildAt(this.image, 0);
  // }

  // changeSizeOfPhysicsCircle(radius) {
  //   if (this.body) {
  //     this.world.remove(this.engine.world, this.body);
  //   }
  //   this.createBody(radius);
  // }
}
