class Cell {
  constructor(y, x, cellWidth, grid, particleSystem) {
    this.particleSystem = particleSystem;
    this.grid = grid;
    this.cellWidth = cellWidth;
    this.pos = { x: x * cellWidth, y: y * cellWidth };
    this.x = x;
    this.y = y;
    this.centerX = this.x * this.cellWidth + this.cellWidth * 0.5;
    this.centerY = this.y * this.cellWidth + this.cellWidth * 0.5;
    this.gas = 0;
    this.graphics;
    this.maxLuckyNumbers = 25;
    this.myLuckyNumber = randomInt(this.maxLuckyNumbers - 1);
    // this.container = elem;
    this.particlesHere = [];
    this.color = generateRandomGrassColor();
    // this.createRectInPixi();
    this.startingFrame = randomInt(8);
    this.gases = [];
    this.directionVector1 = new p5.Vector();
    this.directionVector2 = new p5.Vector();
  }

  setDirectionVector(x, y, type) {
    let vec = this["directionVector" + type];
    if (vec) {
      vec.x += x;
      vec.y += y;
      vec.x *= 0.5;
      vec.y *= 0.5;
    }
  }

  removeMe(who) {
    // if (USE_QUADTREE) return;
    let where;
    for (let i = 0; i < this.particlesHere.length; i++) {
      let a = this.particlesHere[i];
      if (a == who) {
        this.particlesHere.splice(i, 1);
        break;
      }
    }
  }
  addMe(who) {
    // if (USE_QUADTREE) return;
    // console.log("# add me", this, who);
    let areYouHere = false;
    for (let a of this.particlesHere) {
      if (a == who) {
        areYouHere = true;
        break;
      }
    }
    if (!areYouHere) {
      this.particlesHere.push(who);
    }
  }

  getMoreNeighbours(howManyCellsInX, howManyCellsInY) {
    let grid = this.grid;
    let arrRet = [];

    for (
      let dy = this.y - howManyCellsInY;
      dy <= this.y + howManyCellsInY;
      dy++
    ) {
      for (
        let dx = this.x - howManyCellsInX;
        dx <= this.x + howManyCellsInX;
        dx++
      ) {
        try {
          let cell = grid[dy][dx];
          if (cell) {
            arrRet.push(cell);
          }
        } catch (e) {
          // console.error("Error accessing cell:", e);
        }
      }
    }

    return arrRet;
  }

  getNeighbours() {
    let grid = this.grid;
    if (this.neighbours) return this.neighbours;
    let arrRet = [];
    let x = this.x;
    let y = this.y;
    try {
      arrRet.push(grid[y - 1][x - 1]);
    } catch (e) {}
    try {
      arrRet.push(grid[y - 1][x]);
    } catch (e) {}
    try {
      arrRet.push(grid[y - 1][x + 1]);
    } catch (e) {}
    try {
      arrRet.push(grid[y][x - 1]);
    } catch (e) {}
    try {
      arrRet.push(grid[y][x + 1]);
    } catch (e) {}
    try {
      arrRet.push(grid[y + 1][x - 1]);
    } catch (e) {}
    try {
      arrRet.push(grid[y + 1][x]);
    } catch (e) {}
    try {
      arrRet.push(grid[y + 1][x + 1]);
    } catch (e) {}

    if (y == 0) {
      try {
        arrRet.push(grid[grid.length - 1][x - 1]);
      } catch (e) {}
      try {
        arrRet.push(grid[grid.length - 1][x]);
      } catch (e) {}
      try {
        arrRet.push(grid[grid.length - 1][x + 1]);
      } catch (e) {}
    }
    if (y == grid.length - 1) {
      try {
        arrRet.push(grid[0][x - 1]);
      } catch (e) {}
      try {
        arrRet.push(grid[0][x]);
      } catch (e) {}
      try {
        arrRet.push(grid[0][x + 1]);
      } catch (e) {}
    }

    if (x == 0) {
      try {
        arrRet.push(grid[y - 1][grid[0].length - 1]);
      } catch (e) {}
      try {
        arrRet.push(grid[y][grid[0].length - 1]);
      } catch (e) {}
      try {
        arrRet.push(grid[y + 1][grid[0].length - 1]);
      } catch (e) {}
    }
    if (x == grid[0].length - 1) {
      try {
        arrRet.push(grid[y - 1][0]);
      } catch (e) {}
      try {
        arrRet.push(grid[y][0]);
      } catch (e) {}
      try {
        arrRet.push(grid[y + 1][0]);
      } catch (e) {}
    }

    let ret = arrRet.filter((k) => k);
    this.neighbours = ret;
    return ret;
  }

