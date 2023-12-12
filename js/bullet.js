class Bullet {
  constructor(opt) {
    const { x, y, vel, particleSystem, Matter, engine, diameter } = opt;
    this.Matter = Matter;
    this.engine = engine;
    this.world = particleSystem.world;
    this.particleSystem = particleSystem;

    let positionPlusVel = new p5.Vector(x, y);
    positionPlusVel = positionPlusVel.add(vel.copy().setMag(diameter + 2));

    this.pos = positionPlusVel;

    this.strength = 0.5;

    this.createBody();
    this.createCircleInPixi();

    this.FORCE_REDUCER = 0.0006;

    this.body.force.y =
      vel.y * this.FORCE_REDUCER * (Math.random() * 0.1 + 0.9);
    this.body.force.x =
      vel.x * this.FORCE_REDUCER * (Math.random() * 0.1 + 0.9);

    // console.log(this.pos, this.vel);
  }

  remove() {
    this.particleSystem.mainContainer.removeChild(this.graphics);

    this.world.remove(this.engine.world, this.body);

    this.particleSystem.bullets = this.particleSystem.bullets.filter(
      (k) => k.body.id != this.body.id
    );
  }

  createBody() {
    let bodyOptions = {
      restitution: 0.1,
      mass: 0.01,
      label: "bullet",
      friction: 0,
      slop: 0,
      frictionAir: 0,
      isSensor: false,
      render: { visible: false },
      isStatic: false,
    };

    this.body = this.Matter.Bodies.circle(
      this.pos.x,
      this.pos.y,
      4,
      bodyOptions
    );

    this.body.particle = this;

    this.world.add(this.engine.world, [this.body]);
  }

  createCircleInPixi() {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x000000");
    this.graphics.drawCircle(0, 0, 2);
    this.graphics.endFill();
    this.particleSystem.mainContainer.addChild(this.graphics);
  }

  removeIfTheBulletIsLost() {
    let vec = new p5.Vector(this.body.velocity.x, this.body.velocity.y);
    let mag = vec.mag();
    // console.log(mag);
    if (Math.abs(mag) < 10 && Math.abs(mag) > 0) {
      this.remove();
    }
  }

  update(COUNTER) {
    this.removeIfTheBulletIsLost();

    this.COUNTER = COUNTER;

    // let FORCE_REDUCER = 0.00004;
    // this.body.force.y =
    //   this.vel.y * FORCE_REDUCER * (Math.random() * 0.1 + 0.9);
    // this.body.force.x =
    //   this.vel.x * FORCE_REDUCER * (Math.random() * 0.1 + 0.9);

    this.evaluateIfVelocityChangedAndRemove();

    this.lastY = this.pos.y;
    this.lastX = this.pos.x;

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;

    if (
      this.pos.x < 0 ||
      this.pos.x > this.particleSystem.worldWidth ||
      this.pos.y < 0 ||
      this.pos.y > this.particleSystem.worldHeight
    ) {
      this.remove();
    }

    this.render();
  }
  render() {
    this.graphics.x = this.pos.x;
    this.graphics.y = this.pos.y;
  }

  evaluateIfVelocityChangedAndRemove() {
    if (this.currentVel) this.lastVel = this.currentVel.copy();

    this.currentVel = new p5.Vector(this.body.velocity.x, this.body.velocity.y);
    if (this.lastVel && this.currentVel) {
      let curMag = Math.abs(this.currentVel.mag());
      let lastMag = Math.abs(this.lastVel.mag());

      let diffVel = Math.abs(curMag - lastMag);

      if (curMag > 0 && lastMag > 0 && diffVel > 5) {
        this.remove();
      }
    }
  }
}
