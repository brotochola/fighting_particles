// https://codepen.io/davepvm/pen/Hhstl
// Particle class representing each molecule
class Person extends GenericObject {
  constructor(opt) {
    super(opt);
    const { x, y, particleSystem, team, isStatic } = opt;

    //PARAMS OF THIS PERSON:

    this.initStartingAttributes();
    this.team = team;
    this.diameter = 10;
    this.spriteWidth = 12;
    this.spriteHeight = 21;
    this.spriteSpeed = Math.floor(10 * this.speed);
    this.startingFrame = Math.floor(Math.random() * 7);
    /////////////////////////////

    //initialize variables:
    this.nearParticles = [];
    this.vel = new p5.Vector(0, 0);
    this.lastTimeItFlipped = 0;
    this.amILookingLeft = false;

    //create stuff
    this.createBody(this.diameter, this.diameter, "circle");
    this.createContainers();
    this.createSprite("idle_" + this.team);

    this.updateMyPositionInCell();
    // this.addParticleEmitter();
    this.setState("searching");
  }
  initStartingAttributes() {
    this.name = generateID();
    this.strength = Math.random() * 0.005 + 0.005;

    this.health = 1;
    this.speed = Math.random() * 0.5 + 0.5;
    this.intelligence = Math.random(); //opposite of corage

    this.stamina = 1;
    this.fear = 0;
    this.anger = 0;
    this.happiness = 1;
  }
  createContainers() {
    this.container = new PIXI.Container();

    this.particleContainer = new PIXI.ParticleContainer();
    this.particleContainer.zIndex = 1;

    this.container.addChild(this.particleContainer);
    this.particleSystem.mainContainer.addChild(this.container);
  }
  addParticleEmitter() {
    // your imported namespace is
    this.emitter = new PIXI.particles.Emitter(
      // The PIXI.Container to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the root stage Container
      this.particleContainer,
      // Emitter configuration, edit this to change the look
      // of the emitter
      {
        lifetime: {
          min: 0.1,
          max: 1,
        },
        autoUpdate: true,
        frequency: 0.1,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 1,
        maxParticles: 100,
        pos: {
          x: 0,
          y: 10,
        },
        addAtBack: false,
        behaviors: [
          // {
          //   type: "movePath",
          //   config: {
          //     path: "x",
          //     speed: {
          //       list: [
          //         { value: -10, time: 0 },
          //         { value: 100, time: 0.1 },
          //       ],
          //     },
          //     minMult: 0.8,
          //   },
          // },
          {
            type: "scale",
            config: {
              scale: {
                list: [
                  {
                    value: 1,
                    time: 0,
                  },
                  {
                    value: 0.2,
                    time: 1,
                  },
                ],
              },
            },
          },
          {
            type: "color",
            config: {
              color: {
                list: [
                  {
                    value: "dd0000",
                    time: 0,
                  },
                  {
                    value: "ff000055",
                    time: 1,
                  },
                ],
              },
            },
          },
          {
            type: "moveSpeed",
            config: {
              speed: {
                list: [
                  {
                    value: 200,
                    time: 0,
                  },
                  {
                    value: 100,
                    time: 1,
                  },
                ],
                isStepped: false,
              },
            },
          },
          {
            type: "rotationStatic",
            config: {
              min: 0,
              max: -180,
            },
          },
          {
            type: "textureSingle",
            config: {
              texture: PIXI.Texture.from("blood"),
            },
          },

          // {
          //   type: "spawnShape",
          //   config: {
          //     type: "circle",
          //     data: {
          //       x: 0,
          //       y: 10,
          //       radius: 1,
          //     },
          //   },
          // },
        ],
      }
    );
  }

  animateGravityToParticles() {
    this.particleContainer.children.map((k) => {
      k.position.y += 2;
      if (k.position.y > this.spriteHeight * 2) {
        // console.log(k);
        // this.container.parent.addChild(k.texture);

        let blood = new PIXI.Sprite(
          this.particleSystem.res["blood"].texture.clone()
        );
        // this.container.x
        // console.log(this.container.x + k.position.x);
        blood.position.x = this.container.x + k.position.x;
        blood.position.y = this.container.y + k.position.y;
        blood.scale.x = 1;
        blood.scale.y = 1;
        blood.alpha = 0.6;
        this.container.parent.addChild(blood);

        this.particleContainer.removeChild(k);
      }
    });
  }
  emitBlood(angle) {
    // this.particleContainer.x = this.body.position.x;
    // this.particleContainer.y = this.body.position.y;
    // this.emitter.update(this.particleSystem.getDurationOfOneFrame() * 100000);
    // this.emitter.initBehaviors[3].min = angle;
    // this.emitter.initBehaviors[3].max = angle;
    // this.emitter.emit = true;
  }

  fireBullet() {
    if (!this.target || this.state == "dead") return;

    //HERE WE CAN EVALUATE WHAT TYPE OF BULLET, HOW OFTEN, RELOD, ETC
    if (Math.random() > 0.8 && this.COUNTER % 2 == 0)
      this.particleSystem.addBullet(this);
  }

