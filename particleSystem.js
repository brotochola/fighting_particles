//MATTER PIXI INTEGRATION
//https://github.com/celsowhite/matter-pixi/tree/master

class ParticleSystem {
  constructor(canvasId, width, height, Matter) {
    this.pixiApp;

    this.COUNTER = 0;

    //PERSPECTIVE STUFF

    this.minScaleOfSprites = 1;
    this.maxScaleOfSprites = 8;
    this.worldPerspective = 0.25;
    this.doPerspective = false;
    this.diameter = 4;

    this.cameraHeight = window.innerHeight / 2;

    this.CELL_SIZE = 40;
    this.buttonPanelHeight = 100;

    this.viewPortHeight = window.innerHeight - this.buttonPanelHeight;

    this.Matter = Matter;
    // Matter.use(MatterAttractors);
    this.engine = Matter.Engine.create();
    this.world = Matter.World;

    this.worldHeight = height || window.innerHeight - 100;
    this.worldWidth = width || window.innerWidth;

    // this.canvas = document.getElementById(canvasId);
    // this.context = this.canvas.getContext("2d");
    // this.canvas.width = width;
    // this.canvas.height = height;
    this.particles = []; // array to hold all particles
    this.bullets = [];
    this.createPixiStage();

    this.createGrid();

    this.addFloor();

    this.runEngine();

    // // Add event listener to resize canvas when window size changes
    // window.addEventListener('resize', () => {
    //     this.canvas.width = width;
    //     this.canvas.height = height;
    // });

    // this.addEventListenerToMouse();
    this.addClickListenerToCanvas();

    // this.addExtraCanvasForFire();

    this.addShortCuts();

    Matter.Events.on(this.engine, "collisionActive", (e) => {
      this.collisionHandler(e);
    });
  }

  togglePerspectiveMode() {
    this.doPerspective = !this.doPerspective;
    this.bg.visible = !this.bg.visible;
  }

  getDurationOfOneFrame() {
    return 1000 / PIXI.ticker.shared.FPS;
  }