  getPos() {
    return {
      x: this.pos.x + this.cellWidth / 2,
      y: this.pos.y + this.cellWidth / 2,
    };
  }

  // color(col) {
  //   this.elem.style.backgroundColor = col;
  // }
  isItMyFrame() {
    return this.COUNTER % 9 == this.startingFrame;
  }
  manageGas() {
    if (this.gas > 0.01) {
      this.getNeighbours()
        .filter((k) => !k.blocked)
        .forEach((k) => {
          if (this.gas > k.gas) {
            let ratioOfY = k.y != this.y ? 0.2 : 1;
            let howMuchGasIsMoving = this.gas * 0.05 * ratioOfY;

            k.gas += howMuchGasIsMoving;
            this.gas -= howMuchGasIsMoving * 1.1;
          }
        });
    } else {
      this.gas = 0;
    }

    for (let gas of this.gases) {
      gas.update(this.COUNTER, this.gas * 1.5);
    }
  }
  update(FRAMENUM) {
    this.COUNTER = FRAMENUM;
    // console.log(this.isItMyFrame())
    if (!this.isItMyFrame()) return;

    this.manageGas();
    this.putGasSprite();

    this.render();
  }

  putGasSprite() {
    if (this.gas > 0) {
      for (let i = 0; i < this.gas; i++) {
        if (Math.random() > 0.3) return;
        let x = this.x * this.cellWidth + this.cellWidth * Math.random();
        let y = this.y * this.cellWidth + this.cellWidth * Math.random();
        this.gases.push(
          new Humo({ x, y, particleSystem: this.particleSystem, cell: this })
        );
      }
    }
  }

  highlight(color = "red") {
    if (!this.graphics) {
      this.graphics = new PIXI.Graphics();
      this.particleSystem.mainContainer.addChild(this.graphics);
    }

    this.graphics.rect(
      this.x * this.cellWidth,
      this.y * this.cellWidth,
      this.cellWidth,
      this.cellWidth
    );

    // this.graphics.fill({ color: "red", alpha:0.5 });
    this.graphics.stroke({ color, width: 3 });
  }

  showDirectionVector(type = 1, color) {
    let vec = this["directionVector" + type];
    this.highlight(color);
    this.graphics.moveTo(
      this.pos.x + this.cellWidth / 2,
      this.pos.y + this.cellWidth / 2
    );
    let halfCell = this.cellWidth * 0.5;
    this.graphics.lineTo(
      this.pos.x + halfCell + (vec || {}).x * halfCell,
      this.pos.y + halfCell + (vec || {}).y * halfCell
    );
    this.graphics.stroke({ color, width: 2 });

    if (this.blocked) {
      this.graphics.rect(
        this.x * this.cellWidth,
        this.y * this.cellWidth,
        this.cellWidth,
        this.cellWidth
      );
      this.graphics.fill({ color, alpha: 0.8 });
    }
  }

  getParticlesFromHereAndNeighboorCells() {
    let ret = this.getNeighbours()
      .map((k) => k.particlesHere)
      .flat();
    return ret.concat(this.particlesHere);
  }

  unHighlight() {
    if (!this.graphics) return;

    this.graphics.clear();
  }
  render(FRAMENUM) {
    // let  color=this.highlighted?0xffffff:screenBlend(generateGrayscaleColorHex(this.gas), this.color)
    // this.graphics.clear()
    // this.graphics.beginFill(color);
    // this.graphics.drawRect(this.x*this.cellWidth, this.y*this.cellWidth, this.cellWidth, this.cellWidth);
    // this.graphics.endFill();
  }
}
