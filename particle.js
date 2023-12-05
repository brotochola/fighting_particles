// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class Particle {
  constructor(
    x,
    y,
    substance,
    temperature,
    particleSystem,
    energyContained,
    isStatic,
    doNotAddBodyToWorld
  ) {
    this.isStatic = isStatic;
    this.particleSystem = particleSystem;
    this.Matter = particleSystem.Matter;
    this.engine = particleSystem.engine;

    this.diameter = particleSystem.config[substance].diameter;
    this.maxNumberOfConnectionsPerBody =
      particleSystem.config[substance].maxNumberOfConnectionsPerBody;
    this.maxDistanceToAttach =
      particleSystem.config[substance].maxDistanceToAttach;

    this.world = particleSystem.world;

    this.pos = new p5.Vector(x, y);
    this.vel = new p5.Vector(0, 0);
    this.substance = substance || "wood"; // substance of the particle

    let defaultColors = {
      wood: {
        fillStyle: getRandomBrownishColor(0.66, 1),
        strokeStyle: getRandomBrownishColor(0.3, 0.7),
      },
      woodGas: {
        fillStyle: "none",
        strokeStyle: "none",
      },
      water: {
        fillStyle: "blue",
        strokeStyle: "none",
      },
    };

    this.defaultColor = defaultColors[this.substance];

    this.createBody(doNotAddBodyToWorld);
    if (this.substance != "woodGas") this.createCircleInPixi();

    this.nearParticles = [];

    this.heatCapacityAccordingToSubstance();
    this.massAccordingToSubstance();
    this.calculateEneryContained(energyContained);
    this.thermalConductivityAccordingToSubstance();
    this.burningTemperatureAccordingToSubstance();

    this.temperature = temperature || 20;
    this.setStartingState();

    this.onFire = this.substance == "woodGas"; //woodgas starts burning
    this.updateMyPositionInCell();
  }

  setStartingState() {
    if (
      this.temperature < this.evaporationTemperature &&
      this.temperature > this.freezingTemperature
    ) {
      this.state = "liquid";
    } else if (this.temperature < this.freezingTemperature) {
      this.state = "solid";
      // this.freeze();
    } else if (this.temperature > this.evaporationTemperature) {
      this.state = "gas";
      // this.evaporate();
    } else if (this.temperature < this.evaporationTemperature) {
      this.state = "liquid";
      // this.condense();
    }
  }

  stateAccordingToTemperature() {
    if (
      this.freezingTemperature == undefined ||
      this.evaporationTemperature == undefined
    ) {
      return;
    }
    //DOES THIS SUBSTANCE MELT AND FREEZE?
    //WOOD AND WOODGAS DON'T
    //WATER DOES

    if (
      this.temperature < this.evaporationTemperature &&
      this.temperature > this.freezingTemperature &&
      this.state == "solid"
    ) {
      // this.state = "liquid";
      this.melt();
    } else if (
      this.temperature < this.freezingTemperature &&
      this.state == "liquid"
    ) {
      // this.state = "solid";
      this.freeze();
    } else if (
      this.temperature > this.evaporationTemperature &&
      this.state == "liquid"
    ) {
      // this.state = "gas";
      this.evaporate();
    } else if (
      this.temperature < this.evaporationTemperature &&
      this.state == "gas"
    ) {
      // this.state = "liquid";
      this.condense();
    }
  }

  createBody(doNotAddBodyToWorld) {
    let renderTypes = {
      wood: {
        visible: false,
      },
      woodGas: {
        visible: false,
      },
      water: {
        visible: false,
      },
    };

    let slops = {
      wood: 0, // this.diameter,
      woodGas: -this.diameter * 2,
      water: -1, //this.diameter,
    };

    //for the simulation, not to calculate energies:
    let masses = {
      wood: 0,
      woodGas: 0,
      water: 0,
    };
    let bodyOptions = {
      restitution: this.substance == "wood" ? 0.1 : 0.1,
      mass: masses[this.substance],
      friction: this.substance == "wood" ? 1 : 0,
      slop: slops[this.substance],
      // frictionAir: 0,
      // isSensor: true,
      render: renderTypes[this.substance],
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

    if (!doNotAddBodyToWorld) this.world.add(this.engine.world, [this.body]);
  }

  getAttractionFactorAccordingToTemperature() {
    // -272 :2
    // this.freezingTemperature -> 1
    // this.evaporationTemperature ->0
    // this.maxTemperature -> -1

    if (this.temperature < this.freezingTemperature) {
      let maxFactor = 2;
      let minFactor = 1;
      // -272 -> maxFactor
      // this.freezingTemperature ->minFactor
      // this.temperature -> x

      let m = (maxFactor - minFactor) / (-this.freezingTemperature - 272);

      let b =
        maxFactor +
        (272 * (maxFactor - minFactor)) / (-this.freezingTemperature - 272);

      return m * this.temperature + b;
    } else if (
      this.temperature > this.freezingTemperature &&
      this.temperature < this.evaporationTemperature
    ) {
      return 0;
    } else if (this.temperature > this.evaporationTemperature) {
      return -1;
    }
  }
  burningTemperatureAccordingToSubstance() {
    if (this.substance == "wood") {
      this.burningTemperature = 250;
      this.maxTemperature = 1093;
    } else if (this.substance == "woodGas") {
      this.burningTemperature = 200; //lower than wood
      this.maxTemperature = 1200; //roughly accurate
    } else if (this.substance == "water") {
      this.evaporationTemperature = 100;
      this.freezingTemperature = 0;
      this.maxTemperature = 375;
    }
  }
  thermalConductivityAccordingToSubstance() {
    if (this.substance == "wood") this.thermalConductivity = 0.000025;
    else if (this.substance == "woodGas")
      this.thermalConductivity = 0.0000025; //10x less
    else if (this.substance == "water") this.thermalConductivity = 0.0075; //water has 3x the thermal conductivity of wood
  }
  calculateEneryContained(energyContained) {
    //energy contained in joules
    // if (this.substance == "wood") this.energyContained = this.mass * 10000
    if (this.substance == "wood") {
      this.energyContained = this.mass * 2000000000;
      this.originalEnergycontained = this.mass * 2000000000;
    } else if (this.substance == "woodGas") {
      //WHEN WOODGAS IS LIBERATED, I WANT IT TO HAVE THE ENERGY THAT I TAKE OUT FROM THE WOOD
      if (energyContained) {
        this.energyContained = energyContained;
        this.originalEnergycontained = energyContained;
      } else {
        //10x less than wood
        this.energyContained = this.mass * 200000000;
        this.originalEnergycontained = this.mass * 200000000;
      }
    }
  }
  heatCapacityAccordingToSubstance() {
    //energy in joules to raise this particles (1mm3) 1 degree C
    if (this.substance == "wood") this.heatCapacity = 0.001025;
    else if (this.substance == "woodGas")
      this.heatCapacity = 0.0015; //50% than wood
    else if (this.substance == "water") this.heatCapacity = 0.0031; //3x wood
  }
  massAccordingToSubstance() {
    //mass in grams
    //each particle is 1mm3
    //0,0005gr / mm3

    if (this.substance == "wood") this.mass = 0.0005;
    else if (this.substance == "woodGas") this.mass = 0.00005;
    else if (this.substance == "water") this.mass = 0.0007;
  }
  applyHeat(joules) {
    this.temperature += Math.floor(joules) * this.heatCapacity;
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

    if (this.isPartOfABody) {
      //REMOVE THIS PARTICLE FROM THE BODY
      this.body.parent.parts = this.body.parent.parts.filter(
        (k) => k != this.body
      );
      //CHECK IF IT'S EMPTY
      this.particleSystem.removeEmptyCompoundBodies();
    } else {
      this.world.remove(this.engine.world, this.body);
    }

    this.particleSystem.particles = this.particleSystem.particles.filter(
      (k) => k.body.id != this.body.id
    );

    // if ((opt || {}).leaveAshes) {
    // }
  }
  releaseWoodGas(energy) {
    //   addParticle(x, y, substance, temperature, energy) {
    // console.log(energy);
    // debugger;
    this.particleSystem.addParticle(
      this.pos.x - this.diameter * 0.5 + Math.random() * this.diameter,
      this.pos.y - this.diameter,
      "woodGas",
      this.temperature,
      energy,
      false,
      false
    );
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

    this.calculateVelVectorAccordingToTarget();
    let FORCE_REDUCER = 0.00001;
    this.body.force.y = this.vel.y * FORCE_REDUCER;
    this.body.force.x = this.vel.x * FORCE_REDUCER;

    this.render();
  }

  calculateVelVectorAccordingToTarget() {
    //I REFRESH THIS EVERY 3 FRAMES

    if (!("x" in this.vel) || !("x" in this.pos)) return;

    if (this.target) {
      // debugger;
      if (this.target.pos) {
        let vectorThatAimsToTheTarger = p5.Vector.sub(
          this.target.pos,
          this.pos
        );
        // let invertedVector = p5.Vector.sub(this.pos, this.target.pos);

        this.vel = vectorThatAimsToTheTarger.limit(1);
      }
    } else {
      // //CRAZY WANDER AROUND
      // this.vel.add(
      //   new p5.Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).limit(
      //     (Math.random() * this.getMaxSpeed()) / 2
      //   )
      // );
    }

    //  this.vel.limit(this.genes.maxSpeed);

    //  console.log(this.vel);
  }
  getMaxSpeed = () => 10;

  updateState() {
    this.state = 1;
  }

  getAvgTempOfNearParticles() {
    let avg = 0;
    for (let p of this.nearParticles) {
      avg += p.temperature;
    }
    return avg / this.nearParticles.length;
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
    }
  }

  setTarget(target) {
    this.target = target;
  }
  createCircleInPixi() {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0xFFFFFF");
    this.graphics.drawCircle(0, 0, this.diameter);
    this.graphics.endFill();
    this.particleSystem.pixiApp.stage.addChild(this.graphics);
  }

  setColorAccordingToTemperature() {
    let fillR = this.defaultColor.fillStyle.r;
    let strokeR = this.defaultColor.strokeStyle.r;

    let tempRatio = this.temperature / this.burningTemperature;
    let newFillR = tempRatio * (255 - fillR) + fillR;

    // let newStrokeR = tempRatio * (255 - strokeR) + strokeR;

    // this.body.render.fillStyle = makeRGBA({
    //   ...this.defaultColor.fillStyle,
    //   r: newFillR,
    // });
    let rgba = makeRGBA({
      ...this.defaultColor.fillStyle,
      r: newFillR,
    });

    let newColor = rgba2hex2(rgba);
    this.graphics.tint = newColor;

    // this.body.render.strokeStyle = makeRGBA({
    //   ...this.defaultColor.strokeStyle,
    //   r: newStrokeR,
    // });
  }
}
