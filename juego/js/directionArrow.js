class DirectionArrow extends GenericObject {
  constructor(opt) {
    super(opt);
    this.rotation = opt.rotation;
    this.type = opt.type.replace("directionArrow", "");

    this.width = this.type == 1 ? 180 : 90;
    this.container.destroy()

    this.container = { width: this.width, height: this.width };
    this.image = {
      pivot: { x: this.container.width / 2, y: this.container.height / 2 },
    };

    this.putDirectionVectorsInCells();
    
  }

  putDirectionVectorsInCells() {
    this.occupiedCells = this.getCellsThatMatchThisContainer();
    this.occupiedCells.forEach((cell, i) => {
      let result = new p5.Vector(1, 0);
      result.rotate(this.rotation);

      cell.setDirectionVector(result.x, result.y, this.type);
    });
  }

  update() {}

  render() {}
}
