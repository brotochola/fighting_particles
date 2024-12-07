class Pole extends GenericObject {
  constructor(opt) {
    // console.log("pole", opt);
    super(opt);
    const { x, y, particleSystem, fence } = opt;

    this.fence = fence;

    /////////////////////////////

    //initialize variables:

    //create stuff
    this.createBody(10, 10, "circle", "pole", 0, true);

    

    this.createSprite();
    this.update();
    this.updateMyPositionInGrid();
  }
  createSprite() {
    this.image = new PIXI.Sprite(
      this.particleSystem.res["pole"].texture.clone()
    );

    this.alignSpriteMiddleBottom();

    this.container.addChildAt(this.image, 0);
  }

  update(COUNTER) {
    super.update(COUNTER);

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;
    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex = Math.floor(this.pos.y);

    this.updateMyPositionInGrid();
    super.render();
  }

  // render() {
  //   super.render();
  // }
  //   remove() {}
}
