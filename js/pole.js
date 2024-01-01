class Pole extends GenericObject {
  constructor(opt) {
    console.log("pole", opt);
    super(opt);
    const { x, y, particleSystem, fence } = opt;

    this.fence = fence;
    this.spriteWidth = 5;
    this.spriteHeight = 5;

    /////////////////////////////

    //initialize variables:

    //create stuff
    this.createBody(
      this.spriteWidth,
      this.spriteWidth,
      "circle",
      "pole",
      0,
      true
    );

    this.createContainers();

    this.createSprite();

    this.updateMyPositionInCell();
    this.show();

    // this.body.angle = this.startingAngle;
    // this.addParticleEmitter();
  }
  createSprite() {
    this.image = new PIXI.Sprite(
      this.particleSystem.res["pole"].texture.clone()
    );

    this.container.addChildAt(this.image, 0);
  }
  update() {}

  show(COUNTER) {
    super.update(COUNTER);

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;
    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex = Math.floor(this.pos.y);

    this.updateMyPositionInCell();
    super.render();
  }

  //   render() {
  //     super.render();
  //   }
  //   remove() {}
}
