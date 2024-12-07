class DirectionArrow extends GenericObject {
  constructor(opt) {
    super(opt);
    this.rotation = opt.rotation;

    this.container = { width: 180, height: 180 };
    this.image = {
      pivot: { x: this.container.width / 2, y: this.container.height / 2 },
    };

    this.putDirectionVectorsInCells();
  }

  putDirectionVectorsInCells() {
    this.cellsOccupied = this.getCellsALargeObjectIsAt();
    this.cellsOccupied.forEach((cell, i) => {
      let result = new p5.Vector(1, 0);
      result.rotate(this.rotation);

      cell.setDirectionVector(result.x, result.y);

    });
  }

  update() {}

  render() {}
}