  createPixiStage(cb) {
    this.renderer = PIXI.autoDetectRenderer(
      window.innerWidth,
      window.innerHeight - this.buttonPanelHeight,
      {
        // backgroundColor: "green",
        antialias: false,
        transparent: true,
        resolution: 1,
        autoresize: false,
      }
    );
    this.loader = PIXI.Loader.shared;
    this.pixiApp = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight - this.buttonPanelHeight,
    });

    //DEBUG
    globalThis.__PIXI_APP__ = this.pixiApp;

    this.loader.add("walk_1", "img/m_walk.png");
    this.loader.add("walk_2", "img/m_walk_2.png");
    this.loader.add("idle_1", "img/m_idle.png");
    this.loader.add("idle_2", "img/m_idle_2.png");
    this.loader.add("die_1", "img/m_dying_1.png");
    // this.loader.add("dead_1", "img/dead_1.png");
    this.loader.add("die_2", "img/m_dying_2.png");
    this.loader.add("attack_1", "img/m_attack.png");
    this.loader.add("attack_2", "img/m_attack_2.png");
    // this.loader.add("dead_2", "img/dead_2.png");
    this.loader.add("bg", "img/bg.jpg");
    this.loader.add("blood", "img/blood.png");
    // this.loader.add("wood", "wood.png");
    this.loader.load((loader, resources) => {
      this.res = resources;

      this.createBG();
      if (cb instanceof Function) cb();
    });

    this.canvas = this.pixiApp.view;

    this.canvas.oncontextmenu = () => false;

    this.canvas.id = "pixiCanvas";
    // this.canvas.onclick = (e) => this.handleClickOnCanvas(e);
    // this.canvas.onmousemove = (e) => this.handleMouseMoveOnCanvas(e);
    document.body.appendChild(this.canvas);
    this.mainContainer = new PIXI.Container();
    this.pixiApp.stage.addChild(this.mainContainer);
    this.pixiApp.stage.sortableChildren = true;
    this.mainContainer.sortableChildren = true;
  }

  createBG() {
    this.bg = new PIXI.TilingSprite(this.res["bg"].texture.clone());
    this.bg.width = this.worldWidth;
    this.bg.height = this.worldHeight;
    this.mainContainer.addChild(this.bg);
  }

  changeHeightForAllBoxes(howMuch) {
    this.particles.forEach((k) => {
      Matter.Body.scale(k.body, 1, howMuch);
    });
  }

  collisionHandler(e) {
    for (let p of e.pairs) {
      // console.log(p.bodyA, p.bodyB);

      // console.log(p)
      // debugger
      // console.log(p.bodyA, p.bodyB)

      // if (p.bodyA.id != "ground") p.bodyA.isSensor = true
      // if (p.bodyB.id != "ground") p.bodyB.isSensor = true

      // let maxConnectionsPerParticle = 3;

      // console.log(p.bodyA.label, p.bodyB.label);

      if (p.bodyA.label == "bullet" && p.bodyB.label == "bullet") {
        p.bodyA.particle.remove();
        p.bodyB.particle.remove();
      }

      if (p.bodyA.label == "bullet" && p.bodyB.label == "particle") {
        p.bodyB.particle.recieveDamage(p.bodyA.particle, "bullet");
        setTimeout(() => p.bodyA.particle.remove(), 50);
      }

      if (p.bodyB.label == "bullet" && p.bodyA.label == "particle") {
        p.bodyA.particle.recieveDamage(p.bodyB.particle, "bullet");
        setTimeout(() => p.bodyB.particle.remove(), 50);
      }

      if (p.bodyA.label == "ground" && p.bodyB.label == "bullet") {
        p.bodyB.particle.remove();
      }

      if (p.bodyB.label == "ground" && p.bodyA.label == "bullet") {
        p.bodyA.particle.remove();
      }

      if (
        p.bodyA.label == "particle" &&
        p.bodyB.label == "particle" &&
        (p.bodyA.particle || {}).team != (p.bodyB.particle || {}).team
      ) {
        p.bodyA.particle.recieveDamage(p.bodyB.particle);

        p.bodyB.particle.recieveDamage(p.bodyA.particle);
        p.bodyB.particle.throwAPunch();
        p.bodyA.particle.throwAPunch();
      }
    }
  }

  addShortCuts() {
    window.onkeydown = (e) => {
      window.keyIsDown = e.keyCode;
    };
    window.onkeyup = (e) => {
      window.keyIsDown = null;
      console.log("letra", e.keyCode);
      this.unHighlightAllParticles();
      if (e.keyCode == 32) {
        //space bar
        this.togglePause();
      } else if (e.keyCode == 71) {
        //G
        this.toggleGravity();
      } else if (e.keyCode == 84) {
        //G
        // this.addTargetToAllParticles(e);
      }
    };
  }

  // addTargetToAllParticles(e) {
  //   this.particles.forEach((particle) => {
  //     particle.target = {
  //       type: "randomTarget",
  //       pos: new p5.Vector(this.mouseX, this.mouseY),
  //     };
  //   });
  // }
  // toggleGravity() {
  //   this.engine.world.gravity.y = this.engine.world.gravity.y ? 0 : 1;
  //   this.showAlert(this.engine.world.gravity.y ? "gravity on" : "gravity off");
  // }
  showAlert(msg) {
    try {
      showAlert(msg);
    } catch (e) {
      console.warn(e);
      alert(msg);
    }
  }

  createBoxOfParticles(x, y, lines, rows, substance) {}

  runEngine() {
    this.render = Matter.Render.create({
      // bounds: {
      //   min: {
      //     x: 500,
      //     y: 0,
      //   },
      //   max: {
      //     x: 1,
      //     y: 1,
      //   },
      // },
      element: document.body,
      engine: this.engine,
      options: {
        // bounds: { x: { max: 100, min: 0 } },
        showStats: true,
        // hasBounds: true,
        // pixelRatio: "auto",
        // showPositions: true,
        width: this.worldWidth,
        // showVertexNumbers: true,
        constraintIterations: 4,
        positionIterations: 20,
        height: this.worldHeight,
        wireframes: false, // <-- important
        // showAngleIndicator: true,
      },
    });

    // let mouse = {
    //   ...this.Matter.Mouse.create(this.canvas),
    // };

    // let mouseConstraint = this.Matter.MouseConstraint.create(this.engine, {
    //   mouse: mouse,
    //   constraint: {
    //     // length: 100,
    //     stiffness: 0.5,
    //     damping: 0.5,
    //     render: {
    //       anchors: true,
    //       visible: false,
    //     },
    //   },
    // });

    // // keep the mouse in sync with rendering
    // this.render.mouse = mouse;
    // this.world.add(this.engine.world, mouseConstraint || {});

    this.engine.world.gravity.y = 0;

    // World.add(engine.world, constr);

    // run the renderer
    this.Matter.Render.run(this.render);

    // create runner
    this.runner = this.Matter.Runner.create();
    // this.runner.isFixed = true;
    // this.runner.delta = 10;

    // run the engine
    this.Matter.Runner.run(this.runner, this.engine);

    this.Matter.Events.on(this.runner, "tick", (e) => this.onTick(e));
  }
  togglePause() {
    this.runner.enabled = !this.runner.enabled;
    this.showAlert(
      this.runner.enabled ? "Simulation running" : "Simulation paused"
    );
  }
  indicateWhichParticleItIs(x, y) {
    let closeP = this.getParticlesAndTheirDistance(x, y);
    if (!closeP[0]) return;

    const maxDistance = this.diameter * 2;

    if (
      dist(x, y, closeP[0].body.position.x, closeP[0].body.position.y) <
      maxDistance
    ) {
      let p = closeP[0].body;
      window.tempParticle = p.particle;
      //DEBUG
      // p.particle.temperature += 200;
      console.log(p.particle);
    }
  }

  getParticlesAndTheirDistance(x, y, substance) {
    let arr = [];
    let chosenParticles;
    if (substance) {
      chosenParticles = this.particles.filter((k) => k.substance == substance);
    } else {
      chosenParticles = this.particles;
    }
    for (let i = 0; i < chosenParticles.length; i++) {
      let b = chosenParticles[i].body;
      let distance = dist(x, y, b.position.x, b.position.y);
      arr.push({ body: b, distance: distance });
    }

    let newArr = arr.sort((a, b) => (a.distance > b.distance ? 1 : -1));
    return newArr;
  }
  removeParticle(x, y) {
    let closePs = this.getParticlesAndTheirDistance(x, y);
    if (!closePs[0]) return;
    let closest = closePs[0];

    if (
      dist(x, y, closest.body.position.x, closest.body.position.y) <
      this.diameter * 3
    ) {
      closest.body.particle.remove();
    }
  }
  checkIfAPointCollidesWithTheGrounds(x, y) {
    let arr = this.engine.world.bodies.filter((k) => k.label == "ground");
    let isColliding = false;
    for (let gr of arr) {
      if (
        x > gr.bounds.min.x &&
        x < gr.bounds.max.x &&
        y > gr.bounds.min.y &&
        y < gr.bounds.max.y
      ) {
        isColliding = true;
        break;
      }
    }
    return isColliding;
  }

  // createStick(w, h) {
  //   let arr = [];
  //   let diam = this.diameter;
  //   let gap = diam - 2;
  //   for (let x = 100; x < 100 + w * 2 * diam; x += this.diameter + gap) {
  //     for (let y = 100; y < 100 + h * 2 * diam; y += this.diameter + gap) {
  //       arr.push(this.addParticle(x, y));
  //     }
  //   } //for
  //   this.addAutomaticConnections(arr);
  // }

  unHighlightAllParticles() {
    for (let p of this.particles) {
      p.unHighlight();
    }
  }

  createGrid = () => {
    this.grid = [];
    for (
      let i = Math.floor((-1.5 * this.worldHeight) / this.CELL_SIZE);
      i < this.worldHeight / this.CELL_SIZE + 2;
      i++
    ) {
      this.grid[i] = [];
      for (let j = -2; j < this.worldWidth / this.CELL_SIZE + 2; j++) {
        this.grid[i][j] = new Cell(i, j, this.CELL_SIZE, this.grid);
      }
    }
    return this.grid;
  };
  doScreenCameraMove() {
    let margin = 50;
    // console.log(
    //   this.screenX,
    //   this.screenY,
    //   window.innerHeight - this.buttonPanelHeight - margin
    // );

    let leftLimit = this.doPerspective ? window.innerWidth / 2 : 0;

    if (this.screenX > window.innerWidth - margin) {
      this.mainContainer.x -= 10;
    } else if (this.screenX < margin) {
      this.mainContainer.x += 10;
    }

    if (this.screenY > window.innerHeight - this.buttonPanelHeight - margin) {
      this.mainContainer.y -= 10;
    } else if (this.screenY < margin) {
      this.mainContainer.y += 10;
    }

    if (this.mainContainer.x > leftLimit) this.mainContainer.x = leftLimit;
    if (this.mainContainer.y > leftLimit) this.mainContainer.y = leftLimit;

    ///LIMITS:
    let rightEndOfScreen = -this.worldWidth + window.innerWidth - leftLimit;
    if (this.mainContainer.x < rightEndOfScreen)
      this.mainContainer.x = rightEndOfScreen;

    let bottomEnd = -this.worldHeight + window.innerHeight - leftLimit;
    if (this.mainContainer.y < bottomEnd) this.mainContainer.y = bottomEnd;
  }

  addClickListenerToCanvas() {
    let canvas = this.canvas;
    canvas.onmouseleave = (e) => (window.isDown = false);
    canvas.onmousedown = (e) => {
      window.isDown = e.which;
      let box = canvas.getBoundingClientRect();
      let x = e.x - box.x - this.mainContainer.x;
      let y = e.y - box.y - this.mainContainer.y;
      if (e.which == 1) this.indicateWhichParticleItIs(x, y);
      else if (e.which == 3) {
        if (this.checkIfAPointCollidesWithTheGrounds(x, y)) {
          this.addParticle(x, y);
        } else {
          this.addParticle(x, y);
        }
      }
    };
    canvas.onmouseup = (e) => {
      window.isDown = false;
    };
    canvas.onmousemove = (e) => {
      let box = canvas.getBoundingClientRect();

      this.screenX = e.x - box.x;
      this.screenY = e.y - box.y;

      let x = this.screenX - this.mainContainer.x;
      let y = this.screenY - this.mainContainer.y;

      this.mouseX = x;
      this.mouseY = y;

      if (!window.isDown && !window.keyIsDown) return;

      if (window.isDown == 2) {
        //REMOVE PARTICLES

        this.removeParticle(x, y);

        return;
      } else if (window.isDown == 3) {
        //ADD PARTICLES WHILE DRAGGING

        //GOO MODE DOESN'T WORK WHILE DRAGGING!
        this.addParticle(x, y);
      }

      //KEYS
      if (window.keyIsDown == 87) {
        // console.log(1);
        //W
        this.addParticle(x, y, true);
      } else if (window.keyIsDown == 77) {
        //M
        for (let i = 0; i < 10; i++)
          this.addParticle(
            x + Math.random() * 20,
            y + Math.random() * 20,
            false
          );
      } else if (window.keyIsDown == 72) {
        //H (heat)
        // let closeParticles = this.getParticlesAndTheirDistance(x, y, null);
        // for (let p of closeParticles) {
        //   let part = p.body.particle || {};
        //   if (p.distance < 25) {
        //     let part = p.body.particle || {};
        //     part.highlight();
        //     part.heatUp(5);
        //   } else {
        //     part.unHighlight();
        //   }
        // }
      }
      // else if (window.keyIsDown == 67) {
      //   //C (cold)
      //   let closeParticles = this.getParticlesAndTheirDistance(x, y, null);
      //   for (let p of closeParticles) {
      //     let part = p.body.particle || {};

      //     if (p.distance < 25) {
      //       let part = p.body.particle || {};
      //       part.highlight();
      //       part.heatUp(-50);
      //     } else {
      //       part.unHighlight();
      //     }
      //   }
      // }
    };
  }

  // addEventListenerToMouse() {
  //   //THIS IS THE BURNING FUNCTION!
  //   // Add event listener to handle particle interaction on click
  //   this.canvas.addEventListener("mousemove", (event) => {
  //     const rect = this.canvas.getBoundingClientRect();
  //     const mouseX = event.clientX - rect.left;

  //     const mouseY = event.clientY - rect.top

  //     const x = mouseX - this.mainContainer.x;
  //     const y = mouseY - this.mainContainer.y;

  //     const energy = 10000; // Energy to transfer on click

  //     // // Check for particles near mouse pointer and set them on fire
  //     // for (const particle of this.particles) {
  //     //   const distance = Math.sqrt(
  //     //     Math.pow(mouseX - particle.x, 2) + Math.pow(mouseY - particle.y, 2)
  //     //   );
  //     //   if (distance <= 5) {
  //     //     // particle.onFire = true;
  //     //     particle.applyHeat(energy);
  //     //     // console.log(particle)
  //     //   }
  //     //   // else {
  //     //   //     particle.onFire = false;
  //     //   // }
  //     // }
  //   });
  // }
  addFloor() {
    var ground = Bodies.rectangle(0, this.worldHeight + 90, 3000, 200, {
      restitution: 0,
      friction: 0.5,
      slop: 0,
      label: "ground",
      render: {
        fillStyle: "red",
        lineWidth: 0,
      },
      isStatic: true,
      render: { fillStyle: "black" },
    });

    var roof = Bodies.rectangle(0, -95, 3000, 200, {
      restitution: 0,
      friction: 0.5,
      slop: 0,
      label: "ground",

      isStatic: true,
      render: { fillStyle: "black" },
    });

    var leftWall = Bodies.rectangle(
      -90,
      this.worldHeight / 2,
      200,
      this.worldHeight,
      {
        restitution: 0,
        friction: 0.5,
        slop: 0,
        label: "ground",

        isStatic: true,
        render: { fillStyle: "black" },
      }
    );

    var rightWall = Bodies.rectangle(
      this.worldWidth + 90,
      this.worldHeight / 2,
      200,
      this.worldHeight,
      {
        restitution: 0,
        friction: 0.5,
        slop: 0,
        label: "ground",

        isStatic: true,
        render: { fillStyle: "black" },
      }
    );

    // add all of the bodies to the world
    this.world.add(this.engine.world, [ground, leftWall, rightWall, roof]);
  }

  addParticle(x, y, isStatic) {
    // let substance = "wood";
    /// IT CAN BE WOOD GAS ;)

    const particle = new Person({
      x,
      y,

      diameter: 20,
      particleSystem: this,
      team: window.addingParticlesOfTeam,
      isStatic,
    });
    particle.particles = this.particles;
    this.particles.push(particle);
    window.tempParticle = particle;
    return particle;
  }

  addBullet(part) {
    // console.log(part.vel);

    let bullet = new Bullet({
      engine: this.engine,
      x: part.pos.x,
      y: part.pos.y,
      vel: part.vel,
      particleSystem: this,
      Matter: this.Matter,
      diameter: part.diameter,
    });
    this.bullets.push(bullet);
    // console.log(bullet);
  }

  onTick(e) {
    this.prevFrameTime = this.currentFrameTime || 0;
    this.currentFrameTime = performance.now();
    this.deltaTime = this.currentFrameTime - this.prevFrameTime;
    // Update all particles in the system
    this.COUNTER++;
    this.doScreenCameraMove();

    for (const particle of this.particles) {
      particle.update(this.COUNTER);
    }
    for (const bullet of this.bullets) {
      bullet.update(this.COUNTER);
    }
  }

  // calculateAverageTemperature(subst) {
  //   // Calculate the average temperature of all particles
  //   let chosenPArticles;
  //   if (subst) {
  //     chosenPArticles = this.particles.filter((k) => k.substance == subst);
  //   } else {
  //     chosenPArticles = this.particles;
  //   }
  //   let totalTemperature = 0;
  //   for (const particle of chosenPArticles) {
  //     totalTemperature += particle.temperature;
  //   }
  //   return totalTemperature / chosenPArticles.length;
  // }

  //   render() {
  //     // Clear the canvas
  //     this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  //     // Render all particles in the system
  //     for (const particle of this.particles) {
  //       particle.render(this.context);
  //     }

  //     // Update information div
  //     // const infoDiv = document.getElementById('info');
  //     // const overallEnergy = this.calculateOverallEnergy();
  //     // const averageTemperature = this.calculateAverageTemperature();
  //     // infoDiv.innerHTML = `Overall Energy: ${overallEnergy.toFixed(2)} | Average Temperature: ${averageTemperature.toFixed(2)}`;
  //   }

  //   startSimulation() {
  //     // Start the simulation loop
  //     const updateAndRender = () => {
  //       this.update();
  //       this.render();
  //       requestAnimationFrame(updateAndRender);
  //     };
  //     updateAndRender();
  //   }

  //   init() {
  //     //CREATES PARTICLES OF WOOD
  //     for (let i = 0; i < 110; i++) {
  //       for (let j = 0; j < 22; j++) {
  //         let random1 = Math.random() * 0.1 + 0.95;
  //         let random2 = Math.random() * 0.1 + 0.95;
  //         const x = i * random1 + 300;
  //         const y = 200 + j * random2;
  //         this.addParticle(x, y, "wood");
  //       }
  //     }
  //     for (let p of this.particles) {
  //       for (let p2 of this.particles) {
  //         if (p == p2) continue;
  //         const distance = Math.sqrt(
  //           Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2)
  //         );
  //         if (distance > 2) continue;
  //         p.nearParticles.push(p2);
  //       }
  //     }
  //   }

  findOutIfThereIsAlreadyAConstraintWithTheseTwoBodies(b1, b2) {
    let which = this.engine.world.constraints.filter((k) => {
      return (
        ((k.bodyA || {}).id == b1.id && (k.bodyB || {}).id == b2.id) ||
        ((k.bodyB || {}).id == b1.id && (k.bodyA || {}).id == b2.id)
      );
    });
    if (which.length > 0) return which[0];
  }

  // addAutomaticConnections(arr, doNotCareAboutGooBuilding) {
  //   // console.log("#add automatic", numberOfAutomaticConnections, arr)
  //   // if (numberOfAutomaticConnections == undefined) numberOfAutomaticConnections = 3

  //   let howManyConnectionsWeMadeNow = 0;

  //   arr = arr ? arr : this.particles.filter((k) => k.substance == "wood");
  //   for (let i = 0; i < arr.length; i++) {
  //     //EACH BODY

  //     if (arr[i].substance == "woodGas") continue;

  //     let maxDistanceDependingOnGooModeOrNot =
  //       this.config[arr[i].substance].maxDistanceToAttach *
  //       (doNotCareAboutGooBuilding && this.gooBuilding ? 2 : 1);

  //     let b = arr[i].body;
  //     let closestP = this.getParticlesAndTheirDistance(
  //       b.position.x,
  //       b.position.y,
  //       arr[i].substance
  //     );

  //     //ONLY CLOSE PARTICLES, MADE OF THE SAME SUBSTANCE
  //     closestP = (closestP || []).filter(
  //       (k) =>
  //         k.distance < maxDistanceDependingOnGooModeOrNot &&
  //         k.body.particle.substance == arr[i].substance
  //     );

  //     //GET THE CLOSEST BODIES
  //     for (let i = 0; i < closestP.length; i++) {
  //       // if (counterOfConstraints >= numberOfAutomaticConnections) break
  //       let closeParticle = closestP[i];

  //       let closePArticleSubstance = closeParticle.body.particle.substance;

  //       if (!closeParticle) continue;
  //       if (closeParticle.body == b) continue;
  //       if (closeParticle.distance == 0) continue;
  //       if (
  //         this.findOutIfThereIsAlreadyAConstraintWithTheseTwoBodies(
  //           closeParticle.body,
  //           b
  //         )
  //       ) {
  //         continue;
  //       }
  //       //CHECK HOW MANY CONSTRAINTS IT ALREADY HAS
  //       //I KEEP TRACK OF THIS MYSELF IN EACH BODY
  //       if (
  //         (b.constraints || []).length >=
  //           this.config[closePArticleSubstance].maxNumberOfConnectionsPerBody ||
  //         (closeParticle.constraints || []).length >=
  //           this.config[closePArticleSubstance].maxNumberOfConnectionsPerBody
  //       ) {
  //         break;
  //       }

  //       // alert(1)

  //       let newConstraint = this.Matter.Constraint.create({
  //         pointA: { x: 0, y: 0 },
  //         pointB: { x: 0, y: 0 },
  //         // length:

  //         angularStiffness: 0.9,
  //         stiffness: 1,
  //         damping: 0,
  //         render: {
  //           visible: false,
  //           anchors: false,
  //           // strokeStyle: "rgba(255,255,255,0.3)",
  //           // lineWidth: 1,
  //           strokeStyle:
  //             closePArticleSubstance == "wood"
  //               ? makeRGBA(getRandomBrownishColor(0.1, 0.22))
  //               : "rgba(255,255,255,0.5)",
  //           lineWidth:
  //             closePArticleSubstance == "wood"
  //               ? this.config[closePArticleSubstance].diameter * 3
  //               : 1,
  //         },
  //         bodyA: closeParticle.body,
  //         bodyB: b,
  //       });
  //       //ADD CONSTRAINT TO THE WORLD
  //       this.world.add(this.engine.world, [newConstraint]);

  //       //ADD CONSTRAINT TO BOTH BODIES, TO KEEP TRACK OF THEM
  //       if (!Array.isArray(b.constraints)) b.constraints = [];
  //       b.constraints.push(newConstraint);

  //       if (!Array.isArray(closeParticle.body.constraints))
  //         closeParticle.body.constraints = [];
  //       closeParticle.body.constraints.push(newConstraint);

  //       howManyConnectionsWeMadeNow++;
  //     } //for
  //   } //for

  //   console.log("#we added ", howManyConnectionsWeMadeNow, " contraints");
  // }

  // toggleGooBuilding() {
  //   this.gooBuilding = !this.gooBuilding;
  //   this.showAlert(this.gooBuilding ? "goo mode enabled" : "goo mode disabled");
  // }

  // toggleViewConstraints() {
  //   for (let c of this.engine.world.constraints) {
  //     c.render.visible = !this.constraintsVisible;
  //   }
  //   this.constraintsVisible = !this.constraintsVisible;
  //   this.showAlert(
  //     this.constraintsVisible ? "constraints visible" : "constraints hidden"
  //   );
  // }
}
