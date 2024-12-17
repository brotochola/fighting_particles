//MATTER PIXI INTEGRATION
//https://github.com/celsowhite/matter-pixi/tree/master

class ParticleSystem {
  constructor(
    canvasId,
    width,
    height,
    Matter,
    panelInfoElement,
    configElement
  ) {
    window.keyIsDown = [];
    this.pixiApp;
    this.panelInfoElement = panelInfoElement;
    this.configElement = configElement;

    this.COUNTER = 0;
    this.debugMode = false;

    //PERSPECTIVE STUFF

    // this.minScaleOfSprites = 1;
    // this.maxScaleOfSprites = 8;
    // this.worldPerspective = 0.25;
    // this.doPerspective = false;

    this.cameraHeight = window.innerHeight / 2;
    //LLAMO MULTIPLIERS/REDUCERS A ESTOS COEFICIENTES Q SE USAN PARA TUNEAR EL JUEGO
    this.MULTIPLIERS = {
      DO_FLOCKING: true,
      FORCE_REDUCER: 0.1,
      SPEED_REDUCER: 1.7,
      FEAR_REDUCER: 0.3,
      HEALTH_RECOVERY_REDUCER: 0.0003,
      FEAR_RECOVERY_REDUCER: 0.002,
      FEAR_INCREASE_DUE_TO_HEALTH: 0.007,
      ANGER_RECOVERY_REDUCER: 0.01,
      POLICE_ANGER_MULTIPLIER: 0.001,
      HEALTH_LIMIT_TO_ESCAPE: 0.1,
      FEAR_LIMIT_TO_ESCAPE: 0.75,
      EXTRA_SPEED_WHEN_ESCAPING: 1.3,
      POLI_FORCE_PUSH_MULTIPLIER: 3,
      BULLET_FORCE_REDUCER: 0.001,
      BULLETS_STRENGTH: 3,
      ROCK_FORCE_REDUCER: 0.06,
      ROCK_STRENGTH: 1,
      ROCK_SPEED: 8,
      ROCK_MAX_HEIGHT: 100,
      LIMITE_DE_CORAJE_PARA_SER_UN_CAGON: 0.5,
      CANTIDAD_DE_FRAMES_PARA_DEJAR_DE_SER_UN_VIOLENTO: 180,
    };

    //////////////////// FIN REDUCERS
    this.MINIMUM_STAMINA_TO_MOVE = 0.01;
    this.CELL_SIZE = 40;

    this.buttonPanelHeight = 100;

    this.viewportHeight = window.innerHeight - this.buttonPanelHeight;
    this.viewportWidth = window.innerWidth;

    this.Matter = Matter;

    this.engine = Matter.Engine.create();
    this.world = Matter.World;

    this.worldHeight = height;
    this.worldWidth = width;

    this.spritesheets = {};

    this.sideMarginForLevels = 500;

    // this.mousePosUniform = new PIXI.Point(0.1, 0.1);

    // this.canvas = document.getElementById(canvasId);
    // this.context = this.canvas.getContext("2d");
    // this.canvas.width = width;
    // this.canvas.height = height;
    this.people = []; // array to hold all particles
    this.directionArrows = [];
    this.cars = [];
    // this.fences = [];
    this.fixedObjects = [];
    this.grounds = [];
    this.poles = [];
    this.bullets = [];
    this.createPixiStage(() => {
      this.createGrid();
      this.setMainContainerInStartingPosition();

      this.runEngine();

      this.addClickListenerToCanvas();

      this.addShortCuts();

      Matter.Events.on(this.engine, "collisionActive", (e) => {
        this.collisionHandler(e);
      });

      this.createUI();
      this.addFiltersToStage();
      this.disableFilters();
      // this.addShaders();
    });
  }
  createUI() {
    this.UI = new UI({
      particleSystem: this,
      panelInfoElement: this.panelInfoElement,
      configElement: this.configElement,
    });
    this.configElement.style.display = "none";
  }

  getDurationOfOneFrame() {
    return 1000 / PIXI.ticker.shared.FPS;
  }

  // ponerSangreDondeEstabaUnChaboncito(chaboncito) {
  //   let splatDeSangre = new PIXI.AnimatedSprite(
  //     this.particleSystem.res["splat_ss"].animations["splat"]
  //   );

  //   let angulo = Math.atan2(
  //     this.player.container.y - chaboncito.sprite.y,
  //     this.player.container.x - chaboncito.sprite.x
  //   );
  //   splatDeSangre.rotation = angulo;

  //   splatDeSangre.x = chaboncito.sprite.x;
  //   splatDeSangre.y = chaboncito.sprite.y;
  //   this.app.stage.addChild(splatDeSangre);
  //   splatDeSangre.play();

