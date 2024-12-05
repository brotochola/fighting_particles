class Ground extends GenericObject {
  constructor(opt) {
    super(opt);

    this.sprite = opt.sprite;
    this.cellsOccupied = [];
    this.createSprite();

    this.putDirectionVectorsInCells();

    this.update();
  }

  putDirectionVectorsInCells() {
    if (this.sprite != "calle3") return;

    this.cellsOccupied = this.getCellsALargeObjectIsAt();
    this.cellsOccupied.forEach((cell, i) => {
      let result;

      //DONDE ESTA
      let pointWhereThisCellIsAt = new p5.Vector(
        cell.pos.x + cell.cellWidth / 2,
        cell.pos.y + cell.cellWidth / 2
      );
      //ADONDE APUNTA
      let pointToWhereTheyHaveToAim = new p5.Vector(
        this.pos.x - this.image.pivot.x,
        this.pos.y - this.image.pivot.y
      );

      //DIF
      result = p5.Vector.sub(
        pointToWhereTheyHaveToAim,
        pointWhereThisCellIsAt
      ).setMag(0.66);

      //LO PROMEDIO CON LA DIRECCION GENERAL ISOMETRICA
      result.x += -0.5;
      result.y += -0.333;
      result.x /= 2;
      result.y /= 2;

      if (this.opt.scaleX == -1) {
        result.x *= -1;
      }

      cell.setDirectionVector(result.x, result.y);

      // if (this.opt.scaleX == 1) {
      //   cell.setDirectionVector(0.5, 0.333);
      // } else {
      //   //ESTAS VAN DE ABAJO A LA IZQ A ARRIBA A LA DER

      //   cell.setDirectionVector(0.5, -0.333);
      // }
    });
  }

  createSprite() {
    this.image = new PIXI.Sprite(this.particleSystem.res[this.sprite]);

    this.alignSpriteMiddleBottom();

    this.container.addChildAt(this.image, 0);
  }

  update(COUNTER) {
    super.update(COUNTER);

    this.lastY = this.pos.y;
    this.lastX = this.pos.x;

    super.render();
  }
}
