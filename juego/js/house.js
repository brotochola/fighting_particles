class House extends GenericObject {
  constructor(opt) {
    super(opt);

    const { x, y, particleSystem, width, height, sprite } = opt;
    this.sprite = sprite;

    this.spriteWidth = particleSystem.res[sprite].width;
    this.spriteHeight = particleSystem.res[sprite].height;

    /////////////////////////////

    //initialize variables:

    //create stuff
    this.createBody(
      this.spriteWidth / 1.42,
      this.spriteWidth / 1.42,
      "rectangle",
      "house",
      45,
      true,
      999,
      0.5
    );

    this.createSprite();

    // debugger
    this.updateMyPositionInGrid();
    this.update();

    // this.body.angle = this.startingAngle;
    // this.addParticleEmitter();
  }

  createSprite() {
    this.image = new PIXI.Sprite(this.particleSystem.res[this.sprite]);
    // this.image.scale.set(2)
    this.alignSpriteForIsometricView();

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