  //   splatDeSangre.animationSpeed = 1;
  //   splatDeSangre.loop = false;
  //   splatDeSangre.onComplete = () => {};
  //   // this.sprite.play();
  //   // this.app.stage.addChild(this.sprite);

  //   splatDeSangre.anchor.set(0.5, 0.5);
  // }
  async cargarAssets() {
    const assetsToLoad = {
      splat_ss: "img/splat_ss/splat.json",
      boca_ss: "img/boca_ss/boca.json",
      humo_ss: "img/humo_ss/humo.json",
      ambulancia_ss: "img/ambulancia_ss/ambulancia.json",
      river_ss: "img/river_ss/river.json",
      poli_ss: "img/poli_ss/agent.json",
      civil_ss: "img/civil_ss/civil.json",
      bg: "img/bg3.jpg",
      blood: "img/blood.png",
      pole: "img/pole.png",
      casa15: "img/casas/casa15.png",
      casa16: "img/casas/casa16.png",
      casa17: "img/casas/casa17.png",
      casa18: "img/casas/casa18.png",
      casa19: "img/casas/casa19.png",
      casa20: "img/casas/casa20.png",
      casa21: "img/casas/casa21.png", // //CALLES
      calle3: "img/casas/calle3.png",
      calle2: "img/casas/calle2.png",
    };

    for (const [alias, src] of Object.entries(assetsToLoad)) {
      console.log(alias, src);
      PIXI.Assets.add({ alias, src });
    }

    // Cargar todos los assets registrados

    const loadedAssets = await PIXI.Assets.load(Object.keys(assetsToLoad));

    console.log("Assets cargados:", loadedAssets);

    this.res = loadedAssets;

    this.createBG();
  }

  async createBG() {
    console.log("#create bg");
    let tex = await PIXI.Assets.load("bg");

    // console.log("##", tex);

    this.bg = new PIXI.TilingSprite(tex);
    this.bg.name = "BG";
    this.bg.width = this.worldWidth;
    this.bg.height = this.worldHeight;
    this.bg.tileScale.set(0.666);
    this.mainContainer.addChild(this.bg);
  }

  createPixiStage(cb) {
    this.pixiApp = new PIXI.Application();

    this.pixiApp
      .init({
        hello: true,

        preference: "webgl",
        // autoresize: true,
        // resizeTo: window,
        width: this.viewportWidth,
        height: this.viewportHeight,
        autoDensity: true, // Escala automáticamente el canvas para que se vea bien
        backgroundAlpha: 0,
        transparent: true,
        // resolution: 0.5,
        antialias: false,
      })
      .then((e) => {
        globalThis.__PIXI_APP__ = this.pixiApp;
        document.body.appendChild(this.pixiApp.canvas);
        this.canvas = this.pixiApp.canvas;

        this.cargarAssets().then((e) => {
          this.canvas.oncontextmenu = () => false;

          this.canvas.id = "pixiCanvas";
          // this.canvas.onclick = (e) => this.handleClickOnCanvas(e);
          // this.canvas.onmousemove = (e) => this.handleMouseMoveOnCanvas(e);
          document.body.appendChild(this.canvas);

          this.mainContainer = new PIXI.Container();
          this.mainContainer.name = "Main Container";
          this.pixiApp.stage.addChild(this.mainContainer);

          this.createBloodContainer();
          this.createShadowsContainer();

          // this.pixiApp.renderer.roundPixels;
          this.pixiApp.stage.sortableChildren = true;
          this.mainContainer.sortableChildren = true;

          if (cb instanceof Function) {
            cb();
          }
        });
      });

    //DEBUG

    ///
  }

  createShadowsContainer() {
    this.shadowsContainer = new PIXI.Container();
    this.shadowsContainer.name = "Shadows Container";
    this.mainContainer.addChild(this.shadowsContainer);
    this.shadowsContainer.zIndex = 1;
    this.shadowsContainer.filters = [new PIXI.filters.KawaseBlurFilter(3)];
    
  }
  createBloodContainer() {
    this.bloodContainer = new PIXI.Container();
    this.bloodContainer.name = "Blood Container";
    this.mainContainer.addChild(this.bloodContainer);
    this.bloodContainer.zIndex = 2;
    this.bloodContainer.cullable = true;
  }
  setMainContainerInStartingPosition() {
    //LA IDEA ES DEJAR CHANGUI A LA IZQ Y ARRIBA
    this.mainContainer.x = -this.sideMarginForLevels;
    this.mainContainer.y = -this.sideMarginForLevels;
  }

  createGridDebug() {
    if (this.gridDebugGraphics) return;
    this.gridDebugGraphics = new PIXI.Graphics();
    this.gridDebugGraphics.name = "Grid debug";
    this.mainContainer.addChild(this.gridDebugGraphics);
    this.gridDebugGraphics.zIndex = 4;
  }

