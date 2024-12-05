class Ground extends GenericObject {
  constructor(opt) {
    super(opt);
    this.options = opt;
    this.sprite = opt.sprite;

    this.createSprite();

    this.putDirectionVectorsInCells();

    this.update();
  }

  putDirectionVectorsInCells() {
    this.cellsOccupied = this.getCellsALargeObjectIsAt();
    this.cellsOccupied.map((cell) => {
      if (this.options.scaleX == 1) cell.setDirectionVector(0.5, 0.333);
      else cell.setDirectionVector(0.5, -0.333);
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
