class Fence extends GenericObject {
  constructor(opt) {
    console.log("fence", opt);
    super(opt);

    this.poles = [];

    const { x, y, particleSystem, rotation } = opt;
    this.startingAngle = Number(rotation) || 0;

    this.spriteWidth = 200;
    this.spriteHeight = 5;

    /////////////////////////////

    //initialize variables:

    //create stuff
    // this.createBody(
    //   this.spriteWidth,
    //   this.spriteHeight,
    //   "rectangle",
    //   "fence",
    //   this.startingAngle
    // );

    window.lastFence = this;

    this.createCompo(Number(x), Number(y));

    this.createContainers();

    this.updateMyPositionInCell();
  }

  createCompo(x, y) {
    let diam = 10;

    for (let i = 0; i < this.spriteWidth; i += diam) {
      for (let j = 0; j < this.spriteHeight; j += diam) {
        const p = new Pole({ x: i, y: j, particleSystem: this.particleSystem });
        this.poles.push(p);
      }
    } //for
    //create the body that contains all the particles:
    let newBody = this.Matter.Body.create({
      parts: this.poles.map((k) => k.body),
      isStatic: true,
      mass: 9999,
      friction: 1,
      frictionAir: 1,
      // restitution: 0,
      render: { visible: true },
    });

    // this.compoundBodies.push(newBody);
    // newBody.angle = this.startingAngle;
    this.Matter.Body.rotate(newBody, this.startingAngle);
    this.Matter.Body.translate(newBody, { x, y }, 0);
    this.body = newBody;

    this.world.add(this.engine.world, [newBody]);
    this.particleSystem.fences.push(this);
  }

  update(COUNTER) {
    for (let i = 0; i < this.poles.length; i++) {
      if (this.poles[i] && this.poles[i].update instanceof Function)
        this.poles[i].update(COUNTER);
    }

    this.render(COUNTER);
  }

  render(COUNTER) {
    for (let i = 0; i < this.poles.length; i++) {
      if (this.poles[i] && this.poles[i].render instanceof Function)
        this.poles[i].render(COUNTER);
    }
  }
  remove() {}
}