  setStageScale() {
    // debugger
    this.pixiApp.stage.scale.set(this.stageScale);
    let bounds = this.pixiApp.stage.getBounds();
    this.pixiApp.stage.x = -bounds.width / 2;
    this.pixiApp.stage.y = -bounds.height / 2;
  }

  changeHeightForAllBoxes(howMuch) {
    this.people.forEach((k) => {
      Matter.Body.scale(k.body, 1, howMuch);
    });
  }

  getCellAt(x, y) {
    let cellX = Math.floor(x / this.CELL_SIZE);
    let cellY = Math.floor(y / this.CELL_SIZE);
    if (isNaN(cellY) || isNaN(cellX)) {
      return console.warn("getCellAt x or y wrong", x, y);
    }
    return (this.grid[cellY] || [])[cellX];
  }

  getObjectsAt(x, y) {
    // let ret;

    let newCell = this.getCellAt(x, y);

    return (newCell || {}).particlesHere || [];
  }

  collisionHandler(e) {
    for (let p of e.pairs) {
      // console.log(p.bodyA.label, p.bodyB.label);

      // if (p.bodyA.label == "bullet" && p.bodyB.label == "bullet") {
      //   p.bodyA.particle.remove();
      //   p.bodyB.particle.remove();
      // }

      // if (p.bodyA.label == "bullet" && p.bodyB.label == "person") {
      //   p.bodyB.particle.recieveDamage(p.bodyA.particle, "bullet");
      //   setTimeout(() => p.bodyA.particle.remove(), this.deltaTime);
      // }

      // if (p.bodyB.label == "bullet" && p.bodyA.label == "person") {
      //   p.bodyA.particle.recieveDamage(p.bodyB.particle, "bullet");
      //   setTimeout(() => p.bodyB.particle.remove(), this.deltaTime);
      // }

      if (p.bodyA.label == "auto" && p.bodyB.label == "person") {
        let person = p.bodyB.particle;
        person.recieveDamageFrom(
          p.bodyA.particle,
          cheaperDist(
            0,
            0,
            p.bodyA.particle.body.velocity.x,
            p.bodyA.particle.body.velocity.y
          ) * 0.66
        );
      } else if (p.bodyB.label == "auto" && p.bodyA.label == "person") {
        let person = p.bodyA.particle;
        person.recieveDamageFrom(
          p.bodyB.particle,
          cheaperDist(
            0,
            0,
            p.bodyB.particle.body.velocity.x,
            p.bodyB.particle.body.velocity.y
          ) * 0.66
        );
      }
    }
  }

  addShortCuts() {
    window.onkeydown = (e) => {
      if (!Array.isArray(window.keyIsDown)) window.keyIsDown = [];
      if (!window.keyIsDown.includes(e.keyCode))
        window.keyIsDown.push(e.keyCode);
    };
    window.onkeyup = (e) => {
      window.keyIsDown = window.keyIsDown.filter((k) => k != e.keyCode);
      console.log("letra", e.keyCode);
      this.unHighlightAllParticles();
      this.evaluateKeyDowns(e.keyCode);

      if (e.keyCode == 32) {
        //space bar
        this.togglePause();
      }
    };
  }
  getAllParticlesOfClass(classname) {
    return this.people.filter((k) => k instanceof classname);
  }

