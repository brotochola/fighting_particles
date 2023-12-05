// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class Particle {
  constructor(opt) {
    const { x, y, particleSystem, team } = opt;

    this.team = team;
    this.particleSystem = particleSystem;
    this.Matter = particleSystem.Matter;
    this.engine = particleSystem.engine;

    this.diameter = 10;
    this.health = 1;
    this.strength = Math.random() * 0.05 + 0.05;

    this.world = particleSystem.world;

    this.pos = new p5.Vector(x, y);
    this.vel = new p5.Vector(0, 0);

    this.createBody();
    this.createCircleInPixi();

    this.nearParticles = [];

    // this.heatCapacityAccordingToSubstance();
    // this.massAccordingToSubstance();
    // this.calculateEneryContained(energyContained);
    // this.thermalConductivityAccordingToSubstance();
    // this.burningTemperatureAccordingToSubstance();

    // this.onFire = this.substance == "woodGas"; //woodgas starts burning
    this.updateMyPositionInCell();

    this.state = "searching";
  }

  recieveDamage(part) {
    if (!part) return;
    this.highlight();
    setTimeout(() => this.unHighlight(), 100);
    this.health -= part.strength;
  }

  createBody() {
    let bodyOptions = {
      restitution: 0.1,
      mass: 0.01,
      friction: 1,
      slop: 0,
      frictionAir: 0.5,
      // isSensor: true,
      render: { visible: false },
      isStatic: !!this.isStatic,
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

  remove(opt) {
    // console.log("removing");

    try {
      this.cell.removeMe(this);
    } catch (e) {
      console.warn("no cell");
    }

    for (let constr of this.body.constraints) {
      this.world.remove(this.engine.world, constr);
    }

    this.particleSystem.pixiApp.stage.removeChild(this.graphics);

    this.world.remove(this.engine.world, this.body);

    this.particleSystem.particles = this.particleSystem.particles.filter(
      (k) => k.body.id != this.body.id
    );

    // if ((opt || {}).leaveAshes) {
    // }
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

    this.updateMyPositionInCell();

    // for (const particle of particles) {
    //     if (particle !== this) {
    //         const distance = Math.sqrt(
    //             Math.pow(this.pos.x - particle.x, 2) + Math.pow(this.pos.y - particle.y, 2)
    //         );
    //         const energyTransfer = Math.min(this.heat / distance, this.heat);
    //         // particle.heat += energyTransfer;
    //         particle.applyHeat(energyTransfer);
    //         this.applyHeat(energyTransfer)
    //     }
    // }

    this.nearParticles = this.getNearParticles();

    this.updateState();

    this.doStuffAccordingToState();

    this.calculateVelVectorAccordingToTarget();
    let FORCE_REDUCER = 0.00005;
    this.body.force.y = this.vel.y * FORCE_REDUCER;
    this.body.force.x = this.vel.x * FORCE_REDUCER;

    this.render();
  }
  doStuffAccordingToState() {
    if (this.state == "searching") this.findTarget();
  }

  calculateVelVectorAccordingToTarget() {
    //I REFRESH THIS EVERY 3 FRAMES

    if (!("x" in this.vel) || !("x" in this.pos)) return;

    if (this.target && ((this.target || {}).health || 1) > 0) {
      // debugger;
      if (this.target.pos) {
        let vectorThatAimsToTheTarger = p5.Vector.sub(
          this.target.pos,
          this.pos
        );
        // let invertedVector = p5.Vector.sub(this.pos, this.target.pos);

        this.vel = vectorThatAimsToTheTarger.limit(1);
      }
    } else if ((this.target || {}).state == "dead") {
      this.target = null;
      this.vel.x = 0;
      this.vel.y = 0;
    }

    //  this.vel.limit(this.genes.maxSpeed);

    //  console.log(this.vel);
  }
  getMaxSpeed = () => 10;

  updateState() {
    // this.state = "searching";

    if (this.health < 0) {
      this.die();
    }
  }

  die() {
    this.state = "dead";
    this.remove();
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

  render() {
    // Render the particle on the canvas

    this.graphics.x = this.pos.x;
    this.graphics.y = this.pos.y;

    // if (this.substance == "wood") this.setColorAccordingToTemperature();

    if (this.highlighted) {
      this.graphics.tint = "0xffffff";
      // return;
    } else if (this.team == 1) {
      this.graphics.tint = "0xff0000";
    } else if (this.team == 2) {
      this.graphics.tint = "0x00ff00";
    }
  }

  setTarget(target) {
    this.target = target;
  }

  findTarget() {
    let maxDistance = this.diameter * 40;

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
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0xFFFFFF");
    this.graphics.drawCircle(0, 0, this.diameter);
    this.graphics.endFill();
    this.particleSystem.pixiApp.stage.addChild(this.graphics);
  }
}