  recieveDamage(part, what) {
    // if (this.team == 1) return;
    // console.log(part);
    // console.log(part.strength);

    if (!part || part.state == "dead") return;
    this.health -= (part || {}).strength || 0;

    this.highlight();
    setTimeout(() => this.unHighlight(), 30);

    let incomingAngleOfHit = Math.atan2(
      part.body.position.y,
      part.body.position.x
    );

    this.emitBlood(incomingAngleOfHit);

    let difX = part.body.position.x - this.body.position.x;
    let difY = part.body.position.y - this.body.position.y;

    this.body.force.y += difY * 10000;
    this.body.force.x += difX * 10000;

    // if (part instanceof Bullet) setTimeout(() => this.die(), 100);
  }

  // createBody(radius) {
  //   let bodyOptions = {
  //     restitution: 0.1,
  //     mass: 0.01,
  //     friction: 1,
  //     slop: 0,
  //     frictionAir: 0.5,
  //     label: "particle",
  //     // isSensor: true,
  //     render: { visible: false },
  //     isStatic: false,
  //     // density: 99999999999999
  //     // mass: 0
  //     plugin: {
  //       // attractors: [
  //       //   (bodyA, bodyB) => {
  //       //     let factor = this.getAttractionFactorAccordingToTemperature();
  //       //     let distX = bodyA.position.x - bodyB.position.x;
  //       //     let distY = bodyA.position.y - bodyB.position.y;
  //       //     return {
  //       //       x: (bodyA.position.x - bodyB.position.x) * 1e-6 * factor,
  //       //       y: (bodyA.position.y - bodyB.position.y) * 1e-6 * factor,
  //       //     };
  //       //   },
  //       // ],
  //     },
  //   };

  //   this.body = this.Matter.Bodies.circle(
  //     this.pos.x,
  //     this.pos.y,
  //     radius || this.diameter,
  //     bodyOptions
  //   );

  //   this.body.constraints = []; //i need to keep track which constraints each body has
  //   this.body.particle = this;

  //   this.world.add(this.engine.world, [this.body]);
  // }

  update(COUNTER) {
    this.genericUpdate(COUNTER);

    if (this.state != "dead") {
      this.lastY = this.pos.y;
      this.lastX = this.pos.x;
      //get the position in the matterjs world and have it here

      this.pos.x = this.body.position.x;
      this.pos.y = this.body.position.y;
      this.container.zIndex = Math.floor(this.pos.y);

      this.updateMyPositionInCell();
      this.nearParticles = this.getNearParticles();
      this.updateStateAccordingToStuff();

      this.doStuffAccordingToState();
      this.changeSpriteAccordingToStateAndVelocity();
    }

    this.animateSprite();
    this.animateGravityToParticles();

    // this.emitBlood();
    if (this.emitter) this.emitter.emit = false;

    this.render();
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

  amITotallyDead() {
    this.world.remove(this.engine.world, this.body);

    this.particleSystem.particles = this.particleSystem.particles.filter(
      (k) => k.body.id != this.body.id
    );

    this.particleSystem.mainContainer.removeChild(this.graphics);

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
        this.moveAndSubstractStamina();
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
  moveAndSubstractStamina() {
    let minStam = this.particleSystem.MINIMUM_STAMINA_TO_MOVE;
    if (!this.isStatic) {
      if (this.stamina >= minStam) {
        this.body.force.y +=
          this.vel.y * this.particleSystem.FORCE_REDUCER * this.speed;
        this.body.force.x +=
          this.vel.x * this.particleSystem.FORCE_REDUCER * this.speed;
        this.stamina -= minStam;
      } else {
        this.stamina += minStam;
      }
    }
  }

  updateStateAccordingToStuff() {
    // this.state = "searching";

    if (this.health <= 0) {
      this.die();
    }
  }

  throwAPunch() {
    // console.log("#", this.name, "punch");
    this.setState("attacking");
  }

  die() {
    this.body.isStatic = true;
    this.setState("dead");
    // this.createSprite("die_1");

    // setTimeout(() => this.remove(), 1000);
  }

  makeMeLookLeft() {
    // if (this.COUNTER - this.lastTimeItFlipped < this.spriteSpeed) return;

    this.image.scale.x = -1 * this.scale;
    this.image.x = 6;

    if (!this.amILookingLeft) {
      this.lastTimeItFlipped = this.COUNTER;
    }

    this.amILookingLeft = true;
  }

  makeMeLookRight() {
    // if (this.COUNTER - this.lastTimeItFlipped < this.spriteSpeed) return;

    this.image.scale.x = 1 * this.scale;
    this.image.x = -9;

    if (this.amILookingLeft) {
      this.lastTimeItFlipped = this.COUNTER;
    }

    this.amILookingLeft = false;
  }

  render() {
    this.genericRender();

    if (this.vel.x < 0) this.makeMeLookLeft();
    else this.makeMeLookRight();
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
    this.container.addChild(this.graphics);
  }
  createShadow() {
    // this.image = new PIXI.Sprite(this.particleSystem.res["walk"].texture);

    //CIRCLE
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill("0x000000");
    this.graphics.alpha = 0.16;
    this.graphics.drawEllipse(0, 0, this.diameter * 0.82, this.diameter / 4);
    this.graphics.endFill();
    this.graphics.position.x = 10;
    this.graphics.position.y = 40;
    this.container.addChild(this.graphics);
  }
}