  // addTargetToAllParticles(e) {
  //   this.people.forEach((particle) => {
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
    this.matterJSrender = Matter.Render.create({
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
        positionIterations: 999,
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
    // this.matterJSrender.mouse = mouse;
    // this.world.add(this.engine.world, mouseConstraint || {});

    this.engine.world.gravity.y = 0;

    // World.add(engine.world, constr);

    // run the renderer
    this.Matter.Render.run(this.matterJSrender);

    // create runner
    this.runner = this.Matter.Runner.create({ isFixed: true, delta: 12 });
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

    const maxDistance = 20;
    this.getPeopleAndCars().forEach((person) => {
      try {
        person.unHighlight();
      } catch (e) {
        debugger;
      }
    });

    if (
      dist(x, y, closeP[0].body.position.x, closeP[0].body.position.y) <
      maxDistance
    ) {
      let p = closeP[0].body;
      this.selectedPerson = p.particle;
      window.sel = p.particle;

      console.log(p.particle);
      p.particle.highlight();
    } else {
      this.selectedPerson = null;
    }
  }

  getParticlesAndTheirDistance(x, y) {
    let arr = [];
    let chosenParticles;
    let peopleAndCars = this.getPeopleAndCars();

    for (let i = 0; i < peopleAndCars.length; i++) {
      let b = peopleAndCars[i].body;
      let distance = dist(x, y, b.position.x, b.position.y);
      arr.push({ body: b, distance: distance });
    }

    let newArr = arr.sort((a, b) => (a.distance > b.distance ? 1 : -1));
    return newArr;
  }
  removeParticle(x, y) {
    this.indicateWhichParticleItIs(x, y);
    if (!this.selectedPerson) return;

    this.selectedPerson.remove();
  }

  // createStick(w, h) {
  //   let arr = [];
  //   let diam = this.diameter;
  //   let gap = diam - 2;
  //   for (let x = 100; x < 100 + w * 2 * diam; x += this.diameter + gap) {
  //     for (let y = 100; y < 100 + h * 2 * diam; y += this.diameter + gap) {
  //       arr.push(this.addFan(x, y));
  //     }
  //   } //for
  //   this.addAutomaticConnections(arr);
  // }

  unHighlightAllParticles() {
    for (let p of this.people) {
      p.unHighlight();
    }
  }

  createGrid() {
    this.grid = [];

    //MAKE SURE NO ONE HAS ANY CELL
    this.getAllObjects().forEach((k) => {
      if (k.cell) k.cell = null;
      if (k.occupiedCells) k.occupiedCells = [];
    });

    for (
      let i = 0;
      i <
      Math.floor(
        (this.worldHeight + this.sideMarginForLevels) / this.CELL_SIZE
      ) +
        2;
      i++
    ) {
      this.grid[i] = [];
      for (
        let j = 0;
        j <
        Math.floor(
          (this.worldWidth + this.sideMarginForLevels) / this.CELL_SIZE
        ) +
          2;
        j++
      ) {
        this.grid[i][j] = new Cell(i, j, this.CELL_SIZE, this.grid, this);
      }
    }

    return this.grid;
  }

  doScreenCameraMove() {
    if (this.mouseLeft) return;
    let margin = 50;
    let move = 25;
    // console.log(
    //   this.screenX,
    //   this.screenY,
    //   window.innerHeight - this.buttonPanelHeight - margin
    // );

    let leftLimit = 0;

    if (
      // this.screenX > this.viewportWidth - margin ||
      window.keyIsDown.includes(68)
    ) {
      this.mainContainer.x -= move;
    } else if (
      // this.screenX < margin ||
      window.keyIsDown.includes(65)
    ) {
      this.mainContainer.x += move;
    }

    if (
      // this.screenY > this.viewportHeight - this.buttonPanelHeight - margin ||
      window.keyIsDown.includes(83)
    ) {
      this.mainContainer.y -= move;
    } else if (
      // this.screenY < margin ||
      window.keyIsDown.includes(87)
    ) {
      this.mainContainer.y += move;
    }

    if (this.mainContainer.x > leftLimit) this.mainContainer.x = leftLimit;
    if (this.mainContainer.y > leftLimit) this.mainContainer.y = leftLimit;

    ///LIMITS:
    let rightEndOfScreen = -this.worldWidth + this.viewportWidth - leftLimit;
    if (this.mainContainer.x < rightEndOfScreen)
      this.mainContainer.x = rightEndOfScreen;

    let bottomEnd = -this.worldHeight + this.viewportHeight; //+this.buttonPanelHeight;
    if (this.mainContainer.y < bottomEnd) this.mainContainer.y = bottomEnd;

    // this.movePerspectiveCSSBackground();
  }

  getRatioOfBGX() {
    return -this.mainContainer.x / (this.worldWidth - this.viewportWidth);
  }

  getRatioOfBGY() {
    return -this.mainContainer.y / (this.worldHeight - this.viewportHeight);
  }

  // movePerspectiveCSSBackground() {
  //   let rotationX = 40;

  //   let ratioOfXForBG = this.getRatioOfBGX();
  //   let ratioOfYForBG = this.getRatioOfBGY();

  //   let xOffset = (ratioOfXForBG * -30).toFixed(3);
  //   let yOffset = (-30 * ratioOfYForBG).toFixed(3);

  //   // console.log(yOffset);
  //   let stringToPass =
  //     "rotateX(" +
  //     rotationX +
  //     "deg) translate3d(calc(-100vw + " +
  //     xOffset +
  //     "%), " +
  //     yOffset +
  //     "%, 105vw)";

  //   // console.log(stringToPass);
  //   document.querySelector("#bg").style.transform = stringToPass;
  // }

  addGas(x, y) {
    let cell = this.getCellAt(x, y);
    if (!cell.blocked) cell.gas = 30;
  }

  addClickListenerToCanvas() {
    let canvas = this.canvas;

    canvas.onmouseleave = (e) => {
      window.isDown = false;
      this.mouseLeft = true;
    };
    canvas.onmouseenter = (e) => {
      this.mouseLeft = false;
    };

    this.mainContainer.interactive = true;
    this.mainContainer.on("pointerdown", (e) => {
      this.leftMouseButtonDown = true;

      this.indicateWhichParticleItIs(this.mouseX, this.mouseY);
      window.tempCell = this.getCellAt(this.mouseX, this.mouseY);
      if (e.buttons == 4) this.removeParticle(this.mouseX, this.mouseY);
    });
    this.mainContainer.on("pointerup", (e) => {
      this.leftMouseButtonDown = false;
      this.unHighlightAllCells();
    });
    this.mainContainer.on("pointermove", (e) => {
      this.lastPointerMoveEvent = e;

      this.mouseX = e.global.x - this.mainContainer.x;
      this.mouseY = e.global.y - this.mainContainer.y;

      this.seeWhatObjectsImOn(e);
      if (this.leftMouseButtonDown)
        this.showDirectionVectorOfCells(this.mouseX, this.mouseY);

      if (e.buttons == 4) {
        //REMOVE PARTICLES
        this.removeParticle(this.mouseX, this.mouseY);
      }

      this.evaluateKeyDowns(window.keyIsDown);
    });

    window.onresize = (e) => {
      this.handleWindowResize(e);
    };
  }

  handleWindowResize(e) {
    // this.filters=
    this.viewportHeight = window.innerHeight - this.buttonPanelHeight;
    this.viewportWidth = window.innerWidth;

    this.canvas.width = this.viewportWidth;
    this.canvas.height = this.viewportHeight;
    this.matterJSrender.canvas.width = this.worldWidth;
    this.matterJSrender.canvas.height = this.worldHeight;

    this.pixiApp.renderer.resize(this.viewportWidth, this.viewportHeight);

    // this.pixiApp.renderer.width=this.viewportWidth;
    // this.pixiApp.renderer.height=this.viewportHeight;
    // this.bg.width=this.view
  }

  seeWhatObjectsImOn(mousePos) {
    let objects = this.getCellAt(
      this.mouseX,
      this.mouseY
    ).getParticlesFromHereAndNeighboorCells();
    // console.log(objects)

    this.fixedObjects
      .map((k) => k.container)
      .forEach((element) => {
        element.alpha = 1;
        if (isMouseOverPixel(mousePos, element)) {
          // console.log(`Mouse sobre:`, element.owner);
          element.alpha = 0.33;
          element.owner.mouseover = true;
        } else {
          element.owner.mouseover = false;
        }
      });

    // this.grounds.map((k) => {
    //   let cont = k.container;
    //   k.occupiedCells.forEach((k) => k.unHighlight());
    //   if (isMouseOverPixel(x,y, cont)) {
    //     k.occupiedCells.forEach((k) => k.showDirectionVector());
    //   }
    // });
  }

  unHighlightAllCells() {
    this.grid.flat().forEach((cell) => cell.unHighlight());
  }
  showDirectionVectorOfCells(x, y) {
    this.unHighlightAllCells();
    this.getCellAt(x, y)
      .getMoreNeighbours(3, 3)
      .forEach((cell) => {
        cell.showDirectionVector(2, "orange");
        cell.showDirectionVector(1, 0x00ff00);
      });
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
  //     // for (const particle of this.people) {
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

  evaluateKeyDowns(key) {
    let x = this.mouseX;
    let y = this.mouseY;
    //KEYS
    if (key == 66) {
      //B de boca
      this.addFan(x, y, false, "boca");
    } else if (key == 82) {
      //R de river
      this.addFan(x, y, false, "river");
    } else if (key == 70) {
      //F de fijo
      this.addFan(x, y, true, "river");
    } else if (key == 80) {
      //P de poli
      this.addPoli(x, y, false);
    } else if (key == 86) {
      //V
      this.addPole({ x, y, particleSystem: this });
    } else if (key == 77) {
      //M
      for (let i = 0; i < 10; i++)
        this.addFan(
          x + Math.random() * 20,
          y + Math.random() * 20,
          false,
          "boca"
        );
    } else if (key == 67) {
      // C DE CASA
      this.addHouse({
        x,
        y,
        particleSystem: this,
        type: Math.random() > 0.5 ? "casa17" : "casa18",
      });
    } else if (key == 71) {
      //G DE GAS
      this.addGas(x, y);
    } else if (key == 78) {
      //N DE "NO HACEN NADA"
      this.addCivilian(x, y);
    } else if (key == 81) {
      //Q DE AMBULANCIA
      this.addAmbulance(x, y);
    }
  }
  saveLevel() {
    return this.people.map((p) => {
      return { team: p.team, x: p.pos.x, y: p.pos.y, id: p.id };
    });
  }
  getPersonByID(id) {
    for (let i = 0; i < this.people.length; i++) {
      if (this.people[i].id == id) return this.people[i];
    }
  }

  addPoli(x, y, isStatic) {
    // let substance = "wood";
    /// IT CAN BE WOOD GAS ;)

    const particle = new Poli({
      x,
      y,
      particleSystem: this,
      team: "poli",
      isStatic,
    });
    particle.particles = this.people;
    this.people.push(particle);
    window.lastParticle = particle;
    return particle;
  }
  addIdol(x, y) {
    // let substance = "wood";
    /// IT CAN BE WOOD GAS ;)

    const particle = new Idol({
      x,
      y,
      particleSystem: this,
      team: "idol",
      isStatic: false,
    });
    particle.particles = this.people;
    this.people.push(particle);
    window.lastParticle = particle;
    return particle;
  }

  addPole(poleData) {
    const p = new Pole({ ...poleData, particleSystem: this });
    this.poles.push(p);

    this.fixedObjects.push(p);
    window.lastPole = p;
  }
  addFan(x, y, isStatic, team) {
    const particle = new Fan({
      x,
      y,
      particleSystem: this,
      team,
      isStatic,
    });
    particle.particles = this.people;
    this.people.push(particle);
    window.lastParticle = particle;
    return particle;
  }

  addCivilian(x, y) {
    const particle = new Civil({
      x,
      y,
      particleSystem: this,
    });

    this.people.push(particle);
    window.lastParticle = particle;
    return particle;
  }
  addDirectionArrow(k) {
    this.directionArrows.push(
      new DirectionArrow({
        ...k,
        particleSystem: this,
      })
    );
  }

  addAmbulance(x, y) {
    const particle = new Ambulancia({
      x,
      y,
      particleSystem: this,
    });

    this.cars.push(particle);
    window.lastParticle = particle;
    return particle;
  }

  addHouse(data) {
    const house = new House({
      particleSystem: this,
      sprite: data.type,
      ...data,
    });

    this.fixedObjects.push(house);
    window.lastObject = house;
    return house;
  }

  addGround(data) {
    const ground = new Ground({
      particleSystem: this,
      sprite: data.type,
      ...data,
    });

    this.grounds.push(ground);
    window.lastObject = ground;
    return ground;
  }

  addBullet(part) {
    // console.log(part.vel);

    let bullet = new Bullet({
      engine: this.engine,
      x: part.pos.x,
      y: part.pos.y,
      vel: part.vectorThatAimsToTheTarget,
      particleSystem: this,
      Matter: this.Matter,
      diameter: part.diameter,
    });
    this.bullets.push(bullet);
    // console.log(bullet);
  }
  addRock(part) {
    if ((!part.vectorThatAimsToTheTarget || {}).x) return;
    let rock = new Rock({
      engine: this.engine,
      x: part.pos.x,
      y: part.pos.y,
      targetX: part.target.pos.x,
      targetY: part.target.pos.y,
      vel: part.vectorThatAimsToTheTarget,
      particleSystem: this,
      Matter: this.Matter,
      diameter: part.diameter,
      part: part,
    });
    this.bullets.push(rock);
  }

  onTick(e) {
    this.prevFrameTime = this.currentFrameTime || 0;
    this.currentFrameTime = performance.now();
    this.deltaTime = this.currentFrameTime - this.prevFrameTime;
    // Update all particles in the system
    this.COUNTER++;
    this.doScreenCameraMove();

    // for (const particle of this.people) {
    //   particle.update(this.COUNTER);
    // }
    // for (const bullet of this.bullets) {
    //   bullet.update(this.COUNTER);
    // }
    // for (const fence of this.fences) {
    //   fence.update(this.COUNTER);
    // }
    this.getAllObjectThatGottaUpdate().forEach((k) => {
      if (!k.REMOVED && !k.dead) k.update(this.COUNTER);
    });
    this.UI.update(this.COUNTER);

    this.grid.forEach((k) => {
      k.forEach((v) => {
        v.update(this.COUNTER);
      });
    });

    this.updateFilters();
  }

  updateFilters() {
    if (
      (this.pixiApp.stage.filters || []).length &&
      (this.pixiApp.stage.filters || []).includes(this.CRTfilter)
    ) {
      this.CRTfilter.time = this.COUNTER * 0.5;
      this.CRTfilter.seed = this.COUNTER * 0.5 * (Math.random() * 0.1 - 0.05);
    }

    if (
      this.shadowShader &&
      this.shadowShader.resources.uniforms instanceof Object
    ) {
      this.shadowShader.resources.uniforms.uniforms.uTime +=
        0.04 * this.pixiApp.ticker.deltaTime;

      // this.mousePosUniform.x = this.mouseX;
      // this.mousePosUniform.y = this.mouseY;

      if (this.people.length) {
        const bounds =
          this.people[this.people.length - 1].container.getBounds();
        this.shadowShader.resources.uniforms.uniforms.puntoX =
          ((bounds.minX + bounds.maxX) * 0.5) / this.viewportWidth;

        this.shadowShader.resources.uniforms.uniforms.puntoY =
          bounds.maxY / this.viewportHeight;
      } else {
        this.shadowShader.resources.uniforms.uniforms.puntoX = 0.5;

        this.shadowShader.resources.uniforms.uniforms.puntoY = 0.5;
      }

      this.shadowShader.resources.uniforms.uniforms.mousePosX = this.mouseX;
      this.shadowShader.resources.uniforms.uniforms.mousePosY = this.mouseY;
      this.shadowShader.resources.uniforms.uniforms.offsetX =
        this.mainContainer.x;
      this.shadowShader.resources.uniforms.uniforms.offsetY =
        this.mainContainer.y;
      this.shadowShader.resources.uniforms.uniforms.arrOfPos = new Float32Array(
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      );

      // this.shadowShader.resources.people.uniforms.uPositions = makeArraysLength(
      //   particleSystem.getPeopleAsPixiPoints(),
      //   100
      // );
    }
  }

  getPeopleAsPixiPoints() {
    return this.people.map((k) => {
      return new PIXI.Point(k.pos.x, k.pos.y);
    });
  }

  // calculateAverageTemperature(subst) {
  //   // Calculate the average temperature of all particles
  //   let chosenPArticles;
  //   if (subst) {
  //     chosenPArticles = this.people.filter((k) => k.substance == subst);
  //   } else {
  //     chosenPArticles = this.people;
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
  //     for (const particle of this.people) {
  //       particle.render(this.context);
  //     }

  //     // Update information div
  //     // const infoDiv = document.getElementById('info');
  //     // const overallEnergy = this.calculateOverallEnergy();
  //     // const averageTemperature = this.calculateAverageTemperature();
  //     // infoDiv.innerHTML = `Overall Energy: ${overallEnergy.toFixed(2)} | Average Temperature: ${averageTemperature.toFixed(2)}`;
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

  //   arr = arr ? arr : this.people.filter((k) => k.substance == "wood");
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

  async loadLevel(num) {
    let level = await fetch("xfl/LIBRARY/level" + num + ".xml");
    let res = await level.text();
    let xml = parseXmlToJSON(res);
    console.log(xml);
    let itemsOfLevel = getMovieClipsFromFlashSymbolXML(xml);
    console.log(itemsOfLevel);
    this.restartLevel(itemsOfLevel);
  }
  getAllObjects() {
    return [
      ...this.people,
      ...this.bullets,
      ...this.poles,
      ...this.fixedObjects,
      ...this.cars,
    ];
  }

  getAllObjectThatGottaUpdate() {
    return [...this.people, ...this.bullets, ...this.cars];
  }

  getPeopleAndCars() {
    return [...this.people, ...this.cars];
  }

  updateWorldAndGridSize(listOfElements = []) {
    const { width, height } =
      getWidthAndHeightFromListOfElements(listOfElements);

    console.log("# NEW WIDTH AND HEIGHT", width, height);

    this.worldWidth = width;
    this.worldHeight = height;

    this.bg.width = this.worldWidth;
    this.bg.height = this.worldHeight;

    this.handleWindowResize();

    this.setMainContainerInStartingPosition();

    this.createGrid();

    // this.runEngine()
  }

  findBodiesAtPoint(point) {
    return this.Matter.Query.point(this.engine.world.bodies, point);
  }

  scanMapToKnowWhichCellsAreWalkable() {
    for (let cell of this.grid.flat()) {
      let x = cell.x * cell.cellWidth + cell.cellWidth * 0.5;
      let y = cell.y * cell.cellWidth + cell.cellWidth * 0.5;

      let bodies = this.findBodiesAtPoint({ x, y }).filter(
        (k) => k.label == "house"
      );
      if (bodies.length > 0) {
        cell.blocked = true;
      }
    }
  }

  removeAllCorpsesBloodAndShadows() {
    this.shadowsContainer.removeChildren();
    this.bloodContainer.removeChildren();
  }

  restartLevel(listOfElements) {
    this.getAllObjects().forEach((k) => k.remove());
    this.removeAllCorpsesBloodAndShadows();

    this.grounds.forEach((k) => k.remove());

    this.updateWorldAndGridSize(listOfElements);

    this.setMainContainerInStartingPosition();

    listOfElements.forEach((k) => {
      if (k.type == "boca" || k.type == "river") {
        this.addFan(Math.floor(k.x), Math.floor(k.y), false, k.type);
      } else if (k.type == "pole") {
        this.addPole(k);
      } else if (k.type.startsWith("casa")) {
        this.addHouse(k);
      } else if (k.type.startsWith("calle")) {
        this.addGround(k);
      } else if (k.type.startsWith("civil")) {
        this.addCivilian(k.x, k.y);
      } else if (k.type.startsWith("ambulancia")) {
        this.addAmbulance(k.x, k.y);
      } else if (k.type.startsWith("directionArrow")) {
        this.addDirectionArrow(k);
      }
    });

    // this.scanMapToKnowWhichCellsAreWalkable();
  }

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    if (this.debugMode) {
      this.canvas.style.display = "none";
      document.querySelector("canvas:not(#pixiCanvas)").style.display = "block";
    } else {
      this.canvas.style.display = "block";
      document.querySelector("canvas:not(#pixiCanvas)").style.display = "none";
    }
  }
  async addShaders() {
    this.vertex = await (await fetch("shaders/vertex.glsl")).text();

    //FRAGMENT SHADER:

    this.fragment = await (await fetch("shaders/shadow.glsl")).text();

    this.shadowShader = new PIXI.Filter({
      glProgram: new PIXI.GlProgram({
        fragment: this.fragment,
        vertex: this.vertex,
      }),
      resources: {
        uniforms: {
          width: { value: this.mainContainer.width, type: "f32" },
          height: { value: this.mainContainer.height, type: "f32" },

          puntoX: { value: 0.0, type: "f32" },
          puntoY: { value: 0.0, type: "f32" },

          offsetX: { value: 0.0, type: "f32" },
          offsetY: { value: 0.0, type: "f32" },
          uTime: { value: 0.0, type: "f32" },
          mousePosX: { value: 0.0, type: "f32" },
          mousePosY: { value: 0.0, type: "f32" },
          arrOfPos: createDataTexture([
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
          ]),
        },
      },
    });

    // // Aplicar el filtro al sprite
    this.bg.filters = [this.shadowShader];

    // this.shadowShader = PIXI.Shader.from({
    //   fragment: this.fragment,
    //   vertex: this.vertex,
    //   uniforms: {
    //     uPointPosition: [
    //       this.pixiApp.screen.width / 2,
    //       this.pixiApp.screen.height / 2,
    //     ],
    //     uCanvasSize: [this.viewportWidth, this.viewportHeight],
    //   },
    // });

    // const geometry = new PIXI.Geometry()
    // .addAttribute(
    //     'aVertexPosition', // Attribute name
    //     [-1, -1, 1, -1, 1, 1, -1, 1], // Vertex positions (x, y)
    //     2 // Size of each vertex (2 = x, y)
    // )
    // .addAttribute(
    //     'aTextureCoord', // Texture coordinates
    //     [0, 1, 1, 1, 1, 0, 0, 0], // UV mapping for the texture
    //     2 // Size of each UV coordinate (2 = u, v)
    // )
    // .addIndex([0, 1, 2, 0, 2, 3]); // Define triangle indices for rendering

    // const mesh = new PIXI.Mesh({ geometry, shader: this.shadowShader });
    // this.mesh=mesh
    // this.mainContainer.addChild(mesh);
    // mesh.zIndex = 1;
  }

  addFiltersToStage() {
    this.bloomEffect = new PIXI.filters.AdvancedBloomFilter({
      bloomScale: 0.12,
      threshold: 0.7,
      brightness: 1.066,
      blur: 12,
      pixelSize: 1,
      quality: 10,
    });

    this.CRTfilter = new PIXI.filters.CRTFilter({
      curvature: 1, // Bend of interlaced lines, higher value means more bend
      lineContrast: 0.15, // Contrast of interlaced lines
      lineWidth: 1, // Width of the interlaced lines
      noise: 0.05, // Opacity/intensity of the noise effect between 0 and 1
      noiseSize: 2, // The size of the noise particles
      seed: Math.random(), // A seed value to apply to the random noise generation
      time: 0, // For animating interlaced lines
      verticalLine: false,
      vignetting: 0.35, // The radius of the vignette effect, smaller values produces a smaller vignette
      vignettingAlpha: 0.75, // Amount of opacity on the vignette
      vignettingBlur: 0.2, // Blur intensity of the vignette
    });

    this.pixiApp.stage.filters = [this.bloomEffect, this.CRTfilter];
  }

  enableFilters() {
    for (let f of this.pixiApp.stage.filters) {
      f.enabled = true;
    }
  }

  disableFilters() {
    for (let f of this.pixiApp.stage.filters || []) {
      f.enabled = false;
    }
  }
  toggleFilters() {
    if (
      this.pixiApp.stage.filters.length &&
      this.pixiApp.stage.filters[0].enabled
    ) {
      this.disableFilters();
    } else {
      this.enableFilters();
    }
  }
}
