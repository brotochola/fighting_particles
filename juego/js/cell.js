class Cell {
  constructor(y, x, cellWidth, grid, particleSystem) {
    this.particleSystem = particleSystem;
    this.grid = grid;
    this.cellWidth = cellWidth;
    this.pos = { x: x * cellWidth, y: y * cellWidth };
    this.x = x;
    this.y = y;
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
  }

  setDirectionVector(x, y) {
    if (this.directionVector) {
      this.directionVector.x += x;
      this.directionVector.y += y;
      this.directionVector.x *= 0.5;
      this.directionVector.y *= 0.5;
    } else {
      this.directionVector = new p5.Vector(x, y);
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
  update(FRAMENUM) {
    this.COUNTER = FRAMENUM;
    // console.log(this.isItMyFrame())
    if (!this.isItMyFrame()) return;

    if (this.gas > 0.01) {
      this.getNeighbours().forEach((k) => {
        if (this.gas > k.gas) {
          k.gas += this.gas * 0.06;
          this.gas = this.gas * 0.94 - 0.005;
        }
      });
    } else {
      this.gas = 0;
    }

    this.putGasSprite();
    for (let gas of this.gases) {
      gas.update(FRAMENUM);
    }

    this.render();
  }

  putGasSprite() {
    if (this.gas > 0) {
      if (Math.random() > 0.3) return;
      for (let i = 0; i < this.gas; i++) {
        let x = this.x * this.cellWidth + this.cellWidth * Math.random();
        let y = this.y * this.cellWidth + this.cellWidth * Math.random();
        this.gases.push(
          new Humo({ x, y, particleSystem: this.particleSystem })
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

  showDirectionVector() {
    this.highlight("white");
    this.graphics.moveTo(
      this.pos.x + this.cellWidth / 2,
      this.pos.y + this.cellWidth / 2
    );
    let halfCell = this.cellWidth * 0.5;
    this.graphics.lineTo(
      this.pos.x + halfCell + this.directionVector.x * halfCell,
      this.pos.y + halfCell + this.directionVector.y * halfCell
    );
    this.graphics.stroke({ color: "white", width: 2 });
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
