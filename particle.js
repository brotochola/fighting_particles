// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class Particle {
  constructor(opt) {
    const { x, y, particleSystem, team, isStatic } = opt;
    this.name = generateID();
    this.team = team;
    this.particleSystem = particleSystem;
    this.Matter = particleSystem.Matter;
    this.engine = particleSystem.engine;
    this.isStatic = isStatic;

    this.diameter = 10;
    this.health = 1;
    this.strength = Math.random() * 0.005 + 0.005;

    this.world = particleSystem.world;

    this.pos = new p5.Vector(x, y);
    this.vel = new p5.Vector(0, 0);

    this.createBody();
    // this.createCircleInPixi();
    this.createShadow();
    this.createSprite("idle_" + this.team);

    this.nearParticles = [];

    this.spriteWidth = 12;
    this.spriteHeight = 21;
    this.spriteSpeed = 8;

    this.startingFrame = Math.floor(Math.random() * 7);

    // this.heatCapacityAccordingToSubstance();
    // this.massAccordingToSubstance();
    // this.calculateEneryContained(energyContained);
    // this.thermalConductivityAccordingToSubstance();
    // this.burningTemperatureAccordingToSubstance();

    // this.onFire = this.substance == "woodGas"; //woodgas starts burning
    this.updateMyPositionInCell();

    this.setState("searching");
  }

  fireBullet() {
    if (!this.target || this.state == "dead") return;

    //HERE WE CAN EVALUATE WHAT TYPE OF BULLET, HOW OFTEN, RELOD, ETC
    if (Math.random() > 0.8 && this.COUNTER % 2 == 0)
      this.particleSystem.addBullet(this);
  }

  recieveDamage(part, what) {
    // console.log(part);
    // console.log(part.strength);

    if (!part) return;
    this.health -= (part || {}).strength || 0;

    this.highlight();
    setTimeout(() => this.unHighlight(), 30);

    // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  }

  createBody() {
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

    this.body = this.Matter.Bodies.circle(
      this.pos.x,
      this.pos.y,
      this.diameter,
      bodyOptions
    );

    this.body.constraints = []; //i need to keep track which constraints each body has
    this.body.particle = this;

    this.world.add(this.engine.world, [this.body]);
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

    this.particleSystem.pixiApp.stage.removeChild(this.graphics);

    this.world.remove(this.engine.world, this.body);
    this.removeImage();

    this.particleSystem.particles = this.particleSystem.particles.filter(
      (k) => k.body.id != this.body.id
    );

    this.removeMeAsTarget();

    // if ((opt || {}).leaveAshes) {
    // }
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

  update(COUNTER) {
    this.COUNTER = COUNTER;

    this.lastY = this.pos.y;
    this.lastX = this.pos.x;

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.image.zIndex = Math.floor(this.pos.y);

    if (this.state != "dead") {
      this.updateMyPositionInCell();
      this.nearParticles = this.getNearParticles();
      this.updateStateAccordingToStuff();

      this.doStuffAccordingToState();
      this.changeSpriteAccordingToStateAndVelocity();
    }

    this.animateSprite();

    this.render();
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
  changeSpriteAccordingToStateAndVelocity() {
    let vel = new p5.Vector(this.body.velocity.x, this.body.velocity.y);

    if (this.state == "dead") {
      //EMPIEZA A MORIR
      this.createSprite("die_" + this.team, true);
      //Y MUERE
      // setTimeout(
      //   () => this.createSprite("dead_1"),
      //   this.particleSystem.getDurationOfOneFrame() * 7
      // );
    } else if (this.state == "attacking") {
      this.createSprite("attack_" + this.team);
    } else if (this.state == "searching") {
      if (this.whichSpriteAmIShowing().startsWith("attack")) {
        this.createSprite("idle_" + this.team);
      }
    }

    ///ABOUT MOVEMENT:

    if (Math.abs(vel.mag()) > 0.05) {
      //IT'S IDLE AND STARTS TO WALK
      if (this.whichSpriteAmIShowing().startsWith("idle")) {
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
        this.iAmTotallyDead();
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

  iAmTotallyDead() {
    this.world.remove(this.engine.world, this.body);

    this.particleSystem.particles = this.particleSystem.particles.filter(
      (k) => k.body.id != this.body.id
    );

    this.particleSystem.pixiApp.stage.removeChild(this.graphics);

    this.removeMeAsTarget();
  }

  doStuffAccordingToState() {
    // if (this.state == "searching") {

    // } else if (this.state == "chasing") {

    // }

    if (this.COUNTER % 4 == 0) this.findTarget();
    if (this.COUNTER % 2 == 0) this.calculateVelVectorAccordingToTarget();

    if (this.target && this.isStatic) {
      this.fireBullet();
    }
  }

  calculateVelVectorAccordingToTarget() {
    //I REFRESH THIS EVERY 3 FRAMES

    if (!("x" in this.vel) || !("x" in this.pos)) return;

    if (this.target && ((this.target || {}).health || 1) > 0) {
      // debugger;
      if (this.target.pos) {
        let targetsVel = new p5.Vector(
          this.target.body.velocity.x,
          this.target.body.velocity.y
        );
        let vectorThatAimsToTheTarget = p5.Vector.sub(
          this.target.pos,
          this.pos.add(targetsVel)
        );
        // let invertedVector = p5.Vector.sub(this.pos, this.target.pos);

        this.vel = vectorThatAimsToTheTarget.limit(1);

        if (!this.isStatic) {
          let FORCE_REDUCER = 0.00004;
          this.body.force.y = this.vel.y * FORCE_REDUCER;
          this.body.force.x = this.vel.x * FORCE_REDUCER;
        }
      }
    } else if ((this.target || {}).state == "dead") {
      this.target = null;
      this.vel.x = 0;
      this.vel.y = 0;
      this.setState("searching");
    }

    //  this.vel.limit(this.genes.maxSpeed);

    //  console.log(this.vel);
  }
  getMaxSpeed = () => 10;

  updateStateAccordingToStuff() {
    // this.state = "searching";

    if (this.health <= 0) {
      this.die();
    }
  }
  setState(state) {
    this.state = state;
  }

  throwAPunch() {
    // console.log("#", this.name, "punch");
    this.setState("attacking");
  }

  die() {
    this.setState("dead");
    // this.createSprite("die_1");

    // setTimeout(() => this.remove(), 1000);
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

  highlight() {
    this.highlighted = true;
  }
  unHighlight() {
    this.highlighted = false;
  }
  makeMeLookLeft() {
    // if (this.image.scale.x < 0) return;
    this.image.scale.x = -1 * this.scale;
    this.image.x = this.pos.x + 6;
  }

  makeMeLookRight() {
    // if (this.image.scale.x > 0) return;
    this.image.scale.x = 1 * this.scale;
    this.image.x = this.pos.x - 9;
  }

  calculateScaleAccordingToY() {
    let dif =
      this.particleSystem.maxScaleOfSprites -
      this.particleSystem.minScaleOfSprites;

    // DEFINE SCALE
    if (this.particleSystem.doPerspective) {
      this.scale =
        (this.pos.y / this.particleSystem.worldHeight) * dif +
        this.particleSystem.minScaleOfSprites;
    } else {
      this.scale = 2;
    }
    //SCALE.Y DOESN'T DEPEND ON WHICH SIDE THE PARTICLE IS WALKING TOWARDS

    this.image.scale.y = this.scale;
  }

  render() {
    // Render the particle on the canvas

    let yFactor = this.particleSystem.doPerspective
      ? this.scale * this.particleSystem.worldPerspective
      : 1;

    if (this.graphics) {
      this.graphics.x = this.pos.x;
      this.graphics.y = this.pos.y * yFactor;
    }

    this.image.y =
      (this.pos.y - this.image.texture.baseTexture.height * 2) * yFactor;
    this.calculateScaleAccordingToY();

    if (this.vel.x < 0) this.makeMeLookLeft();
    else this.makeMeLookRight();

    // if (this.substance == "wood") this.setColorAccordingToTemperature();

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

  setTarget(target) {
    this.target = target;
    this.state = "chasing";
  }

  findTarget() {
    let maxDistance = this.diameter * 400;

    let arr = this.particleSystem.particles
      .filter((k) => k.team != this.team)
      .map((k) => {
        let x = this.cellX - k.cellX;
        let y = this.cellY - k.cellY;
        return {
          dist: this.particleSystem.CELL_SIZE * (Math.abs(x) + Math.abs(y)),
          part: k,
        };
      });
    let newArr = arr.sort((a, b) => (a.dist > b.dist ? 1 : -1));
    newArr = newArr.filter((k) => k.dist < maxDistance);
    if (newArr.length == 0) return;

    let closestEnemy = newArr[0].part;

    this.setTarget(closestEnemy);
  }
  createCircleInPixi() {
    // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

    //CIRCLE
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x220000");
    this.graphics.drawCircle(0, 0, this.diameter);
    this.graphics.endFill();
    this.particleSystem.pixiApp.stage.addChild(this.graphics);
  }
  createShadow() {
    // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

    //CIRCLE
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x000000");
    this.graphics.alpha = 0.16;
    this.graphics.drawEllipse(0, 0, this.diameter * 0.82, this.diameter / 4);
    this.graphics.endFill();
    this.particleSystem.pixiApp.stage.addChild(this.graphics);
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

    this.particleSystem.pixiApp.stage.addChild(this.image);
  }
}
