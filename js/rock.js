class Rock {
  constructor(opt) {
    const {
      x,
      y,
      vel,
      particleSystem,
      Matter,
      engine,
      diameter,
      targetX,
      targetY,
      part,
    } = opt;
    this.targetX = targetX;
    this.targetY = targetY;
    this.Matter = Matter;
    this.engine = engine;
    this.world = particleSystem.world;
    this.particleSystem = particleSystem;
    this.owner = part;

    this.id = Math.floor(Math.random() * 9999999999999);
    this.vel = (vel || new p5.Vector())
      .copy()
      .setMag(this.particleSystem.MULTIPLIERS.ROCK_SPEED);

    this.vel.x *= randomBetween(0.9, 1.1);
    this.vel.y *= randomBetween(0.9, 1.1);

    this.pos = new p5.Vector(x, y - diameter * 2);

    this.initialDistance = dist(
      this.pos.x,
      this.pos.y,
      this.targetX,
      this.targetY
    );

    this.velZ =
      this.initialDistance *
        this.particleSystem.MULTIPLIERS.ROCK_FORCE_REDUCER +
      part.strength; //velocidad inicial de la piedra

    this.z = diameter * 2;

    this.strength = this.particleSystem.MULTIPLIERS.ROCK_STRENGTH;

    // this.createBody();
    this.createCircleInPixi();

    // this.getParabola();

    // this.particleSystem.MULTIPLIERS.FORCE_REDUCER = 0.0006;

    // this.body.force.y =
    //   vel.y *
    //   this.particleSystem.MULTIPLIERS.ROCK_FORCE_REDUCER *
    //   (Math.random() * 0.1 + 0.9);
    // this.body.force.x =
    //   vel.x *
    //   this.particleSystem.MULTIPLIERS.ROCK_FORCE_REDUCER *
    //   (Math.random() * 0.1 + 0.9);

    // console.log(this.pos, this.vel);
  }
  // getParabola() {
  //   this.middlePoint = new p5.Vector(
  //     this.targetX - this.pos.x,
  //     this.targetY -
  //       this.pos.y -
  //       this.particleSystem.MULTIPLIERS.ROCK_MAX_HEIGHT
  //   );
  //   this.coeficients = findParabolaCoefficients(
  //     this.middlePoint,
  //     this.pos,
  //     new p5.Vector(this.targetX, this.targetY)
  //   );

  //   // console.log(this.coeficients);
  // }

  remove() {
    this.particleSystem.mainContainer.removeChild(this.graphics);

    // this.world.remove(this.engine.world, this.body);

    this.particleSystem.bullets = this.particleSystem.bullets.filter(
      (k) => k.id != this.id
    );
  }

  //   createBody() {
  //     let bodyOptions = {
  //       restitution: 0.1,
  //       mass: 0.01,
  //       label: "rock",
  //       friction: 0,
  //       slop: 0,
  //       frictionAir: 0,
  //       isSensor: false,
  //       render: { visible: true },
  //       isStatic: false,
  //     };

  //     this.body = this.Matter.Bodies.circle(
  //       this.pos.x,
  //       this.pos.y,
  //       6,
  //       bodyOptions
  //     );

  //     this.body.particle = this;

  //     this.world.add(this.engine.world, [this.body]);
  //   }

  createCircleInPixi() {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x331100");
    this.graphics.drawCircle(0, 0, 4);
    this.graphics.endFill();
    this.particleSystem.mainContainer.addChild(this.graphics);
  }

  seeWhoIKilled() {
    let people = this.particleSystem
      .getObjectsAt(this.pos.x, this.pos.y)
      .filter((k) => k instanceof Person && k != this)
      .map((k) => {
        return {
          dist: cheaperDist(this.pos.x, this.pos.y, k.pos.x, k.pos.y),
          part: k,
        };
      })
      .sort((a, b) => (a.dist > b.dist ? 1 : -1));

    if (people.length > 0) {
      let personWhoDies = people[0].part;
      personWhoDies.recieveDamageFrom(this);
      // console.log("roca le pego a ", personWhoDies);
    }
  }

  update(COUNTER) {
    // this.removeIfTheBulletIsLost();

    this.COUNTER = COUNTER;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.velZ -= 1; //gravedad
    if (this.velZ < -10) this.velZ = -10; //velocidad terminal
    this.z += this.velZ; //aplicar la velocidad en z a la altura

    // this.dist2Target = dist(this.pos.x, this.pos.y, this.targetX, this.targetY);

    if (
      this.pos.x < 0 ||
      this.pos.x > this.particleSystem.worldWidth ||
      this.pos.y < 0 ||
      this.pos.y > this.particleSystem.worldHeight
    ) {
      this.remove();
    }

    // this.ratioOfDistanceTraveled = 1 - this.dist2Target / this.initialDistance;

    // console.log("###", this.id, this.ratioOfDistanceTraveled);

    if (this.z < 0) {
      //la piedra cayo al piso
      this.seeWhoIKilled();
      this.remove();
    }

    //esto va de 0 a 1 y de 1 a 0.. 50% del recorrido de 1
    // this.yOffset =
    //   Math.abs(Math.abs(this.ratioOfDistanceTraveled - 0.5) - 0.5) * 2;

    this.render();
  }
  render() {
    this.graphics.x = this.pos.x;

    this.graphics.y = this.pos.y - this.z;

    //-this.particleSystem.MULTIPLIERS.ROCK_MAX_HEIGHT * Math.sin(this.yOffset);

    // this.graphics.y =
    //   this.coeficients.a * this.graphics.x * this.graphics.x +
    //   this.coeficients.b * this.graphics.x +
    //   this.coeficients.c;
  }

  //   evaluateIfVelocityChangedAndRemove() {
  //     if (this.currentVel) this.lastVel = this.currentVel.copy();

  //     this.currentVel = new p5.Vector(this.body.velocity.x, this.body.velocity.y);
  //     if (this.lastVel && this.currentVel) {
  //       let curMag = Math.abs(this.currentVel.mag());
  //       let lastMag = Math.abs(this.lastVel.mag());

  //       let diffVel = Math.abs(curMag - lastMag);

  //       if (curMag > 0 && lastMag > 0 && diffVel > 5) {
  //         this.remove();
  //       }
  //     }
  //   }
}
